// ─── Chart ────────────────────────────────────────────
const ctx      = document.getElementById("mainChart");
let chartIndex = 0;

const chartMeta = [
  { key: "temp",     label: "Temperatura °C",     color: "#ff9800" },
  { key: "humAire",  label: "Humedad Ambiental %", color: "#22c55e" },
  { key: "humSuelo", label: "Humedad Suelo %",     color: "#3b82f6" }
];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label:           chartMeta[0].label,
      data:            [],
      borderColor:     chartMeta[0].color,
      backgroundColor: chartMeta[0].color + "33",
      fill: true, tension: 0.4, pointRadius: 5
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "white" } } },
    scales: {
      x: { ticks: { color: "#d1d5db" }, grid: { color: "rgba(255,255,255,0.08)" } },
      y: { ticks: { color: "#d1d5db" }, grid: { color: "rgba(255,255,255,0.08)" } }
    }
  }
});

function aplicarHistorial(puntos) {
  const m = chartMeta[chartIndex];
  chart.data.labels                      = puntos.map(p => p.hora);
  chart.data.datasets[0].data            = puntos.map(p => p[m.key]);
  chart.data.datasets[0].label           = m.label;
  chart.data.datasets[0].borderColor     = m.color;
  chart.data.datasets[0].backgroundColor = m.color + "33";
  chart.update();
}

function suscribirHistorial() {
  if (typeof window.cargarHistorial === "function") {
    window.cargarHistorial(aplicarHistorial);
  } else {
    setTimeout(suscribirHistorial, 300);
  }
}
suscribirHistorial();

function showChart(index) {
  chartIndex = index;
  document.querySelectorAll(".chart-btn")
    .forEach((btn, i) => btn.classList.toggle("active-chart", i === index));
  if (typeof window.cargarHistorial === "function")
    window.cargarHistorial(aplicarHistorial);
}

// ─── Modo Auto / Manual ───────────────────────────────
function setMode(id, mode, button) {
  const card = button.parentElement;
  card.querySelectorAll(".mode-btn")
    .forEach(b => b.classList.remove("active-btn"));
  button.classList.add("active-btn");

  const sw = document.getElementById(id + "-switch");

  if (mode === "manual") {
    // Escribir en Firebase primero; habilitar switch solo cuando
    // el ESP32 ya sabe que está en manual (evita la ventana de riesgo)
    window._fbSet("control/" + id + "/modo", "manual").then(() => {
      sw.disabled = false;
    });
  } else {
    sw.disabled = true;
    // Limpiar bandera al volver a auto
    if (window._ignorarUpdate) window._ignorarUpdate[id] = false;
    window._fbSet("control/" + id + "/modo", "auto");
  }
}

// ─── Toggle manual ────────────────────────────────────
function toggleActuator(id) {
  const sw = document.getElementById(id + "-switch");

  const textos = {
    bomba:      { on: "Encendida", off: "Apagada"  },
    ventilador: { on: "Encendido", off: "Apagado"  },
    techo:      { on: "Abierto",   off: "Cerrado"  }
  };

  const nuevoEstado = sw.checked ? textos[id].on : textos[id].off;
  document.getElementById(id + "-status").innerText = nuevoEstado;

  // Bloquear el onValue por 4 s para que no revierta el switch
  // mientras el ESP32 procesa el cambio de modo y deja de escribir
  if (window._ignorarUpdate) {
    window._ignorarUpdate[id] = true;
    setTimeout(() => { window._ignorarUpdate[id] = false; }, 4000);
  }

  window._fbSet("actuadores/" + id, nuevoEstado);
}