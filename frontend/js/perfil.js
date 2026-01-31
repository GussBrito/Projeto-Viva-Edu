const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");

const roleText = document.getElementById("roleText");
const camposTutor = document.getElementById("camposTutor");

const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
const inputBio = document.getElementById("bio");
const inputTelefone = document.getElementById("telefone");

const inputFoto = document.getElementById("foto");
const fotoPreview = document.getElementById("fotoPreview");

roleText.innerText = role || "—";

// Tutor vê telefone, aluno não
if (role === "TUTOR") {
  camposTutor.style.display = "block";
} else {
  camposTutor.style.display = "none";
}

function setDefaultAvatar(){
  // se não tiver foto, usa um placeholder simples
  fotoPreview.src = "https://via.placeholder.com/140?text=Foto";
}

function carregarPerfil(){
  inputNome.value = localStorage.getItem("nome") || "";
  inputEmail.value = localStorage.getItem("email") || "";
  inputBio.value = localStorage.getItem("bio") || "";

  if (role === "TUTOR" && inputTelefone) {
    inputTelefone.value = localStorage.getItem("telefone") || "";
  }

  const fotoDataUrl = localStorage.getItem("fotoDataUrl");
  if (fotoDataUrl) fotoPreview.src = fotoDataUrl;
  else setDefaultAvatar();
}

carregarPerfil();

// Trocar foto (mock: salva base64 no localStorage)
inputFoto.addEventListener("change", () => {
  const file = inputFoto.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    localStorage.setItem("fotoDataUrl", dataUrl);
    fotoPreview.src = dataUrl;
  };
  reader.readAsDataURL(file);
});

// Salvar
document.getElementById("btnSalvar").addEventListener("click", () => {
  const nome = inputNome.value.trim();
  if (!nome) return alert("Nome é obrigatório.");

  localStorage.setItem("nome", nome);
  localStorage.setItem("bio", inputBio.value.trim());

  if (role === "TUTOR" && inputTelefone) {
    localStorage.setItem("telefone", inputTelefone.value.trim());
  }

  alert("Perfil atualizado!");

  // FUTURO BACKEND:
  // PUT /me  { nome, bio, telefone? }
});

// Voltar (home por role)
document.getElementById("btnVoltar").addEventListener("click", () => {
  if (role === "ALUNO") window.location.replace("aluno-home.html");
  else if (role === "TUTOR") window.location.replace("tutor-home.html");
  else if (role === "COORDENADOR") window.location.replace("coordenador-home.html");
  else window.location.replace("login.html");
});

// Sair
document.getElementById("logoutBtn").addEventListener("click", () => logout());
