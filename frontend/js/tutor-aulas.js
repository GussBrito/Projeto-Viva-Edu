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

// ✅ NOVO: filtro de status (você vai criar no HTML)
const statusFilterAulas = document.getElementById("statusFilterAulas");

const inputId = document.getElementById("aulaId");
const inputDisciplina = document.getElementById("disciplina"); // ✅ agora é SELECT de materias
const inputAssunto = document.getElementById("assunto");
const inputData = document.getElementById("data");
const inputHora = document.getElementById("hora");

const inputLocalJson = document.getElementById("localJson");
const inputLocalNome = document.getElementById("localNome");

const btnSelecionarLocal = document.getElementById("btnSelecionarLocal");
const btnCancelar = document.getElementById("cancelarEdicao");

// MODAL RELATÓRIO (agora integra no backend)
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
  const [ano, mes, dia] = (dataISO || "").split("-");
  if (!ano) return "-";
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

// ✅ label amigável pro status no card
function statusLabelAula(status) {
  const s = String(status || "").toUpperCase().trim();
  if (s === "DISPONIVEL") return "Disponível";
  if (s === "FINALIZADA") return "Finalizada";
  if (s === "CANCELADA") return "Cancelada";
  return s || "Disponível";
}

// ✅ usa o badge do admin: .badge.active e .badge.inactive
function statusBadgeClassAula(statusRaw) {
  const s = String(statusRaw || "").toUpperCase().trim();
  if (s === "DISPONIVEL") return "badge active";
  return "badge inactive";
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

/**
 * ✅ RELATÓRIO (UPLOAD MULTIPART NO BACKEND)
 * POST /aulas/:id/relatorio
 * FormData: observacoes + arquivo
 */
async function uploadRelatorioAula(aulaId, observacoes, file) {
  const fd = new FormData();
  fd.append("observacoes", observacoes || "");
  fd.append("arquivo", file); // <- se seu multer não for "arquivo", troque aqui

  const res = await fetch(`http://localhost:3000/aulas/${encodeURIComponent(aulaId)}/relatorio`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: fd
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || "Erro ao enviar relatório.");
  return data;
}

// ===== RENDER =====
function renderizar() {
  lista.innerHTML = "";

  // ✅ aplica filtro por status
  const filtroStatus = (statusFilterAulas?.value || "").toUpperCase().trim();
  const aulasFiltradas = !filtroStatus
    ? aulas
    : aulas.filter(a => String(a.status || "DISPONIVEL").toUpperCase().trim() === filtroStatus);

  if (aulasFiltradas.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">Nenhuma aula encontrada para esse filtro.</p>`;
    lista.appendChild(empty);
    return;
  }

  aulasFiltradas.forEach(a => {
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

    const statusRaw = String(a.status || "DISPONIVEL").toUpperCase().trim();
    const statusTxt = statusLabelAula(statusRaw);
    const badgeClass = statusBadgeClassAula(statusRaw);

    // ✅ desabilita relatório se já finalizou (ou não está disponível)
    const podeRelatorio = statusRaw === "DISPONIVEL";
    const relatorioDisabledAttr = podeRelatorio ? "" : "disabled";
    const relatorioTexto = statusRaw === "FINALIZADA" ? "Relatório enviado" : "Finalizar / Relatório";

    // ✅ esconde só o botão "Editar" quando FINALIZADA (mantém Excluir)
    const mostrarEditar = statusRaw !== "FINALIZADA";

    div.innerHTML = `
      <div>
          <strong>
            ${escapeHtml(a.materiaNome || a.materiaId || "Matéria")} - ${escapeHtml(a.titulo || "")}
          </strong>
          <br>
          <span class="${badgeClass}">${escapeHtml(statusTxt)}</span>
        </div>

        <div style="margin-top:6px;">
          Data: ${dataFmt} às ${escapeHtml(horaFmt)}<br>
          Local: ${escapeHtml(localNome)}<br>
        </div>

      ${alunosHtml}

      <div style="margin-top:12px;">
        ${mostrarEditar ? `<button class="btn btn-outline" type="button" onclick="editarAula('${a._id}')">Editar</button>` : ""}
        <button class="btn btn-outline" type="button" onclick="excluirAula('${a._id}')">Excluir</button>
        <button class="btn btn-primary" type="button" onclick="abrirRelatorio('${a._id}')" ${relatorioDisabledAttr}>
          ${escapeHtml(relatorioTexto)}
        </button>
      </div>
    `;

    lista.appendChild(div);
  });
}

// ===== CRUD AULA =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const materiaId = (inputDisciplina.value || "").trim();
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

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

window.abrirRelatorio = function (aulaId) {
  const aula = aulas.find(a => a._id === aulaId);
  if (!aula) return;

  const statusRaw = String(aula.status || "DISPONIVEL").toUpperCase().trim();
  if (statusRaw !== "DISPONIVEL") {
    return alert("Essa aula já foi finalizada (ou não está disponível para relatório).");
  }

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

// ✅ SUBMIT REAL (BACKEND)
relatorioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!aulaSelecionadaParaRelatorio) return alert("Nenhuma aula selecionada.");

  const file = fileInput.files[0];
  if (!file) return alert("Selecione um arquivo do relatório.");

  try {
    await uploadRelatorioAula(
      aulaSelecionadaParaRelatorio._id,
      obs.value.trim(),
      file
    );

    alert("Relatório enviado com sucesso!");
    closeModal();

    await carregarMinhasAulas();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao enviar relatório.");
  }
});

// ✅ ao trocar filtro, só re-renderiza
if (statusFilterAulas) {
  statusFilterAulas.addEventListener("change", renderizar);
}

// init
carregarLocalSelecionadoSeExistir();
carregarMaterias();
carregarMinhasAulas();
