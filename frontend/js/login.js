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
        const me = await api("/users/me");

        const tutorValidado = me?.tutorValidado === true;
        const temPerfil = !!me?.areaAtuacao && !!me?.formacao && !!me?.situacaoCurso;
        const temDocs = !!me?.docs?.comprovanteUrl && !!me?.docs?.identidadeUrl;

        // ainda não completou validacao -> manda completar
        if (!temPerfil || !temDocs) {
          alert("Complete seu cadastro de tutor antes de continuar.");
          return window.location.replace("tutor-validacao.html");
        }

        // completou, mas ainda não validado -> só avisa e fica no login
        if (!tutorValidado) {
          alert("Aguarde o coordenador validar o seu perfil.");
          return; // não redireciona
        }

        // validado -> entra normal
        return window.location.replace("tutor-home.html");

      } catch (err) {
        console.error(err);
        alert("Não foi possível verificar seu status agora. Tente novamente.");
        return; // fica no login
      }
    }



    alert("Perfil inválido: " + role);
    window.location.replace("login.html");

  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});
