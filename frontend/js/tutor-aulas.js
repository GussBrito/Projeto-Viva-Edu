// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

// ELEMENTOS AULA
const form = document.getElementById("aulaForm");
const lista = document.getElementById("listaAulas");

const inputId = document.getElementById("aulaId");
const inputDisciplina = document.getElementById("disciplina"); // ✅ agora é SELECT de materias
const inputAssunto = document.getElementById("assunto");
const inputData = document.getElementById("data");
const inputHora = document.getElementById("hora");

const inputLocalJson = document.getElementById("localJson");
const inputLocalNome = document.getElementById("localNome");

const btnSelecionarLocal = document.getElementById("btnSelecionarLocal");
const btnCancelar = document.getElementById("cancelarEdicao");

// MODAL RELATÓRIO (mantém mock por enquanto)
const modal = document.getElementById("modalRelatorio");
const modalInfo = document.getElementById("modalInfoAula");
const modalTitle = document.getElementById("modalTitle");
const btnFecharModal = document.getElementById("btnFecharModal");
const btnCancelarRelatorio = document.getElementById("btnCancelarRelatorio");
const relatorioForm = document.getElementById("relatorioForm");
const obs = document.getElementById("observacoes");
const fileInput = document.getElementById("arquivoRelatorio");

let aulaSelecionadaParaRelatorio = null;

// ===== Estado vindo do backend =====
let aulas = [];
let materias = []; // ✅ lista de matérias do backend

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

// junta data + hora em ISO
function buildISO(data, hora) {
  return new Date(`${data}T${hora}:00`).toISOString();
}

function splitISO(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { data: "", hora: "" };

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return { data: `${yyyy}-${mm}-${dd}`, hora: `${hh}:${mi}` };
}

function parseLocalFromLocalId(localId) {
  if (!localId) return null;
  try {
    return JSON.parse(localId);
  } catch {
    return null;
  }
}

// ✅ pegar nome da matéria pelo id
function materiaNome(materiaId) {
  const m = materias.find(x => x._id === materiaId);
  return m?.nome || materiaId || "Matéria";
}

// ===== MATÉRIAS (para o SELECT) =====
async function carregarMaterias() {
  try {
    const data = await api("/materias");
    materias = Array.isArray(data) ? data : [];
    preencherSelectMaterias();
  } catch (err) {
    console.error(err);
    inputDisciplina.innerHTML = `<option value="">Erro ao carregar disciplinas</option>`;
    alert(err.message || "Erro ao carregar disciplinas.");
  }
}

function preencherSelectMaterias() {
  const ativas = materias.filter(m => m.ativo !== false);

  inputDisciplina.innerHTML = `
    <option value="">Selecione a disciplina...</option>
    ${ativas.map(m => `<option value="${m._id}">${escapeHtml(m.nome)}</option>`).join("")}
  `;

  if (ativas.length === 0) {
    inputDisciplina.innerHTML = `<option value="">Nenhuma disciplina disponível</option>`;
  }
}

// ===== BACKEND =====
async function carregarMinhasAulas() {
  try {
    const data = await api("/aulas/mine");
    aulas = Array.isArray(data) ? data : [];
    renderizar();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao carregar aulas do tutor.");
  }
}

async function criarAula(payload) {
  return api("/aulas", { method: "POST", body: payload });
}

async function atualizarAula(id, patch) {
  return api(`/aulas/${id}`, { method: "PUT", body: patch });
}

async function removerAula(id) {
  return api(`/aulas/${id}`, { method: "DELETE" });
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
                  onclick="verPerfil('${encodeURIComponent(al.id)}')"
                  style="margin-left:10px;">
                  Ver perfil
                </button>
              </li>
            `).join("")}
          </ul>
        </div>
      `
      : `<div style="margin-top:10px;color:var(--muted);">Nenhum aluno matriculado ainda.</div>`;

    const localObj = parseLocalFromLocalId(a.localId);
    const localNome = localObj?.nome || "Não informado";

    const { data, hora } = splitISO(a.dataHora || "");
    const dataFmt = data ? formatarData(data) : "-";
    const horaFmt = hora || "-";

    div.innerHTML = `
      <strong>${escapeHtml(a.materiaNome || a.materiaId || "Matéria")} </strong> - ${escapeHtml(a.titulo || "")}<br>
      Data: ${dataFmt} às ${escapeHtml(horaFmt)}<br>
      Local: ${escapeHtml(localNome)}<br>

      ${alunosHtml}

      <div style="margin-top:12px;">
        <button class="btn btn-outline" type="button" onclick="editarAula('${a._id}')">Editar</button>
        <button class="btn btn-outline" type="button" onclick="excluirAula('${a._id}')">Excluir</button>
        <button class="btn btn-primary" type="button" onclick="abrirRelatorio('${a._id}')">Finalizar / Relatório</button>
      </div>
    `;

    lista.appendChild(div);
  });
}

// ===== CRUD AULA =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const materiaId = (inputDisciplina.value || "").trim(); // vem do select
  const titulo = inputAssunto.value.trim();
  const descricao = inputAssunto.value.trim();
  const data = inputData.value;
  const hora = inputHora.value;

  if (!materiaId || !titulo || !data || !hora) {
    alert("Selecione a disciplina e preencha assunto, data e hora.");
    return;
  }

  if (!inputLocalJson.value) {
    alert("Selecione um local no mapa antes de salvar a aula.");
    return;
  }

  let local;
  try { local = JSON.parse(inputLocalJson.value); }
  catch { return alert("Local inválido. Selecione novamente no mapa."); }

  const dataHora = buildISO(data, hora);
  const localId = JSON.stringify(local);

  try {
    if (inputId.value) {
      await atualizarAula(inputId.value, { materiaId, titulo, descricao, dataHora, localId });
      alert("Aula atualizada!");
    } else {
      await criarAula({ materiaId, titulo, descricao, dataHora, localId });
      alert("Aula criada!");
    }

    localStorage.removeItem("selected_local");
    limparForm();
    await carregarMinhasAulas();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao salvar aula.");
  }
});

window.editarAula = function (id) {
  const aula = aulas.find(a => a._id === id);
  if (!aula) return;

  inputId.value = aula._id;

  inputDisciplina.value = aula.materiaId || "";
  inputAssunto.value = aula.titulo || "";

  const { data, hora } = splitISO(aula.dataHora || "");
  inputData.value = data;
  inputHora.value = hora;

  if (aula.localId) {
    inputLocalJson.value = aula.localId;
    const loc = parseLocalFromLocalId(aula.localId);
    inputLocalNome.value = loc?.nome || "";
  } else {
    inputLocalJson.value = "";
    inputLocalNome.value = "Nenhum local selecionado";
  }
};

window.excluirAula = async function (id) {
  if (!confirm("Deseja excluir esta aula?")) return;

  try {
    await removerAula(id);
    await carregarMinhasAulas();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao excluir aula.");
  }
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
window.verPerfil = function (userId) {
  window.location.href = `perfil-publico.html?id=${encodeURIComponent(userId)}`;
};

// ===== MODAL RELATÓRIO (continua mock por enquanto) =====
function openModal() { modal.classList.add("open"); }
function closeModal() {
  modal.classList.remove("open");
  aulaSelecionadaParaRelatorio = null;
  obs.value = "";
  fileInput.value = "";
}

btnFecharModal.addEventListener("click", closeModal);
btnCancelarRelatorio.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

window.abrirRelatorio = function (aulaId) {
  const aula = aulas.find(a => a._id === aulaId);
  if (!aula) return;

  aulaSelecionadaParaRelatorio = aula;
  modalTitle.textContent = `Relatório da Aula: ${escapeHtml(aula.titulo || "")}`;

  const { data, hora } = splitISO(aula.dataHora || "");
  const dataFmt = data ? formatarData(data) : "-";
  const localObj = parseLocalFromLocalId(aula.localId);

  modalInfo.innerHTML = `
    <strong>${escapeHtml(aula.materiaNome || aula.materiaId || "")}</strong> - ${escapeHtml(aula.titulo || "")}<br>
    Data: ${dataFmt} às ${escapeHtml(hora || "-")}<br>
    Local: ${escapeHtml(localObj?.nome || "Não informado")}<br>
    <span style="color:var(--muted)">
      Ao enviar o relatório, ele ficará disponível para o coordenador.
    </span>
  `;

  openModal();
};

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadReports() {
  try { return JSON.parse(localStorage.getItem("reports") || "[]"); }
  catch { return []; }
}
function saveReports(arr) {
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
    aulaId: String(aulaSelecionadaParaRelatorio._id),
    tutorId: localStorage.getItem("userId") || "",
    tutorNome: localStorage.getItem("nome") || "Tutor",
    disciplina: materiaNome(aulaSelecionadaParaRelatorio.materiaId),
    assunto: aulaSelecionadaParaRelatorio.titulo,
    createdAt: new Date().toISOString(),
    observacoes: obs.value.trim(),
    fileName: file.name,
    fileDataUrl: dataUrl
  });
  saveReports(reports);

  alert("Relatório enviado! O coordenador poderá visualizar.");
  closeModal();
});

// init
carregarLocalSelecionadoSeExistir();
carregarMaterias();       // ✅ importante
carregarMinhasAulas();
