
const int sensorHumedad = 35;

const int releBomba = 23;


/* Definición de parámetros de control */

int umbralRiego = 40;

int hist = 5;


/* Parámetros de temporización del riego */

unsigned long tiempoRiego = 8000;

unsigned long inicioRiego = 0;

bool bombaActiva = false;


/* Configuración inicial del sistema */

void setup()
{
    pinMode(releBomba,OUTPUT);
    Serial.begin(115200);
}


/* Bucle principal de ejecución */

void loop()
{

    int humedad = leerHumedad();

    controlRiego(humedad);

    controlarTemporizador();

}


/* Lectura del sensor de humedad */

int leerHumedad()
{
    int lectura = analogRead(sensorHumedad);

    int porcentaje = map(lectura,0,4095,100,0);

    return porcentaje;
}


/* Lógica de control para iniciar el riego */

void controlRiego(int humedad)
{

    if(!bombaActiva)
    {

        if(humedad < (umbralRiego - hist))
        {

            iniciarRiego();

        }

    }

}


/* Activación del sistema de riego */

void iniciarRiego()
{

    digitalWrite(releBomba,HIGH);

    bombaActiva = true;

    inicioRiego = millis();

}


/* Control del temporizador de riego */

void controlarTemporizador()
{

    if(bombaActiva)
    {

        if(millis() - inicioRiego > tiempoRiego)
        {

            detenerRiego();

        }

    }

}


/* Desactivación del sistema de riego */

void detenerRiego()
{

    digitalWrite(releBomba,LOW);

    bombaActiva = false;

}