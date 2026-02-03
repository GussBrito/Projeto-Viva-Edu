// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "ALUNO") window.location.replace("tutor-home.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaAulas");

let aulas = [];
let materias = [];
let materiaSelecionada = ""; // "" = todas

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===== UI: filtro de matérias (criado via JS) =====
const filtroWrap = document.createElement("div");
filtroWrap.className = "list-card";
filtroWrap.style.display = "flex";
filtroWrap.style.gap = "10px";
filtroWrap.style.alignItems = "center";
filtroWrap.style.flexWrap = "wrap";

filtroWrap.innerHTML = `
  <div style="font-weight:800;color:var(--brand);">Filtrar por disciplina:</div>
  <select id="materiaFilter" style="max-width:340px;">
    <option value="">Carregando...</option>
  </select>
  <button class="btn btn-outline" type="button" id="btnLimparFiltro">Limpar</button>
`;

const selectMateria = filtroWrap.querySelector("#materiaFilter");
const btnLimparFiltro = filtroWrap.querySelector("#btnLimparFiltro");

// insere o filtro antes da lista
if (lista && lista.parentElement) {
  lista.parentElement.insertBefore(filtroWrap, lista);
}

btnLimparFiltro.addEventListener("click", () => {
  materiaSelecionada = "";
  selectMateria.value = "";
  renderizar();
});

selectMateria.addEventListener("change", () => {
  materiaSelecionada = selectMateria.value || "";
  renderizar();
});

// ===== carregar matérias =====
async function carregarMaterias() {
  try {
    const data = await api("/materias");
    materias = Array.isArray(data) ? data : [];
    preencherSelectMaterias();
  } catch (err) {
    console.error(err);
    selectMateria.innerHTML = `<option value="">Erro ao carregar</option>`;
  }
}

function preencherSelectMaterias() {
  const ativas = materias.filter(m => m.ativo !== false);

  selectMateria.innerHTML = `
    <option value="">Todas as disciplinas</option>
    ${ativas.map(m => `<option value="${m._id}">${escapeHtml(m.nome)}</option>`).join("")}
  `;

  if (ativas.length === 0) {
    selectMateria.innerHTML = `<option value="">Nenhuma disciplina disponível</option>`;
  }
}

function materiaNome(materiaId) {
  const m = materias.find(x => x._id === materiaId);
  return m?.nome || materiaId || "Matéria";
}

// ===== carregar aulas =====
async function carregarAulas() {
  try {
    const data = await api("/aulas");
    aulas = Array.isArray(data) ? data : [];
    renderizar();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao carregar aulas disponíveis.");
  }
}

function renderizar() {
  lista.innerHTML = "";

  // aplica filtro
  const filtradas = materiaSelecionada
    ? aulas.filter(a => a.materiaId === materiaSelecionada)
    : aulas;

  if (filtradas.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">
      Nenhuma aula disponível ${materiaSelecionada ? "para esta disciplina" : "no momento"}.
    </p>`;
    lista.appendChild(empty);
    return;
  }

  filtradas.forEach(aula => {
    const div = document.createElement("div");
    div.className = "list-card";

    div.innerHTML = `
      <strong>${escapeHtml(aula.materiaNome || "Matéria")}</strong><br>
      Assunto: ${escapeHtml(aula.titulo || "")}<br>
      Tutor: ${escapeHtml(aula.tutor?.nome || "Tutor")}
      <button class="btn btn-outline" type="button"
        onclick="verPerfil('${encodeURIComponent(aula.tutor?.id || "")}')"
        style="margin-left:10px;">
        Ver perfil
      </button>
      <br><br>

      <button class="btn btn-primary" type="button" onclick="agendarAula('${aula._id}')">
        Agendar
      </button>
    `;

    lista.appendChild(div);
  });
}

window.verPerfil = function(userId){
  window.location.href = `perfil-publico.html?id=${userId}`;
};

window.agendarAula = async function (aulaId) {
  try {
    await api("/agendamentos", {
      method: "POST",
      body: { aulaId }
    });

    alert("Agendamento enviado! Status: PENDENTE");
    window.location.href = "aluno-agendamentos.html";
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao agendar aula.");
  }
};


// init
carregarMaterias();
carregarAulas();
