function render() {

  const app = document.getElementById("app");

  const p = DATA?.prostor || {};
  const pasi = DATA?.pasi || [];

  app.innerHTML = `
    <div class="card">
      <h2>📦 ${p.oznaka || "-"}</h2>
      <p>Status: ${p.status || "-"}</p>
      <p>Površina: ${p.povrsina || "-"}</p>
      <p><b>Pasa:</b> ${pasi.length}</p>
    </div>

    <div class="card">
      <h3>🐶 Psi u boksu</h3>

      ${pasi.length ? pasi.map(d => `
        <button onclick="selectDog('${d.id}')">
          ${d.ime || "N/A"}
        </button>
      `).join("") : "<p>Nema pasa</p>"}
    </div>

    ${ACTIVE_DOG ? renderDog(ACTIVE_DOG) : "<div class='card'>Nema aktivnog psa</div>"}
  `;
}
