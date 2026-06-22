const ADMIN_PIN = "1234";
let AUTHORIZED = false;
let DATA = null;
let ACTIVE_DOG = null;

// ================= URL SAFE PARSING =================

const params = new URLSearchParams(window.location.search);

const PROSTOR_ID =
  params.get("prostor") ||
  params.get("id");

const API =
"https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

// ================= INIT =================

window.onload = () => {

  const app = document.getElementById("app");

  if (!PROSTOR_ID) {
    app.innerHTML = "❌ Missing prostor ID (QR link nije validan)";
    return;
  }

  load();
};

// ================= LOAD =================

function load() {

  const app = document.getElementById("app");
  app.innerHTML = "Loading...";

  fetch(API + "?action=getBox&prostorId=" + PROSTOR_ID)
    .then(r => r.json())
    .then(data => {

      if (!data || !data.success) {
        console.error(data);
        app.innerHTML = "API ERROR";
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

  const p = DATA.prostor;
  const pasi = DATA.pasi || [];

  app.innerHTML = `
    <div class="card">
      <h2>📦 ${p?.oznaka || "-"}</h2>
      <p>Status: ${p?.status || "-"}</p>
      <p>Površina: ${p?.povrsina || "-"}</p>
      <p><b>Pasa:</b> ${pasi.length}</p>
    </div>

    <div class="card">
      <h3>🐶 Psi u boksu</h3>
      ${pasi.map(d => `
        <button onclick="selectDog('${d.id}')">
          ${d.ime}
        </button>
      `).join("")}
    </div>

    ${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : "<div class='card'>Nema pasa</div>"}
  `;
}

// ================= DOG =================

function renderDog(d) {

  const last = d.tezine?.at(-1);

  return `
    <div class="card">
      <h2>🐶 ${d.ime}</h2>
      <p>Pol: ${d.pol || "-"}</p>
      <p>Rođenje: ${d.rodjenje || "-"}</p>
      <p>Rodovnik: ${d.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina</h3>
      <p><b>${last?.tezina || "-"} kg</b></p>
      <p><b>Hrana:</b> ${last?.hrana || "-"} g</p>
    </div>

    <div class="card">
      <button onclick="save('tezina')">Unos težine</button>
      <button onclick="save('krpelji')">Krpelji</button>
      <button onclick="save('paraziti')">Paraziti</button>
      <button onclick="save('besnilo')">Besnilo</button>
      <button onclick="save('ostalo')">Ostalo</button>
    </div>
  `;
}

// ================= SELECT DOG =================

function selectDog(id) {
  ACTIVE_DOG = DATA.pasi.find(x => x.id === id);
  render();
}

// ================= SAVE =================

function save(type) {

  if (!verifyPIN()) return;

  if (type === "tezina") {

    const tezina = prompt("Izmerena težina (kg):");
    if (!tezina) return;

    const hrana = prompt("Preporuka hrane (g):");

    fetch(API, {
      method: "POST",
      body: JSON.stringify({
        type: "tezina",
        pasId: ACTIVE_DOG.id,
        value: tezina,
        hrana: hrana || 0
      })
    }).then(() => load());

    return;
  }

  const value = prompt("Sredstvo:");
  if (!value) return;

  const next = prompt("Sledeći datum (YYYY-MM-DD):");

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      type,
      pasId: ACTIVE_DOG.id,
      value,
      next
    })
  }).then(() => load());
}

// ================= PIN =================

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
