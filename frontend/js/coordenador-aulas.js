const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaAulas");

// MOCK – depois vem do backend
const aulas = [
  {
    id: 1,
    disciplina: "Português",
    assunto: "Regência",
    tutor: { id: 501, nome: "João Tutor" },
    data: "2026-02-10",
    local: "Sala 01 – Escola X"
  },
  {
    id: 2,
    disciplina: "Matemática",
    assunto: "Função do 1º Grau",
    tutor: { id: 502, nome: "Maria Tutor" },
    data: "2026-02-12",
    local: "Sala 02 – Escola Y"
  }
];

function render(){
  lista.innerHTML = "";

  if (aulas.length === 0) {
    lista.innerHTML = `<div class="list-card">Nenhuma aula cadastrada.</div>`;
    return;
  }

  aulas.forEach(a => {
    const div = document.createElement("div");
    div.className = "list-card";

    div.innerHTML = `
      <strong>${a.disciplina}</strong><br>
      Assunto: ${a.assunto}<br>
      Tutor:
      <span style="color:var(--brand);font-weight:800;cursor:pointer"
            onclick="verPerfil(${a.tutor.id})">
        ${a.tutor.nome}
      </span><br>
      Data: ${a.data}<br>
      Local: ${a.local}
    `;

    lista.appendChild(div);
  });
}

window.verPerfil = function(id){
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(id)}`;
};

render();
