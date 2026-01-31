const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) {
  window.location.replace("login.html");
}

// aceita TUTOR (e PROFESSOR se tiver legado)
if (role !== "TUTOR" && role !== "PROFESSOR") {
  alert("Acesso negado.");
  window.location.replace("login.html");
}

document.getElementById("logoutBtn").addEventListener("click", () => logout());
