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
    app.innerHTML = "❌ Missing prostor ID";
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

  const lastWash = pranja.length ? pranja[pranja.length - 1] : null;

  app.innerHTML = `
    
    <!-- BOX INFO + PRANJE -->
    <div class="card">
      <h2>📦 ${p.oznaka || "-"}</h2>

      <p><b>Status:</b> ${p.status || "-"}</p>
      <p><b>Površina:</b> ${p.povrsina || "-"}</p>
      <p><b>Broj pasa:</b> ${pasi.length}</p>

      <hr>

      <h3>🚿 Pranje boksa</h3>
      <p><b>Poslednje:</b> ${lastWash ? format(lastWash.datum) : "-"}</p>
      <p><b>Oprao:</b> ${lastWash?.oprao || "-"}</p>

      <button onclick="toggleWash()">Istorija pranja</button>

      <div id="washBox" style="display:none">
        ${pranja.map(p => `
          <p>${format(p.datum)} → ${p.oprao || "-"}</p>
        `).join("")}
      </div>
    </div>

    <!-- PSI -->
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

  const tezine = d?.tezine || [];
  const last = tezine.length ? tezine[tezine.length - 1] : null;

  return `
    <div class="card">
      <h2>${d.ime}</h2>
      <p>Pol: ${d.pol || "-"}</p>
      <p>Rođenje: ${d.rodjenje || "-"}</p>
      <p>Rodovnik: ${d.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina</h3>
      <p><b>${last?.tezina ?? "-"} kg</b></p>
      <p><b>Hrana:</b> ${last?.hrana ?? "-"} g</p>

      <h4>Istorija težine</h4>
      ${tezine.map(t => `
        <p>${format(t.datum)} → ${t.tezina} kg / ${t.hrana || 0} g</p>
      `).join("")}
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

      <h4>Istorija</h4>
      ${(data.history || []).map(h =>
        `<p>${format(h.datum)} → ${h.value}</p>`
      ).join("")}
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
    if (pin !== ADMIN_PIN) {
      alert("Wrong PIN");
      return;
    }
    AUTHORIZED = true;
  }

  // TEZINA
  if (type === "tezina") {

    const value = prompt("Težina (kg):");
    if (!value) return;

    const hrana = prompt("Hrana (g):");

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        pasId: ACTIVE_DOG.id,
        value,
        hrana: hrana || 0
      })
    }).then(() => load());

    return;
  }

  // HEALTH
  const value = prompt("Sredstvo:");
  if (!value) return;

  const next = prompt("Sledeći datum:");

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      pasId: ACTIVE_DOG.id,
      value,
      next
    })
  }).then(() => load());
}

// ================= HELPERS =================

function format(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}
function toggleWash() {
  const el = document.getElementById("washBox");
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}
