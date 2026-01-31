// ===== PROTEÇÃO =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");
// =====================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaRelatorios");

function loadReports(){
  try { return JSON.parse(localStorage.getItem("reports") || "[]"); }
  catch { return []; }
}

function escapeHtml(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function formatDate(iso){
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return iso || "—";
  }
}

function render(){
  const reports = loadReports();

  // mais recente primeiro
  reports.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  lista.innerHTML = "";

  if (reports.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="margin:0;color:var(--muted);">Nenhum relatório enviado ainda.</p>`;
    lista.appendChild(empty);
    return;
  }

  reports.forEach(r => {
    const div = document.createElement("div");
    div.className = "list-card";

    const tutorNome = r.tutorNome || "Tutor";
    const tutorId = r.tutorId || "";
    const data = formatDate(r.createdAt);
    const obs = r.observacoes?.trim() ? r.observacoes : "Sem observações.";
    const fileName = r.fileName || "arquivo";

    div.innerHTML = `
      <strong>Relatório da Aula #${escapeHtml(r.aulaId)}</strong><br>
      <span style="color:var(--muted); font-weight:800;">
        ${escapeHtml(r.disciplina || "")}${r.assunto ? " - " + escapeHtml(r.assunto) : ""}
      </span>
      <hr>

      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <div>
          <strong>Tutor:</strong>
          ${
            tutorId
            ? `<span style="color:var(--brand); font-weight:900; cursor:pointer;"
                 onclick="verPerfil('${encodeURIComponent(tutorId)}')">
                 ${escapeHtml(tutorNome)}
               </span>`
            : `<span style="color:var(--brand); font-weight:900;">${escapeHtml(tutorNome)}</span>`
          }
        </div>
        <div style="color:var(--muted); font-weight:800;">• ${escapeHtml(data)}</div>
      </div>

      <div style="margin-top:10px;">
        <strong>Observações:</strong>
        <p style="margin:6px 0 0; color:var(--muted);">${escapeHtml(obs)}</p>
      </div>

      <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-primary" type="button"
          onclick="abrirArquivo('${encodeURIComponent(r.fileDataUrl)}')">
          Abrir / Baixar (${escapeHtml(fileName)})
        </button>
      </div>
    `;

    lista.appendChild(div);
  });
}

window.verPerfil = function(tutorIdEnc){
  const tutorId = decodeURIComponent(tutorIdEnc);
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(tutorId)}`;
};

window.abrirArquivo = function(fileDataUrlEnc){
  const dataUrl = decodeURIComponent(fileDataUrlEnc);
  if (!dataUrl) return alert("Arquivo não encontrado.");
  window.open(dataUrl, "_blank");
};

render();
