document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    alert("Informe email e senha.");
    return;
  }

  try {
    // 1) Login (REST)
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || "Login inválido.");
      return;
    }

    // 2) Salva sessão
    const role = (data.user?.role || "").toUpperCase().trim();
    const nome = data.user?.nome || "";
    const userId = data.user?.id || "";

    localStorage.setItem("token", data.token);
    localStorage.setItem("nome", nome);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId);

    // 3) Redirecionamento por role
    if (role === "ALUNO") return window.location.replace("aluno-home.html");

    if (role === "COORDENADOR") return window.location.replace("coordenador-home.html");

    if (role === "ADMIN") return window.location.replace("admin-home.html");

    if (role === "TUTOR") {
      try {
        // pega dados do usuário logado para checar validação
        const me = await api("/users/me"); // usa token
        const tutorValidado = me?.tutorValidado === true;

        localStorage.setItem("tutorValidado", String(tutorValidado));

        if (!tutorValidado) {
          return window.location.replace("tutor-validacao.html");
        }

        return window.location.replace("tutor-home.html");
      } catch (err) {
        console.error(err);
        // fallback: se não conseguir ler /users/me, manda pro home do tutor
        return window.location.replace("tutor-home.html");
      }
    }

    alert("Perfil inválido: " + role);
    window.location.replace("login.html");

  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});
