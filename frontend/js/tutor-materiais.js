// ===== PROTEÇÃO DA PÁGINA (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "login.html";
if (role !== "TUTOR") window.location.href = "aluno-home.html";
// ============================================

const form = document.getElementById("materialForm");
const lista = document.getElementById("listaMateriais");

// MOCK de materiais
let materiais = [];

// ENVIO (UPLOAD)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const arquivoInput = document.getElementById("arquivo");
  const arquivo = arquivoInput.files[0];

  if (!titulo || !arquivo) {
    alert("Preencha todos os campos");
    return;
  }

  // MOCK: salva info local
  materiais.push({
    id: Date.now(),
    titulo,
    nomeArquivo: arquivo.name
  });

  alert("Material enviado com sucesso!");

  form.reset();
  renderizar();

  // QUANDO TIVER BACKEND:
  /*
  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("arquivo", arquivo);

  await apiFetch("/materiais", {
    method: "POST",
    body: formData
  });
  */
});

// LISTAGEM
function renderizar() {
  lista.innerHTML = "";

  if (materiais.length === 0) {
    lista.innerHTML = "<p>Nenhum material enviado.</p>";
    return;
  }

  materiais.forEach(m => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${m.titulo}</strong><br>
      Arquivo: ${m.nomeArquivo}<br><br>
      <button onclick="excluirMaterial(${m.id})">Excluir</button>
    `;

    lista.appendChild(div);
  });
}

// EXCLUIR
function excluirMaterial(id) {
  const ok = confirm("Deseja excluir este material?");
  if (!ok) return;

  materiais = materiais.filter(m => m.id !== id);
  renderizar();

  alert("Material excluído!");

  // QUANDO TIVER BACKEND:
  // await apiFetch(`/materiais/${id}`, { method: "DELETE" });
}

renderizar();
