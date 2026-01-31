const token = localStorage.getItem("token");
if (!token) window.location.replace("login.html");

const myRole = localStorage.getItem("role") || "";
const myId = localStorage.getItem("userId") || "";
const myName = localStorage.getItem("nome") || "Você";

const params = new URLSearchParams(window.location.search);
const thread = params.get("thread") || "default";
const otherId = params.get("otherId") || "";
const otherName = decodeURIComponent(params.get("tutor") || params.get("aluno") || params.get("otherName") || "Usuário");

const messagesEl = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("msgInput");

if (!messagesEl || !form || !input) {
  alert("Erro: elementos do chat não encontrados (messages/chatForm/msgInput).");
  throw new Error("Chat DOM missing");
}

const peerNameEl = document.getElementById("peerName");
const peerAvatarEl = document.getElementById("peerAvatar");
const peerSubEl = document.getElementById("peerSub");
const threadEl = document.getElementById("threadId");
const btnVoltar = document.getElementById("btnVoltar");

function loadUsers(){
  try { return JSON.parse(localStorage.getItem("users") || "[]"); }
  catch { return []; }
}
function getUserById(id){
  const users = loadUsers();
  return users.find(u => String(u.id) === String(id));
}
function avatarOf(user, size=44){
  return user?.fotoDataUrl || `https://via.placeholder.com/${size}?text=Foto`;
}

if (threadEl) threadEl.textContent = thread;

if (peerNameEl) {
  peerNameEl.textContent = otherName;
  peerNameEl.style.cursor = otherId ? "pointer" : "default";
  peerNameEl.onclick = () => {
    if (otherId) window.location.href = `perfil-publico.html?id=${encodeURIComponent(otherId)}`;
  };
}

if (peerSubEl) {
  const assunto = params.get("assunto");
  peerSubEl.textContent = assunto ? `Aula: ${decodeURIComponent(assunto)}` : "Conversa";
}

if (peerAvatarEl) {
  const u = otherId ? getUserById(otherId) : null;
  peerAvatarEl.src = avatarOf(u, 44);
  peerAvatarEl.style.cursor = otherId ? "pointer" : "default";
  peerAvatarEl.onclick = () => {
    if (otherId) window.location.href = `perfil-publico.html?id=${encodeURIComponent(otherId)}`;
  };
}

if (btnVoltar) {
  btnVoltar.addEventListener("click", () => {
    if (myRole === "ALUNO") window.location.replace("aluno-agendamentos.html");
    else if (myRole === "TUTOR") window.location.replace("tutor-chats.html");
    else if (myRole === "COORDENADOR") window.location.replace("coordenador-home.html");
    else window.location.replace("login.html");
  });
}

const chatKey = `chat_thread_${thread}`;

function loadMessages() {
  try {
    const raw = localStorage.getItem(chatKey);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao ler mensagens:", e);
    return [];
  }
}

function saveMessages(msgs) {
  try {
    localStorage.setItem(chatKey, JSON.stringify(msgs));
    return true;
  } catch (e) {
    console.error("Erro ao salvar mensagens (localStorage):", e);
    alert("Não foi possível salvar mensagens. Abra o site via Live Server (http://), não via file://");
    return false;
  }
}

function formatTime(ts){
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function escapeHtml(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function render(){
  const msgs = loadMessages();
  messagesEl.innerHTML = "";

  if (msgs.length === 0) {
    const div = document.createElement("div");
    div.className = "list-card";
    div.innerHTML = `<p style="margin:0;color:var(--muted);">Nenhuma mensagem ainda. Diga oi 👋</p>`;
    messagesEl.appendChild(div);
    return;
  }

  msgs.forEach(m => {
    const row = document.createElement("div");
    row.className = "msg-row";

    const avatar = document.createElement("img");
    avatar.className = "msg-avatar";

    const senderUser = m.senderId ? getUserById(m.senderId) : null;
    avatar.src = avatarOf(senderUser, 34);

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = `
      <div class="bubble-top">
        <div class="bubble-name">${escapeHtml(m.senderName || "Usuário")}</div>
        <div class="bubble-time">${formatTime(m.ts)}</div>
      </div>
      <div class="bubble-text">${escapeHtml(m.text)}</div>
    `;

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesEl.appendChild(row);
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const msgs = loadMessages();
  msgs.push({
    id: Date.now(),
    senderId: myId || null,
    senderName: myName,
    text,
    ts: Date.now()
  });

  const ok = saveMessages(msgs);
  if (!ok) return;

  input.value = "";
  render();
});

render();
