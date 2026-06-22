const ADMIN_PIN = "1234";
let AUTHORIZED = false;

const params = new URLSearchParams(window.location.search);
const PROSTOR_ID = params.get("prostor");

const API = "https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

let DATA = null;
let ACTIVE_DOG = null;

window.onload = load;

function load() {

  const app = document.getElementById("app");

  if (!PROSTOR_ID) {
    app.innerHTML = "❌ Missing PROSTOR ID";
    return;
  }

  app.innerHTML = "Loading...";

  fetch(`${API}?action=getBox&prostorId=${PROSTOR_ID}`)
    .then(r => r.json())
    .then(data => {

      console.log("API RESPONSE:", data);

      if (!data || !data.success) {
        app.innerHTML = "API ERROR (check Apps Script)";
        return;
      }

      DATA = data;
      ACTIVE_DOG = data.pasi?.[0] || null;

      render();
    })
    .catch(err => {
      console.error(err);
      app.innerHTML = "NETWORK ERROR (script not reachable)";
    });
}

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

function renderDog(d) {

  const last = d.tezine?.at(-1);

  return `
    <div class="card">
      <h2>${d.ime}</h2>
      <p>${d.pol || "-"}</p>
      <p>${d.rodjenje || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina</h3>
      <p>${last ? last.tezina + " kg" : "-"}</p>
    </div>

    <div class="card">
      <button onclick="save('tezina')">Unos težine</button>
    </div>
  `;
}

function selectDog(id) {
  ACTIVE_DOG = DATA.pasi.find(x => x.id === id);
  render();
}

function save(type) {

  if (!verifyPIN()) return;

  const value = prompt("Unos:");
  if (!value) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      type,
      pasId: ACTIVE_DOG.id,
      value
    })
  }).then(() => load());
}

function verifyPIN() {

  if (AUTHORIZED) return true;

  const pin = prompt("PIN:");

  if (pin === ADMIN_PIN) {
    AUTHORIZED = true;
    return true;
  }

  alert("Pogrešan PIN");
  return false;
}
