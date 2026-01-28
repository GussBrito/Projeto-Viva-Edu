// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "ALUNO") window.location.replace("tutor-home.html");
// ===================================

const lista = document.getElementById("listaAgendamentos");

// MOCK TEMPORÁRIO (depois vem do backend)
let agendamentos = [
  {
    id: 101,
    aula: {
      disciplina: "Português",
      assunto: "Regência",
      tutor: "João Silva",
      data: "2026-02-05",
      hora: "19:00",
      local: {
        nome: "IFPB - Cajazeiras (Bloco A)",
        latitude: -6.8892,
        longitude: -38.5577
      }
    },
    status: "AGENDADO"
  }
];

function renderizar() {
  lista.innerHTML = "";

  if (agendamentos.length === 0) {
    lista.innerHTML = "<p>Você não tem agendamentos no momento.</p>";
    return;
  }

  agendamentos.forEach((ag) => {
    const a = ag.aula;
    const localNome = a.local?.nome || "Não informado";

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${a.disciplina}</strong> - ${a.assunto}<br>
      Tutor: ${a.tutor}<br>
      Data: ${formatarData(a.data)} às ${a.hora}<br>
      Status: ${ag.status}<br>
      Local: ${localNome}<br><br>

      <button data-id="${ag.id}" class="btnChat">Chat</button>
      <button data-id="${ag.id}" class="btnMapa">Ver no mapa</button>
      <button data-id="${ag.id}" class="btnCancelar">Cancelar</button>
    `;

    lista.appendChild(div);
  });

  document.querySelectorAll(".btnChat").forEach(btn => {
    btn.addEventListener("click", () => abrirChat(btn.dataset.id));
  });

  document.querySelectorAll(".btnMapa").forEach(btn => {
    btn.addEventListener("click", () => abrirMapa(btn.dataset.id));
  });

  document.querySelectorAll(".btnCancelar").forEach(btn => {
    btn.addEventListener("click", () => cancelarAgendamento(btn.dataset.id));
  });
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function abrirChat(agendamentoId) {
  const ag = agendamentos.find(x => String(x.id) === String(agendamentoId));
  if (!ag) return;

  const tutor = encodeURIComponent(ag.aula.tutor);
  const assunto = encodeURIComponent(`${ag.aula.disciplina} - ${ag.aula.assunto}`);

  // thread = id do agendamento
  window.location.href = `chat.html?thread=${encodeURIComponent(ag.id)}&tutor=${tutor}&assunto=${assunto}`;
}

function abrirMapa(agendamentoId) {
  const ag = agendamentos.find(x => String(x.id) === String(agendamentoId));
  if (!ag || !ag.aula?.local) {
    alert("Localização não disponível para este agendamento.");
    return;
  }
  const { latitude, longitude } = ag.aula.local;
  window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
}

function cancelarAgendamento(agendamentoId) {
  const ok = confirm("Tem certeza que deseja cancelar?");
  if (!ok) return;

  agendamentos = agendamentos.filter(x => String(x.id) !== String(agendamentoId));
  renderizar();

  alert("Agendamento cancelado!");
  // FUTURO: await apiFetch(`/agendamentos/${agendamentoId}`, { method: "DELETE" });
}

renderizar();
