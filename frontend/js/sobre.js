const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");

const linkAluno = document.getElementById("linkHomeAluno");
const linkTutor = document.getElementById("linkHomeTutor");

if (role === "ALUNO") {
  linkTutor.style.display = "none";
} else if (role === "TUTOR") {
  linkAluno.style.display = "none";
}

document.getElementById("logoutBtn").addEventListener("click", () => logout());
