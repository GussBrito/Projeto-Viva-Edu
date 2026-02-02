// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "COORDENADOR") window.location.replace("login.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaVoluntarios");

// Agora vem do backend:
let voluntarios = []; // array de users (tutores pendentes)

function fileUrl(path) {
  // backend devolve /uploads/tutors/...
  if (!path) return "";
  return `http://localhost:3000${path}`;
}

async function loadPendentes() {
  try {
    // ✅ rota real do backend
    const pendentes = await api("/tutors/pending");
    voluntarios = Array.isArray(pendentes) ? pendentes : [];
    render();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao carregar voluntários pendentes.");
    voluntarios = [];
    render();
  }
}

function render() {
  lista.innerHTML = "";

  if (voluntarios.length === 0) {
    lista.innerHTML = `<div class="list-card">Nenhum tutor pendente</div>`;
    return;
  }

  voluntarios.forEach(v => {
    const div = document.createElement("div");
    div.className = "list-card";

    const status = (v.tutorValidado === true) ? "VALIDADO" : "PENDENTE";

    const comprovante = v?.docs?.comprovanteUrl;
    const identidade = v?.docs?.identidadeUrl;

    div.innerHTML = `
      <strong>${v.nome}</strong><br>
      E-mail: ${v.email || "-"}<br>
      Área de atuação: ${v.areaAtuacao || "-"}<br>
      Formação: ${v.formacao || "-"}<br>
      Situação do curso: ${v.situacaoCurso || "-"}<br>
      Status: ${status}<br><br>

      ${
        comprovante
          ? `<a class="btn btn-outline" href="${fileUrl(comprovante)}" target="_blank" rel="noopener">Ver comprovante</a>`
          : `<button class="btn btn-outline" disabled type="button">Sem comprovante</button>`
      }
      ${
        identidade
          ? `<a class="btn btn-outline" href="${fileUrl(identidade)}" target="_blank" rel="noopener" style="margin-left:8px;">Ver identidade</a>`
          : `<button class="btn btn-outline" disabled type="button" style="margin-left:8px;">Sem identidade</button>`
      }

      <br><br>

      ${
        v.tutorValidado
          ? `<button class="btn btn-outline" disabled type="button">Já validado</button>`
          : `<button class="btn btn-primary" type="button" onclick="validar('${v._id}')">Validar</button>`
      }
    `;

    lista.appendChild(div);
  });
}

window.validar = async function(id) {
  const ok = confirm("Deseja validar este tutor?");
  if (!ok) return;

  try {
    // ✅ valida no backend
    await api(`/tutors/${id}/validate`, {
      method: "PUT",
      body: { validado: true }
    });

    alert("Tutor validado com sucesso");

    // Recarrega lista (some da lista pendente)
    await loadPendentes();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao validar tutor.");
  }
};

// carrega ao entrar na seção
loadPendentes();
