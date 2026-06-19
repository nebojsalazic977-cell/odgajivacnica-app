const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API =
"https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

window.onload = load;

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

      render(data);
    })
    .catch(err => {
      console.error(err);
      app.innerHTML = "NETWORK ERROR";
    });
}

function render(d){

  const app = document.getElementById("app");

  const p = d.prostor || [];
  const pas = d.pas || {};

  const tezine = Array.isArray(d.istorija?.tezine) ? d.istorija.tezine : [];
  const pranja = Array.isArray(d.istorija?.pranja) ? d.istorija.pranja : [];

  const zdravlje = d.zdravlje || {};

  const lastWeight = tezine.length ? Number(tezine[tezine.length - 1].tezina) : null;

  const food = lastWeight ? (lastWeight * 0.03).toFixed(2) + " kg / dan" : "-";

  app.innerHTML = `
    
    <div class="card">
      <h2>📦 ${p[2] || "-"}</h2>
      <p><b>Status:</b> ${p[5] || "-"}</p>
      <p><b>Površina:</b> ${p[3] || "-"}</p>
    </div>

    <div class="card">
      <h3>📲 QR BOKS</h3>
      <img width="150"
        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}">
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

    <div class="card">
      <h3>🚿 Pranje</h3>
      ${pranja.length
        ? pranja.map(pr =>
            `<p>${formatDate(pr.datum)} - ${pr.napomena || "-"}</p>`
          ).join("")
        : "<p>-</p>"
      }
    </div>

    <div class="card">
      <h3>🏥 Zdravlje</h3>
      <p>Krpelji: ${safeLen(zdravlje.krpelji)}</p>
      <p>Paraziti: ${safeLen(zdravlje.paraziti)}</p>
      <p>Besnilo: ${safeLen(zdravlje.besnilo)}</p>
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

// ---------------- CHART SAFE

function drawChart(tezine){

  const el = document.getElementById("chart");

  if(!el){
    console.warn("NO CHART ELEMENT");
    return;
  }

  if(!window.Chart){
    console.warn("CHART.JS NOT LOADED");
    return;
  }

  if(!tezine || !tezine.length){
    return;
  }

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

// ---------------- SAVE

function save(type){

  const value = prompt("Unesi sredstvo (npr. NexGard / vakcina):");
  if(!value) return;

  const next = prompt("Datum sledeće doze (YYYY-MM-DD):");

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      type,
      prostorId: PROSTOR_ID,
      pasId: window.DATA?.pas?.id,
      value,
      next
    })
  }).then(() => load());
}

// ---------------- HELPERS

function safeLen(arr){
  return Array.isArray(arr) ? arr.length : 0;
}

function formatDate(d){
  if(!d) return "-";
  return new Date(d).toLocaleDateString();
}
