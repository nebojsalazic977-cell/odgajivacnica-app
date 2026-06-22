const ADMIN_PIN = "1234";
let AUTHORIZED = false;

const params = new URLSearchParams(window.location.search);

const PROSTOR_ID =
  params.get("prostor") ||
  params.get("id");

const API =
"https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

let DATA = null;
let ACTIVE_DOG = null;

// ================= INIT =================

window.onload = () => {
  const app = document.getElementById("app");

  if (!PROSTOR_ID) {
    app.innerHTML = "❌ Missing QR parameter";
    return;
  }

  load();
};

// ================= LOAD =================

function load() {

  const app = document.getElementById("app");
  app.innerHTML = "Loading...";

  const url = `${API}?action=getBox&prostorId=${encodeURIComponent(PROSTOR_ID)}`;

  fetch(url)
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

  const p = DATA?.prostor || {};
  const pasi = DATA?.pasi || [];
  const pranja = DATA?.pranja || [];

  app.innerHTML = `
    <div class="card">
      <h2>📦 ${p.oznaka || "-"}</h2>
      <p>Status: ${p.status || "-"}</p>
      <p>Površina: ${p.povrsina || "-"}</p>
      <p><b>Pasa:</b> ${pasi.length}</p>
    </div>

    <div class="card">
      <h3>🐶 Psi</h3>
      ${pasi.map(d => `
        <button onclick="selectDog('${d.id}')">${d.ime}</button>
      `).join("")}
    </div>

    ${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : "<div class='card'>Nema pasa</div>"}

    ${renderPranje(pranja)}
  `;
}

// ================= DOG =================

function renderDog(d) {

  const last = d?.tezine?.at(-1);

  return `
    <div class="card">
      <h2>🐶 ${d.ime}</h2>
      <p>Pol: ${d.pol || "-"}</p>
      <p>Rođenje: ${d.rodjenje || "-"}</p>
      <p>Rodovnik: ${d.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina</h3>
      <p><b>${last?.tezina ?? "-"} kg</b></p>
      <p><b>Hrana:</b> ${last?.hrana ?? "-"} g</p>
    </div>

    ${renderHealth("🐾 Krpelji", d.krpelji)}
    ${renderHealth("🪱 Paraziti", d.paraziti)}
    ${renderHealth("💉 Besnilo", d.besnilo)}
    ${renderHealth("⚙️ Ostalo", d.ostalo)}

    <div class="card">
      <button onclick="save('tezina')">Težina</button>
      <button onclick="save('krpelji')">Krpelji</button>
      <button onclick="save('paraziti')">Paraziti</button>
      <button onclick="save('besnilo')">Besnilo</button>
      <button onclick="save('ostalo')">Ostalo</button>
    </div>
  `;
}

// ================= HEALTH =================

function renderHealth(title, data) {

  if (!data) return "";

  return `
    <div class="card">
      <h3>${title}</h3>
      <p><b>Poslednje:</b> ${format(data.lastDate)}</p>
      <p><b>Sredstvo:</b> ${data.lastValue || "-"}</p>
      <p><b>Sledeće:</b> ${format(data.nextDate)}</p>
    </div>
  `;
}

// ================= PRANJE =================

function renderPranje(pranja) {

  if (!pranja.length) return "";

  return `
    <div class="card">
      <h3>🚿 Pranje boksa</h3>
      <p><b>Poslednje:</b> ${format(pranja.at(-1).datum)}</p>
      <p><b>Napomena:</b> ${pranja.at(-1).napomena || "-"}</p>
    </div>
  `;
}

// ================= SELECT =================

function selectDog(id) {
  ACTIVE_DOG = DATA.pasi.find(x => x.id === id) || null;
  render();
}

// ================= SAVE =================

function save(type) {

  if (!verifyPIN()) return;

  const value = prompt("Unos:");
  if (!value) return;

  const next = prompt("Sledeći datum (YYYY-MM-DD):");

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      type,
      pasId: ACTIVE_DOG?.id,
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

// ================= HELP =================

function format(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}
