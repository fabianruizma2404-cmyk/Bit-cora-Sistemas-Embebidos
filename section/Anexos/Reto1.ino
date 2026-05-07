
//Microcontrolador: ESP32//


//DEFINICIÃ“N DE PINES -//

const int boton1 = 25;
const int boton2 = 26;
const int boton3 = 27;

const int ledAcceso = 14;
const int ledError = 12;

const int releCerradura = 13;


//PARÃMETROS DEL SISTEMA //

const int secuenciaCorrecta[3] = {1,2,3};

const int maxIntentos = 3;

const unsigned long tiempoBloqueo = 10000;
const unsigned long tiempoApertura = 3000;


//VARIABLES DE CONTROL //

int secuenciaIngresada[3];
int indiceSecuencia = 0;

int contadorIntentos = 0;

bool sistemaBloqueado = false;

unsigned long inicioBloqueo = 0;
unsigned long inicioApertura = 0;

bool cerraduraAbierta = false;


//CONFIGURACIÃ“N //

void setup()
{
    pinMode(boton1, INPUT_PULLUP);
    pinMode(boton2, INPUT_PULLUP);
    pinMode(boton3, INPUT_PULLUP);

    pinMode(ledAcceso, OUTPUT);
    pinMode(ledError, OUTPUT);

    pinMode(releCerradura, OUTPUT);

    Serial.begin(115200);
}


//LOOP PRINCIPAL //

void loop()
{
    verificarBloqueo();

    if(!sistemaBloqueado)
    {
        leerBotones();
        verificarSecuencia();
    }

    controlarApertura();
}


//LECTURA DE BOTONES //

void leerBotones()
{
    if(digitalRead(boton1)==LOW)
    {
        registrarEntrada(1);
    }

    if(digitalRead(boton2)==LOW)
    {
        registrarEntrada(2);
    }

    if(digitalRead(boton3)==LOW)
    {
        registrarEntrada(3);
    }
}


// REGISTRAR ENTRADA //

void registrarEntrada(int valor)
{
    if(indiceSecuencia < 3)
    {
        secuenciaIngresada[indiceSecuencia] = valor;
        indiceSecuencia++;
    }
}


// VERIFICAR COMBINACIÃ“N //

void verificarSecuencia()
{
    if(indiceSecuencia == 3)
    {
        if(combinacionCorrecta())
        {
            abrirCerradura();
            contadorIntentos = 0;
        }
        else
        {
            manejarIntentoFallido();
        }

        indiceSecuencia = 0;
    }
}


// COMPARACIÃ“N //

bool combinacionCorrecta()
{
    for(int i=0;i<3;i++)
    {
        if(secuenciaIngresada[i] != secuenciaCorrecta[i])
        return false;
    }

    return true;
}


//APERTURA//

void abrirCerradura()
{
    digitalWrite(releCerradura, HIGH);
    digitalWrite(ledAcceso, HIGH);

    cerraduraAbierta = true;
    inicioApertura = millis();
}


//CONTROL APERTURA //

void controlarApertura()
{
    if(cerraduraAbierta)
    {
        if(millis() - inicioApertura > tiempoApertura)
        {
            digitalWrite(releCerradura, LOW);
            digitalWrite(ledAcceso, LOW);
            cerraduraAbierta = false;
        }
    }
}


//INTENTO FALLIDO//

void manejarIntentoFallido()
{
    contadorIntentos++;

    digitalWrite(ledError, HIGH);

    if(contadorIntentos >= maxIntentos)
    {
        sistemaBloqueado = true;
        inicioBloqueo = millis();
    }
}


// CONTROL BLOQUEO //

void verificarBloqueo()
{
    if(sistemaBloqueado)
    {
        if(millis() - inicioBloqueo > tiempoBloqueo)
        {
            sistemaBloqueado = false;
            contadorIntentos = 0;
            digitalWrite(ledError, LOW);
        }
    }
}
