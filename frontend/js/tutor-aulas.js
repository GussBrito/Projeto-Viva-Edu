// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "login.html";
if (role !== "TUTOR") window.location.href = "aluno-home.html";
// ==================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

// ELEMENTOS
const form = document.getElementById("aulaForm");
const lista = document.getElementById("listaAulas");

const inputId = document.getElementById("aulaId");
const inputDisciplina = document.getElementById("disciplina");
const inputAssunto = document.getElementById("assunto");
const inputData = document.getElementById("data");
const inputHora = document.getElementById("hora");

const inputLocalJson = document.getElementById("localJson");
const inputLocalNome = document.getElementById("localNome");

const btnSelecionarLocal = document.getElementById("btnSelecionarLocal");
const btnCancelar = document.getElementById("cancelarEdicao");

// MOCK de aulas
let aulas = [
  {
    id: 1,
    disciplina: "Português",
    assunto: "Regência",
    data: "2026-02-05",
    hora: "19:00",
    local: { nome: "IFPB - Cajazeiras (Bloco A)", latitude: -6.8892, longitude: -38.5577 }
  }
];

// Abre a página do "Leaflet CRUD" (placeholder por enquanto)
btnSelecionarLocal.addEventListener("click", () => {
  // guarda contexto: estamos escolhendo local para aula
  localStorage.setItem("pick_local_return_to", "tutor-aulas.html");
  window.location.href = "tutor-local-picker.html";
});

// Se voltou do picker e existe local selecionado, carrega
function carregarLocalSelecionadoSeExistir() {
  const raw = localStorage.getItem("selected_local");
  if (!raw) return;

  try {
    const loc = JSON.parse(raw);
    inputLocalJson.value = raw;
    inputLocalNome.value = loc.nome || `(${loc.latitude}, ${loc.longitude})`;
  } catch {
    // se der ruim, limpa
    localStorage.removeItem("selected_local");
  }
}

function renderizar() {
  lista.innerHTML = "";

  if (aulas.length === 0) {
    lista.innerHTML = "<p>Nenhuma aula cadastrada.</p>";
    return;
  }

  aulas.forEach(a => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${a.disciplina}</strong> - ${a.assunto}<br>
      Data: ${formatarData(a.data)} às ${a.hora}<br>
      Local: ${a.local?.nome || "Não informado"}<br><br>
      <button onclick="editarAula(${a.id})">Editar</button>
      <button onclick="excluirAula(${a.id})">Excluir</button>
    `;

    lista.appendChild(div);
  });
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

// SALVAR (CRIAR / EDITAR)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const disciplina = inputDisciplina.value.trim();
  const assunto = inputAssunto.value.trim();
  const data = inputData.value;
  const hora = inputHora.value;

  if (!inputLocalJson.value) {
    alert("Selecione um local no mapa antes de salvar a aula.");
    return;
  }

  let local;
  try {
    local = JSON.parse(inputLocalJson.value);
  } catch {
    alert("Local inválido. Selecione novamente no mapa.");
    return;
  }

  if (inputId.value) {
    // EDITAR
    const aula = aulas.find(a => a.id == inputId.value);
    if (!aula) return;

    aula.disciplina = disciplina;
    aula.assunto = assunto;
    aula.data = data;
    aula.hora = hora;
    aula.local = local;
  } else {
    // CRIAR
    aulas.push({
      id: Date.now(),
      disciplina,
      assunto,
      data,
      hora,
      local
    });
  }

  // limpa o local "selecionado" (evita reaproveitar sem querer)
  localStorage.removeItem("selected_local");

  limparForm();
  renderizar();

  // FUTURO BACKEND:
  // Enviar locationId ou geom para /aulas
});

window.editarAula = function (id) {
  const aula = aulas.find(a => a.id === id);
  if (!aula) return;

  inputId.value = aula.id;
  inputDisciplina.value = aula.disciplina;
  inputAssunto.value = aula.assunto;
  inputData.value = aula.data;
  inputHora.value = aula.hora;

  // carrega local no campo
  inputLocalJson.value = JSON.stringify(aula.local);
  inputLocalNome.value = aula.local?.nome || "";
};

window.excluirAula = function (id) {
  if (!confirm("Deseja excluir esta aula?")) return;
  aulas = aulas.filter(a => a.id !== id);
  renderizar();
};

btnCancelar.addEventListener("click", () => {
  localStorage.removeItem("selected_local");
  limparForm();
});

function limparForm() {
  form.reset();
  inputId.value = "";
  inputLocalJson.value = "";
  inputLocalNome.value = "Nenhum local selecionado";
}

// Ao abrir/voltar pra página, tenta carregar o local escolhido
carregarLocalSelecionadoSeExistir();
renderizar();
