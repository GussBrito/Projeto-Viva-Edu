// ===== PROTEÇÃO DA PÁGINA (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "login.html";
if (role !== "ALUNO") window.location.href = "tutor-home.html";
// ============================================

const lista = document.getElementById("listaAulas");

// FUNÇÃO PARA BUSCAR AULAS
async function carregarAulas() {
  try {
    // quando o backend estiver pronto:
    // const aulas = await apiFetch("/aulas-disponiveis");

    // MOCK TEMPORÁRIO (pra desenvolver sem backend)
    const aulas = [
      {
        id: 1,
        disciplina: "Português",
        assunto: "Regência",
        tutor: "João Silva"
      },
      {
        id: 2,
        disciplina: "Matemática",
        assunto: "Função do 1º Grau",
        tutor: "Maria Souza"
      }
    ];

    lista.innerHTML = "";

    aulas.forEach(aula => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";

      div.innerHTML = `
        <strong>${aula.disciplina}</strong><br>
        Assunto: ${aula.assunto}<br>
        Tutor: ${aula.tutor}<br><br>
        <button onclick="agendarAula(${aula.id})">Agendar</button>
      `;

      lista.appendChild(div);
    });

  } catch (err) {
    alert("Erro ao carregar aulas");
  }
}

// FUNÇÃO AGENDAR
function agendarAula(id) {
  alert("Aula " + id + " agendada!");

  // quando tiver backend:
  // await apiFetch("/agendamentos", {
  //   method: "POST",
  //   body: JSON.stringify({ aulaId: id })
  // });
}

carregarAulas();
