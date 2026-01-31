const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.href = "login.html";

// aceita TUTOR (e PROFESSOR se tiver legado)
if (role !== "TUTOR" && role !== "PROFESSOR") {
  alert("Acesso negado. Role atual: " + role);
  window.location.href = "login.html";
}
