(async () => {
  try {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toUpperCase().trim();

    if (!token) return window.location.replace("login.html");
    if (role !== "TUTOR") return window.location.replace("login.html");

    const me = await api("/users/me");

    const temPerfil =
      !!me?.areaAtuacao &&
      !!me?.formacao &&
      !!me?.situacaoCurso;

    const temDocs =
      !!me?.docs?.comprovanteUrl &&
      !!me?.docs?.identidadeUrl;

    if (!temPerfil || !temDocs) {
      alert("Complete seu cadastro de tutor antes de continuar.");
      return window.location.replace("tutor-onboarding.html");
    }

    if (me?.tutorValidado !== true) {
      alert("Aguarde o coordenador validar o seu perfil.");
      return window.location.replace("login.html");
    }

  } catch (err) {
    console.error(err);
    return window.location.replace("login.html");
  }
})();

document.getElementById("logoutBtn").addEventListener("click", () => logout());
