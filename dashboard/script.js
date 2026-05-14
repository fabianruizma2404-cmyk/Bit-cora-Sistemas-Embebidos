// FIREBASE CONFIG
const firebaseConfig = {

  apiKey: "temp",

  databaseURL:
  "https://embebidos-c22c3-default-rtdb.firebaseio.com"

};

// INICIALIZAR
firebase.initializeApp(firebaseConfig);

const db = firebase.database();

// REFERENCIA
const riegoRef = db.ref("sistema_riego");

// HISTORICO
const soilHistory = [];
const labels = [];

// GRAFICA
const ctx =
document.getElementById("mainChart");

const chart = new Chart(ctx, {

  type:'line',

  data:{

    labels:labels,

    datasets:[{

      label:'Humedad del suelo (%)',

      data:soilHistory,

      borderColor:'#3b82f6',

      backgroundColor:'#3b82f633',

      fill:true,

      tension:0.4,

      pointRadius:4

    }]

  },

  options:{

    responsive:true,

    maintainAspectRatio:false,

    plugins:{
      legend:{
        labels:{
          color:'white'
        }
      }
    },

    scales:{

      x:{
        ticks:{
          color:'#d1d5db'
        },
        grid:{
          color:'rgba(255,255,255,0.08)'
        }
      },

      y:{

        min:0,
        max:100,

        ticks:{
          color:'#d1d5db'
        },

        grid:{
          color:'rgba(255,255,255,0.08)'
        }

      }

    }

  }

});


// TIEMPO REAL
riegoRef.on('value', (snapshot) => {

  const data = snapshot.val();

  if(!data) return;

  // DATOS FIREBASE
  const humedadRaw =
  data.nivel_humedad;

  const estadoBomba =
  data.estado_bomba;

  // CONVERSION ADC -> %
  let humedad = Math.round(
    100 - ((humedadRaw / 4095) * 100)
  );

  humedad = Math.max(0, humedad);
  humedad = Math.min(100, humedad);

  // DASHBOARD
  document.getElementById('soilValue')
  .innerText = humedad;

  // ALERTA
  const soilStatus =
  document.getElementById('soilStatus');

  if(humedad < 50){

    soilStatus.innerHTML =
    '⚠ Humedad baja';

    soilStatus.className =
    'sensor-status warn';

  }else{

    soilStatus.innerHTML =
    '✓ Humedad correcta';

    soilStatus.className =
    'sensor-status ok';

  }

  // ESTADO BOMBA
  const bombaSwitch =
  document.getElementById('bomba-switch');

  const bombaStatus =
  document.getElementById('bomba-status');

  const pumpState =
  document.getElementById('pumpState');

  const pumpStatus =
  document.getElementById('pumpStatus');

  if(estadoBomba === "Encendida"){

    bombaSwitch.checked = true;

    bombaStatus.innerText =
    'Encendida';

    pumpState.innerText =
    'ON';

    pumpStatus.innerHTML =
    '✓ Sistema de riego activo';

    pumpStatus.className =
    'sensor-status ok';

  }else{

    bombaSwitch.checked = false;

    bombaStatus.innerText =
    'Apagada';

    pumpState.innerText =
    'OFF';

    pumpStatus.innerHTML =
    '⚠ Sistema detenido';

    pumpStatus.className =
    'sensor-status warn';

  }

  // HISTORICO
  const now =
  new Date().toLocaleTimeString();

  labels.push(now);

  soilHistory.push(humedad);

  // LIMITAR
  if(labels.length > 15){

    labels.shift();
    soilHistory.shift();

  }

  chart.update();

  // FOOTER
  document.getElementById('lastUpdate')
  .innerHTML =
  '⏺ Última actualización: ' + now;

});