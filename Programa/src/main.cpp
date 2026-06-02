#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ESP32Servo.h>
#include <ESP32PWM.h>
#include <DHT.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

//======================
// WIFI
//======================
#define WIFI_SSID     "USTA_Administrativo"
#define WIFI_PASSWORD "#soytomasino#"

//======================
// FIREBASE
//======================
#define API_KEY      "AIzaSyDu_jPIrBwjU_uqYAeWDyfxS0FTKsPfNqg"
#define DATABASE_URL "embebidos-c22c3-default-rtdb.firebaseio.com"

//======================
// PINES
//======================
#define DHTPIN         4
#define DHTTYPE        DHT11
#define SENSOR_HUMEDAD 34
#define RELE_BOMBA     27
#define PIN_SERVO      13

//======================
// OBJETOS
//======================
Servo    miServo;
DHT      dht(DHTPIN, DHTTYPE);

FirebaseData   fbdo;
FirebaseData   fbdoControl;
FirebaseData   fbdoAct;
FirebaseAuth   auth;
FirebaseConfig config;

//======================
// VARIABLES
//======================
bool techoAbierto    = false;
bool bombaEncendida  = false;
bool signupOK        = false;

bool modoManualBomba = false;
bool modoManualTecho = false;

bool estadoManualBomba = false;
bool estadoManualTecho = false;

unsigned long lastSend = 0;

//======================
// STREAM /control
//======================
void onControlStream(FirebaseStream data)
{
    String path = data.dataPath();

    if (path == "/bomba/modo")
    {
        modoManualBomba = (data.stringData() == "manual");
        if (!modoManualBomba) estadoManualBomba = false;
        Serial.printf("Modo bomba: %s\n", modoManualBomba ? "MANUAL" : "AUTO");
    }

    if (path == "/techo/modo")
    {
        modoManualTecho = (data.stringData() == "manual");
        if (!modoManualTecho) estadoManualTecho = false;
        Serial.printf("Modo techo: %s\n", modoManualTecho ? "MANUAL" : "AUTO");
    }
}

//======================
// STREAM /actuadores
//======================
void onActuadoresStream(FirebaseStream data)
{
    String path = data.dataPath();

    if (path == "/bomba" && modoManualBomba)
    {
        estadoManualBomba = (data.stringData() == "Encendida");
        Serial.printf("[STREAM] Estado manual bomba: %s\n",
                      estadoManualBomba ? "ON" : "OFF");
    }

    if (path == "/techo" && modoManualTecho)
    {
        estadoManualTecho = (data.stringData() == "Abierto");
        Serial.printf("[STREAM] Estado manual techo: %s\n",
                      estadoManualTecho ? "ON" : "OFF");
    }
}

void onStreamTimeout(bool timeout)
{
    if (timeout) Serial.println("Stream timeout — reconectando...");
}

//======================
// SETUP
//======================
void setup()
{
    Serial.begin(115200);

    dht.begin();
    delay(2000); // estabilización del DHT11

    pinMode(RELE_BOMBA, OUTPUT);
    digitalWrite(RELE_BOMBA, HIGH);

    ESP32PWM::allocateTimer(0);
    miServo.setPeriodHertz(50);
    miServo.attach(PIN_SERVO, 500, 2400);
    miServo.write(100);

    // ── WiFi ──────────────────────────────────────────
    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Conectando WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(500);
    }
    Serial.printf("\nWiFi conectado — IP: %s\n",
                  WiFi.localIP().toString().c_str());

    // ── Firebase ──────────────────────────────────────
    config.api_key      = API_KEY;
    config.database_url = DATABASE_URL;
    config.token_status_callback = tokenStatusCallback;

    if (Firebase.signUp(&config, &auth, "", ""))
    {
        Serial.println("Firebase: signup OK");
        signupOK = true;
    }
    else
    {
        Serial.printf("Firebase signup error: %s\n",
                      config.signer.signupError.message.c_str());
    }

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    // ── Stream 1: /control ────────────────────────────
    if (!Firebase.RTDB.beginStream(&fbdoControl, "/control"))
        Serial.printf("Error stream /control: %s\n",
                      fbdoControl.errorReason().c_str());

    Firebase.RTDB.setStreamCallback(
        &fbdoControl, onControlStream, onStreamTimeout);

    // ── Stream 2: /actuadores ─────────────────────────
    if (!Firebase.RTDB.beginStream(&fbdoAct, "/actuadores"))
        Serial.printf("Error stream /actuadores: %s\n",
                      fbdoAct.errorReason().c_str());

    Firebase.RTDB.setStreamCallback(
        &fbdoAct, onActuadoresStream, onStreamTimeout);

    Serial.println("Sistema iniciado");
}

//======================
// LOOP
//======================
void loop()
{
    // ── Procesar streams ──────────────────────────────
    if (!Firebase.RTDB.readStream(&fbdoControl) &&
        fbdoControl.streamTimeout())
        Serial.println("Stream /control timeout");

    if (!Firebase.RTDB.readStream(&fbdoAct) &&
        fbdoAct.streamTimeout())
        Serial.println("Stream /actuadores timeout");

    // ── DHT11 ─────────────────────────────────────────
    float temperatura = dht.readTemperature();
    float humedadAire = dht.readHumidity();

    if (isnan(temperatura) || isnan(humedadAire))
    {
        Serial.println("Error DHT11 — reintentando...");
        delay(1000);
        return;
    }

    // ── Sensor suelo ──────────────────────────────────
    int lectura      = analogRead(SENSOR_HUMEDAD);
    int humedadSuelo = constrain(map(lectura, 3000, 1200, 0, 100), 0, 100);

    // ── Serial ────────────────────────────────────────
    Serial.printf("Temp: %.1f°C  HumAire: %.0f%%  HumSuelo: %d%%  ADC: %d\n",
                  temperatura, humedadAire, humedadSuelo, lectura);

    // ── Control techo ─────────────────────────────────
    if (modoManualTecho)
    {
        if (estadoManualTecho && !techoAbierto)
        {
            Serial.println("[MANUAL] Abriendo techo");
            for (int pos = 85; pos <= 180; pos++) { miServo.write(pos); delay(20); }
            techoAbierto = true;
        }
        else if (!estadoManualTecho && techoAbierto)
        {
            Serial.println("[MANUAL] Cerrando techo");
            for (int pos = 180; pos >= 85; pos--) { miServo.write(pos); delay(20); }
            techoAbierto = false;
        }
    }
    else
    {
        Serial.printf("[AUTO TECHO] abierto=%d  temp=%.1f  hum=%.0f\n",
                      techoAbierto, temperatura, humedadAire);

        if (!techoAbierto && (temperatura > 30 || humedadAire > 85))
        {
            Serial.println("[AUTO] Abriendo techo");
            for (int pos = 100; pos <= 180; pos++) { miServo.write(pos); delay(20); }
            techoAbierto = true;
        }
        else if (techoAbierto && temperatura < 28.5 && humedadAire < 80)
        {
            Serial.println("[AUTO] Cerrando techo");
            for (int pos = 180; pos >= 100; pos--) { miServo.write(pos); delay(20); }
            techoAbierto = false;
        }
    }

    // ── Control bomba ─────────────────────────────────
    if (modoManualBomba)
    {
        if (estadoManualBomba && !bombaEncendida)
        {
            digitalWrite(RELE_BOMBA, LOW);
            bombaEncendida = true;
            Serial.println("[MANUAL] BOMBA ENCENDIDA");
        }
        else if (!estadoManualBomba && bombaEncendida)
        {
            digitalWrite(RELE_BOMBA, HIGH);
            bombaEncendida = false;
            Serial.println("[MANUAL] BOMBA APAGADA");
        }
    }
    else
    {
        if (!bombaEncendida && humedadSuelo < 60)
        {
            digitalWrite(RELE_BOMBA, LOW);
            bombaEncendida = true;
            Serial.println("[AUTO] BOMBA ENCENDIDA");
        }
        if (bombaEncendida && humedadSuelo > 75)
        {
            digitalWrite(RELE_BOMBA, HIGH);
            bombaEncendida = false;
            Serial.println("[AUTO] BOMBA APAGADA");
        }
    }

    // ── Firebase: enviar sensores cada 3 s ────────────
    if (Firebase.ready() && signupOK && millis() - lastSend > 3000)
    {
        lastSend = millis();

        Firebase.RTDB.setFloat(&fbdo, "/sensores/temperatura",   temperatura);
        Firebase.RTDB.setFloat(&fbdo, "/sensores/humedad_aire",  humedadAire);
        Firebase.RTDB.setInt  (&fbdo, "/sensores/humedad_suelo", humedadSuelo);
        Firebase.RTDB.setInt  (&fbdo, "/sensores/adc",           lectura);

        // Solo actualizar /actuadores/ en modo auto
        // En modo manual la web es la fuente de verdad
        if (!modoManualBomba)
            Firebase.RTDB.setString(&fbdo, "/actuadores/bomba",
                                    bombaEncendida ? "Encendida" : "Apagada");

        if (!modoManualTecho)
        {
            Firebase.RTDB.setString(&fbdo, "/actuadores/techo",
                                    techoAbierto ? "Abierto" : "Cerrado");
            Firebase.RTDB.setInt   (&fbdo, "/actuadores/servo_posicion",
                                    techoAbierto ? 180 : 100);
        }

        Serial.println("Datos enviados a Firebase");
    }

    delay(1000); // mínimo necesario para el DHT11
}