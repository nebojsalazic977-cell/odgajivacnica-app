const ADMIN_PIN = "1234";
let AUTHORIZED = false;

const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API = "https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

let DATA = null;
let ACTIVE_DOG = null;

// ================= LOAD =================

window.onload = load;

function load(){

  const app = document.getElementById("app");
  app.innerHTML = "Loading...";

  fetch(API + "?action=getBox&prostorId=" + PROSTOR_ID)
    .then(r => r.json())
    .then(data => {

      if(!data || !data.success){
        app.innerHTML = "API ERROR";
        return;
      }

      DATA = data;
      ACTIVE_DOG = data.pasi?.[0] || null;

      render();
    })
    .catch(err => {
      console.error(err);
      document.getElementById("app").innerHTML = "NETWORK ERROR";
    });
}

// ================= RENDER =================

function render(){

  const app = document.getElementById("app");

  const p = DATA.prostor;
  const pasi = DATA.pasi || [];
  const pranja = DATA.pranja || [];

  app.innerHTML = `
    <div class="card">
      <h2>📦 ${p.oznaka}</h2>
      <p>Status: ${p.status}</p>
      <p>Površina: ${p.povrsina}</p>
      <p>Psi: ${pasi.length}</p>
    </div>

    <div class="card">
      <h3>🐶 Psi</h3>
      ${pasi.map(x => `
        <button onclick="selectDog('${x.id}')">
          ${x.ime}
        </button>
      `).join("")}
    </div>

    ${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : ""}
  `;
}

// ================= DOG =================

function renderDog(d){

  const lastWeight = d.tezine?.at(-1);
  const lastFood = d.ishrana?.at(-1);

  return `
    <div class="card">
      <h2>${d.ime}</h2>
      <p>Rođenje: ${d.rodjenje}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina</h3>
      <p>${lastWeight ? lastWeight.tezina + " kg" : "-"}</p>
    </div>

    <div class="card">
      <h3>🍗 Ishrana</h3>
      <p>${lastFood ? lastFood.hrana + " g" : "-"}</p>
    </div>

    <div class="card">
      <button onclick="save('tezina')">Težina</button>
      <button onclick="save('ishrana')">Ishrana</button>
      <button onclick="save('krpelji')">Krpelji</button>
      <button onclick="save('paraziti')">Paraziti</button>
      <button onclick="save('besnilo')">Besnilo</button>
    </div>
  `;
}

// ================= SAVE =================

function save(type){

  if(!verifyPIN()) return;

  if(type === "tezina"){

    const v = prompt("Težina (kg):");
    if(!v) return;

    fetch(API,{
      method:"POST",
      body:JSON.stringify({type:"tezina", pasId:ACTIVE_DOG.id, value:v})
    }).then(load);

    return;
  }

  if(type === "ishrana"){

    const v = prompt("Hrana (g):");
    if(!v) return;

    fetch(API,{
      method:"POST",
      body:JSON.stringify({type:"ishrana", pasId:ACTIVE_DOG.id, value:v})
    }).then(load);

    return;
  }
}

// ================= PIN =================

function verifyPIN(){

  if(AUTHORIZED) return true;

  const pin = prompt("PIN:");

  if(pin === ADMIN_PIN){
    AUTHORIZED = true;
    return true;
  }

  alert("Pogrešan PIN");
  return false;
}

// ================= SELECT =================

function selectDog(id){
  ACTIVE_DOG = DATA.pasi.find(x => x.id === id);
  render();
}
