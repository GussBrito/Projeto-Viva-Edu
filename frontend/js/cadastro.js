document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const email = document.getElementById("email").value.trim();
  const confirmarEmail = document.getElementById("confirmarEmail").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  const tipo = document.getElementById("tipo").value;

  if (!nome || !cpf || !email || !senha) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  if (email !== confirmarEmail) {
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
    role: tipo.toUpperCase()
  };

  try {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao cadastrar.");
      return;
    }

    alert("Cadastro realizado com sucesso!");
    window.location.replace("login.html");

  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});
