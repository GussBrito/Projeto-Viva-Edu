const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
if (!token) window.location.replace("login.html");
if (role !== "ALUNO") window.location.replace("tutor-home.html");

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaAgendamentos");

/**
 * Mock com tutorId para poder abrir perfil público.
 * Depois o backend vai retornar: aula.tutor { id, nome }
 */
let agendamentos = [
  {
    id: 101,
    aula: {
      disciplina: "Português",
      assunto: "Regência",
      tutor: { id: 9001, nome: "João Tutor" },
      data: "2026-02-05",
      hora: "19:00",
      local: { nome: "IFPB - Cajazeiras (Bloco A)", latitude: -6.8892, longitude: -38.5577 }
    },
    status: "AGENDADO"
  }
];

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function renderizar() {
  lista.innerHTML = "";

  if (agendamentos.length === 0) {
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

    div.innerHTML = `
      <strong>${a.disciplina}</strong> - ${a.assunto}<br>
      Tutor: ${a.tutor.nome}
      <button class="btn btn-outline" type="button" onclick="verPerfil(${a.tutor.id})" style="margin-left:10px;">Ver perfil</button>
      <br>
      Data: ${formatarData(a.data)} às ${a.hora}<br>
      Status: ${ag.status}<br>
      Local: ${a.local?.nome || "Não informado"}<br><br>

      <button class="btn btn-outline" type="button" onclick="abrirChat(${ag.id})">Chat</button>
      <button class="btn btn-outline" type="button" onclick="abrirMapa(${ag.id})">Ver no mapa</button>
      <button class="btn btn-primary" type="button" onclick="cancelarAgendamento(${ag.id})">Cancelar</button>
    `;

    lista.appendChild(div);
  });
}

window.verPerfil = function(userId){
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(userId)}`;
};

window.abrirChat = function (agendamentoId) {
  const ag = agendamentos.find(x => x.id === agendamentoId);
  if (!ag) return;

  const tutorNome = encodeURIComponent(ag.aula.tutor.nome);
  const assunto = encodeURIComponent(`${ag.aula.disciplina} - ${ag.aula.assunto}`);
  window.location.href = `chat.html?thread=${encodeURIComponent(ag.id)}&tutor=${tutorNome}&assunto=${assunto}`;
};

window.abrirMapa = function (agendamentoId) {
  const ag = agendamentos.find(x => x.id === agendamentoId);
  if (!ag || !ag.aula?.local) return alert("Localização não disponível.");
  const { latitude, longitude } = ag.aula.local;
  window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
};

window.cancelarAgendamento = function (agendamentoId) {
  const ok = confirm("Tem certeza que deseja cancelar?");
  if (!ok) return;
  agendamentos = agendamentos.filter(x => x.id !== agendamentoId);
  renderizar();
  alert("Agendamento cancelado!");
};

renderizar();
