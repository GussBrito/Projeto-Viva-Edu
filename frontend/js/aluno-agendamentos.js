const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "ALUNO") window.location.replace("tutor-home.html");

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaAgendamentos");

let agendamentos = []; // já vem "pronto" do backend

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function splitISO(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { data: "", hora: "" };

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return { data: `${yyyy}-${mm}-${dd}`, hora: `${hh}:${mi}` };
}

function parseLocal(localId) {
  if (!localId) return null;
  try { return JSON.parse(localId); } catch { return null; }
}

function statusLabel(status) {
  const s = String(status || "").toUpperCase().trim();
  if (s === "PENDENTE") return "PENDENTE";
  if (s === "CONFIRMADO") return "CONFIRMADO";
  if (s === "REJEITADO") return "REJEITADO";
  return s || "PENDENTE";
}

// ===== carregar do backend =====
async function carregarAgendamentos() {
  try {
    const data = await api("/agendamentos/me");
    agendamentos = Array.isArray(data) ? data : [];
    renderizar();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao carregar agendamentos.");
  }
}

// ===== render =====
function renderizar() {
  lista.innerHTML = "";

  //PROTEÇÃO: remove agendamentos cujo ag.aula não existe mais
  const agsVisiveis = (Array.isArray(agendamentos) ? agendamentos : [])
    .filter(ag => ag && ag.aula && (ag.aula._id || ag.aula.aulaId || ag.aula.materiaId || ag.aula.titulo));

  if (!agsVisiveis.length) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">Você não tem agendamentos no momento.</p>`;
    lista.appendChild(empty);
    return;
  }

  agsVisiveis.forEach((ag) => {
    const a = ag.aula || {};

    const { data, hora } = splitISO(a.dataHora || "");
    const local = parseLocal(a.localId);
    const localNome = local?.nome || "Não informado";

    const lat = local?.latitude ?? local?.lat;
    const lng = local?.longitude ?? local?.lng;
    const temMapa = lat != null && lng != null;

    const disciplina = a.materiaNome || a.materiaId || "Matéria";
    const assunto = a.titulo || "";
    const tutorId = a.tutor?.id || "";
    const tutorNome = a.tutor?.nome || "Tutor";

    const div = document.createElement("div");
    div.className = "list-card";

    div.innerHTML = `
      <strong>${escapeHtml(disciplina)}</strong><br>
      Assunto: ${escapeHtml(assunto)}<br>
      Tutor: ${escapeHtml(tutorNome)}
      <button class="btn btn-outline" type="button"
        onclick="verPerfil('${encodeURIComponent(tutorId)}')"
        style="margin-left:10px;">
        Ver perfil
      </button>
      <br>
      Data: ${data ? formatarData(data) : "-"} às ${escapeHtml(hora || "-")}<br>
      Status: ${escapeHtml(statusLabel(ag.status))}<br>
      Local: ${escapeHtml(localNome)}<br><br>

      <button class="btn btn-outline" type="button" onclick="abrirChat('${ag._id}')">Chat</button>
      <button class="btn btn-outline" type="button" onclick="abrirMapa('${ag._id}')" ${temMapa ? "" : "disabled"}>
        Ver no mapa
      </button>

      <button class="btn btn-primary" type="button" onclick="cancelarAgendamento('${ag._id}')">
        Cancelar
      </button>
    `;

    lista.appendChild(div);
  });
}


// ===== ações =====
window.verPerfil = function(userId){
  window.location.href = `perfil-publico.html?id=${userId}`;
};

window.abrirChat = function (agendamentoId) {
  const ag = agendamentos.find(x => x._id === agendamentoId);
  if (!ag) return;

  const disciplina = ag.aula?.materiaNome || ag.aula?.materiaId || "Matéria";
  const assunto = ag.aula?.titulo || "";
  const tutorNome = encodeURIComponent(ag.aula?.tutor?.nome || "Tutor");

  const assuntoChat = encodeURIComponent(`${disciplina} - ${assunto}`);
  window.location.href = `chat.html?thread=${encodeURIComponent(ag._id)}&tutor=${tutorNome}&assunto=${assuntoChat}`;
};

window.abrirMapa = function (agendamentoId) {
  const ag = agendamentos.find(x => x._id === agendamentoId);
  if (!ag) return;

  const local = parseLocal(ag.aula?.localId);
  if (!local) return alert("Localização não disponível.");

  const lat = local.latitude ?? local.lat;
  const lng = local.longitude ?? local.lng;
  if (lat == null || lng == null) return alert("Localização não disponível.");

  window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
};

window.cancelarAgendamento = async function (agendamentoId) {
  const ag = agendamentos.find(x => x._id === agendamentoId);
  if (!ag) return;

  if (String(ag.status).toUpperCase() !== "PENDENTE") {
    return alert("Só é possível cancelar agendamentos PENDENTES.");
  }

  const ok = confirm("Tem certeza que deseja cancelar este agendamento?");
  if (!ok) return;

  try {
    await api(`/agendamentos/${agendamentoId}`, { method: "DELETE" });
    alert("Agendamento cancelado!");
    carregarAgendamentos();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao cancelar agendamento.");
  }
};

// init
carregarAgendamentos();
