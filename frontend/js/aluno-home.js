const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
  window.location.href = "login.html";
}

if (role !== "ALUNO") {
  alert("Acesso negado.");
  window.location.href = "login.html";
}
