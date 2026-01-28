document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const email = document.getElementById("email").value.trim();
  const confirmarEmail = document.getElementById("confirmarEmail").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  const tipo = document.getElementById("tipo").value;

  // validações básicas
  const cpfSomenteNumeros = cpf.replace(/\D/g, "");
  if (cpfSomenteNumeros.length !== 11) {
    alert("CPF inválido. Digite 11 números.");
    return;
  }

  if (email.toLowerCase() !== confirmarEmail.toLowerCase()) {
    alert("Os e-mails não conferem.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não conferem.");
    return;
  }

  if (senha.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  try {
    // MODO TESTE (sem backend)
    alert(
      "Cadastro realizado!\n\n" +
      `Nome: ${nome}\n` +
      `CPF: ${cpfSomenteNumeros}\n` +
      `Tipo: ${tipo}`
    );

    // Quando tiver backend:
    /*
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        nome,
        cpf: cpfSomenteNumeros,
        email,
        senha,
        role: tipo
      })
    });
    */

    window.location.href = "login.html";
  } catch (err) {
    alert("Erro no cadastro");
  }
});
