async function login(email, senha, roleTeste = "ALUNO") {
  // LOGIN FALSO TEMPORÁRIO (até o backend existir)
  if (email && senha) {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("role", roleTeste);
    return roleTeste;
  }
  throw new Error("Login inválido");
}
