const ADMIN_PIN = "1234";
let AUTH = false;

const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API = "https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

let DATA = null;
let ACTIVE = null;

window.onload = () => {
  if (!PROSTOR_ID) return show("Missing QR ID");
  load();
};

function show(t) {
  document.getElementById("app").innerHTML = t;
}

function load() {

  show("Loading...");

  fetch(`${API}?action=getBox&prostorId=${PROSTOR_ID}`)
    .then(r => r.json())
    .then(d => {

      if (!d.success) {
        console.log(d);
        return show("API ERROR");
      }

      DATA = d;
      ACTIVE = d.pasi?.[0] || null;
      render();
    })
    .catch(e => {
      console.log(e);
      show("NETWORK ERROR");
    });
}

function render() {

  const p = DATA.prostor || {};
  const psi = DATA.pasi || [];

  document.getElementById("app").innerHTML = `
    <div class="card">
      <h2>${p.oznaka || "-"}</h2>
      <p>${p.status || "-"}</p>
      <p>${p.povrsina || "-"}</p>
      <p>Pasa: ${psi.length}</p>
    </div>

    <div class="card">
      ${psi.map(x => `<button onclick="select('${x.id}')">${x.ime}</button>`).join("")}
    </div>

    ${ACTIVE ? dog(ACTIVE) : ""}
  `;
}

function dog(d) {

  return `
    <div class="card">
      <h2>${d.ime}</h2>
      <p>${d.pol}</p>
      <p>${d.rodjenje}</p>
    </div>

    <div class="card">
      <h3>Težina</h3>
      ${(d.tezine || []).map(t => `<p>${t.datum} → ${t.value}</p>`).join("")}
    </div>

    <div class="card">
      <h3>Ishrana</h3>
      ${(d.ishrana || []).map(i => `<p>${i.datum} → ${i.value}</p>`).join("")}
    </div>

    ${health("Krpelji", d.krpelji)}
    ${health("Paraziti", d.paraziti)}
    ${health("Besnilo", d.besnilo)}
  `;
}

function health(t, d) {
  if (!d) return "";
  return `
    <div class="card">
      <h3>${t}</h3>
      <p>${d.lastValue || "-"}</p>
    </div>
  `;
}

function select(id) {
  ACTIVE = DATA.pasi.find(x => x.id === id);
  render();
}

function save(type) {

  if (!AUTH) {
    if (prompt("PIN?") !== ADMIN_PIN) return;
    AUTH = true;
  }

  const value = prompt("Unos:");
  if (!value) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      type,
      pasId: ACTIVE.id,
      value
    })
  }).then(() => load());
}
