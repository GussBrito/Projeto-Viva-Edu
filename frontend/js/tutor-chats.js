// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaChats");

/**
 * MOCK de threads do tutor.
 * Depois o back substitui por:
 *   GET /tutor/chats -> [{ threadId, alunoNome, aulaAssunto, updatedAt }]
 *
 * Por enquanto:
 * threadId = id do agendamento (igual o aluno usa pra abrir chat)
 */
const threads = [
  { threadId: 101, aluno: "Aluno 1", aula: "Português - Regência" },
  { threadId: 102, aluno: "Aluno 2", aula: "Matemática - Função do 1º Grau" }
];

function loadThreadMessages(threadId) {
  const key = `chat_thread_${threadId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function previewUltima(msgs) {
  if (!msgs.length) return "Sem mensagens ainda.";
  const last = msgs[msgs.length - 1];
  const text = String(last.text || "");
  return text.length > 45 ? text.slice(0, 45) + "..." : text;
}

function render() {
  lista.innerHTML = "";

  if (threads.length === 0) {
    lista.innerHTML = "<p>Nenhuma conversa ainda.</p>";
    return;
  }

  threads.forEach(t => {
    const msgs = loadThreadMessages(t.threadId);
    const total = msgs.length;

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${t.aluno}</strong><br>
      Aula: ${t.aula}<br>
      Thread: ${t.threadId}<br>
      Mensagens: ${total}<br>
      Última: ${previewUltima(msgs)}<br><br>

      <button class="btnAbrir"
        data-thread="${t.threadId}"
        data-aluno="${encodeURIComponent(t.aluno)}"
        data-assunto="${encodeURIComponent(t.aula)}">
        Abrir chat
      </button>
    `;

    lista.appendChild(div);
  });

  document.querySelectorAll(".btnAbrir").forEach(btn => {
    btn.addEventListener("click", () => {
      const thread = btn.dataset.thread;
      const aluno = btn.dataset.aluno;
      const assunto = btn.dataset.assunto;

      window.location.href =
        `chat.html?thread=${encodeURIComponent(thread)}&aluno=${aluno}&assunto=${assunto}`;
    });
  });
}

render();
