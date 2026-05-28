import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  query,
  orderByChild,
  limitToLast
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDu_jPIrBwjU_uqYAeWDyfxS0FTKsPfNqg",
  authDomain: "embebidos-c22c3.firebaseapp.com",
  databaseURL: "https://embebidos-c22c3-default-rtdb.firebaseio.com",
  projectId: "embebidos-c22c3",
  storageBucket: "embebidos-c22c3.appspot.com",
  messagingSenderId: "1047930790430",
  appId: "1:1047930790430:web:000000000000"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ─────────────────────────────────────────
// EXPORTAR set y ref para usarlos en script.js
// ─────────────────────────────────────────
window._fbSet = set;
window._fbRef = (path) => ref(db, path);


// ─────────────────────────────────────────
// HELPERS: etiqueta de hora y último timestamp
// ─────────────────────────────────────────
function horaActual() {
  const d = new Date();
  return d.getHours().toString().padStart(2,"0") + ":" +
         d.getMinutes().toString().padStart(2,"0");
}

let ultimoTimestamp = 0;

// ─────────────────────────────────────────
// GUARDAR HISTORIAL cada vez que llega un
// dato nuevo del ESP32 (detectado por cambio
// real de valor + throttle de 60 s)
// ─────────────────────────────────────────
function guardarHistorial(temp, humAire, humSuelo) {
  const ahora = Date.now();
  if (ahora - ultimoTimestamp < 60_000) return;   // máx 1 punto/min
  ultimoTimestamp = ahora;

  const entrada = {
    ts:        ahora,
    hora:      horaActual(),
    temp:      temp,
    humAire:   humAire,
    humSuelo:  humSuelo
  };
  push(ref(db, "historial"), entrada);
}

// ─────────────────────────────────────────
// LECTURA SENSORES (tiempo real)
// ─────────────────────────────────────────
let _temp = null, _humAire = null, _humSuelo = null;

onValue(ref(db, "sensores/temperatura"), (snap) => {
  const v = snap.val();
  if (v === null) return;
  _temp = v;
  document.getElementById("temperatura").innerHTML =
    v.toFixed(1) + "<span>°C</span>";
  intentarGuardar();
});

onValue(ref(db, "sensores/humedad_aire"), (snap) => {
  const v = snap.val();
  if (v === null) return;
  _humAire = v;
  document.getElementById("humedad-aire").innerHTML =
    v.toFixed(0) + "<span>%</span>";
  intentarGuardar();
});

onValue(ref(db, "sensores/humedad_suelo"), (snap) => {
  const v = snap.val();
  if (v === null) return;
  _humSuelo = v;
  document.getElementById("humedad-suelo").innerHTML =
    v + "<span>%</span>";
  intentarGuardar();
});

// Solo guarda cuando los 3 valores están disponibles
function intentarGuardar() {
  if (_temp !== null && _humAire !== null && _humSuelo !== null) {
    guardarHistorial(_temp, _humAire, _humSuelo);
  }
}

// ─────────────────────────────────────────
// ACTUADORES — leer estado y sincronizar UI
// ─────────────────────────────────────────
// Reemplazar los dos onValue de bomba y techo por estos:

onValue(ref(db, "actuadores/bomba"), (snap) => {
  const estado = snap.val();
  if (!estado) return;

  const statusEl = document.getElementById("bomba-status");
  const sw       = document.getElementById("bomba-switch");

  statusEl.innerText = estado;

  // Sincronizar el switch SIEMPRE, esté en auto o manual
  sw.checked = (estado === "Encendida");
});

onValue(ref(db, "actuadores/techo"), (snap) => {
  const estado = snap.val();
  if (!estado) return;

  const statusEl = document.getElementById("techo-status");
  const sw       = document.getElementById("techo-switch");

  statusEl.innerText = estado;

  // Sincronizar el switch SIEMPRE, esté en auto o manual
  sw.checked = (estado === "Abierto");
});

// ─────────────────────────────────────────
// HISTORIAL — cargar últimos 20 puntos
// y exponer función de recarga para script.js
// ─────────────────────────────────────────
window.cargarHistorial = function(callback) {
  const q = query(
    ref(db, "historial"),
    orderByChild("ts"),
    limitToLast(20)
  );

  onValue(q, (snap) => {
    const puntos = [];
    snap.forEach(child => puntos.push(child.val()));
    // quedan ordenados de más antiguo a más reciente
    callback(puntos);
  });
};