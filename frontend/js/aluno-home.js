// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "login.html";
if (role !== "ALUNO") window.location.href = "tutor-home.html";
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => {
  logout();
});
