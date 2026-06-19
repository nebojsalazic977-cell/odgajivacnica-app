const urlParams = new URLSearchParams(window.location.search);
const PROSTOR_ID = urlParams.get("prostor");

window.onload = loadBox;

function loadBox(){

  window.handleResponse = function(data){

    console.log("DATA:", data);

    if(!data || !data.success){
      document.getElementById("app").innerHTML = "Greška u učitavanju";
      return;
    }

    render(data);
  }

  const script = document.createElement("script");

  script.src =
    CONFIG.API_URL +
    "?action=getBox&prostorId=" +
    PROSTOR_ID +
    "&callback=handleResponse";

  document.body.appendChild(script);
}

function render(data){

  const p = data.prostor;
  const pas = data.pas;
  const s = data.smestaj;

  let html = "";

  html += `
    <div class="card">
      <h2>Boks: ${p[2]}</h2>
      <p>Tip: ${p[1]}</p>
      <p>Površina: ${p[3]} m2</p>
      <p>Status: ${p[5]}</p>
    </div>

    <div class="card">
      <h3>Pas</h3>
      <p>${pas ? pas[2] : "Nema psa"}</p>
    </div>
  `;

  if(s){
    html += `
      <div class="card">
        <h3>Smestaj</h3>
        <p>Ulazak: ${new Date(s[3]).toLocaleDateString()}</p>
      </div>
    `;
  }

  document.getElementById("app").innerHTML = html;
}
