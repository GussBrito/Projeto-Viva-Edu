// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

// ELEMENTOS AULA
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

// MODAL RELATÓRIO
const modal = document.getElementById("modalRelatorio");
const modalInfo = document.getElementById("modalInfoAula");
const modalTitle = document.getElementById("modalTitle");
const btnFecharModal = document.getElementById("btnFecharModal");
const btnCancelarRelatorio = document.getElementById("btnCancelarRelatorio");
const relatorioForm = document.getElementById("relatorioForm");
const obs = document.getElementById("observacoes");
const fileInput = document.getElementById("arquivoRelatorio");

let aulaSelecionadaParaRelatorio = null;

/**
 * MOCK DE AULAS
 * No mundo real isso vem do backend.
 * Aqui cada aula já tem "alunosMatriculados" (mock) com id e nome,
 * para o tutor conseguir abrir perfil público dos alunos.
 */
let aulas = [
  {
    id: 1,
    disciplina: "Português",
    assunto: "Regência",
    data: "2026-02-05",
    hora: "19:00",
    local: { nome: "IFPB - Cajazeiras (Bloco A)", latitude: -6.8892, longitude: -38.5577 },
    alunosMatriculados: [
      { id: 2001, nome: "Aluno 1" },
      { id: 2002, nome: "Aluno 2" }
    ]
  },
  {
    id: 2,
    disciplina: "Matemática",
    assunto: "Função do 1º Grau",
    data: "2026-02-06",
    hora: "18:30",
    local: { nome: "Biblioteca Municipal", latitude: -6.8901, longitude: -38.5589 },
    alunosMatriculados: [
      { id: 2003, nome: "Aluno 3" }
    ]
  }
];

// ===== LOCAL (selecionar no mapa placeholder) =====
btnSelecionarLocal.addEventListener("click", () => {
  localStorage.setItem("pick_local_return_to", "tutor-aulas.html");
  window.location.href = "tutor-local-picker.html";
});

function carregarLocalSelecionadoSeExistir() {
  const raw = localStorage.getItem("selected_local");
  if (!raw) return;
  try {
    const loc = JSON.parse(raw);
    inputLocalJson.value = raw;
    inputLocalNome.value = loc.nome || `(${loc.latitude}, ${loc.longitude})`;
  } catch {
    localStorage.removeItem("selected_local");
  }
}

// ===== UTIL =====
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===== RENDER =====
function renderizar() {
  lista.innerHTML = "";

  if (aulas.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">Nenhuma aula cadastrada.</p>`;
    lista.appendChild(empty);
    return;
  }

  aulas.forEach(a => {
    const div = document.createElement("div");
    div.className = "list-card";

    // alunos matriculados
    const alunos = Array.isArray(a.alunosMatriculados) ? a.alunosMatriculados : [];
    const alunosHtml = alunos.length
      ? `
        <div style="margin-top:10px;">
          <strong>Alunos matriculados:</strong>
          <ul style="margin:8px 0 0; padding-left:18px;">
            ${alunos.map(al => `
              <li style="margin:6px 0;">
                ${escapeHtml(al.nome)}
                <button class="btn btn-outline" type="button"
                  onclick="verPerfil(${al.id})"
                  style="margin-left:10px;">
                  Ver perfil
                </button>
              </li>
            `).join("")}
          </ul>
        </div>
      `
      : `<div style="margin-top:10px;color:var(--muted);">Nenhum aluno matriculado ainda.</div>`;

    div.innerHTML = `
      <strong>${escapeHtml(a.disciplina)}</strong> - ${escapeHtml(a.assunto)}<br>
      Data: ${formatarData(a.data)} às ${escapeHtml(a.hora)}<br>
      Local: ${escapeHtml(a.local?.nome || "Não informado")}<br>

      ${alunosHtml}

      <div style="margin-top:12px;">
        <button class="btn btn-outline" type="button" onclick="editarAula(${a.id})">Editar</button>
        <button class="btn btn-outline" type="button" onclick="excluirAula(${a.id})">Excluir</button>
        <button class="btn btn-primary" type="button" onclick="abrirRelatorio(${a.id})">Finalizar / Relatório</button>
      </div>
    `;

    lista.appendChild(div);
  });
}

// ===== CRUD AULA =====
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
  try { local = JSON.parse(inputLocalJson.value); }
  catch { return alert("Local inválido. Selecione novamente no mapa."); }

  if (inputId.value) {
    const aula = aulas.find(a => a.id == inputId.value);
    if (!aula) return;

    aula.disciplina = disciplina;
    aula.assunto = assunto;
    aula.data = data;
    aula.hora = hora;
    aula.local = local;
  } else {
    aulas.push({
      id: Date.now(),
      disciplina,
      assunto,
      data,
      hora,
      local,
      alunosMatriculados: [] // começa vazio
    });
  }

  localStorage.removeItem("selected_local");
  limparForm();
  renderizar();
});

window.editarAula = function(id) {
  const aula = aulas.find(a => a.id === id);
  if (!aula) return;

  inputId.value = aula.id;
  inputDisciplina.value = aula.disciplina;
  inputAssunto.value = aula.assunto;
  inputData.value = aula.data;
  inputHora.value = aula.hora;

  inputLocalJson.value = JSON.stringify(aula.local);
  inputLocalNome.value = aula.local?.nome || "";
};

window.excluirAula = function(id) {
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

// ===== PERFIL PÚBLICO =====
window.verPerfil = function(userId){
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(userId)}`;
};

// ===== MODAL RELATÓRIO =====
function openModal() { modal.classList.add("open"); }
function closeModal() {
  modal.classList.remove("open");
  aulaSelecionadaParaRelatorio = null;
  obs.value = "";
  fileInput.value = "";
}

btnFecharModal.addEventListener("click", closeModal);
btnCancelarRelatorio.addEventListener("click", closeModal);

// fecha clicando fora
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

window.abrirRelatorio = function(aulaId){
  const aula = aulas.find(a => a.id === aulaId);
  if (!aula) return;

  aulaSelecionadaParaRelatorio = aula;
  modalTitle.textContent = `Relatório da Aula (#${aula.id})`;

  modalInfo.innerHTML = `
    <strong>${escapeHtml(aula.disciplina)}</strong> - ${escapeHtml(aula.assunto)}<br>
    Data: ${formatarData(aula.data)} às ${escapeHtml(aula.hora)}<br>
    Local: ${escapeHtml(aula.local?.nome || "Não informado")}<br>
    <span style="color:var(--muted)">
      Ao enviar o relatório, ele ficará disponível para o coordenador.
    </span>
  `;

  openModal();
};

function readAsDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadReports(){
  try { return JSON.parse(localStorage.getItem("reports") || "[]"); }
  catch { return []; }
}
function saveReports(arr){
  localStorage.setItem("reports", JSON.stringify(arr));
}

relatorioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!aulaSelecionadaParaRelatorio) return alert("Nenhuma aula selecionada.");

  const file = fileInput.files[0];
  if (!file) return alert("Selecione um arquivo do relatório.");

  const dataUrl = await readAsDataURL(file);

  const reports = loadReports();
  reports.push({
    id: Date.now(),
    aulaId: String(aulaSelecionadaParaRelatorio.id),
    tutorId: localStorage.getItem("userId") || "",
    tutorNome: localStorage.getItem("nome") || "Tutor",
    disciplina: aulaSelecionadaParaRelatorio.disciplina,
    assunto: aulaSelecionadaParaRelatorio.assunto,
    createdAt: new Date().toISOString(),
    observacoes: obs.value.trim(),
    fileName: file.name,
    fileDataUrl: dataUrl
  });
  saveReports(reports);

  alert("Relatório enviado! O coordenador poderá visualizar.");
  closeModal();

  // FUTURO BACKEND:
  // POST /relatorios (multipart) + atualizar status da aula como FINALIZADA
});

// init
carregarLocalSelecionadoSeExistir();
renderizar();
