document.getElementById("cadastroForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const email = document.getElementById("email").value.trim();
  const confirmarEmail = document.getElementById("confirmarEmail").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  const tipo = document.getElementById("tipo").value;

  if (email !== confirmarEmail) {
    alert("Os e-mails não conferem.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não conferem.");
    return;
  }

  // MOCK: salva dados localmente (simula backend)
  localStorage.setItem("nome", nome);
  localStorage.setItem("email", email);
  localStorage.setItem("role", tipo);

  alert("Cadastro realizado com sucesso!");
  window.location.replace("login.html");

  /*
  FUTURO BACKEND:
  POST /auth/register
  {
    nome,
    cpf,
    email,
    senha,
    role: tipo
  }
  */
});
