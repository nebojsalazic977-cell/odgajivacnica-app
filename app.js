const PROSTOR_ID = new URLSearchParams(location.search).get("prostor");

const API =
"https://script.google.com/macros/s/AKfycbxjRNExBlTo99eYDD8LQjw2DGX_n9KY5es-XirSXzu5WGddOvZoBPfJV2GfJiyRRiQ_/exec";

window.onload = load;

function load(){

  document.getElementById("app").innerHTML = "Loading...";

  fetch(API + "?action=getBox&prostorId=" + PROSTOR_ID)
    .then(r => r.json())
    .then(data => {

      console.log("DATA:", data);

      if(!data || !data.success){
        document.getElementById("app").innerHTML = "API ERROR";
        return;
      }

      render(data);
    })
    .catch(err => {
      document.getElementById("app").innerHTML = "NETWORK ERROR";
      console.error(err);
    });
}

function render(d){

  const p = d.prostor;
  const pas = d.pas || {};
  const tezine = d.istorija?.tezine || [];
  const pranja = d.istorija?.pranja || [];
  const zdravlje = d.zdravlje || {};

  document.getElementById("app").innerHTML = `
    
    <div class="card">
      <h2>📦 ${p?.[2] || "-"}</h2>
      <p>Status: ${p?.[5] || "-"}</p>
    </div>

    <div class="card">
      <h3>🐶 Pas</h3>
      <p>${pas.ime || "-"}</p>
      <p>Rodovnik: ${pas.rodovnik || "-"}</p>
    </div>

    <div class="card">
      <h3>🍗 Ishrana</h3>
      <p>${tezine.length ? (tezine.at(-1).tezina * 0.03).toFixed(2) + " kg / dan" : "-"}</p>
    </div>

    <div class="card">
      <h3>🚿 Pranje</h3>
      ${pranja.length
        ? pranja.map(p => `<p>${new Date(p.datum).toLocaleDateString()} - ${p.napomena}</p>`).join("")
        : "<p>-</p>"
      }
    </div>

    <div class="card">
      <h3>🏥 Zdravlje</h3>
      <p>Krpelji: ${zdravlje.krpelji?.length || 0}</p>
      <p>Paraziti: ${zdravlje.paraziti?.length || 0}</p>
      <p>Besnilo: ${zdravlje.besnilo?.length || 0}</p>
    </div>
  `;
}
