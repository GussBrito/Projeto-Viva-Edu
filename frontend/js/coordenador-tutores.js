const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaTutores");
const busca = document.getElementById("buscaTutor");

function loadUsers(){
  try { return JSON.parse(localStorage.getItem("users") || "[]"); }
  catch { return []; }
}

function escapeHtml(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function render(){
  const q = (busca.value || "").toLowerCase().trim();
  const users = loadUsers();

  const tutores = users.filter(u =>
    u.role === "TUTOR" &&
    (
      !q ||
      (u.nome || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    )
  );

  lista.innerHTML = "";

  if (tutores.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="margin:0;color:var(--muted);">Nenhum tutor encontrado.</p>`;
    lista.appendChild(empty);
    return;
  }

  tutores.forEach(t => {
    const div = document.createElement("div");
    div.className = "list-card";
    div.innerHTML = `
      <strong>${escapeHtml(t.nome)}</strong><br>
      <span style="color:var(--muted); font-weight:700;">${escapeHtml(t.email)}</span><br><br>
      <button class="btn btn-primary" type="button" onclick="verPerfil(${t.id})">Ver perfil</button>
    `;
    lista.appendChild(div);
  });
}

window.verPerfil = function(id){
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(id)}`;
};

busca.addEventListener("input", render);
render();
