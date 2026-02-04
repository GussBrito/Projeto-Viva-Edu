// ===== PROTEÇÃO =====
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");
// =====================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaRelatorios");

const API_BASE = "http://localhost:3000";

// ===== estado =====
let relatorios = [];

// ===== utils =====
function escapeHtml(str) {
  const s = String(str || "");
  return s
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;")
    .split("'").join("&#039;");
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return iso || "—";
  }
}

function arquivoHref(arquivoUrl) {
  const u = String(arquivoUrl || "").trim();
  if (!u) return "";
  // se já vier absoluto (http...), usa direto
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  // se vier como /uploads/...
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}

// ===== backend =====
async function carregarRelatorios() {
  try {
    const data = await api("/relatorios"); // ✅ GET /relatorios (COORDENADOR)
    relatorios = Array.isArray(data) ? data : [];
    render();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao carregar relatórios.");
  }
}

// ===== render =====
function render() {
  // mais recente primeiro
  relatorios.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  lista.innerHTML = "";

  if (!relatorios.length) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="margin:0;color:var(--muted);">Nenhum relatório enviado ainda.</p>`;
    lista.appendChild(empty);
    return;
  }

  relatorios.forEach((r) => {
    const div = document.createElement("div");
    div.className = "list-card";

    const tutorNome = r.tutorNome || "Tutor";
    // se você decidir retornar tutorId depois no backend, dá pra usar aqui:
    const tutorId = r.tutorId || "";

    const data = formatDate(r.createdAt);
    const obs = (r.observacoes || "").trim() || "Sem observações.";

    const materiaNome = r.materiaNome || "";
    const tituloAula = r.tituloAula || "";
    const aulaId = r.aulaId || r._id || "";

    const href = arquivoHref(r.arquivoUrl);
    const arquivoNome = r.arquivoNome || "arquivo";

    div.innerHTML = `
      <strong>Relatório da Aula </strong><br>
      <span style="color:var(--muted); font-weight:800;">
        ${escapeHtml(materiaNome)}${tituloAula ? " - " + escapeHtml(tituloAula) : ""}
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
          onclick="abrirArquivo('${encodeURIComponent(href)}')"
          ${href ? "" : "disabled"}>
          Abrir / Baixar (${escapeHtml(arquivoNome)})
        </button>
      </div>
    `;

    lista.appendChild(div);
  });
}

// ===== ações =====
window.verPerfil = function (tutorIdEnc) {
  const tutorId = decodeURIComponent(tutorIdEnc);
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(tutorId)}`;
};

window.abrirArquivo = function (hrefEnc) {
  const href = decodeURIComponent(hrefEnc || "");
  if (!href) return alert("Arquivo não encontrado.");
  window.open(href, "_blank");
};

// init
carregarRelatorios();
