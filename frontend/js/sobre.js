const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
  window.location.replace("login.html");
}

document.getElementById("btnVoltar").addEventListener("click", () => {
  if (role === "ALUNO") window.location.replace("aluno-home.html");
  else if (role === "TUTOR") window.location.replace("tutor-home.html");
  else if (role === "COORDENADOR") window.location.replace("coordenador-home.html");
  else window.location.replace("login.html");
});
