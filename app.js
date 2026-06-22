const ADMIN_PIN = "1234";
let AUTHORIZED = false;

const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API = "https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

let DATA = null;

// ================= LOAD =================

window.onload = load;

function load() {

  const app = document.getElementById("app");

  if (!PROSTOR_ID) {
    app.innerHTML = "MISSING PROSTOR_ID";
    return;
  }

  app.innerHTML = "Loading...";

  fetch(API + "?action=getBox&prostorId=" + PROSTOR_ID)
    .then(r => r.json())
    .then(data => {

      console.log("API:", data);

      if (!data || !data.success) {
        app.innerHTML = "API ERROR";
        return;
      }

      DATA = data;
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
  const pas = DATA.pas || null;
  const istorija = DATA.istorija || { tezine: [], pranja: [] };

  const tezine = istorija.tezine || [];
  const pranja = istorija.pranja || [];

  const last = tezine.length ? tezine.at(-1) : null;

  app.innerHTML = `
    <div class="card">
      <h2>📦 ${p.oznaka || "-"}</h2>
      <p>Status: ${p.status || "-"}</p>
      <p>Površina: ${p.povrsina || "-"}</p>
    </div>

    ${pas ? renderDog(pas, tezine) : "<div class='card'>Nema psa u boksu</div>"}

    <div class="card">
      <h3>🚿 Pranje boksa</h3>

      ${
        pranja.length
          ? `
            <p><b>Poslednje:</b> ${format(pranja.at(-1).datum)} - ${pranja.at(-1).napomena || "-"}</p>

            <button onclick="toggle('wash')">Istorija</button>

            <div id="wash" style="display:none">
              ${pranja.map(x => `
                <p>${format(x.datum)} - ${x.napomena || "-"}</p>
              `).join("")}
            </div>
          `
          : "<p>-</p>"
      }
    </div>
  `;

  setTimeout(drawChart, 200);
}

// ================= DOG =================

function renderDog(pas, tezine) {

  const last = tezine.length ? tezine.at(-1) : null;

  return `
    <div class="card">
      <h2>🐶 ${pas.ime || "-"}</h2>
      <p>Pol: ${pas.pol || "-"}</p>
      <p>Rođenje: ${pas.rodjenje || "-"}</p>
      <p>Rodovnik: ${pas.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina i ishrana</h3>

      <p><b>Težina:</b> ${last ? last.tezina + " kg" : "-"}</p>
      <p><b>Hrana:</b> ${last ? last.hrana + " g" : "-"}</p>

      <canvas id="chart"></canvas>
    </div>

    <div class="card">
      <h3>⚙️ Akcije</h3>

      <button onclick="save('tezina')">Težina</button>
      <button onclick="save('krpelji')">Krpelji</button>
      <button onclick="save('paraziti')">Paraziti</button>
      <button onclick="save('besnilo')">Besnilo</button>
      <button onclick="save('ostalo')">Ostalo</button>
    </div>
  `;
}

// ================= CHART =================

function drawChart() {

  const el = document.getElementById("chart");

  if (!el || !DATA?.istorija?.tezine?.length) return;

  const tezine = DATA.istorija.tezine;

  new Chart(el, {
    type: "line",
    data: {
      labels: tezine.map(x => format(x.datum)),
      datasets: [{
        label: "Težina (kg)",
        data: tezine.map(x => Number(x.tezina)),
        borderColor: "#111",
        tension: 0.3
      }]
    }
  });
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
      prostorId: PROSTOR_ID,
      pasId: DATA?.pas?.id,
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

// ================= HELPERS =================

function toggle(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function format(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}
