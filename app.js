console.log("APP JS LOADED");
const urlParams = new URLSearchParams(window.location.search);
const PROSTOR_ID = urlParams.get("prostor");

let DATA = null;

window.onload = loadBox;

function loadBox(){

  const script = document.createElement("script");

  window.handleResponse = function(data){

    DATA = data;

    if(!data.success){
      document.getElementById("app").innerHTML = "Greška";
      return;
    }

    render(data);
  }

  script.src =
    CONFIG.API_URL +
    "?action=getBox&prostorId=" + PROSTOR_ID +
    "&callback=handleResponse";

  document.body.appendChild(script);
}

function render(data){

  const p = data.prostor;
  const s = data.smestaj;
  const pas = data.pas;

  let html = "";

  // 🟦 PROSTOR
  html += `
    <div class="card">
      <h2>Boks: ${p[2]}</h2>
      <p><b>Tip:</b> ${p[1]}</p>
      <p><b>Površina:</b> ${p[3]} m2</p>
      <p><b>Status:</b> ${p[5]}</p>
    </div>
  `;

  // 🐶 PAS
  if(pas){
    html += `
      <div class="card">
        <h3>Pas</h3>
        <p><b>Ime:</b> ${pas[2]}</p>
        <p><b>Pol:</b> ${pas[1]}</p>
        <p><b>Datum rođenja:</b> ${pas[3]}</p>
        <p><b>Rodovnik:</b> ${pas[4]}</p>
      </div>
    `;
  } else {
    html += `<div class="card"><p>Nema psa u boksu</p></div>`;
  }
  // 📊 LAST DATA
  if(data.lastTezina || data.lastPranje){

    html += `<div class="card"><h3>Poslednji podaci</h3>`;

    if(data.lastTezina){
      html += `<p><b>Težina:</b> ${data.lastTezina[3]} kg</p>`;
    }

    if(data.lastPranje){
      html += `<p><b>Pranje:</b> ${new Date(data.lastPranje[2]).toLocaleDateString()}</p>`;
    }

    html += `</div>`;
  }
  // 📦 SMESTAJ
  if(s){
    html += `
      <div class="card">
        <h3>Smestaj</h3>
        <p><b>Ulazak:</b> ${new Date(s[3]).toLocaleDateString()}</p>
      </div>
    `;
  }

  // 📊 AKCIJE
  html += `
    <div class="card">
      <h3>Unos podataka</h3>

      <button onclick="openForm('tezina')">Nova težina</button>
      <button onclick="openForm('pranje')">Novo pranje</button>
      <button onclick="openForm('krpelji')">Krpelji</button>
      <button onclick="openForm('paraziti')">Paraziti</button>
      <button onclick="openForm('besnilo')">Besnilo</button>
    </div>

    <div id="formArea"></div>
  `;

  document.getElementById("app").innerHTML = html;
}

function openForm(type){

  let form = "";

  if(type === "tezina"){
    form = `
      <div class="card">
        <h3>Nova težina</h3>
        <input id="val" placeholder="Težina (kg)">
        <button onclick="save('tezina')">Sačuvaj</button>
      </div>
    `;
  }

  if(type === "pranje"){
    form = `
      <div class="card">
        <h3>Novo pranje</h3>
        <input id="val" placeholder="Ko je oprao">
        <button onclick="save('pranje')">Sačuvaj</button>
      </div>
    `;
  }

  if(type === "krpelji"){
    form = `
      <div class="card">
        <h3>Krpelji</h3>
        <input id="val" placeholder="Sredstvo">
        <button onclick="save('krpelji')">Sačuvaj</button>
      </div>
    `;
  }

  if(type === "paraziti"){
    form = `
      <div class="card">
        <h3>Paraziti</h3>
        <input id="val" placeholder="Sredstvo">
        <button onclick="save('paraziti')">Sačuvaj</button>
      </div>
    `;
  }

  if(type === "besnilo"){
    form = `
      <div class="card">
        <h3>Besnilo</h3>
        <input id="val" placeholder="Vakcina">
        <button onclick="save('besnilo')">Sačuvaj</button>
      </div>
    `;
  }

  document.getElementById("formArea").innerHTML = form;
}

function save(type){

  const value = document.getElementById("val").value;

  fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "insert",
      type: type,
      prostorId: PROSTOR_ID,
      pasId: DATA?.pas?.[0],
      value: value
    })
  })
  .then(r => r.json())
  .then(res => {
    alert("Sačuvano!");
    loadBox();
    document.getElementById("formArea").innerHTML = "";
  });
}
