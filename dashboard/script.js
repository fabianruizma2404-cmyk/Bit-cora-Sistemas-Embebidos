const ctx = document.getElementById('mainChart');

const chartData = [

{
label:'Temperatura °C',
color:'#ff9800',
data:[20,22,25,27,28,29,30,29,27,25,24,23]
},

{
label:'Humedad Ambiental %',
color:'#22c55e',
data:[75,74,72,70,69,68,67,66,67,68,69,70]
},

{
label:'Humedad Suelo %',
color:'#3b82f6',
data:[55,54,52,50,49,47,46,45,44,43,42,41]
}

];

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

const chart = new Chart(ctx, {

type:'line',

data:{
labels:labels,

datasets:[{
label:chartData[0].label,
data:chartData[0].data,
borderColor:chartData[0].color,
backgroundColor:chartData[0].color + '33',
fill:true,
tension:0.4,
pointRadius:5
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

function showChart(index){

chart.data.datasets[0].label =
chartData[index].label;

chart.data.datasets[0].data =
chartData[index].data;

chart.data.datasets[0].borderColor =
chartData[index].color;

chart.data.datasets[0].backgroundColor =
chartData[index].color + '33';

chart.update();

document.querySelectorAll('.chart-btn')
.forEach(btn => btn.classList.remove('active-chart'));

document.querySelectorAll('.chart-btn')[index]
.classList.add('active-chart');

}

function setMode(id, mode, button){

const card = button.parentElement;

card.querySelectorAll('.mode-btn')
.forEach(btn => btn.classList.remove('active-btn'));

button.classList.add('active-btn');

const sw = document.getElementById(id + '-switch');

const status = document.getElementById(id + '-status');

if(mode === 'manual'){

sw.disabled = false;

}else{

sw.disabled = true;

sw.checked = false;

if(id === 'bomba'){
status.innerText = 'Apagada';
}

if(id === 'ventilador'){
status.innerText = 'Apagado';
}

if(id === 'techo'){
status.innerText = 'Cerrado';
}

}

}

function toggleActuator(id){

const sw = document.getElementById(id + '-switch');

const status = document.getElementById(id + '-status');

if(id === 'bomba'){

status.innerText =
sw.checked ? 'Encendida' : 'Apagada';

}

if(id === 'ventilador'){

status.innerText =
sw.checked ? 'Encendido' : 'Apagado';

}

if(id === 'techo'){

status.innerText =
sw.checked ? 'Abierto' : 'Cerrado';

}

}