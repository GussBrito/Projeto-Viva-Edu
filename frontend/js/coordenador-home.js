// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());
