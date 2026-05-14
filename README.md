# Bitácora — Sistemas Embebidos

**Estudiante:** Fabián Ruiz &b Julian Díaz 
**Materia:** Sistemas Embebidos  
**Repositorio:** [github.com/fabianruizma2404-cmyk/Bit-cora-Sistemas-Embebidos](https://github.com/fabianruizma2404-cmyk/Bit-cora-Sistemas-Embebidos)

---

## Descripción

Este repositorio contiene la bitácora del semestre de la materia **Sistemas Embebidos**, desarrollada en LaTeX y gestionada con Git y GitHub desde Visual Studio Code. El documento compila todas las actividades, talleres, consultas y el proyecto final realizados a lo largo del semestre.

---

## Estructura del repositorio

```
├── main.tex                  # Documento principal
├── preamble.tex              # Configuración y paquetes LaTeX
├── reference.bib             # Referencias bibliográficas
├── firmware/                 # Proyecto PlatformIO para ESP32
│   └── src/
│       └── main.cpp          # Código fuente del proyecto final
├── images/                   # Imágenes del documento
│   └── evidencias/           # Capturas de pantalla y evidencias
├── section/                  # Secciones de la bitácora
│   └── Anexos/               # Códigos fuente incluidos
└── tables/                   # Tablas del documento
```

---

## Contenido de la bitácora

### Actividades y talleres
Registro de todas las prácticas, talleres evaluables y ejercicios realizados durante el semestre, incluyendo:
- Configuración del entorno de desarrollo
- Programación de microcontroladores ESP32
- Uso de sensores y actuadores
- Comunicación serial y protocolos de comunicación
- Control de entradas y salidas digitales y analógicas

### Consultas
Investigaciones y consultas teóricas que respaldan el desarrollo de las prácticas.

### Proyecto Final — Invernadero inteligente IoT

Sistema de monitoreo y supervisión de un invernadero para la **germinación de pimentón**, implementado con ESP32 y conectado a la nube mediante **Firebase**.

**Características principales:**
- Monitoreo de temperatura y humedad ambiental
- Control de riego automático según condiciones del sensor
- Control de iluminación según nivel de luz
- Activación de actuadores según umbrales definidos para germinación
- Conexión en tiempo real con **Firebase Realtime Database**
- Dashboard de visualización y control remoto

**Hardware utilizado:**
- Microcontrolador ESP32
- Sensor DHT11 (temperatura y humedad ambiental)
- Sensor de humedad del suelo YL-100
- Sensor ultrasónico HC-SR04 (nivel de agua en el tanque)
- Relés para actuadores
- Bomba de agua
- Ventilador

**Stack tecnológico:**
- Firmware: C++ con framework Arduino (PlatformIO)
- Base de datos: Firebase Realtime Database
- Dashboard: Firebase Console / Web App

---

## Herramientas utilizadas

| Herramienta | Uso |
|---|---|
| Visual Studio Code | Editor principal |
| LaTeX (MiKTeX) | Redacción de la bitácora |
| PlatformIO | Desarrollo del firmware ESP32 |
| Git + GitHub | Control de versiones |
| Firebase | Base de datos y dashboard IoT |

---

## Requisitos para compilar

Antes de compilar, asegúrese de tener instalado:

- [Visual Studio Code](https://code.visualstudio.com/)
- Extensión **LaTeX Workshop** (James Yu) — instalar desde el marketplace de VS Code
- [MiKTeX](https://miktex.org/download) — distribución de LaTeX para Windows

Después de instalar MiKTeX, agregue la ruta del compilador al PATH del sistema. La ruta típica es:

```
C:\Users\<usuario>\AppData\Local\Programs\MiKTeX\miktex\bin\x64
```

Para verificar que el compilador está disponible, abra la terminal de VS Code y ejecute:

```bash
pdflatex --version
```

---

## Cómo compilar la bitácora

1. Clone el repositorio:

```bash
git clone https://github.com/fabianruizma2404-cmyk/Bit-cora-Sistemas-Embebidos
```

2. Abra la carpeta en VS Code:

```bash
code Bit-cora-Sistemas-Embebidos
```

3. Abra el archivo `main.tex`.

4. En la barra lateral izquierda, haga clic en el icono **TEX** de LaTeX Workshop y seleccione **Build LaTeX project**. También puede usar el atajo:

```
Ctrl+Alt+B
```

5. Para visualizar el PDF generado, use:

```
Ctrl+Alt+V
```

El archivo `main.pdf` se generará en la raíz del proyecto.

> **Nota:** La primera compilación puede tardar varios minutos porque MiKTeX descarga los paquetes necesarios automáticamente. Las compilaciones siguientes serán más rápidas.

---

## Licencia

Proyecto académico — Universidad Santo Tomás · Sistemas Embebidos · 2025
