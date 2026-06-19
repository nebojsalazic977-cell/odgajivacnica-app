const urlParams = new URLSearchParams(window.location.search);
const PROSTOR_ID = urlParams.get("prostor");

window.onload = loadBox;

function loadBox(){

  window.handleResponse = function(data){

    console.log("DATA:", data);

    if(!data || !data.success){
      document.getElementById("app").innerHTML = "Greška u učitavanju";
      return;
    }

    render(data);
  }

  const script = document.createElement("script");

  script.src =
    CONFIG.API_URL +
    "?action=getBox&prostorId=" +
    PROSTOR_ID +
    "&callback=handleResponse";

  document.body.appendChild(script);
}function render(data){

  const p = data.prostor;
  const pas = data.pas;
  const s = data.smestaj;

  let html = "";

  // 🟦 BOKS
  html += `
    <div class="card">
      <h2>Boks: ${p[2]}</h2>
      <p>Tip: ${p[1]}</p>
      <p>Površina: ${p[3]} m2</p>
      <p>Status: ${p[5]}</p>
    </div>
  `;

  // 🐶 PAS
  html += `
    <div class="card">
      <h3>Pas</h3>
      <p><b>${pas ? pas[2] : "Nema psa"}</b></p>
      <p>${pas ? pas[1] : ""}</p>
    </div>
  `;

  // 📦 SMESTAJ
  if(s){
    html += `
      <div class="card">
        <h3>Smestaj</h3>
        <p>Ulazak: ${new Date(s[3]).toLocaleDateString()}</p>
      </div>
    `;
  }

  // 📊 LAST PODACI
  html += `<div class="card"><h3>Poslednji podaci</h3>`;

  html += `
    <p>Težina: ${data.lastTezina ? data.lastTezina[3] + " kg" : "nema"}</p>
    <p>Pranje: ${data.lastPranje ? new Date(data.lastPranje[2]).toLocaleDateString() : "nema"}</p>
  `;

  html += `</div>`;

  // 🔘 AKCIJE
  html += `
    <div class="card">
      <h3>Unos</h3>

      <button onclick="openForm('tezina')">Nova težina</button>
      <button onclick="openForm('pranje')">Novo pranje</button>
    </div>

    <div id="formArea"></div>
  `;

  document.getElementById("app").innerHTML = html;
}


