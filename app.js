const ADMIN_PIN = "1234";
let AUTHORIZED = false;

let DATA = null;
let ACTIVE_DOG = null;

// ================= URL PARAMS =================

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

  fetch(`${API}?action=getBox&prostorId=${encodeURIComponent(PROSTOR_ID)}`)
    .then(r => r.json())
    .then(data => {

      console.log("API RESPONSE:", data);

      if (!data || !data.success) {
        console.error("API ERROR:", data);
        app.innerHTML = "API ERROR";
        return;
      }

      DATA = data;

      ACTIVE_DOG = data.pasi?.length ? data.pasi[0] : null;

      render();
    })
    .catch(err => {
      console.error("NETWORK ERROR:", err);
      app.innerHTML = "NETWORK ERROR";
    });
}

// ================= RENDER BOX =================

function render() {

  const app = document.getElementById("app");

  const p = DATA?.prostor || {};
  const pasi = DATA?.pasi || [];

  app.innerHTML = `
    <div class="card">
      <h2>📦 ${p?.oznaka || "-"}</h2>
      <p><b>Status:</b> ${p?.status || "-"}</p>
      <p><b>Površina:</b> ${p?.povrsina || "-"}</p>
      <p><b>Broj pasa:</b> ${pasi.length}</p>
    </div>

    <div class="card">
      <h3>🐶 Psi u boksu</h3>

      ${pasi.length
        ? pasi.map(d => `
            <button onclick="selectDog('${d.id}')"
              style="display:block;width:100%;margin:5px 0;padding:8px;">
              ${d.ime || "-"}
            </button>
          `).join("")
        : "<p>Nema pasa</p>"
      }
    </div>

    ${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : "<div class='card'>Nema aktivnog psa</div>"}
  `;
}

// ================= DOG CARD =================

function renderDog(d) {

  const tezine = d?.tezine || [];
  const last = tezine.length ? tezine.at(-1) : null;

  return `
    <div class="card">
      <h2>🐶 ${d?.ime || "-"}</h2>
      <p><b>Pol:</b> ${d?.pol || "-"}</p>
      <p><b>Rođenje:</b> ${d?.rodjenje || "-"}</p>
      <p><b>Rodovnik:</b> ${d?.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina i hrana</h3>

      <p><b>Poslednja težina:</b> ${last?.tezina ?? "-"} kg</p>
      <p><b>Preporuka hrane:</b> ${last?.hrana ?? "-"} g</p>
    </div>

    <div class="card">
      <h3>⚙️ Akcije</h3>

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

  if (!ACTIVE_DOG) return;

  if (type === "tezina") {

    const tezina = prompt("Izmerena težina (kg):");
    if (!tezina) return;

    const hrana = prompt("Preporuka hrane (g):");

    fetch(API, {
      method: "POST",
      body: JSON.stringify({
        type: "tezina",
        pasId: ACTIVE_DOG.id,
        value: Number(tezina),
        hrana: Number(hrana || 0)
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
