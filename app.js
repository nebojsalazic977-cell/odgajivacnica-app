const ADMIN_PIN = "1234";
let AUTHORIZED = false;

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

```
  if(!data || !data.success){
    app.innerHTML = "API ERROR";
    return;
  }

  DATA = data;

  if(!ACTIVE_DOG){
    ACTIVE_DOG = data.pasi?.[0] || null;
  }else{
    ACTIVE_DOG =
      data.pasi?.find(x => x.id === ACTIVE_DOG.id)
      || data.pasi?.[0]
      || null;
  }

  render();
})
.catch(err => {
  console.error(err);
  app.innerHTML = "NETWORK ERROR";
});
```

}

// ===================== RENDER =====================

function render(){

const app = document.getElementById("app");

const p = DATA.prostor || {};
const pasi = DATA.pasi || [];
const pranja = DATA.pranja || [];

app.innerHTML = `

```
<div class="card">
  <h2>📦 ${p.oznaka || "-"}</h2>
  <p><b>Status:</b> ${p.status || "-"}</p>
  <p><b>Površina:</b> ${p.povrsina || "-"}</p>
  <p><b>Broj pasa:</b> ${pasi.length}</p>
</div>

<div class="card">
  <h3>🐶 Psi u boksu</h3>

  ${pasi.map(p => `
    <button
      onclick="selectDog('${p.id}')"
      style="display:block;width:100%;margin:5px 0;padding:8px;">
      ${p.ime}
    </button>
  `).join("")}
</div>

${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : "<div class='card'>Nema pasa u boksu</div>"}

<div class="card">
  <h3>🚿 Pranje boksa</h3>

  ${
    pranja.length
      ? `
        <p>
          <b>Poslednje:</b>
          ${format(pranja.at(-1).datum)}
        </p>

        <button onclick="toggle('washHist')">
          Istorija
        </button>

        <div id="washHist" style="display:none">

          ${pranja.map(x => `
            <p>
              ${format(x.datum)}
              -
              ${x.oprao || "-"}
            </p>
          `).join("")}

        </div>
      `
      : "<p>Nema unosa</p>"
  }
</div>
```

`;

if(ACTIVE_DOG){
setTimeout(drawChart,300);
}
}

// ===================== DOG =====================

function renderDog(d){

const tezine = d.tezine || [];

const poslednjaTezina =
tezine.length
? tezine.at(-1)
: null;

return `

```
<div class="card">
  <h2>🐶 ${d.ime}</h2>

  <p><b>Pol:</b> ${d.pol || "-"}</p>

  <p><b>Rođenje:</b> ${d.rodjenje || "-"}</p>

  <p><b>Rodovnik:</b> ${d.rodovnik || "-"}</p>
</div>

<div class="card">

  <h3>⚖️ Težina i ishrana</h3>

  <p>
    <b>Poslednja težina:</b>
    ${poslednjaTezina ? poslednjaTezina.tezina + " kg" : "-"}
  </p>

  <p>
    <b>Preporuka hrane:</b>
    ${poslednjaTezina?.hrana || "-"} g
  </p>

  <canvas id="chart"></canvas>

</div>

${renderHealth("🐾 Krpelji", d.krpelji, "krpelji")}
${renderHealth("🪱 Paraziti", d.paraziti, "paraziti")}
${renderHealth("💉 Besnilo", d.besnilo, "besnilo")}
${renderHealth("⚙️ Ostalo", d.ostalo, "ostalo")}

<div class="card">

  <h3>⚙️ Akcije</h3>

  <button onclick="save('pranje')">
    Pranje boksa
  </button>

  <button onclick="save('tezina')">
    Težina
  </button>

  <button onclick="save('krpelji')">
    Krpelji
  </button>

  <button onclick="save('paraziti')">
    Paraziti
  </button>

  <button onclick="save('besnilo')">
    Besnilo
  </button>

  <button onclick="save('ostalo')">
    Ostalo
  </button>

</div>
```

`;
}

// ===================== HEALTH =====================

function renderHealth(title,data,key){

if(!data){
return "";
}

return ` <div class="card">

```
  <h3>${title}</h3>

  <p><b>Poslednje:</b> ${format(data.lastDate)}</p>

  <p><b>Sredstvo:</b> ${data.lastValue || "-"}</p>

  <p><b>Sledeće:</b> ${format(data.nextDate)}</p>

  <button onclick="toggle('${key}')">
    Istorija
  </button>

  <div id="${key}" style="display:none">

    ${(data.history || []).map(x => `
      <p>
        ${format(x.datum)}
        -
        ${x.value}
        →
        ${format(x.next)}
      </p>
    `).join("")}

  </div>

</div>
```

`;
}

// ===================== SELECT DOG =====================

function selectDog(id){

ACTIVE_DOG =
DATA.pasi.find(x => x.id === id);

render();
}

// ===================== CHART =====================

function drawChart(){

const el = document.getElementById("chart");

if(!el) return;

if(!ACTIVE_DOG?.tezine?.length) return;

new Chart(el,{
type:"line",
data:{
labels:
ACTIVE_DOG.tezine.map(x =>
format(x.datum)
),

```
  datasets:[{
    label:"Težina (kg)",
    data:
      ACTIVE_DOG.tezine.map(x =>
        Number(x.tezina)
      ),
    borderColor:"#111",
    tension:0.3
  }]
}
```

});
}

// ===================== PIN =====================

function verifyPIN(){

if(AUTHORIZED){
return true;
}

const pin =
prompt("Unesite PIN:");

if(pin === ADMIN_PIN){

```
AUTHORIZED = true;

alert("Pristup odobren");

return true;
```

}

alert("Pogrešan PIN");

return false;
}

// ===================== SAVE =====================

function save(type){

if(!verifyPIN()){
return;
}

// TEŽINA

if(type === "tezina"){

```
const tezina =
  prompt("Izmerena težina (kg):");

if(!tezina) return;

const hrana =
  prompt("Preporuka hrane (g):");

fetch(API,{
  method:"POST",
  body:JSON.stringify({
    type:"tezina",
    pasId:ACTIVE_DOG.id,
    value:tezina,
    hrana:hrana || ""
  })
}).then(()=>load());

return;
```

}

// PRANJE

if(type === "pranje"){

```
const oprao =
  prompt("Ko je oprao boks?");

if(!oprao) return;

const note =
  prompt("Napomena:");

fetch(API,{
  method:"POST",
  body:JSON.stringify({
    type:"pranje",
    prostorId:PROSTOR_ID,
    value:oprao,
    note:note || ""
  })
}).then(()=>load());

return;
```

}

// OSTALI TRETMANI

const value =
prompt("Unesi sredstvo:");

if(!value) return;

const next =
prompt("Sledeći datum tretmana (YYYY-MM-DD):");

const note =
prompt("Napomena:");

fetch(API,{
method:"POST",
body:JSON.stringify({
type,
pasId:ACTIVE_DOG.id,
value,
next,
note
})
}).then(()=>load());
}

// ===================== TOGGLE =====================

function toggle(id){

const el =
document.getElementById(id);

if(!el) return;

el.style.display =
el.style.display === "none"
? "block"
: "none";
}

// ===================== HELPERS =====================

function format(d){

if(!d){
return "-";
}

return new Date(d)
.toLocaleDateString();
}

