// ===== PROTEÇÃO (TOKEN + ROLE) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.href = "login.html";
if (role !== "TUTOR") window.location.href = "aluno-home.html";
// ==================================

const form = document.getElementById("localForm");
const btnGeo = document.getElementById("btnGeo");

const inputNome = document.getElementById("nome");
const inputLat = document.getElementById("lat");
const inputLng = document.getElementById("lng");

btnGeo.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      inputLat.value = pos.coords.latitude;
      inputLng.value = pos.coords.longitude;
      alert("Localização capturada!");
    },
    () => alert("Não foi possível obter localização. Permita o acesso e tente novamente.")
  );
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = inputNome.value.trim();
  const latitude = Number(inputLat.value);
  const longitude = Number(inputLng.value);

  if (!nome || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    alert("Preencha nome, latitude e longitude corretamente.");
    return;
  }

  // Local selecionado (no futuro, isso virá do POST /locais retornando id + geom)
  const localSelecionado = { nome, latitude, longitude };

  localStorage.setItem("selected_local", JSON.stringify(localSelecionado));

  // volta pra página que pediu o local
  const voltarPara = localStorage.getItem("pick_local_return_to") || "tutor-aulas.html";
  window.location.href = voltarPara;
});
