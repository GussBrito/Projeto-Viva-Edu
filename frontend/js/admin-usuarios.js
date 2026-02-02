const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "ADMIN") {
  alert("Acesso negado.");
  window.location.replace("login.html");
}

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const tbody = document.getElementById("usersTable");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const reloadBtn = document.getElementById("reloadBtn");

let allUsers = [];

async function loadUsers() {
  try {
    const users = await api("/users"); // backend
    allUsers = Array.isArray(users) ? users : [];
    renderUsers();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao carregar usuários");
  }
}

function renderUsers() {
  const search = (searchInput.value || "").toLowerCase();
  const roleValue = roleFilter.value;

  const filtered = allUsers.filter(u => {
    const nome = (u.nome || "").toLowerCase();
    const email = (u.email || "").toLowerCase();

    const matchesSearch = nome.includes(search) || email.includes(search);
    const matchesRole = !roleValue || u.role === roleValue;

    return matchesSearch && matchesRole;
  });

  tbody.innerHTML = "";

  filtered.forEach(u => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.nome || "-"}</td>
      <td>${u.email || "-"}</td>
      <td>
        <select class="role-select" data-id="${u._id}">
          ${["ALUNO","TUTOR","COORDENADOR","ADMIN"].map(r =>
            `<option value="${r}" ${u.role === r ? "selected" : ""}>${r}</option>`
          ).join("")}
        </select>
      </td>
      <td>
        <span class="badge ${u.ativo ? "active" : "inactive"}">
          ${u.ativo ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td class="actions">
        <button class="btn btn-outline" type="button" onclick="toggleStatus('${u._id}')">
          ${u.ativo ? "Desativar" : "Ativar"}
        </button>
        <button class="btn btn-primary" type="button" onclick="deleteUser('${u._id}')">
          Excluir
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // ligar change role
  document.querySelectorAll(".role-select").forEach(sel => {
    sel.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const newRole = (e.target.value || "").toUpperCase().trim();

      if (!confirm(`Alterar role para ${newRole}?`)) {
        // re-render pra desfazer mudança visual
        renderUsers();
        return;
      }

      try {
        await api(`/users/${id}/role`, {
          method: "PUT",
          body: { role: newRole }
        });
        await loadUsers();
      } catch (err) {
        console.error(err);
        alert(err.message || "Erro ao alterar role");
        await loadUsers();
      }
    });
  });
}

searchInput.addEventListener("input", renderUsers);
roleFilter.addEventListener("change", renderUsers);
reloadBtn.addEventListener("click", loadUsers);

// ações globais (usadas no onclick)
window.toggleStatus = async function(id) {
  const user = allUsers.find(u => u._id === id);
  if (!user) return alert("Usuário não encontrado.");

  const novoStatus = !user.ativo;
  if (!confirm(`Deseja ${novoStatus ? "ATIVAR" : "DESATIVAR"} este usuário?`)) return;

  try {
    await api(`/users/${id}/status`, {
      method: "PUT",
      body: { ativo: novoStatus }
    });
    await loadUsers();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao alterar status.");
  }
};

window.deleteUser = async function(id) {
  if (!confirm("Excluir usuário definitivamente?")) return;

  try {
    await api(`/users/${id}`, { method: "DELETE" });
    await loadUsers();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao excluir usuário.");
  }
};

loadUsers();
