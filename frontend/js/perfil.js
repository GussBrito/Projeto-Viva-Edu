// ===== PROTEÇÃO =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
// =====================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

// Links
const linkAluno = document.getElementById("linkHomeAluno");
const linkTutor = document.getElementById("linkHomeTutor");
const atalhoTutor = document.getElementById("atalhoTutor");

// Campos
const roleText = document.getElementById("roleText");
const camposTutor = document.getElementById("camposTutor");

const form = document.getElementById("perfilForm");
const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
const inputBio = document.getElementById("bio");
const inputTelefone = document.getElementById("telefone");

const inputFoto = document.getElementById("foto");
const fotoPreview = document.getElementById("fotoPreview");

// Ajuste visual por role
roleText.innerText = role || "—";

if (role === "ALUNO") {
  linkTutor.style.display = "none";
  atalhoTutor.style.display = "none";
  camposTutor.style.display = "none";
} else if (role === "TUTOR") {
  linkAluno.style.display = "none";
  atalhoTutor.style.display = "inline";
  camposTutor.style.display = "block";
} else {
  linkAluno.style.display = "none";
  linkTutor.style.display = "none";
  atalhoTutor.style.display = "none";
  camposTutor.style.display = "none";
}

// Carregar dados (mock)
function carregarPerfil() {
  inputNome.value = localStorage.getItem("nome") || "";
  inputEmail.value = localStorage.getItem("email") || "";
  inputBio.value = localStorage.getItem("bio") || "";

  if (role === "TUTOR") {
    inputTelefone.value = localStorage.getItem("telefone") || "";
  }

  const fotoDataUrl = localStorage.getItem("fotoDataUrl");
  fotoPreview.src = fotoDataUrl || "https://via.placeholder.com/120?text=Foto";
}

carregarPerfil();

// Foto (mock em base64)
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

// Salvar perfil
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = inputNome.value.trim();
  if (!nome) return alert("Nome é obrigatório.");

  localStorage.setItem("nome", nome);
  localStorage.setItem("bio", inputBio.value.trim());

  if (role === "TUTOR") {
    localStorage.setItem("telefone", inputTelefone.value.trim());
  }

  alert("Perfil atualizado!");

  // FUTURO BACKEND:
  /*
  await apiFetch("/me", {
    method: "PUT",
    body: JSON.stringify({
      nome,
      bio: inputBio.value.trim(),
      telefone: role === "TUTOR" ? inputTelefone.value.trim() : null
    })
  });
  */
});
