const API_URL = "http://localhost:3333"; // depois você ajusta

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(API_URL + endpoint, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "../pages/login.html";
    return;
  }

  return response.json();
}
