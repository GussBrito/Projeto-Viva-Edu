const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");

document.getElementById("logoutBtn").addEventListener("click", () => logout());

const form = document.getElementById("localForm");
const btnGeo = document.getElementById("btnGeo");

const inputNome = document.getElementById("nome");
const inputLat = document.getElementById("lat");
const inputLng = document.getElementById("lng");

btnGeo.addEventListener("click", () => {
  if (!navigator.geolocation) return alert("Geolocalização não suportada.");

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

  localStorage.setItem("selected_local", JSON.stringify({ nome, latitude, longitude }));
  const voltarPara = localStorage.getItem("pick_local_return_to") || "tutor-aulas.html";
  window.location.href = voltarPara;
});
