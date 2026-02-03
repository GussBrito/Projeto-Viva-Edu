const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "ALUNO") window.location.replace("tutor-home.html");

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaAgendamentos");

let agendamentos = []; // view-model pronto pra render
let agsRaw = [];       // retorno do backend /agendamentos/me
let aulas = [];        // /aulas
let materias = [];     // /materias

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

function materiaNome(materiaId) {
  const m = materias.find(x => x._id === materiaId);
  return m?.nome || materiaId || "Matéria";
}

function statusLabel(status) {
  const s = String(status || "").toUpperCase().trim();
  if (s === "PENDENTE") return "PENDENTE";
  if (s === "CONFIRMADO") return "CONFIRMADO";
  if (s === "REJEITADO") return "REJEITADO";
  return s || "PENDENTE";
}

// ===== carregar dados =====
async function carregarTudo() {
  try {
    // 1) agendamentos do aluno
    agsRaw = await api("/agendamentos/me");

    // 2) aulas (pra montar detalhes)
    aulas = await api("/aulas");

    // 3) materias (pra mostrar nome)
    materias = await api("/materias");

    montarViewModel();
    renderizar();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao carregar agendamentos.");
  }
}

function montarViewModel() {
  // agsRaw: [{ _id, aulaId, tutorId, status, createdAt ... }]
  // aulas:  [{ _id, materiaId, titulo, dataHora, localId, tutorId ... }]
  agendamentos = (Array.isArray(agsRaw) ? agsRaw : []).map(ag => {
    const aula = (Array.isArray(aulas) ? aulas : []).find(a => a._id === ag.aulaId);

    const { data, hora } = splitISO(aula?.dataHora || "");
    const local = parseLocal(aula?.localId);

    return {
      id: ag._id, // string
      status: statusLabel(ag.status),
      aula: {
        disciplina: materiaNome(aula?.materiaId),
        assunto: aula?.titulo || "",
        tutor: {
          id: ag.tutorId || aula?.tutorId || "",
          nome: "Tutor" // por enquanto não temos nome no backend aqui
        },
        data: data || "",
        hora: hora || "",
        local: local
      }
    };
  });
}

// ===== render =====
function renderizar() {
  lista.innerHTML = "";

  if (!agendamentos.length) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">Você não tem agendamentos no momento.</p>`;
    lista.appendChild(empty);
    return;
  }

  agendamentos.forEach((ag) => {
    const a = ag.aula;

    const div = document.createElement("div");
    div.className = "list-card";

    const localNome = a.local?.nome || "Não informado";
    const temMapa = a.local && (a.local.latitude || a.local.lat) && (a.local.longitude || a.local.lng);

    div.innerHTML = `
      <strong>${escapeHtml(a.disciplina)}</strong> - ${escapeHtml(a.assunto)}<br>
      TutorId: ${escapeHtml(a.tutor.id)}
      <button class="btn btn-outline" type="button"
        onclick="verPerfil('${encodeURIComponent(a.tutor.id)}')"
        style="margin-left:10px;">
        Ver perfil
      </button>
      <br>
      Data: ${a.data ? formatarData(a.data) : "-"} às ${escapeHtml(a.hora || "-")}<br>
      Status: ${escapeHtml(ag.status)}<br>
      Local: ${escapeHtml(localNome)}<br><br>

      <button class="btn btn-outline" type="button" onclick="abrirChat('${ag.id}')">Chat</button>
      <button class="btn btn-outline" type="button" onclick="abrirMapa('${ag.id}')" ${temMapa ? "" : "disabled"}>
        Ver no mapa
      </button>

      <button class="btn btn-primary" type="button" onclick="cancelarAgendamento('${ag.id}')" disabled>
        Cancelar
      </button>

      <div class="hint" style="margin-top:10px;">
        * Cancelamento ainda não implementado no backend.
      </div>
    `;

    lista.appendChild(div);
  });
}

// ===== ações =====
window.verPerfil = function(userId){
  window.location.href = `perfil-publico.html?id=${userId}`;
};

window.abrirChat = function (agendamentoId) {
  const ag = agendamentos.find(x => x.id === agendamentoId);
  if (!ag) return;

  const tutorNome = encodeURIComponent(ag.aula.tutor.nome || "Tutor");
  const assunto = encodeURIComponent(`${ag.aula.disciplina} - ${ag.aula.assunto}`);
  window.location.href = `chat.html?thread=${encodeURIComponent(ag.id)}&tutor=${tutorNome}&assunto=${assunto}`;
};

window.abrirMapa = function (agendamentoId) {
  const ag = agendamentos.find(x => x.id === agendamentoId);
  if (!ag || !ag.aula?.local) return alert("Localização não disponível.");

  const lat = ag.aula.local.latitude ?? ag.aula.local.lat;
  const lng = ag.aula.local.longitude ?? ag.aula.local.lng;
  if (lat == null || lng == null) return alert("Localização não disponível.");

  window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
};

window.cancelarAgendamento = function (agendamentoId) {
  alert("Cancelamento ainda não implementado no backend.");
};

// init
carregarTudo();
