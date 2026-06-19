const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API =
"https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

window.onload = load;

function load(){

  const app = document.getElementById("app");
  if(!app) return;

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
  if(!app) return;

  const p = d.prostor || [];
  const pas = d.pas || {};
  const tezine = Array.isArray(d.istorija?.tezine) ? d.istorija.tezine : [];
  const pranja = Array.isArray(d.istorija?.pranja) ? d.istorija.pranja : [];
  const zdravlje = d.zdravlje || {};

  const lastWeight =
    tezine.length > 0 ? Number(tezine[tezine.length - 1].tezina) : null;

  const food = lastWeight
    ? (lastWeight * 0.03).toFixed(2) + " kg / dan"
    : "-";

  app.innerHTML = `
    
    <div class="card">
      <h2>📦 ${p[2] || "-"}</h2>
      <p>Status: ${p[5] || "-"}</p>
    </div>

    <div class="card">
      <h3>🐶 Pas</h3>
      <p>Ime: ${pas.ime || "-"}</p>
      <p>Rodovnik: ${pas.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>🍗 Ishrana</h3>
      <p>${food}</p>
    </div>

    <div class="card">
      <h3>🚿 Pranje</h3>
      ${pranja.length > 0
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
  `;
}

// --- helpers

function safeLen(arr){
  return Array.isArray(arr) ? arr.length : 0;
}

function formatDate(d){
  if(!d) return "-";
  return new Date(d).toLocaleDateString();
}
