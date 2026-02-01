const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "ADMIN") {
  alert("Acesso negado.");
  window.location.replace("login.html");
}

const tbody = document.getElementById("usersTable");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");

let allUsers = [];

// carregar usuários
async function loadUsers() {
  try {
    const users = await api("/users");
    allUsers = users;
    renderUsers();
  } catch (err) {
    alert(err.message || "Erro ao carregar usuários");
  }
}

function renderUsers() {
  const search = searchInput.value.toLowerCase();
  const roleValue = roleFilter.value;

  const filtered = allUsers.filter(u => {
    const matchesSearch =
      (u.nome || "").toLowerCase().includes(search) ||
      (u.email || "").toLowerCase().includes(search);

    const matchesRole = !roleValue || u.role === roleValue;

    return matchesSearch && matchesRole;
  });

  tbody.innerHTML = "";

  filtered.forEach(u => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>
        <select class="roleSelect" data-id="${u._id}">
          <option value="ALUNO" ${u.role === "ALUNO" ? "selected" : ""}>ALUNO</option>
          <option value="TUTOR" ${u.role === "TUTOR" ? "selected" : ""}>TUTOR</option>
          <option value="COORDENADOR" ${u.role === "COORDENADOR" ? "selected" : ""}>COORDENADOR</option>
          <option value="ADMIN" ${u.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
        </select>
      </td>
      <td>
        <span class="badge ${u.ativo ? "active" : "inactive"}">
          ${u.ativo ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td>
        <button class="btn btn-outline" onclick="toggleStatus('${u._id}')">
          ${u.ativo ? "Desativar" : "Ativar"}
        </button>
        <button class="btn btn-primary" onclick="deleteUser('${u._id}')">
          Excluir
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // ✅ liga o evento de troca de role após renderizar a tabela
  document.querySelectorAll(".roleSelect").forEach(sel => {
    sel.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const newRole = e.target.value;

      // descobre role atual para o confirm e rollback
      const current = allUsers.find(u => u._id === id);
      const oldRole = current?.role;

      if (!confirm(`Alterar role de ${oldRole} para ${newRole}?`)) {
        await loadUsers(); // volta ao estado original
        return;
      }

      try {
        await api(`/users/${id}/role`, {
          method: "PUT",
          body: { role: newRole }
        });

        await loadUsers();
      } catch (err) {
        alert(err.message || "Erro ao alterar role.");
        await loadUsers();
      }
    });
  });
}

// filtros
searchInput.addEventListener("input", renderUsers);
roleFilter.addEventListener("change", renderUsers);

document.getElementById("reloadBtn").onclick = loadUsers;

// ações
window.toggleStatus = async function(id){
  const user = allUsers.find(u => u._id === id);
  if (!user) return alert("Usuário não encontrado.");

  const novoStatus = !user.ativo;

  if(!confirm(`Deseja ${novoStatus ? "ATIVAR" : "DESATIVAR"} este usuário?`)) return;

  try {
    await api(`/users/${id}/status`, {
      method: "PUT",
      body: { ativo: novoStatus }
    });

    await loadUsers();
  } catch (err) {
    alert(err.message || "Erro ao alterar status.");
  }
};

window.deleteUser = async function(id){
  if(!confirm("Excluir usuário definitivamente?")) return;

  await api(`/users/${id}`, { method:"DELETE" });
  loadUsers();
};

loadUsers();

// logout (se seu auth.js não expõe logout global, troque por localStorage.clear + replace)
document.getElementById("logoutBtn").addEventListener("click", () => logout());
