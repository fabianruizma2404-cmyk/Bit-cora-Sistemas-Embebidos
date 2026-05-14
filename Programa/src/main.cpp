#include <Arduino.h>

//Hola

// ===============================
// Pines
// ===============================
#define SENSOR_AO 34
#define RELE 26

// ===============================
// Variables
// ===============================
int valorSensor = 0;

// Ajusta este valor según tus pruebas
int umbral = 2000;

void setup()
{
    // Iniciar monitor serial
    Serial.begin(115200);

    // Pequeña espera para iniciar serial
    delay(1000);

    // Configurar relé
    pinMode(RELE, OUTPUT);

    // Relé apagado inicialmente
    // (Muchos relés son ACTIVE LOW)
    digitalWrite(RELE, HIGH);

    Serial.println("=================================");
    Serial.println("SISTEMA INICIADO");
    Serial.println("Leyendo sensor...");
    Serial.println("=================================");
}

void loop()
{
    // Leer sensor
    valorSensor = analogRead(SENSOR_AO);

    // Mostrar valor constantemente
    Serial.print("Valor del sensor: ");
    Serial.print(valorSensor);

    // Verificar umbral
    if (valorSensor > umbral)
    {
        Serial.println("  --> BOMBA ENCENDIDA");

        // Activar relé
        digitalWrite(RELE, LOW);
    }
    else
    {
        Serial.println("  --> Bomba apagada");

        // Apagar relé
        digitalWrite(RELE, HIGH);
    }

    // Espera
    delay(500);
}