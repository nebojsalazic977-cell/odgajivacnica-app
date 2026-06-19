
const urlParams = new URLSearchParams(window.location.search);
const PROSTOR_ID = urlParams.get("prostor");

window.onload = loadBox;

// -------------------- LOAD --------------------
function loadBox(){

  window.handleResponse = function(data){

    console.log("DATA:", data);

    if(!data || !data.success){
      document.getElementById("app").innerHTML = "Greška u učitavanju";
      return;
    }

    window.lastData = data; // 🔥 BITNO

    render(data);
  };

  const script = document.createElement("script");

  script.onerror = function(){
    document.getElementById("app").innerHTML = "API error";
  };

  script.src =
    CONFIG.API_URL +
    "?action=getBox&prostorId=" +
    PROSTOR_ID +
    "&callback=handleResponse";

  document.body.appendChild(script);
}

// -------------------- RENDER --------------------
function render(data){

  const p = data.prostor;
  const pas = data.pas;
  const s = data.smestaj;

  let html = "";

  html += `
    <div class="card">
      <h2>Boks: ${p[2]}</h2>
      <p>Tip: ${p[1]}</p>
      <p>Površina: ${p[3]} m2</p>
      <p>Status: ${p[5]}</p>
    </div>

    <div class="card">
      <h3>Pas</h3>
      <p><b>${pas ? pas[2] : "Nema psa"}</b></p>
    </div>
  `;

  if(s){
    html += `
      <div class="card">
        <h3>Smestaj</h3>
        <p>Ulazak: ${new Date(s[3]).toLocaleDateString()}</p>
      </div>
    `;
  }

  html += `
    <div class="card">
      <h3>Poslednji podaci</h3>
      <p>Težina: ${data.lastTezina ? data.lastTezina[3] + " kg" : "nema"}</p>
      <p>Pranje: ${data.lastPranje ? new Date(data.lastPranje[2]).toLocaleDateString() : "nema"}</p>
    </div>

    <div class="card">
      <h3>Unos</h3>
      <button onclick="openForm('tezina')">Nova težina</button>
      <button onclick="openForm('pranje')">Novo pranje</button>
    </div>

    <div id="formArea"></div>
  `;

  document.getElementById("app").innerHTML = html;
}

// -------------------- FORM --------------------
function openForm(type){

  let html = "";

  if(type === "tezina"){
    html = `
      <div class="card">
        <h3>Nova težina</h3>
        <input id="val" type="number" placeholder="kg">
        <button onclick="save('tezina')">Sačuvaj</button>
      </div>
    `;
  }

  if(type === "pranje"){
    html = `
      <div class="card">
        <h3>Novo pranje</h3>
        <input id="val" type="text" placeholder="napomena">
        <button onclick="save('pranje')">Sačuvaj</button>
      </div>
    `;
  }

  document.getElementById("formArea").innerHTML = html;
}

// -------------------- SAVE --------------------
function save(type){

  const value = document.getElementById("val").value;

  fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({
      type: type,
      prostorId: PROSTOR_ID,
      pasId: window.lastData?.pas?.[0],
      value: value
    })
  })
  .then(r => r.json())
  .then(res => {

    alert("Sačuvano!");

    document.getElementById("formArea").innerHTML = "";

    loadBox();
  });
}
