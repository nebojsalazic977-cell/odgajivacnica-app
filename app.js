
const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

window.onload = load;

function load(){

  window.cb = (data)=>{

    if(!data.success){
      document.getElementById("app").innerHTML="ERROR";
      return;
    }

    window.DATA = data;
    render(data);
  };

  const s = document.createElement("script");
  s.src = CONFIG.API_URL + "?action=getBox&prostorId=" + PROSTOR_ID + "&callback=cb";
  document.body.appendChild(s);
}

function render(d){

  const p = d.prostor;
  const pas = d.pas;

  document.getElementById("app").innerHTML = `
    
    <div class="card">
      <h2>📦 BOKS: ${p.oznaka}</h2>
      <p>Status: ${p.status}</p>
      <p>Tip: ${p.tip}</p>
      <p>Površina: ${p.povrsina} m²</p>
    </div>

    <div class="card">
      <h3>🐶 PAS</h3>
      <p><b>${pas?.ime || "Nema psa"}</b></p>
      <p>Pol: ${pas?.pol || "-"}</p>
      <p>Rodovnik: ${pas?.rodovnik || "-"}</p>
      <p>Datum rođenja: ${pas?.rodjenje || "-"}</p>
    </div>

    <div class="card">
      <h3>🍗 ISHRANA</h3>
      <p>Težina: ${d.lastTezina?.tezina || "-"}</p>
      <p>Hrana: ${d.lastTezina?.hrana || "-"}</p>
    </div>

    <div class="card">
      <h3>🏥 ZDRAVLJE</h3>
      <p>Krpelji: ${d.health.krpelji ? "DA" : "NE"}</p>
      <p>Paraziti: ${d.health.paraziti ? "DA" : "NE"}</p>
      <p>Besnilo: ${d.health.besnilo ? "DA" : "NE"}</p>
    </div>

    <div class="card">
      <h3>⚙️ AKCIJE</h3>
      <button onclick="openForm('tezina')">Težina</button>
      <button onclick="openForm('pranje')">Pranje</button>
      <button onclick="openForm('krpelji')">Krpelji</button>
      <button onclick="openForm('paraziti')">Paraziti</button>
      <button onclick="openForm('besnilo')">Besnilo</button>
    </div>

    <div id="formArea"></div>
  `;
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

  fetch(CONFIG.API_URL,{
    method:"POST",
    body: JSON.stringify({
      type,
      prostorId: PROSTOR_ID,
      pasId: DATA.pas.id,
      tezina: document.getElementById("val").value,
      hrana: document.getElementById("val").value,
      value: document.getElementById("val").value
    })
  }).then(()=>load());
}
