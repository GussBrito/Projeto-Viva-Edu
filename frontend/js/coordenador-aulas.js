// ===== PROTEÇÃO =====
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");
// =====================

document.getElementById("logoutBtn")?.addEventListener("click", () => logout());

const lista = document.getElementById("listaAulas");

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
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return iso || "—";
  }
}

function parseLocalFromLocalId(localId) {
  if (!localId) return null;
  try {
    return JSON.parse(localId);
  } catch {
    return null;
  }
}

async function carregar() {
  const aulas = await api("/coordenador/aulas");
  render(Array.isArray(aulas) ? aulas : []);
}

function render(aulas) {
  if (!lista) return; // evita crash se o HTML estiver diferente

  lista.innerHTML = "";

  if (!aulas.length) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="margin:0;color:var(--muted);">Nenhuma aula encontrada.</p>`;
    lista.appendChild(empty);
    return;
  }

  aulas.forEach(a => {
    const div = document.createElement("div");
    div.className = "list-card";

    const dataFmt = formatDate(a.dataHora);
    const localObj = parseLocalFromLocalId(a.localId);
    const localNome = localObj?.nome || "Não informado";

    const btnMapa = a.localId
      ? `<button class="btn btn-outline" type="button" onclick="verNoMapa('${encodeURIComponent(a.localId)}')">
           Ver no mapa
         </button>`
      : "";

    div.innerHTML = `
      <strong>${escapeHtml(a.materiaNome || "Matéria")} - ${escapeHtml(a.titulo || "")}</strong><br>
      <div style="margin-top:6px;color:var(--muted);font-weight:800;">
        Tutor: ${escapeHtml(a.tutorNome || "Tutor")}
      </div>
      <div style="margin-top:6px;">
        <strong>Data:</strong> ${escapeHtml(dataFmt)}
      </div>
      <div style="margin-top:6px;">
        <strong>Local:</strong> ${escapeHtml(localNome)}
      </div>
      <div style="margin-top:6px;">
        <strong>Status:</strong> ${escapeHtml(a.status || "DISPONIVEL")}
      </div>

      <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
        ${btnMapa}
      </div>
    `;

    lista.appendChild(div);
  });
}

window.verNoMapa = function (localIdEnc) {
  const localId = decodeURIComponent(localIdEnc);
  window.location.href = `mapa-view.html?localId=${encodeURIComponent(localId)}`;
};

carregar().catch(err => alert(err.message || "Erro ao carregar aulas"));
