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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login inválido.");
      return;
    }

    // Normaliza o role para evitar problemas de maiúsculas/minúsculas/espaços
    const role = (data.role || "").toUpperCase().trim();

    // Salva sessão
    localStorage.setItem("token", data.token);
    localStorage.setItem("nome", data.nome || "");
    localStorage.setItem("role", role);

    // Debug útil (se quiser remover depois)
    console.log("Login OK:", { nome: data.nome, role });

    // Redireciona por papel
    if (role === "ALUNO") {
      window.location.href = "aluno-home.html";
      return;
    }

    // Aceita TUTOR e, se existir usuário antigo, PROFESSOR
    if (role === "TUTOR" || role === "PROFESSOR") {
      window.location.href = "tutor-home.html";
      return;
    }

    // Se vier algo inesperado, não deixa passar silencioso
    alert("Perfil inválido retornado pelo servidor: " + role);
    window.location.href = "login.html";

  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});
