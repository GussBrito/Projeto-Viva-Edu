// ===== PROTEÇÃO =====
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");
// =====================

document.getElementById("logoutBtn")?.addEventListener("click", () => logout());

const lista = document.getElementById("listaTutores");

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function carregar() {
  const tutores = await api("/coordenador/tutores");
  render(tutores || []);
}

function render(tutores) {
  lista.innerHTML = "";

  if (!tutores.length) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="margin:0;color:var(--muted);">Nenhum tutor encontrado.</p>`;
    lista.appendChild(empty);
    return;
  }

  tutores.forEach(t => {
    const div = document.createElement("div");
    div.className = "list-card";

    const validado = t.tutorValidado === true;
    const docsOk = !!(t.docs?.comprovanteUrl && t.docs?.identidadeUrl);

    div.innerHTML = `
      <strong>${escapeHtml(t.nome || "Tutor")}</strong><br>
      <span style="color:var(--muted);font-weight:800;">${escapeHtml(t.email || "")}</span><br>

      <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
        <span class="badge ${validado ? "active" : "inactive"}">
          ${validado ? "Validado" : "Pendente"}
        </span>

        <span class="badge ${docsOk ? "active" : "inactive"}">
          ${docsOk ? "Docs OK" : "Docs pendentes"}
        </span>
      </div>

      <div style="margin-top:12px;">
        <button class="btn btn-outline" type="button" onclick="verPerfil('${encodeURIComponent(t._id)}')">
          Ver perfil
        </button>
      </div>
    `;

    lista.appendChild(div);
  });
}

window.verPerfil = function (idEnc) {
  const id = decodeURIComponent(idEnc);
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(id)}`;
};

carregar().catch(err => alert(err.message || "Erro ao carregar tutores"));
