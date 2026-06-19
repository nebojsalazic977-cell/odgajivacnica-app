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

  const s = document.createElement("script");

  s.src =
    CONFIG.API_URL +
    "?action=getBox&prostorId=" +
    PROSTOR_ID +
    "&callback=handleResponse";

  document.body.appendChild(s);
}

function render(data){

  const p = data.prostor;
  const pas = data.pas;

  let html = "";

  html += `
    <div class="card">
      <h2>Boks: ${p.oznaka}</h2>
      <p>Status: ${p.status}</p>
    </div>

    <div class="card">
      <h3>Pas</h3>
      <p><b>${pas?.ime || "-"}</b></p>
      <p>Pol: ${pas?.pol || "-"}</p>
      <p>Datum rođenja: ${pas?.datumRodjenja || "-"}</p>
      <p>Rodovnik: ${pas?.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>Ishrana</h3>
      <p>Težina: ${data.lastTezina?.tezina || "-"}</p>
      <p>Hrana: ${data.lastTezina?.hrana || "-"}</p>
    </div>

    <div class="card">
      <h3>Zdravlje</h3>
      <p>Krpelji: ${data.lastKrpelji ? "DA" : "NE"}</p>
      <p>Paraziti: ${data.lastParaziti ? "DA" : "NE"}</p>
      <p>Besnilo: ${data.lastBesnilo ? "DA" : "NE"}</p>
    </div>

    <div class="card">
      <h3>Pranje</h3>
      <p>${data.lastPranje?.napomena || "-"}</p>
      <button onclick="openForm('pranje')">Novo pranje</button>
    </div>

    <div class="card">
      <h3>Unos</h3>
      <button onclick="openForm('tezina')">Težina</button>
      <button onclick="openForm('krpelji')">Krpelji</button>
      <button onclick="openForm('paraziti')">Paraziti</button>
      <button onclick="openForm('besnilo')">Besnilo</button>
    </div>

    <div id="formArea"></div>
  `;

  document.getElementById("app").innerHTML = html;
}

function openForm(type){

  document.getElementById("formArea").innerHTML = `
    <div class="card">
      <input id="val" placeholder="unos">
      <button onclick="save('${type}')">Sačuvaj</button>
    </div>
  `;
}

function save(type){

  fetch(CONFIG.API_URL, {
    method:"POST",
    body: JSON.stringify({
      type,
      prostorId: PROSTOR_ID,
      pasId: window.lastData.pas.id,
      value: document.getElementById("val").value
    })
  })
  .then(r => r.json())
  .then(() => loadBox());
}
