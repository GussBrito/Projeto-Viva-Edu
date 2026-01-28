// (Opcional) proteção: deixe só tutor mexer, ou permita qualquer logado
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const form = document.getElementById("localForm");
const btnGeo = document.getElementById("btnGeo");

const inputNome = document.getElementById("nomeLocal");
const inputLat = document.getElementById("latitude");
const inputLng = document.getElementById("longitude");

const lista = document.getElementById("listaLocais");

// MOCK
let locais = [];

btnGeo.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada no seu navegador.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      inputLat.value = pos.coords.latitude;
      inputLng.value = pos.coords.longitude;
      alert("Localização capturada!");
    },
    (err) => {
      alert("Não foi possível obter a localização. Permita o acesso e tente de novo.");
    }
  );
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = inputNome.value.trim();
  const latitude = Number(inputLat.value);
  const longitude = Number(inputLng.value);

  if (!nome || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    alert("Preencha nome, latitude e longitude corretamente.");
    return;
  }

  // MOCK salva
  locais.push({
    id: Date.now(),
    nome,
    latitude,
    longitude
  });

  form.reset();
  renderizar();

  alert("Local salvo!");

  // QUANDO TIVER BACKEND:
  /*
  await apiFetch("/locais", {
    method: "POST",
    body: JSON.stringify({ nome, latitude, longitude })
  });
  */
});

function renderizar() {
  lista.innerHTML = "";

  if (locais.length === 0) {
    lista.innerHTML = "<p>Nenhum local cadastrado.</p>";
    return;
  }

  locais.forEach(l => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${l.nome}</strong><br>
      Lat: ${l.latitude}<br>
      Lng: ${l.longitude}<br><br>
      <button onclick="removerLocal(${l.id})">Excluir</button>
    `;

    lista.appendChild(div);
  });
}

function removerLocal(id) {
  const ok = confirm("Excluir este local?");
  if (!ok) return;

  locais = locais.filter(l => l.id !== id);
  renderizar();
}

renderizar();
