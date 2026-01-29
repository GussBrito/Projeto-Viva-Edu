document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const tipo = document.getElementById("tipo").value; // ALUNO ou TUTOR (modo teste)

  try {
    const result = await login(email, senha, tipo);

    // garante que o nome fica salvo
    if (result?.nome) localStorage.setItem("nome", result.nome);

    if (result.role === "ALUNO") {
      window.location.replace("aluno-home.html");
    } else if (result.role === "TUTOR") {
      window.location.replace("tutor-home.html");
    } else {
      alert("Tipo de usuário não reconhecido");
    }
  } catch (err) {
    alert(err.message || "Erro no login");
  }
});
