const urlParams = new URLSearchParams(window.location.search);
const PROSTOR_ID = urlParams.get("prostor");

let DATA = null;

window.onload = loadBox;

function loadBox(){

  fetch(`${CONFIG.API_URL}?action=getBox&prostorId=${PROSTOR_ID}`)
    .then(r => r.json())
    .then(data => {

      DATA = data;

      if(!data.success){
        document.getElementById("boxTitle").innerText = "Greška";
        return;
      }

      render(data);
    });
}

function render(data){

  document.getElementById("boxTitle").innerText =
    "Boks: " + PROSTOR_ID;

  let html = "";

  if(data.pas){

    html += `
      <h3>Pas</h3>
      <p><b>Ime:</b> ${data.pas[2]}</p>
      <p><b>Pol:</b> ${data.pas[1]}</p>
      <p><b>Rodovnik:</b> ${data.pas[4]}</p>
    `;
  } else {
    html += "<p>Nema psa u boksu</p>";
  }

  document.getElementById("dogInfo").innerHTML = html;
}

function openForm(type){

  let form = "";

  if(type === "tezina"){
    form = `
      <h3>Nova težina</h3>
      <input id="val" placeholder="Težina">
      <button onclick="save('tezina')">Sačuvaj</button>
    `;
  }

  if(type === "pranje"){
    form = `
      <h3>Novo pranje</h3>
      <input id="val" placeholder="Oprao (ime)">
      <button onclick="save('pranje')">Sačuvaj</button>
    `;
  }

  if(type === "krpelji"){
    form = `<h3>Krpelji</h3><input id="val"><button onclick="save('krpelji')">Sačuvaj</button>`;
  }

  if(type === "paraziti"){
    form = `<h3>Paraziti</h3><input id="val"><button onclick="save('paraziti')">Sačuvaj</button>`;
  }

  if(type === "besnilo"){
    form = `<h3>Besnilo</h3><input id="val"><button onclick="save('besnilo')">Sačuvaj</button>`;
  }

  document.getElementById("formArea").innerHTML = form;
}

function save(type){

  const value = document.getElementById("val").value;

  fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "insert",
      type: type,
      prostorId: PROSTOR_ID,
      pasId: DATA?.pas?.[0],
      value: value
    })
  })
  .then(r => r.json())
  .then(res => {
    alert("Sačuvano!");
    loadBox();
    document.getElementById("formArea").innerHTML = "";
  });
}
