
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
      <h2>📦 ${p[2]}</h2>
      <p>Status: ${p[5]}</p>
    </div>

    <div class="card">
      <h3>🐶 Pas</h3>
      <p>${pas?.ime || "-"}</p>
      <p>Rodovnik: ${pas?.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>🍗 Ishrana (istorija)</h3>
      ${d.istorija.tezine.map(t => `
        <p>${new Date(t.datum).toLocaleDateString()} - ${t.tezina} kg / ${t.hrana || "-"}</p>
      `).join("") || "-"}
    </div>

    <div class="card">
      <h3>🚿 Pranje</h3>
      ${d.istorija.pranja.map(p => `
        <p>${new Date(p.datum).toLocaleDateString()} - ${p.napomena}</p>
      `).join("") || "-"}
    </div>

    <div class="card">
      <h3>🏥 Zdravlje log</h3>
      <p>Krpelji: ${d.zdravlje.krpelji.length}</p>
      <p>Paraziti: ${d.zdravlje.paraziti.length}</p>
      <p>Besnilo: ${d.zdravlje.besnilo.length}</p>
    </div>

    <div class="card">
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
