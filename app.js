
const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

window.onload = load;

function load(){

  document.getElementById("app").innerHTML = "Loading...";

  window.cb = (data)=>{

    console.log("DATA:", data);

    if(!data || !data.success){
      document.getElementById("app").innerHTML = "Greška u učitavanju";
      return;
    }

    window.DATA = data;

    render(data);
  };

  const s = document.createElement("script");

  s.onerror = () => {
    document.getElementById("app").innerHTML = "API error";
  };

  s.src =
    CONFIG.API_URL +
    "?action=getBox&prostorId=" +
    PROSTOR_ID +
    "&callback=cb";

  document.body.appendChild(s);
}


function render(d){

  const p = d.prostor;
  const pas = d.pas || {};

  const tezine = d.istorija?.tezine || [];
  const pranja = d.istorija?.pranja || [];
  const zdravlje = d.zdravlje || {};

  document.getElementById("app").innerHTML = `
    
    <div class="card">
      <h2>📦 ${p?.[2] || "-"}</h2>
      <p>Status: ${p?.[5] || "-"}</p>
    </div>

    <div class="card">
      <h3>🐶 Pas</h3>
      <p>${pas.ime || "-"}</p>
      <p>Rodovnik: ${pas.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>🍗 Ishrana (istorija)</h3>
      ${
        tezine.length
          ? tezine.map(t => `
              <p>${new Date(t.datum).toLocaleDateString()} - ${t.tezina} kg / ${t.hrana || "-"}</p>
            `).join("")
          : "<p>-</p>"
      }
    </div>

    <div class="card">
      <h3>🚿 Pranje</h3>
      ${
        pranja.length
          ? pranja.map(pr => `
              <p>${new Date(pr.datum).toLocaleDateString()} - ${pr.napomena}</p>
            `).join("")
          : "<p>-</p>"
      }
    </div>

    <div class="card">
      <h3>🏥 Zdravlje log</h3>
      <p>Krpelji: ${zdravlje.krpelji?.length || 0}</p>
      <p>Paraziti: ${zdravlje.paraziti?.length || 0}</p>
      <p>Besnilo: ${zdravlje.besnilo?.length || 0}</p>
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
