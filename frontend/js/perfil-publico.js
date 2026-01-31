const token = localStorage.getItem("token");
const roleAtual = localStorage.getItem("role");

if (!token) window.location.replace("login.html");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const elNome = document.getElementById("nome");
const elRole = document.getElementById("role");
const elBio = document.getElementById("bio");
const elFoto = document.getElementById("fotoPreview");
const telefoneBox = document.getElementById("telefoneBox");
const elTelefone = document.getElementById("telefone");

function loadUsers(){
  try { return JSON.parse(localStorage.getItem("users") || "[]"); }
  catch { return []; }
}

function goBack(){
  if (roleAtual === "ALUNO") return window.location.replace("aluno-home.html");
  if (roleAtual === "TUTOR") return window.location.replace("tutor-home.html");
  if (roleAtual === "COORDENADOR") return window.location.replace("coordenador-home.html");
  window.location.replace("login.html");
}

document.getElementById("btnVoltar").addEventListener("click", goBack);

if (!id) {
  alert("Perfil inválido (id não informado).");
  goBack();
}

const users = loadUsers();
const user = users.find(u => String(u.id) === String(id));

if (!user) {
  alert("Usuário não encontrado (mock).");
  goBack();
}

elNome.textContent = user.nome || "—";
elRole.textContent = user.role || "—";
elBio.textContent = user.bio?.trim() ? user.bio : "Sem bio cadastrada.";

const foto = user.fotoDataUrl || "https://via.placeholder.com/110?text=Foto";
elFoto.src = foto;

// regra: telefone só aparece se for tutor e se estiver preenchido
if (user.role === "TUTOR" && user.telefone && user.telefone.trim()) {
  telefoneBox.style.display = "block";
  elTelefone.textContent = user.telefone;
} else {
  telefoneBox.style.display = "none";
}
