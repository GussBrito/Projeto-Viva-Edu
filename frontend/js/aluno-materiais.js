// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "ALUNO") window.location.replace("tutor-home.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaMateriais");

// MOCK
const materiais = [
  { id: 1, titulo: "Regência Verbal - PDF", disciplina: "Português", arquivo: "regencia.pdf" },
  { id: 2, titulo: "Função do 1º Grau - Exercícios", disciplina: "Matemática", arquivo: "funcao1grau.pdf" }
];

function renderizar() {
  lista.innerHTML = "";

  if (materiais.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">Nenhum material disponível.</p>`;
    lista.appendChild(empty);
    return;
  }

  materiais.forEach(m => {
    const div = document.createElement("div");
    div.className = "list-card";

    div.innerHTML = `
      <strong>${m.titulo}</strong><br>
      Disciplina: ${m.disciplina}<br><br>
      <button class="btn btn-primary" type="button" onclick="baixarMaterial('${m.arquivo}')">Baixar</button>
    `;

    lista.appendChild(div);
  });
}

window.baixarMaterial = function (nomeArquivo) {
  alert("Download do arquivo: " + nomeArquivo);
  // FUTURO: abrir URL real do backend /uploads/...
};

renderizar();
