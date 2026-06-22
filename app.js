const ADMIN_PIN = "1234";
let AUTHORIZED = false;

const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API = "https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

let DATA = null;
let ACTIVE_DOG = null;

// ===================== INIT =====================

window.onload = () => {
  if (!PROSTOR_ID) {
    document.getElementById("app").innerHTML = "MISSING PROSTOR ID";
    return;
  }
  load();
};

// ===================== LOAD =====================

function load() {
  const app = document.getElementById("app");
  app.innerHTML = "Loading...";

  fetch(API + "?action=getBox&prostorId=" + PROSTOR_ID)
    .then(r => r.json())
    .then(data => {

      console.log("API DATA:", data);

      if (!data || !data.success) {
        app.innerHTML = "API ERROR";
        return;
      }

      DATA = data;

      if (!ACTIVE_DOG) {
        ACTIVE_DOG = data.pasi?.[0] || null;
      } else {
        ACTIVE_DOG = data.pasi?.find(x => x.id === ACTIVE_DOG.id) || data.pasi?.[0] || null;
      }

      render();
    })
    .catch(err => {
      console.error(err);
      document.getElementById("app").innerHTML = "NETWORK ERROR";
    });
}

// ===================== RENDER BOX =====================

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
      <p><b>Broj pasa:</b> ${pasi.length}</p>
    </div>

    <div class="card">
      <h3>🐶 Psi u boksu</h3>
      ${pasi.map(d => `
        <button onclick="selectDog('${d.id}')" style="width:100%;margin:5px 0">
          ${d.ime}
        </button>
      `).join("")}
    </div>

    ${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : "<div class='card'>Nema pasa</div>"}

    <div class="card">
      <h3>🚿 Pranje boksa</h3>
      ${
        pranja.length
          ? `<p><b>Poslednje:</b> ${fmt(pranja.at(-1).datum)} - ${pranja.at(-1).oprao || "-"}</p>`
          : "<p>-</p>"
      }
    </div>
  `;

  setTimeout(drawChart, 200);
}

// ===================== DOG =====================

function renderDog(d) {

  const t = d.tezine || [];

  return `
    <div class="card">
      <h2>🐶 ${d.ime}</h2>
      <p>Pol: ${d.pol || "-"}</p>
      <p>Rođenje: ${d.rodjenje || "-"}</p>
      <p>Rodovnik: ${d.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>⚖️ Težina</h3>
      <p><b>Poslednja:</b> ${t.length ? t.at(-1).tezina + " kg" : "-"}</p>
      <p><b>Hrana:</b> ${t.length ? t.at(-1).hrana + " g" : "-"}</p>
      <canvas id="chart"></canvas>
    </div>

    ${healthBlock("Krpelji", d.krpelji, "krpelji")}
    ${healthBlock("Paraziti", d.paraziti, "paraziti")}
    ${healthBlock("Besnilo", d.besnilo, "besnilo")}
    ${healthBlock("Ostalo", d.ostalo, "ostalo")}

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

// ===================== HEALTH =====================

function healthBlock(title, d, key) {
  if (!d) return "";

  return `
    <div class="card">
      <h3>${title}</h3>

      <p><b>Poslednje:</b> ${fmt(d.lastDate)}</p>
      <p><b>Sredstvo:</b> ${d.lastValue || "-"}</p>
      <p><b>Sledeće:</b> ${fmt(d.nextDate)}</p>

      <button onclick="toggle('${key}')">Istorija</button>

      <div id="${key}" style="display:none">
        ${(d.history || []).map(x =>
          `<p>${fmt(x.datum)} - ${x.value} → ${fmt(x.next)}</p>`
        ).join("")}
      </div>
    </div>
  `;
}

// ===================== SELECT DOG =====================

function selectDog(id) {
  ACTIVE_DOG = DATA.pasi.find(x => x.id === id);
  render();
  setTimeout(drawChart, 200);
}

// ===================== CHART =====================

function drawChart() {
  const el = document.getElementById("chart");
  if (!el || !ACTIVE_DOG?.tezine?.length) return;

  new Chart(el, {
    type: "line",
    data: {
      labels: ACTIVE_DOG.tezine.map(x => fmt(x.datum)),
      datasets: [{
        label: "Težina",
        data: ACTIVE_DOG.tezine.map(x => Number(x.tezina)),
        borderColor: "#111",
        tension: 0.3
      }]
    }
  });
}

// ===================== PIN =====================

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

// ===================== SAVE =====================

function save(type) {

  if (!verifyPIN()) return;

  const value = prompt("Sredstvo / vrednost:");
  if (!value) return;

  const next = prompt("Sledeći datum (YYYY-MM-DD):");

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      type,
      prostorId: PROSTOR_ID,
      pasId: ACTIVE_DOG?.id,
      value,
      next
    })
  }).then(() => load());
}

// ===================== TOGGLE =====================

function toggle(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// ===================== HELP =====================

function fmt(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}
