const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const lista = document.getElementById("listaChats");

// Mock threads (depois vem do backend)
const threads = [
  {
    threadId: 101,
    alunoId: 201,
    alunoNome: "Maria Oliveira",
    aula: "Português - Regência"
  },
  {
    threadId: 102,
    alunoId: 202,
    alunoNome: "João Santos",
    aula: "Matemática - Função do 1º Grau"
  }
];

function loadThreadMessages(threadId) {
  const raw = localStorage.getItem(`chat_thread_${threadId}`);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function preview(msgs){
  if (!msgs.length) return "Sem mensagens ainda.";
  const last = msgs[msgs.length - 1];
  const text = String(last.text || "");
  return text.length > 55 ? text.slice(0,55) + "..." : text;
}

function render(){
  lista.innerHTML = "";

  if (threads.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-card";
    empty.innerHTML = `<p style="color:var(--muted);margin:0;">Nenhuma conversa ainda.</p>`;
    lista.appendChild(empty);
    return;
  }

  threads.forEach(t => {
    const msgs = loadThreadMessages(t.threadId);

    const div = document.createElement("div");
    div.className = "list-card";
    div.innerHTML = `
      <strong>${t.alunoNome}</strong><br>
      Aula: ${t.aula}<br>
      Mensagens: ${msgs.length}<br>
      Última: ${preview(msgs)}<br><br>

      <button class="btn btn-primary" type="button"
        onclick="abrirChat(${t.threadId}, ${t.alunoId}, '${encodeURIComponent(t.alunoNome)}', '${encodeURIComponent(t.aula)}')">
        Abrir chat
      </button>
    `;
    lista.appendChild(div);
  });
}

// ✅ agora passa otherId pro chat (isso destrava avatar + perfil clicável)
window.abrirChat = function(threadId, alunoId, alunoNomeEnc, aulaEnc){
  window.location.href =
    `chat.html?thread=${encodeURIComponent(threadId)}&otherId=${encodeURIComponent(alunoId)}&aluno=${alunoNomeEnc}&assunto=${aulaEnc}`;
};

render();
