import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, onValue, set, push, query, orderByChild, limitToLast
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

window._fbSet = (path, value) => set(ref(db, path), value);

// ─── Historial ────────────────────────────────────────
function horaActual() {
  const d = new Date();
  return d.getHours().toString().padStart(2,"0") + ":" +
         d.getMinutes().toString().padStart(2,"0");
}

let _t = null, _ha = null, _hs = null, _lastSave = 0;

function intentarGuardar() {
  if (_t === null || _ha === null || _hs === null) return;
  const ahora = Date.now();
  if (ahora - _lastSave < 60_000) return;
  _lastSave = ahora;
  push(ref(db, "historial"), {
    ts: ahora, hora: horaActual(),
    temp: _t, humAire: _ha, humSuelo: _hs
  });
}

// ─── Sensores ─────────────────────────────────────────
onValue(ref(db, "sensores/temperatura"), snap => {
  const v = snap.val(); if (v === null) return;
  _t = v;
  document.getElementById("temperatura").innerHTML = v.toFixed(1) + "<span>°C</span>";
  intentarGuardar();
});

onValue(ref(db, "sensores/humedad_aire"), snap => {
  const v = snap.val(); if (v === null) return;
  _ha = v;
  document.getElementById("humedad-aire").innerHTML = v.toFixed(0) + "<span>%</span>";
  intentarGuardar();
});

onValue(ref(db, "sensores/humedad_suelo"), snap => {
  const v = snap.val(); if (v === null) return;
  _hs = v;
  document.getElementById("humedad-suelo").innerHTML = v + "<span>%</span>";
  intentarGuardar();
});

// ─── Actuadores ───────────────────────────────────────
// _ignorarUpdate evita que el onValue revierta el switch
// justo después de que el usuario lo mueve
window._ignorarUpdate = { bomba: false, techo: false };

onValue(ref(db, "actuadores/bomba"), snap => {
  const estado = snap.val(); if (!estado) return;
  document.getElementById("bomba-status").innerText = estado;
  if (!window._ignorarUpdate.bomba) {
    document.getElementById("bomba-switch").checked = (estado === "Encendida");
  }
});

onValue(ref(db, "actuadores/techo"), snap => {
  const estado = snap.val(); if (!estado) return;
  document.getElementById("techo-status").innerText = estado;
  if (!window._ignorarUpdate.techo) {
    document.getElementById("techo-switch").checked = (estado === "Abierto");
  }
});

// ─── Historial para gráfica ───────────────────────────
window.cargarHistorial = function(callback) {
  const q = query(ref(db, "historial"), orderByChild("ts"), limitToLast(20));
  onValue(q, snap => {
    const puntos = [];
    snap.forEach(child => puntos.push(child.val()));
    callback(puntos);
  });
};