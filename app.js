const urlParams = new URLSearchParams(window.location.search);
const PROSTOR_ID = urlParams.get("prostor");

let DATA = null;

window.onload = loadBox;

function loadBox(){

  const script = document.createElement("script");

  window.handleResponse = function(data){

    console.log("DATA:", data);

    DATA = data;

    if(!data || !data.success){
      document.getElementById("app").innerHTML = "Greška u podacima";
      return;
    }

    render(data);
  }

  script.src =
    CONFIG.API_URL +
    "?action=getBox&prostorId=" + PROSTOR_ID +
    "&callback=handleResponse";

  document.body.appendChild(script);
}

function render(data){

  document.getElementById("app").innerHTML = `
    <h2>Boks: ${data.prostor[2]}</h2>

    <h3>Pas</h3>
    <p>${data.pas ? data.pas[2] : "Nema psa"}</p>
  `;
}
