document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const email = document.getElementById("email").value.trim();
  const confirmarEmail = document.getElementById("confirmarEmail").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  const tipo = document.getElementById("tipo").value; // ALUNO/TUTOR (ou outros no futuro)

  if (!nome || !cpf || !email || !senha) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  // comparação de email case-insensitive (mais amigável)
  if (email.toLowerCase() !== confirmarEmail.toLowerCase()) {
    alert("Os e-mails não conferem.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não conferem.");
    return;
  }

  const payload = {
    nome,
    cpf,
    email,
    senha,
    role: (tipo || "").toUpperCase().trim()
  };

  try {
    // 1) cadastra
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || "Erro ao cadastrar.");
      return;
    }

    //Se for TUTOR: auto-login e vai pro onboarding
    if (payload.role === "TUTOR") {
      const loginRes = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      const loginData = await loginRes.json().catch(() => ({}));

      if (!loginRes.ok) {
        // fallback: se login falhar, manda pro login normal
        alert("Cadastro ok! Agora faça login para completar seu perfil.");
        window.location.replace("login.html");
        return;
      }

      const role = (loginData.user?.role || "").toUpperCase().trim();
      const nomeUser = loginData.user?.nome || "";
      const userId = loginData.user?.id || "";

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("nome", nomeUser);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);

      alert("Cadastro realizado! Complete seu perfil de tutor.");
      window.location.replace("tutor-validacao.html");
      return;
    }

    // Para os outros perfis, segue normal
    alert("Cadastro realizado com sucesso!");
    window.location.replace("login.html");

  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});
