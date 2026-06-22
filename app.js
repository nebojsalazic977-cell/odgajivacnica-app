const ADMIN_PIN = "1234";
let AUTHORIZED = false;

const params = new URLSearchParams(window.location.search);

const PROSTOR_ID =
  params.get("prostor") ||
  params.get("id");

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

  const p = DATA.prostor || {};
  const pasi = DATA.pasi || [];

  app.innerHTML = `
    <div class="card">
      <h2>📦 ${p.oznaka || "-"}</h2>
      <p>Status: ${p.status || "-"}</p>
      <p>Površina: ${p.povrsina || "-"}</p>
      <p>Broj pasa: ${pasi.length}</p>
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
      <p>Pol: ${d.pol || "-"}</p>
      <p>Rođenje: ${d.rodjenje || "-"}</p>
      <p>Rodovnik: ${d.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina</h3>
      <p><b>${lastW?.value || "-"} kg</b></p>

      <h4>Istorija</h4>
      ${(d.tezine || []).map(t => `
        <p>${format(t.datum)} → ${t.value} kg</p>
      `).join("")}
    </div>

    <div class="card">
      <h3>🍖 Ishrana</h3>
      <p><b>${lastF?.value || "-"} g</b></p>

      <h4>Istorija</h4>
      ${(d.ishrana || []).map(i => `
        <p>${format(i.datum)} → ${i.value} g</p>
      `).join("")}
    </div>

    ${renderHealth("Krpelji", d.krpelji)}
    ${renderHealth("Paraziti", d.paraziti)}
    ${renderHealth("Besnilo", d.besnilo)}
    ${renderHealth("Ostalo", d.ostalo)}

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

// ================= HEALTH =================

function renderHealth(title, data) {

  if (!data) return "";

  return `
    <div class="card">
      <h3>${title}</h3>
      <p>Poslednje: ${format(data.lastDate)}</p>
      <p>Sredstvo: ${data.lastValue || "-"}</p>
      <p>Sledeće: ${format(data.nextDate)}</p>
    </div>
  `;
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

  const payload = {
    type,
    pasId: ACTIVE_DOG.id,
    value,
    next
  };

  console.log("SENDING:", payload);

fetch(API, {
  method: "POST",
  body: JSON.stringify(payload)
})
  .then(async r => {
    const text = await r.text();
    console.log("RAW RESPONSE:", text);

    return JSON.parse(text);
  })
  .then(res => {

    console.log("SERVER:", res);

    if (!res.success) {
      alert("SERVER ERROR: " + res.message);
      return;
    }

    load();
  })
  .catch(err => {
    console.error("POST ERROR:", err);
    alert("Greška pri unosu");
  });
}

// ================= HELPERS =================

function format(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

// ================= SELECT =================

function selectDog(id) {
  ACTIVE_DOG = DATA.pasi.find(x => x.id === id);
  render();
}
