document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    alert("Informe email e senha.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login inválido.");
      return;
    }

    const role = (data.user?.role || "").toUpperCase().trim();
    const nome = data.user?.nome || "";
    const userId = data.user?.id || "";

    localStorage.setItem("token", data.token);
    localStorage.setItem("nome", nome);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId);

    if (role === "ALUNO") return window.location.replace("aluno-home.html");
    if (role === "TUTOR" || role === "PROFESSOR") return window.location.replace("tutor-home.html");

    alert("Perfil inválido: " + role);
    window.location.replace("login.html");
  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});
