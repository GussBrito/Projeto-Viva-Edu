const BASE_URL = "http://localhost:3000";

/**
 * Chamada padrão para API VivaEdu
 * Uso: api("/auth/login", { method: "POST", body: {...}, auth: false })
 */
async function api(path, { method = "GET", body, auth = true, isForm = false } = {}) {
  const headers = {};

  if (!isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined)
  });

  // token expirou/invalidou
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("nome");
    window.location.replace("login.html");
    return null;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || "Erro na API");
  return data;
}

// deixa disponível globalmente para outros scripts (auth.js, etc.)
window.api = api;
window.BASE_URL = BASE_URL;
