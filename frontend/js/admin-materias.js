const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "ADMIN") {
  alert("Acesso negado.");
  window.location.replace("login.html");
}

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const nomeInput = document.getElementById("materiaNome");
const descInput = document.getElementById("materiaDesc");
const addBtn = document.getElementById("addMateriaBtn");
const reloadBtn = document.getElementById("reloadMateriasBtn");
const tbody = document.getElementById("materiasTable");

let allMaterias = [];

async function loadMaterias() {
  try {
    const materias = await api("/materias"); // backend
    allMaterias = Array.isArray(materias) ? materias : [];
    renderMaterias();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao carregar matérias");
  }
}

function renderMaterias() {
  tbody.innerHTML = "";

  if (allMaterias.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:#666;">Nenhuma matéria cadastrada.</td></tr>`;
    return;
  }

  allMaterias.forEach(m => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <input class="inline-input" data-id="${m._id}" data-field="nome" value="${m.nome || ""}">
      </td>
      <td>
        <input class="inline-input" data-id="${m._id}" data-field="descricao" value="${m.descricao || ""}">
      </td>
      <td>
        <span class="badge ${m.ativo ? "active" : "inactive"}">
          ${m.ativo ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td class="actions">
        <button class="btn btn-outline" type="button" onclick="toggleMateria('${m._id}')">
          ${m.ativo ? "Desativar" : "Ativar"}
        </button>
        <button class="btn btn-outline" type="button" onclick="saveMateria('${m._id}')">
          Salvar
        </button>
        <button class="btn btn-primary" type="button" onclick="deleteMateria('${m._id}')">
          Excluir
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

addBtn.addEventListener("click", async () => {
  const nome = (nomeInput.value || "").trim();
  const descricao = (descInput.value || "").trim();

  if (!nome) return alert("Informe o nome da matéria.");

  try {
    await api("/materias", {
      method: "POST",
      body: { nome, descricao }
    });

    nomeInput.value = "";
    descInput.value = "";
    await loadMaterias();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao adicionar matéria");
  }
});

reloadBtn.addEventListener("click", loadMaterias);

window.toggleMateria = async function(id) {
  const mat = allMaterias.find(m => m._id === id);
  if (!mat) return alert("Matéria não encontrada.");

  const novoStatus = !mat.ativo;
  if (!confirm(`Deseja ${novoStatus ? "ATIVAR" : "DESATIVAR"} esta matéria?`)) return;

  try {
    await api(`/materias/${id}`, {
      method: "PUT",
      body: { ativo: novoStatus }
    });
    await loadMaterias();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao alterar status.");
  }
};

window.saveMateria = async function(id) {
  const nomeEl = document.querySelector(`.inline-input[data-id="${id}"][data-field="nome"]`);
  const descEl = document.querySelector(`.inline-input[data-id="${id}"][data-field="descricao"]`);

  const nome = (nomeEl?.value || "").trim();
  const descricao = (descEl?.value || "").trim();

  if (!nome) return alert("Nome não pode ficar vazio.");

  try {
    await api(`/materias/${id}`, {
      method: "PUT",
      body: { nome, descricao }
    });
    await loadMaterias();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao salvar matéria.");
  }
};

window.deleteMateria = async function(id) {
  if (!confirm("Excluir matéria definitivamente?")) return;

  try {
    await api(`/materias/${id}`, { method: "DELETE" });
    await loadMaterias();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao excluir matéria.");
  }
};

loadMaterias();
