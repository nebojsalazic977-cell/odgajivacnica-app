
const urlParams = new URLSearchParams(window.location.search);
const PROSTOR_ID = urlParams.get("prostor");

window.onload = loadBox;

function loadBox(){

  window.handleResponse = function(data){

    if(!data || !data.success){
      document.getElementById("app").innerHTML = "Greška";
      return;
    }

    window.lastData = data;
    render(data);
  };

  const script = document.createElement("script");

  script.src =
    CONFIG.API_URL +
    "?action=getBox&prostorId=" +
    PROSTOR_ID +
    "&callback=handleResponse";

  document.body.appendChild(script);
}

function render(data){

  const p = data.prostor;
  const pas = data.pas;
  const s = data.smestaj;

  let html = "";

  html += `
    <div class="card">
      <h2>Boks: ${p[2]}</h2>
      <p>Status: ${p[5]}</p>
    </div>

    <div class="card">
      <h3>Pas</h3>
      <p>${pas ? pas[2] : "Nema psa"}</p>
    </div>

    <div class="card">
      <h3>Zdravlje</h3>
      <p>Krpelji: ${data.lastKrpelji ? "DA" : "NE"}</p>
      <p>Paraziti: ${data.lastParaziti ? "DA" : "NE"}</p>
      <p>Besnilo: ${data.lastBesnilo ? "DA" : "NE"}</p>
    </div>

    <div class="card">
      <h3>Težina</h3>
      <p>${data.lastTezina ? data.lastTezina[3] + " kg" : "nema"}</p>
      <p>Hrana: ${data.lastTezina ? data.lastTezina[4] + " g" : "nema"}</p>
    </div>

    <div class="card">
      <h3>Unos</h3>
      <button onclick="openForm('tezina')">Težina</button>
      <button onclick="openForm('pranje')">Pranje</button>
    </div>

    <div id="formArea"></div>
  `;

  document.getElementById("app").innerHTML = html;
}

function openForm(type){

  let html = "";

  if(type === "tezina"){
    html = `
      <div class="card">
        <h3>Težina</h3>
        <input id="val" type="number">
        <button onclick="save('tezina')">Sačuvaj</button>
      </div>
    `;
  }

  if(type === "pranje"){
    html = `
      <div class="card">
        <h3>Pranje</h3>
        <input id="val" type="text">
        <button onclick="save('pranje')">Sačuvaj</button>
      </div>
    `;
  }

  document.getElementById("formArea").innerHTML = html;
}

function save(type){

  fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({
      type,
      prostorId: PROSTOR_ID,
      pasId: window.lastData?.pas?.[0],
      value: document.getElementById("val").value
    })
  })
  .then(r => r.json())
  .then(() => {
    alert("Sačuvano");
    loadBox();
  });
}
