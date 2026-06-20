const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API =
"https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

window.onload = load;

let DATA = null;

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
      render(data);
    })
    .catch(err => {
      console.error(err);
      app.innerHTML = "NETWORK ERROR";
    });
}


// ---------------- RENDER ----------------

function render(d){

  const app = document.getElementById("app");

  const p = d.prostor || [];
  const pas = d.pas || {};

  const tezine = Array.isArray(d.istorija?.tezine) ? d.istorija.tezine : [];
  const pranja = Array.isArray(d.istorija?.pranja) ? d.istorija.pranja : [];

  const zdravlje = d.zdravlje || {};

  const lastWeight = tezine.length ? Number(tezine.at(-1).tezina) : null;
  const food = lastWeight ? (lastWeight * 0.03).toFixed(2) + " kg / dan" : "-";


  app.innerHTML = `
    
    <div class="card">
      <h2>📦 ${p?.[2] || "-"}</h2>
      <p><b>Status:</b> ${p?.[5] || "-"}</p>
      <p><b>Površina:</b> ${p?.[3] || "-"}</p>
    </div>

   

    <div class="card">
      <h3>🐶 Pas</h3>
      <p><b>Ime:</b> ${pas.ime || "-"}</p>
      <p><b>Rodovnik:</b> ${pas.rodovnik || "-"}</p>
      <p><b>Rođenje:</b> ${pas.rodjenje || "-"}</p>
    </div>

    <div class="card">
      <h3>🍗 Ishrana</h3>
      <p>${food}</p>
    </div>

    <div class="card">
      <h3>📊 Težina</h3>
      <canvas id="chart"></canvas>
    </div>

    <!-- PRANJE: SAMO POSLEDNJE -->
    <div class="card">
      <h3>🚿 Pranje</h3>
      ${
        pranja.length
          ? `
            <p><b>Poslednje:</b> ${formatDate(pranja.at(-1).datum)} - ${pranja.at(-1).napomena || "-"}</p>
            <button onclick="toggle('pranja')">Istorija</button>
            <div id="pranja" style="display:none">
              ${pranja.map(p =>
                `<p>${formatDate(p.datum)} - ${p.napomena}</p>`
              ).join("")}
            </div>
          `
          : "<p>-</p>"
      }
    </div>

    <!-- KRPELJI -->
    <div class="card">
      <h3>🐾 Krpelji</h3>
      <p><b>Poslednje:</b> ${formatDate(zdravlje.krpelji?.lastDate)}</p>
      <p><b>Sredstvo:</b> ${zdravlje.krpelji?.lastValue || "-"}</p>
      <p><b>Sledeće:</b> ${formatDate(zdravlje.krpelji?.nextDate)}</p>

      <button onclick="toggle('krpeljiH')">Istorija</button>
      <div id="krpeljiH" style="display:none">
        ${(zdravlje.krpelji?.history || []).map(x =>
          `<p>${formatDate(x.datum)} - ${x.value} → ${formatDate(x.next)}</p>`
        ).join("")}
      </div>
    </div>

    <!-- PARAZITI -->
    <div class="card">
      <h3>🪱 Paraziti</h3>
      <p><b>Poslednje:</b> ${formatDate(zdravlje.paraziti?.lastDate)}</p>
      <p><b>Sredstvo:</b> ${zdravlje.paraziti?.lastValue || "-"}</p>
      <p><b>Sledeće:</b> ${formatDate(zdravlje.paraziti?.nextDate)}</p>

      <button onclick="toggle('parazitiH')">Istorija</button>
      <div id="parazitiH" style="display:none">
        ${(zdravlje.paraziti?.history || []).map(x =>
          `<p>${formatDate(x.datum)} - ${x.value} → ${formatDate(x.next)}</p>`
        ).join("")}
      </div>
    </div>

    <!-- BESNILO -->
    <div class="card">
      <h3>💉 Besnilo</h3>
      <p><b>Poslednje:</b> ${formatDate(zdravlje.besnilo?.lastDate)}</p>
      <p><b>Sredstvo:</b> ${zdravlje.besnilo?.lastValue || "-"}</p>
      <p><b>Sledeće:</b> ${formatDate(zdravlje.besnilo?.nextDate)}</p>

      <button onclick="toggle('besniloH')">Istorija</button>
      <div id="besniloH" style="display:none">
        ${(zdravlje.besnilo?.history || []).map(x =>
          `<p>${formatDate(x.datum)} - ${x.value} → ${formatDate(x.next)}</p>`
        ).join("")}
      </div>
    </div>

    <div class="card">
      <h3>⚙️ Akcije</h3>
      <button onclick="save('pranje')">Pranje</button>
      <button onclick="save('krpelji')">Krpelji</button>
      <button onclick="save('paraziti')">Paraziti</button>
      <button onclick="save('besnilo')">Besnilo</button>
    </div>

    <div id="formArea"></div>
  `;

  setTimeout(() => drawChart(tezine), 300);
}


// ---------------- CHART ----------------

function drawChart(tezine){

  const el = document.getElementById("chart");
  if(!el || !window.Chart || !tezine.length) return;

  const labels = tezine.map(t => formatDate(t.datum));
  const data = tezine.map(t => Number(t.tezina));

  new Chart(el, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Težina (kg)',
        data,
        borderColor: '#111',
        tension: 0.3
      }]
    }
  });
}


// ---------------- SAVE ----------------

function save(type){

  const value = prompt("Unesi sredstvo:");
  if(!value) return;

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


// ---------------- TOGGLE HISTORY ----------------

function toggle(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}


// ---------------- HELPERS ----------------

function formatDate(d){
  if(!d) return "-";
  return new Date(d).toLocaleDateString();
}
