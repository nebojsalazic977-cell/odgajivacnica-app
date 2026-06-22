const PIN = "4444"; // kasnije može iz Sheets-a

let AUTH = false;
const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API =
"https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

let DATA = null;
let ACTIVE_DOG = null;

window.onload = load;

// ===================== LOAD =====================

function load(){

  const app = document.getElementById("app");
  app.innerHTML = "Loading...";

  fetch(API + "?action=getBox&prostorId=" + PROSTOR_ID)
    .then(r => r.json())
    .then(data => {

      console.log("DATA:", data);

      if(!data || !data.success){
        app.innerHTML = "API ERROR";
        return;
      }

      DATA = data;

      // default active dog = first
      ACTIVE_DOG = data.pasi?.[0] || null;

      render();
    })
    .catch(err => {
      console.error(err);
      app.innerHTML = "NETWORK ERROR";
    });
}

// ===================== RENDER BOX =====================

function render(){

  const app = document.getElementById("app");

  const p = DATA.prostor;
  const pasi = DATA.pasi || [];
  const pranja = DATA.pranja || [];

  app.innerHTML = `
    
    <div class="card">
      <h2>📦 ${p.oznaka || "-"}</h2>
      <p>Status: ${p.status || "-"}</p>
      <p>Površina: ${p.povrsina || "-"}</p>
      <p><b>Broj pasa:</b> ${pasi.length}</p>
    </div>

    <div class="card">
      <h3>🐶 Psi u boksu</h3>
      ${pasi.map(p => `
        <button onclick="selectDog('${p.id}')"
          style="display:block;margin:5px 0;padding:6px;width:100%">
          ${p.ime}
        </button>
      `).join("")}
    </div>

    ${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : "<p>Nema pasa</p>"}

    <div class="card">
      <h3>🚿 Pranje boksa</h3>
      ${
        pranja.length
          ? `
            <p><b>Poslednje:</b> ${format(pranja.at(-1).datum)} - ${pranja.at(-1).oprao || "-"}</p>
            <button onclick="toggle('washHist')">Istorija</button>
            <div id="washHist" style="display:none">
              ${pranja.map(p => `<p>${format(p.datum)} - ${p.oprao}</p>`).join("")}
            </div>
          `
          : "<p>-</p>"
      }
    </div>
  `;
}

// ===================== DOG CARD =====================

function renderDog(d){

  const tezine = d.tezine || [];

  return `
    <div class="card">
      <h2>🐶 ${d.ime}</h2>
      <p>Pol: ${d.pol || "-"}</p>
      <p>Rođenje: ${d.rodjenje || "-"}</p>
      <p>Rodovnik: ${d.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>🍗 Težina</h3>
      <p><b>Poslednja:</b> ${tezine.length ? tezine.at(-1).tezina + " kg" : "-"}</p>
      <canvas id="chart"></canvas>
    </div>

    ${renderHealth("🐾 Krpelji", d.krpelji, "krpelji")}
    ${renderHealth("🪱 Paraziti", d.paraziti, "paraziti")}
    ${renderHealth("💉 Besnilo", d.besnilo, "besnilo")}
    ${renderHealth("⚙️ Ostalo", d.ostalo, "ostalo")}

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

// ===================== HEALTH BLOCK =====================

function renderHealth(title, data, key){

  if(!data) return "";

  return `
    <div class="card">
      <h3>${title}</h3>

      <p><b>Poslednje:</b> ${format(data.lastDate)}</p>
      <p><b>Sredstvo:</b> ${data.lastValue || "-"}</p>
      <p><b>Sledeće:</b> ${format(data.nextDate)}</p>

      <button onclick="toggle('${key}')">Istorija</button>

      <div id="${key}" style="display:none">
        ${(data.history || []).map(x =>
          `<p>${format(x.datum)} - ${x.value} → ${format(x.next)}</p>`
        ).join("")}
      </div>
    </div>
  `;
}

// ===================== SELECT DOG =====================

function selectDog(id){

  ACTIVE_DOG = DATA.pasi.find(p => p.id === id);
  render();

  setTimeout(() => drawChart(), 300);
}

// ===================== CHART =====================

function drawChart(){

  const el = document.getElementById("chart");
  if(!el || !ACTIVE_DOG?.tezine?.length) return;

  new Chart(el, {
    type: "line",
    data: {
      labels: ACTIVE_DOG.tezine.map(t => format(t.datum)),
      datasets: [{
        label: "Težina",
        data: ACTIVE_DOG.tezine.map(t => t.tezina),
        borderColor: "#111",
        tension: 0.3
      }]
    }
  });
}

// ===================== SAVE =====================

function save(type){

  if(!AUTH){
    alert("Nemaš dozvolu za unos");
    requestPIN();
    if(!AUTH) return;
  }

  const value = prompt("Unos sredstva:");
  if(!value) return;

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

function toggle(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// ===================== HELP =====================

function format(d){
  if(!d) return "-";
  return new Date(d).toLocaleDateString();
}
function requestPIN(){

  const input = prompt("Unesi PIN za izmene:");

  if(input === PIN){
    AUTH = true;
    alert("✔ Odobren pristup");
  } else {
    alert("❌ Pogrešan PIN");
  }
}
