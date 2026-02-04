// ===== PROTEÇÃO =====
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");
// =====================

document.getElementById("logoutBtn")?.addEventListener("click", () => logout());

const lista = document.getElementById("listaAlunos");

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return iso || "—";
  }
}

async function carregar() {
  const alunos = await api("/coordenador/alunos");
  render(alunos || []);
}

function render(alunos) {
  lista.innerHTML = "";

  if (!alunos.length) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="margin:0;color:var(--muted);">Nenhum aluno encontrado.</p>`;
    lista.appendChild(empty);
    return;
  }

  alunos.forEach(u => {
    const div = document.createElement("div");
    div.className = "list-card";

    div.innerHTML = `
      <strong>${escapeHtml(u.nome || "Aluno")}</strong><br>
      <span style="color:var(--muted);font-weight:800;">${escapeHtml(u.email || "")}</span><br>
      <div style="margin-top:8px;color:var(--muted);font-weight:700;">
        Criado em: ${escapeHtml(formatDate(u.createdAt))}
      </div>
    `;

    lista.appendChild(div);
  });
}

carregar().catch(err => alert(err.message || "Erro ao carregar alunos"));
