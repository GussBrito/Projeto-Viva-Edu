// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "ALUNO") window.location.replace("tutor-home.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaAulas");

// MOCK: aulas com tutor {id, nome}
// No back, isso deve vir na resposta de /aulas-disponiveis
const aulas = [
  {
    id: 1,
    disciplina: "Português",
    assunto: "Regência",
    tutor: { id: 9001, nome: "João Tutor" }
  },
  {
    id: 2,
    disciplina: "Matemática",
    assunto: "Função do 1º Grau",
    tutor: { id: 9002, nome: "Maria Tutor" }
  }
];

function renderizar() {
  lista.innerHTML = "";

  if (aulas.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">Nenhuma aula disponível no momento.</p>`;
    lista.appendChild(empty);
    return;
  }

  aulas.forEach(aula => {
    const div = document.createElement("div");
    div.className = "list-card";

    div.innerHTML = `
      <strong>${aula.disciplina}</strong><br>
      Assunto: ${aula.assunto}<br>
      Tutor: ${aula.tutor.nome}
      <button class="btn btn-outline" type="button"
        onclick="verPerfil(${aula.tutor.id})"
        style="margin-left:10px;">
        Ver perfil
      </button>
      <br><br>

      <button class="btn btn-primary" type="button" onclick="agendarAula(${aula.id})">
        Agendar
      </button>
    `;

    lista.appendChild(div);
  });
}

window.verPerfil = function(userId){
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(userId)}`;
};

window.agendarAula = function (aulaId) {
  alert("Aula " + aulaId + " agendada! (mock)");
  // FUTURO BACKEND:
  // POST /agendamentos { aulaId }
};

renderizar();
