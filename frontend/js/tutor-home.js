// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "login.html";
if (role !== "TUTOR") window.location.href = "aluno-home.html";
// ===================================

// logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  logout();
});
