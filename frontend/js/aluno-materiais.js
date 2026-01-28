// ===== PROTEÇÃO DA PÁGINA (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "login.html";
if (role !== "ALUNO") window.location.href = "tutor-home.html";
// ============================================

const lista = document.getElementById("listaMateriais");

// MOCK TEMPORÁRIO
const materiais = [
  {
    id: 1,
    titulo: "Regência Verbal - PDF",
    disciplina: "Português",
    arquivo: "regencia.pdf"
  },
  {
    id: 2,
    titulo: "Função do 1º Grau - Exercícios",
    disciplina: "Matemática",
    arquivo: "funcao1grau.pdf"
  }
];

function renderizar() {
  lista.innerHTML = "";

  if (materiais.length === 0) {
    lista.innerHTML = "<p>Nenhum material disponível.</p>";
    return;
  }

  materiais.forEach(m => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${m.titulo}</strong><br>
      Disciplina: ${m.disciplina}<br><br>
      <button onclick="baixarMaterial('${m.arquivo}')">Baixar</button>
    `;

    lista.appendChild(div);
  });
}

function baixarMaterial(nomeArquivo) {
  alert("Download do arquivo: " + nomeArquivo);

  // quando tiver backend:
  // window.open(`http://localhost:3333/uploads/${nomeArquivo}`, "_blank");
}

renderizar();
