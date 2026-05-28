// ─────────────────────────────────────────
// CHART — configuración base
// ─────────────────────────────────────────
const ctx = document.getElementById("mainChart");

// Índice activo: 0=Temp, 1=HumAire, 2=HumSuelo
let chartIndex = 0;

const chartMeta = [
  { key: "temp",     label: "Temperatura °C",      color: "#ff9800" },
  { key: "humAire",  label: "Humedad Ambiental %",  color: "#22c55e" },
  { key: "humSuelo", label: "Humedad Suelo %",       color: "#3b82f6" }
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
      fill:      true,
      tension:   0.4,
      pointRadius: 5
    }]
  },
  options: {
    responsive:          true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "white" } }
    },
    scales: {
      x: {
        ticks: { color: "#d1d5db" },
        grid:  { color: "rgba(255,255,255,0.08)" }
      },
      y: {
        ticks: { color: "#d1d5db" },
        grid:  { color: "rgba(255,255,255,0.08)" }
      }
    }
  }
});

// ─────────────────────────────────────────
// Actualizar gráfica con datos del historial
// ─────────────────────────────────────────
function aplicarHistorial(puntos) {
  const meta = chartMeta[chartIndex];

  chart.data.labels                      = puntos.map(p => p.hora);
  chart.data.datasets[0].data            = puntos.map(p => p[meta.key]);
  chart.data.datasets[0].label           = meta.label;
  chart.data.datasets[0].borderColor     = meta.color;
  chart.data.datasets[0].backgroundColor = meta.color + "33";
  chart.update();
}

// ─────────────────────────────────────────
// Suscribirse al historial en tiempo real
// (se llama cuando firebase.js ya cargó)
// ─────────────────────────────────────────
function suscribirHistorial() {
  if (typeof window.cargarHistorial === "function") {
    window.cargarHistorial(aplicarHistorial);
  } else {
    // firebase.js aún no terminó de cargar, reintentar
    setTimeout(suscribirHistorial, 300);
  }
}

suscribirHistorial();

// ─────────────────────────────────────────
// showChart — cambiar variable mostrada
// ─────────────────────────────────────────
function showChart(index) {
  chartIndex = index;

  document.querySelectorAll(".chart-btn")
    .forEach((btn, i) => btn.classList.toggle("active-chart", i === index));

  // La suscripción onValue de cargarHistorial ya reactualiza sola,
  // pero forzamos un refresco inmediato
  if (typeof window.cargarHistorial === "function") {
    window.cargarHistorial(aplicarHistorial);
  }
}

// ─────────────────────────────────────────
// setMode — Auto / Manual
// ─────────────────────────────────────────
function setMode(id, mode, button) {
  const card = button.parentElement;

  card.querySelectorAll(".mode-btn")
    .forEach(btn => btn.classList.remove("active-btn"));
  button.classList.add("active-btn");

  const sw = document.getElementById(id + "-switch");

  if (mode === "manual") {
    sw.disabled = false;
  } else {
    sw.disabled = true;
    // NO tocar sw.checked ni el status — Firebase los actualiza solo
    // Solo avisar al ESP32 que vuelve a auto
    if (typeof window._fbSet === "function") {
      window._fbSet(window._fbRef("control/" + id + "/modo"), "auto");
    }
  }
}

// ─────────────────────────────────────────
// toggleActuator — encender/apagar manual
// ─────────────────────────────────────────
function toggleActuator(id) {
  const sw     = document.getElementById(id + "-switch");
  const status = document.getElementById(id + "-status");

  // Textos de estado
  const textos = {
    bomba:       { on: "Encendida", off: "Apagada"  },
    ventilador:  { on: "Encendido", off: "Apagado"  },
    techo:       { on: "Abierto",   off: "Cerrado"  }
  };

  const texto = sw.checked ? textos[id].on : textos[id].off;
  status.innerText = texto;

  // Escribir en Firebase
  if (typeof window._fbSet === "function") {

    // Estado visible en /actuadores/
    window._fbSet(
      window._fbRef("actuadores/" + id),
      texto
    );

    // Nodo de control para que el ESP32 lo lea
    window._fbSet(
      window._fbRef("control/" + id + "/modo"),
      "manual"
    );
    window._fbSet(
      window._fbRef("control/" + id + "/estado"),
      sw.checked ? "on" : "off"
    );
  }
}