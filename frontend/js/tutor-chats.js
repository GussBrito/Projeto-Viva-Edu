// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");
// ===================================

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaChats");

/**
 * MOCK de threads do tutor (no futuro vem do backend):
 * Ex.: GET /tutor/chats -> [{threadId, alunoNome, aulaAssunto, updatedAt}]
 *
 * Aqui eu usei:
 * - threadId = id do agendamento (igual você usou no aluno)
 */
const threads = [
  { threadId: 101, aluno: "Gustavo Brito", aula: "Português - Regência" },
  { threadId: 102, aluno: "Ana Clara", aula: "Matemática - Função do 1º Grau" }
];

function loadThreadMessages(threadId) {
  const key = `chat_thread_${threadId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function ultimaMensagemPreview(msgs) {
  if (!msgs.length) return "Sem mensagens ainda.";
  const last = msgs[msgs.length - 1];
  const text = String(last.text || "");
  return text.length > 40 ? text.slice(0, 40) + "..." : text;
}

function render() {
  lista.innerHTML = "";

  if (threads.length === 0) {
    lista.innerHTML = "<p>Nenhuma conversa ainda.</p>";
    return;
  }

  threads.forEach(t => {
    const msgs = loadThreadMessages(t.threadId);
    const preview = ultimaMensagemPreview(msgs);
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
      Última: ${preview}<br><br>
      <button data-thread="${t.threadId}" data-aula="${encodeURIComponent(t.aula)}" data-aluno="${encodeURIComponent(t.aluno)}" class="btnAbrir">
        Abrir chat
      </button>
    `;

    lista.appendChild(div);
  });

  document.querySelectorAll(".btnAbrir").forEach(btn => {
    btn.addEventListener("click", () => {
      const thread = btn.dataset.thread;
      const aluno = btn.dataset.aluno;
      const aula = btn.dataset.aula;

      // Reaproveita a mesma página chat.html (ela já funciona pra ALUNO e TUTOR)
      window.location.href = `chat.html?thread=${encodeURIComponent(thread)}&tutor=${encodeURIComponent("Tutor")}&assunto=${aula}&aluno=${aluno}`;
    });
  });
}

render();
