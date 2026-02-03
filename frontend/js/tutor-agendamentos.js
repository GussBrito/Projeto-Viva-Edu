// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toUpperCase().trim();

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaAgendamentos");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const reloadBtn = document.getElementById("reloadBtn");

// ⚠️ AJUSTE AQUI se sua rota do tutor for diferente
// exemplos comuns:
// const AG_TUTOR_PATH = "/agendamentos/mine";
// const AG_TUTOR_PATH = "/agendamentos/me";
const AG_TUTOR_PATH = "/agendamentos/mine";

let agsRaw = [];    // retorno do backend (agendamentos)
let aulas = [];     // /aulas
let materias = [];  // /materias
let users = [];     // /users (admin-only) -> NÃO vamos usar
let view = [];      // view-model pronto

function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function statusLabel(status) {
    const s = String(status || "").toUpperCase().trim();
    if (s === "PENDENTE") return "PENDENTE";
    if (s === "CONFIRMADO") return "CONFIRMADO";
    if (s === "REJEITADO") return "REJEITADO";
    return s || "PENDENTE";
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

function formatarData(dataISO) {
    const [ano, mes, dia] = (dataISO || "").split("-");
    if (!ano) return "-";
    return `${dia}/${mes}/${ano}`;
}

function parseLocal(localId) {
    if (!localId) return null;
    try { return JSON.parse(localId); } catch { return null; }
}

function materiaNome(materiaId) {
    const m = materias.find(x => x._id === materiaId);
    return m?.nome || materiaId || "Matéria";
}

async function carregarTudo() {
    try {
        agsRaw = await api(AG_TUTOR_PATH);     // agendamentos do tutor
        aulas = await api("/aulas");           // aulas disponíveis (ou todas)
        materias = await api("/materias");     // nome da matéria

        montarViewModel();
        renderizar();
    } catch (err) {
        console.error(err);
        alert(err.message || "Erro ao carregar agendamentos do tutor.");
    }
}

function montarViewModel() {
    view = (Array.isArray(agsRaw) ? agsRaw : [])
        .map(ag => {
            const aula = (Array.isArray(aulas) ? aulas : []).find(a => a._id === ag.aulaId);

            // PROTEÇÃO: se a aula foi apagada, não mostra esse agendamento
            if (!aula) return null;

            const { data, hora } = splitISO(aula?.dataHora || "");
            const local = parseLocal(aula?.localId);

            return {
                id: ag._id,
                status: statusLabel(ag.status),
                aula: {
                    materia: materiaNome(aula?.materiaId),
                    titulo: aula?.titulo || "",
                    data,
                    hora,
                    localNome: local?.nome || "Não informado",
                },
                alunoId: ag.alunoId || ""
            };
        })
        .filter(Boolean); //remove nulls
}


function renderizar() {
    const search = (searchInput.value || "").toLowerCase().trim();
    const status = (statusFilter.value || "").toUpperCase().trim();

    const filtered = view.filter(item => {
        const matchesStatus = !status || item.status === status;

        const hay =
            `${item.aula.materia} ${item.aula.titulo} ${item.alunoId}`.toLowerCase();

        const matchesSearch = !search || hay.includes(search);

        return matchesStatus && matchesSearch;
    });

    lista.innerHTML = "";

    if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "list-card";
        empty.innerHTML = `<p style="color:var(--muted);margin:0;">Nenhum agendamento encontrado.</p>`;
        lista.appendChild(empty);
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement("div");
        div.className = "list-card";

        const podeAcao = item.status === "PENDENTE";

        div.innerHTML = `
      <strong>${escapeHtml(item.aula.materia)}</strong> - ${escapeHtml(item.aula.titulo)}<br>
      AlunoId: ${escapeHtml(item.alunoId)}<br>
      Data: ${item.aula.data ? formatarData(item.aula.data) : "-"} às ${escapeHtml(item.aula.hora || "-")}<br>
      Local: ${escapeHtml(item.aula.localNome)}<br>
      Status: <strong>${escapeHtml(item.status)}</strong><br><br>

      <button class="btn btn-primary" type="button" onclick="confirmar('${item.id}')" ${podeAcao ? "" : "disabled"}>
        Confirmar
      </button>
      <button class="btn btn-outline" type="button" onclick="rejeitar('${item.id}')" ${podeAcao ? "" : "disabled"}>
        Rejeitar
      </button>
    `;

        lista.appendChild(div);
    });
}

// ações
window.confirmar = async function (id) {
    if (!confirm("Confirmar este agendamento?")) return;

    try {
        await api(`/agendamentos/${id}/confirm`, { method: "PUT" });
        await carregarTudo();
    } catch (err) {
        console.error(err);
        alert(err.message || "Erro ao confirmar.");
    }
};

window.rejeitar = async function (id) {
    if (!confirm("Rejeitar este agendamento?")) return;

    try {
        await api(`/agendamentos/${id}/reject`, { method: "PUT" });
        await carregarTudo();
    } catch (err) {
        console.error(err);
        alert(err.message || "Erro ao rejeitar.");
    }
};

// filtros
searchInput.addEventListener("input", renderizar);
statusFilter.addEventListener("change", renderizar);
reloadBtn.addEventListener("click", carregarTudo);

// init
carregarTudo();
