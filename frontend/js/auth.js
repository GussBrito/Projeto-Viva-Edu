async function login(email, senha, roleTeste = "ALUNO") {
  // ===== LOGIN FALSO TEMPORÁRIO (até o backend existir) ====
  if (email && senha) {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("role", roleTeste);

    // tenta puxar o nome salvo no cadastro; se não tiver, cria um padrão
    const nomeSalvo = localStorage.getItem("nome");
    const nome = nomeSalvo && nomeSalvo.trim().length ? nomeSalvo : "Usuário";

    localStorage.setItem("nome", nome);

    return { role: roleTeste, nome };
  }

  throw new Error("Login inválido");
  // =======================================================
}

function logout() {
  localStorage.clear();
  window.location.replace("../pages/login.html");
}
