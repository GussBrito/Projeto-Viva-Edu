document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const tipo = document.getElementById("tipo").value; // ALUNO | TUTOR | COORDENADOR | ...

  try {
    const result = await login(email, senha, tipo);

    // salva nome (mock)
    if (result?.nome) localStorage.setItem("nome", result.nome);

    if (result.role === "ALUNO") {
      window.location.replace("aluno-home.html");
    } else if (result.role === "TUTOR") {
      window.location.replace("tutor-home.html");
    } else if (result.role === "COORDENADOR") {
      window.location.replace("coordenador-home.html");
    } else if (result.role === "ESCOLA") {
      window.location.replace("escola-home.html"); // se você criar depois
    } else if (result.role === "ADMIN") {
      window.location.replace("admin-home.html"); // se você criar depois
    } else {
      alert("Tipo de usuário não foi reconhecido: " + result.role);
    }
  } catch (err) {
    alert(err.message || "Erro no login");
  }
});
