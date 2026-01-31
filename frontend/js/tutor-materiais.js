const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const form = document.getElementById("materialForm");
const lista = document.getElementById("listaMateriais");

// mock
let materiais = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const arquivo = document.getElementById("arquivo").files[0];

  if (!titulo || !arquivo) return alert("Preencha título e selecione um arquivo.");

  materiais.push({
    id: Date.now(),
    titulo,
    nomeArquivo: arquivo.name
  });

  alert("Material enviado!");
  form.reset();
  render();
});

function render(){
  lista.innerHTML = "";

  if (materiais.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">Nenhum material enviado.</p>`;
    lista.appendChild(empty);
    return;
  }

  materiais.forEach(m => {
    const div = document.createElement("div");
    div.className = "list-card";
    div.innerHTML = `
      <strong>${m.titulo}</strong><br>
      Arquivo: ${m.nomeArquivo}<br><br>
      <button class="btn btn-outline" type="button" onclick="excluirMaterial(${m.id})">Excluir</button>
    `;
    lista.appendChild(div);
  });
}

window.excluirMaterial = function(id){
  if (!confirm("Excluir este material?")) return;
  materiais = materiais.filter(x => x.id !== id);
  render();
};

render();
