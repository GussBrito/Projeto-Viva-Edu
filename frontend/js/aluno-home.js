const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

// Proteção: precisa estar logado
if (!token) {
  window.location.replace("login.html");
}

// Proteção por perfil: somente ALUNO
if (role !== "ALUNO") {
  alert("Acesso negado.");
  window.location.replace("login.html");
}

// Botão logout
document.getElementById("logoutBtn").addEventListener("click", () => logout());
