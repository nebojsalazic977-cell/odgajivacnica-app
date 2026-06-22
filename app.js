const ADMIN_PIN = "1234";
let AUTHORIZED = false;

const params = new URLSearchParams(window.location.search);

const PROSTOR_ID = params.get("prostor") || params.get("id");

const API = "https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

let DATA = null;
let ACTIVE_DOG = null;

// ================= INIT =================

window.onload = () => {

  if (!PROSTOR_ID) {
    document.getElementById("app").innerHTML = "Missing prostor ID";
    return;
  }

  load();
};

// ================= LOAD =================

function load() {

  const app = document.getElementById("app");
  app.innerHTML = "Loading...";

  fetch(`${API}?action=getBox&prostorId=${PROSTOR_ID}`)
    .then(r => r.json())
    .then(data => {

      if (!data.success) {
        app.innerHTML = "API ERROR";
        console.error(data);
        return;
      }

      DATA = data;
      ACTIVE_DOG = data.pasi?.[0] || null;

      render();
    })
    .catch(err => {
      console.error(err);
      app.innerHTML = "NETWORK ERROR";
    });
}

// ================= RENDER =================

function render() {

  const app = document.getElementById("app");
  const p = DATA.prostor || {};
  const pasi = DATA.pasi || [];

  app.innerHTML = `
    <div class="card">
      <h2>📦 ${p.oznaka || "-"}</h2>
      <p>Status: ${p.status || "-"}</p>
      <p>Površina: ${p.povrsina || "-"}</p>
      <p>Pasa: ${pasi.length}</p>
    </div>

    <div class="card">
      <h3>🐶 Psi</h3>
      ${pasi.map(d => `
        <button onclick="selectDog('${d.id}')">${d.ime}</button>
      `).join("")}
    </div>

    ${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : ""}
  `;
}

// ================= DOG =================

function renderDog(d) {

  const lastW = d.tezine?.at(-1);
  const lastF = d.ishrana?.at(-1);

  return `
    <div class="card">
      <h2>${d.ime}</h2>
      <p>${d.pol || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina</h3>
      <p>${lastW?.value || "-"} kg</p>
    </div>

    <div class="card">
      <h3>🍖 Ishrana</h3>
      <p>${lastF?.value || "-"} g</p>
    </div>

    <div class="card">
      <button onclick="save('tezina')">Težina</button>
      <button onclick="save('ishrana')">Ishrana</button>
      <button onclick="save('krpelji')">Krpelji</button>
      <button onclick="save('paraziti')">Paraziti</button>
      <button onclick="save('besnilo')">Besnilo</button>
      <button onclick="save('ostalo')">Ostalo</button>
    </div>
  `;
}

// ================= SELECT =================

function selectDog(id) {
  ACTIVE_DOG = DATA.pasi.find(x => x.id === id);
  render();
}

// ================= SAVE =================

function save(type) {

  if (!AUTHORIZED) {
    const pin = prompt("PIN?");
    if (pin !== ADMIN_PIN) return;
    AUTHORIZED = true;
  }

  const value = prompt("Unos:");
  if (!value) return;

  const next = prompt("Sledeći datum (opciono)");

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      pasId: ACTIVE_DOG.id,
      value,
      next
    })
  })
  .then(r => r.json())
  .then(res => {

    if (!res.success) {
      alert("Greška pri unosu");
      console.error(res);
      return;
    }

    load();
  })
  .catch(err => {
    console.error(err);
    alert("Network error");
  });
}
