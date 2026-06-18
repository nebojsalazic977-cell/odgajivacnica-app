const params = new URLSearchParams(window.location.search);
const boxID = params.get("box");

// ✔ TVOJ GOOGLE SHEET ID
const SHEET_ID = "1pc-2LSt_-syuDFX_RNXVVV_memB7VJ9lhVFXWKSEvVc";

// ==========================
// GOOGLE SHEETS CSV LINKOVI
// ==========================
const SMESTAJ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=SMESTAJ`;
const PSI_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=PSI`;
const KRP_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=KRPILJI`;
const PAR_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=PARAZITI`;
const CIS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=CISCENJE_BOKSA`;

// ==========================
// LOAD CSV
// ==========================
async function loadCSV(url) {
  const res = await fetch(url);
  const data = await res.text();

  return data
    .trim()
    .split("\n")
    .map(r => r.split(","));
}

// ==========================
// INIT APP
// ==========================
async function init() {

  const smestaj = await loadCSV(SMESTAJ_URL);
  const psi = await loadCSV(PSI_URL);

  // aktivni smeštaj (bez Datuma izlaska)
  let aktivan = smestaj.find(r =>
    r[2] === boxID && (!r[4] || r[4] === "")
  );

  let pasID = aktivan ? aktivan[1] : null;
  let pas = psi.find(r => r[0] === pasID);

  document.getElementById("boxTitle").innerText =
    "Boks " + boxID;

  document.getElementById("dogInfo").innerHTML =
    pas
      ? `<b>${pas[1]}</b><br>ID: ${pas[0]}`
      : "Nema psa u ovom boksu";

  loadDetails(pasID);
}

// ==========================
// DETALJI (KRPELJI, PARAZITI, CISCENJE)
// ==========================
async function loadDetails(pasID) {

  if (!pasID) return;

  const krpelji = await loadCSV(KRP_URL);
  const paraziti = await loadCSV(PAR_URL);
  const ciscenje = await loadCSV(CIS_URL);

  document.getElementById("krpelji").innerHTML =
    krpelji
      .filter(r => r[1] === pasID)
      .map(r => `<div>📅 ${r[2]} | 💉 ${r[3]} | ➜ ${r[4]}</div>`)
      .join("");

  document.getElementById("paraziti").innerHTML =
    paraziti
      .filter(r => r[1] === pasID)
      .map(r => `<div>📅 ${r[2]} | 💊 ${r[3]} | ➜ ${r[4]}</div>`)
      .join("");

  document.getElementById("ciscenje").innerHTML =
    ciscenje
      .filter(r => r[1] === boxID)
      .map(r => `<div>📅 ${r[2]} | 🧽 ${r[3]} | ➜ ${r[4]}</div>`)
      .join("");
}

// ==========================
// DUGMAD (SLEDEĆA FAZA)
// ==========================
function addKrpelji() {
  alert("Sledeće: unos u Google Sheets (krpelji)");
}

function addParaziti() {
  alert("Sledeće: unos u Google Sheets (paraziti)");
}

function addCiscenje() {
  alert("Sledeće: unos u Google Sheets (čišćenje)");
}

// START
init();
