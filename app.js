function doGet(e){

  const action = e.parameter.action;
  const callback = e.parameter.callback;

  let result = {success:false};

  if(action === "getBox"){
    result = getBox(e.parameter.prostorId);
  }

  const json = JSON.stringify(result);

  if(callback){
    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


function getBox(prostorId){

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const p = ss.getSheetByName("PROSTOR").getDataRange().getValues();
  const s = ss.getSheetByName("SMESTAJ").getDataRange().getValues();
  const psi = ss.getSheetByName("PSI").getDataRange().getValues();

  const prostor = p.slice(1).find(r => r[0] == prostorId);

  if(!prostor){
    return {success:false};
  }

  const smestaj = s.slice(1).find(r =>
    r[1] == prostorId && (!r[4] || r[4] === "")
  );

  let pas = null;

  if(smestaj){
    pas = psi.slice(1).find(r => r[0] == smestaj[2]);
  }

  // --- DODATO: poslednji zapisi (ALI OSTAJU ARRAY) ---
  const tez = ss.getSheetByName("TEZINE").getDataRange().getValues().slice(1);
  const pran = ss.getSheetByName("PRANJE").getDataRange().getValues().slice(1);
  const kr = ss.getSheetByName("KRPELJI").getDataRange().getValues().slice(1);
  const pa = ss.getSheetByName("PARAZITI").getDataRange().getValues().slice(1);
  const be = ss.getSheetByName("BESNILO").getDataRange().getValues().slice(1);

  const lastTezina = pas ? tez.filter(r => r[1]==pas[0]).slice(-1)[0] : null;
  const lastPranje = pran.filter(r => r[1]==prostorId).slice(-1)[0] || null;

  const lastKr = pas ? kr.filter(r => r[1]==pas[0]).slice(-1)[0] : null;
  const lastPa = pas ? pa.filter(r => r[1]==pas[0]).slice(-1)[0] : null;
  const lastBe = pas ? be.filter(r => r[1]==pas[0]).slice(-1)[0] : null;

  return {
    success:true,
    prostor:prostor,
    smestaj:smestaj || null,
    pas:pas,

    lastTezina:lastTezina,
    lastPranje:lastPranje,

    health:{
      krpelji: !!lastKr,
      paraziti: !!lastPa,
      besnilo: !!lastBe
    }
  };
}


function doPost(e){

  const d = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if(d.type === "tezina"){
    ss.getSheetByName("TEZINE").appendRow([
      "TEZ"+Date.now(),
      d.pasId,
      new Date(),
      d.value
    ]);
  }

  if(d.type === "pranje"){
    ss.getSheetByName("PRANJE").appendRow([
      "PRN"+Date.now(),
      d.prostorId,
      new Date(),
      d.value
    ]);
  }

  if(d.type === "krpelji"){
    ss.getSheetByName("KRPELJI").appendRow([
      "KRP"+Date.now(),
      d.pasId,
      new Date(),
      d.value
    ]);
  }

  if(d.type === "paraziti"){
    ss.getSheetByName("PARAZITI").appendRow([
      "PAR"+Date.now(),
      d.pasId,
      new Date(),
      d.value
    ]);
  }

  if(d.type === "besnilo"){
    ss.getSheetByName("BESNILO").appendRow([
      "BES"+Date.now(),
      d.pasId,
      new Date(),
      d.value
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({success:true}))
    .setMimeType(ContentService.MimeType.JSON);
}
