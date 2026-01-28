// ===== PROTEÇÃO =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
// =====================

// Pega parâmetros do chat
const params = new URLSearchParams(window.location.search);
const thread = params.get("thread"); // id do agendamento (por enquanto)
const tutor = params.get("tutor") || "Tutor";
const assunto = params.get("assunto") || "";

if (!thread) {
  alert("Chat inválido (thread não informada).");
  // volta para home do papel
  window.location.replace(role === "TUTOR" ? "tutor-home.html" : "aluno-home.html");
}

const chatKey = `chat_thread_${thread}`;
const messagesEl = document.getElementById("messages");
const chatInfoEl = document.getElementById("chatInfo");
const form = document.getElementById("chatForm");
const input = document.getElementById("msgInput");
const btnVoltar = document.getElementById("btnVoltar");

function loadMessages() {
  const raw = localStorage.getItem(chatKey);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveMessages(msgs) {
  localStorage.setItem(chatKey, JSON.stringify(msgs));
}

function formatTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function render() {
  const msgs = loadMessages();
  messagesEl.innerHTML = "";

  if (msgs.length === 0) {
    // mensagem inicial (opcional)
    const initial = [{
      id: Date.now(),
      sender: "SISTEMA",
      text: "Você pode conversar por aqui sobre a aula. (Modo teste: mensagens ficam neste navegador)",
      ts: Date.now()
    }];
    saveMessages(initial);
    return render();
  }

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.style.marginBottom = "8px";

    const who = m.sender;
    const when = formatTime(m.ts);

    // alinhamento simples: minhas mensagens à direita
    const isMine = (who === role);
    div.style.textAlign = isMine ? "right" : "left";

    div.innerHTML = `
      <div style="display:inline-block; max-width: 80%; padding:8px 10px; border-radius:10px; border:1px solid #ddd; background:#fff;">
        <div style="font-size:12px; color:#555; margin-bottom:4px;">
          ${who} • ${when}
        </div>
        <div>${escapeHtml(m.text)}</div>
      </div>
    `;
    messagesEl.appendChild(div);
  });

  // scroll para baixo
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

chatInfoEl.innerHTML = `
  <strong>Thread:</strong> ${thread}<br>
  <strong>Tutor:</strong> ${escapeHtml(tutor)}<br>
  ${assunto ? `<strong>Aula:</strong> ${escapeHtml(assunto)}<br>` : ""}
`;

// enviar mensagem
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const msgs = loadMessages();
  msgs.push({
    id: Date.now(),
    sender: role,      // "ALUNO" ou "TUTOR"
    text,
    ts: Date.now()
  });
  saveMessages(msgs);

  input.value = "";
  render();
});

// voltar (vai para home do papel)
btnVoltar.addEventListener("click", () => {
  if (role === "TUTOR") window.location.replace("tutor-home.html");
  else window.location.replace("aluno-home.html");
});

render();
