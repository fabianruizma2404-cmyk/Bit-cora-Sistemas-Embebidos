#include <Arduino.h>
#include <WiFi.h>
#include <FirebaseESP32.h>

// ===============================
// Credenciales (REMPLAZAR DATOS)
// ===============================
#define WIFI_SSID "TU_SSID_AQUÍ"
#define WIFI_PASSWORD "TU_PASSWORD_AQUÍ"
#define FIREBASE_HOST "https://embebidos-c22c3-default-rtdb.firebaseio.com/" // Sin https://
#define FIREBASE_AUTH "gTiHP7JFvj6GZZ3EJiEIZvwxQslFdmR4tNk9Xive"

// ===============================
// Pines
// ===============================
#define SENSOR_AO 34
#define RELE 26

// ===============================
// Variables y Objetos
// ===============================
int valorSensor = 0;
int umbral = 2000;

// Objetos de Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
    Serial.begin(115200);
    delay(1000);

    // Configurar relé
    pinMode(RELE, OUTPUT);
    digitalWrite(RELE, HIGH); // Apagado inicialmente (Active Low)

    // --- CONEXIÓN WIFI ---
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Conectando a WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Conectado!");

    // --- CONFIGURACIÓN FIREBASE ---
    config.host = FIREBASE_HOST;
    config.signer.tokens.legacy_token = FIREBASE_AUTH;
    
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    Serial.println("=================================");
    Serial.println("SISTEMA CONECTADO A FIREBASE");
    Serial.println("=================================");
}

void loop() {
    // 1. Leer sensor
    valorSensor = analogRead(SENSOR_AO);
    String estadoBomba = "";

    // 2. Lógica de control
    Serial.print("Valor del sensor: ");
    Serial.print(valorSensor);

    if (valorSensor > umbral) {
        Serial.println("  --> BOMBA ENCENDIDA");
        digitalWrite(RELE, LOW);
        estadoBomba = "Encendida";
    } else {
        Serial.println("  --> Bomba apagada");
        digitalWrite(RELE, HIGH);
        estadoBomba = "Apagada";
    }

    // 3. Enviar a Firebase (Cada ciclo de 1 segundo)
    // Solo enviamos si el ESP32 está listo para evitar colapsar la conexión
    if (Firebase.ready()) {
        // Guardamos el valor analógico
        Firebase.setInt(fbdo, "/sistema_riego/nivel_humedad", valorSensor);
        
        // Guardamos el estado de la bomba como texto
        Firebase.setString(fbdo, "/sistema_riego/estado_bomba", estadoBomba);
    }

    delay(1000); // Un segundo de espera entre lecturas
}