
const int sensorPin = 34;

const int ledNormal = 16;
const int ledAdvertencia = 17;
const int ledCritico = 18;

const int buzzer = 19;


/* Definici??n de umbrales del sistema */

float V1 = 30;
float V2 = 40;

float H = 2;


/* Definici??n de estados del sistema */

enum EstadoSistema
{
    NORMAL,
    ADVERTENCIA,
    CRITICO
};

EstadoSistema estadoActual = NORMAL;


/* Configuraci??n inicial del sistema */

void setup()
{
    pinMode(ledNormal,OUTPUT);
    pinMode(ledAdvertencia,OUTPUT);
    pinMode(ledCritico,OUTPUT);

    pinMode(buzzer,OUTPUT);

    Serial.begin(115200);
}


/* Bucle principal de ejecuci??n */

void loop()
{
    float valorSensor = leerSensor();

    actualizarEstado(valorSensor);

    actualizarSalidas();
}


/* Lectura del sensor anal??gico */

float leerSensor()
{
    int lecturaADC = analogRead(sensorPin);

    float temperatura = (lecturaADC/4095.0)*100;

    return temperatura;
}


/* Actualizaci??n del estado del sistema con hist??resis */

void actualizarEstado(float valor)
{
    switch(estadoActual)
    {

        case NORMAL:

            if(valor > V1 + H)
            estadoActual = ADVERTENCIA;

        break;


        case ADVERTENCIA:

            if(valor > V2 + H)
            estadoActual = CRITICO;

            if(valor < V1 - H)
            estadoActual = NORMAL;

        break;


        case CRITICO:

            if(valor < V2 - H)
            estadoActual = ADVERTENCIA;

        break;

    }
}


/* Control de salidas del sistema */

void actualizarSalidas()
{

    digitalWrite(ledNormal,LOW);
    digitalWrite(ledAdvertencia,LOW);
    digitalWrite(ledCritico,LOW);

    switch(estadoActual)
    {

        case NORMAL:

        digitalWrite(ledNormal,HIGH);

        break;


        case ADVERTENCIA:

        digitalWrite(ledAdvertencia,HIGH);

        break;


        case CRITICO:

        digitalWrite(ledCritico,HIGH);
        digitalWrite(buzzer,HIGH);

        break;

    }
}

