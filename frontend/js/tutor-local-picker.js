// ===== PROTEÇÃO =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) window.location.replace("login.html");
if (role !== "TUTOR") window.location.replace("aluno-home.html");
// =====================

document.getElementById("logoutBtn")?.addEventListener("click", () => logout());

// ===== ELEMENTOS =====
const form = document.getElementById("localForm");
const btnGeo = document.getElementById("btnGeo");

const inputNome = document.getElementById("nome");
const inputLat = document.getElementById("lat");
const inputLng = document.getElementById("lng");

// Leaflet: precisa existir no HTML um <div id="map"></div>
const mapEl = document.getElementById("map");

// ===== MAPA (Leaflet) =====
let map = null;
let marker = null;

function setLatLng(lat, lng, options = { pan: true }) {
  inputLat.value = String(lat);
  inputLng.value = String(lng);

  if (!map) return;

  const ll = [lat, lng];

  if (!marker) {
    marker = L.marker(ll).addTo(map);
  } else {
    marker.setLatLng(ll);
  }

  if (options.pan) map.setView(ll, Math.max(map.getZoom(), 16));
}

function initMap() {
  if (!mapEl || typeof L === "undefined") return;

 // centro inicial do mapa
  const lat0 = -6.8896;   // Cajazeiras - PB
  const lng0 = -38.5616;

  map = L.map("map").setView([lat0, lng0], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // clique no mapa => pega lat/lng
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    setLatLng(lat, lng);
  });

  // se já tinha local salvo, pré-carrega
  const raw = localStorage.getItem("selected_local");
  if (raw) {
    try {
      const loc = JSON.parse(raw);
      if (typeof loc.latitude === "number" && typeof loc.longitude === "number") {
        if (inputNome && !inputNome.value) inputNome.value = loc.nome || "";
        setLatLng(loc.latitude, loc.longitude, { pan: false });
        map.setView([loc.latitude, loc.longitude], 16);
      }
    } catch { }
  }
}

initMap();

// ===== GEOLOCALIZAÇÃO (botão) =====
btnGeo?.addEventListener("click", () => {
  if (!navigator.geolocation) return alert("Geolocalização não suportada.");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLatLng(lat, lng);
      alert("Localização capturada! (Você pode clicar no mapa para ajustar.)");
    },
    () => alert("Não foi possível obter localização. Permita o acesso e tente novamente.")
  );
});

// ===== SALVAR (submit) =====
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = (inputNome?.value || "").trim();
  const latitude = Number(inputLat?.value);
  const longitude = Number(inputLng?.value);

  if (!nome || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    alert("Preencha nome, latitude e longitude corretamente (ou clique no mapa).");
    return;
  }

  // ✅ GeoJSON (Point) + campos antigos pra não quebrar nada
  const local = {
    nome,
    latitude,
    longitude,
    geo: {
      type: "Point",
      coordinates: [longitude, latitude] // GeoJSON é [lng, lat]
    }
  };

  localStorage.setItem("selected_local", JSON.stringify(local));

  const voltarPara = localStorage.getItem("pick_local_return_to") || "tutor-aulas.html";
  window.location.href = voltarPara;
});
