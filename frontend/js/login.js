document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const tipo = document.getElementById("tipo").value; // ALUNO ou TUTOR

  try {
    const role = await login(email, senha, tipo);

    if (role === "ALUNO") window.location.href = "aluno-home.html";
    else if (role === "TUTOR") window.location.href = "tutor-home.html";
    else alert("Tipo de usuário não reconhecido");
  } catch (err) {
    alert(err.message || "Erro no login");
  }
});
