function loadUsers(){
  try { return JSON.parse(localStorage.getItem("users") || "[]"); }
  catch { return []; }
}

async function login(email, senha, roleTeste = "ALUNO") {
  // ===== LOGIN REAL (quando o backend estiver pronto) =====
  /*
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha })
  });

  localStorage.setItem("token", response.token);
  localStorage.setItem("role", response.user.role);
  localStorage.setItem("nome", response.user.nome);
  localStorage.setItem("userId", response.user.id);

  return { role: response.user.role, nome: response.user.nome };
  */
  // =======================================================

  // ===== LOGIN MOCK =====
  if (email && senha) {
    const users = loadUsers();
    const found = users.find(u => (u.email || "").toLowerCase() === email.toLowerCase());

    localStorage.setItem("token", "fake-token");

    if (found) {
      localStorage.setItem("role", found.role);
      localStorage.setItem("nome", found.nome);
      localStorage.setItem("email", found.email);
      localStorage.setItem("userId", String(found.id));
      return { role: found.role, nome: found.nome };
    }

    // fallback (se não tiver cadastrado)
    localStorage.setItem("role", roleTeste);
    localStorage.setItem("nome", localStorage.getItem("nome") || "Usuário");
    localStorage.setItem("email", email);
    localStorage.setItem("userId", "");
    return { role: roleTeste, nome: localStorage.getItem("nome") || "Usuário" };
  }

  throw new Error("Login inválido");
}

function logout() {
  localStorage.clear();
  window.location.replace("../pages/login.html");
}
