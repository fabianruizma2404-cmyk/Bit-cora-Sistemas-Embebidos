const labels = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00'
];

const tempData = [22,23,23,25,26,27,26,25,24,24,23,24];

const humAmbData = [72,70,68,65,63,61,63,65,67,68,69,68];

const humSueloData = [55,54,52,50,48,46,44,43,42,41,41,41];

new Chart(document.getElementById('histChart'), {

  type:'line',

  data:{
    labels,

    datasets:[
      {
        label:'Temperatura',
        data:tempData,
        borderColor:'#EF9F27',
        backgroundColor:'rgba(239,159,39,0.08)',
        tension:0.4,
        fill:true
      },

      {
        label:'Humedad ambiental',
        data:humAmbData,
        borderColor:'#1D9E75',
        backgroundColor:'rgba(29,158,117,0.08)',
        tension:0.4,
        fill:true
      },

      {
        label:'Humedad del suelo',
        data:humSueloData,
        borderColor:'#378ADD',
        backgroundColor:'rgba(55,138,221,0.08)',
        tension:0.4,
        fill:true
      }
    ]
  },

  options:{
    responsive:true,
    maintainAspectRatio:false,

    plugins:{
      legend:{
        labels:{
          color:'#ccc'
        }
      }
    },

    scales:{
      x:{
        ticks:{
          color:'#aaa'
        },
        grid:{
          color:'rgba(255,255,255,0.05)'
        }
      },

      y:{
        min:20,
        max:85,

        ticks:{
          color:'#aaa'
        },

        grid:{
          color:'rgba(255,255,255,0.05)'
        }
      }
    }
  }

});

const labels_actuator = {

  bomba:['Apagada','Encendida'],
  ventilador:['Apagado','Encendido'],
  techo:['Cerrado','Abierto']

};

function updateActuator(id){

  const cb = document.getElementById('toggle-' + id);

  const st = document.getElementById('status-' + id);

  const on = cb.checked;

  st.textContent = labels_actuator[id][on ? 1 : 0];

  st.className = 'actuator-status' + (on ? ' on' : '');

}

function setMode(id, mode, btn){

  const parent = btn.parentElement;

  parent.querySelectorAll('.mode-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');

  const cb = document.getElementById('toggle-' + id);

  cb.disabled = (mode === 'auto');

  if(mode === 'auto'){

    cb.checked = false;

    updateActuator(id);

  }

}

setInterval(() => {

  document.getElementById('updateTime').innerHTML =
    '<i class="ti ti-clock"></i> Última actualización: hace ' +
    Math.floor(Math.random() * 30 + 5) +
    ' segundos';

}, 5000);