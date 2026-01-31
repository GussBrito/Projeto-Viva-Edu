document.getElementById("cadastroForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const email = document.getElementById("email").value.trim();
  const confirmarEmail = document.getElementById("confirmarEmail").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  const tipo = document.getElementById("tipo").value; // mock: ALUNO/TUTOR/COORDENADOR

  if (email.toLowerCase() !== confirmarEmail.toLowerCase()) {
    alert("Os e-mails não conferem.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não conferem.");
    return;
  }

  // ===== salva usuário no "banco" mock =====
  let users = [];
  try { users = JSON.parse(localStorage.getItem("users") || "[]"); } catch { users = []; }

  // evita duplicar email
  if (users.some(u => (u.email || "").toLowerCase() === email.toLowerCase())) {
    alert("Já existe um usuário com esse e-mail (mock).");
    return;
  }

  const user = {
    id: Date.now(),
    nome,
    email,
    role: tipo,
    bio: "",
    telefone: "",
    fotoDataUrl: ""
  };

  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));

  // deixa o cadastro “visível” pro perfil e pro login mock
  localStorage.setItem("nome", nome);
  localStorage.setItem("email", email);
  localStorage.setItem("role", tipo);

  alert("Cadastro realizado com sucesso!");
  window.location.replace("login.html");
});
