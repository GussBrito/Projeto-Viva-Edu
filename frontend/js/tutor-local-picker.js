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

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function setLatLng(lat, lng, options = { pan: true, zoom: 16 }) {
  if (!inputLat || !inputLng) return;

  inputLat.value = String(lat);
  inputLng.value = String(lng);

  if (!map) return;

  const ll = [lat, lng];

  if (!marker) {
    marker = L.marker(ll).addTo(map);
  } else {
    marker.setLatLng(ll);
  }

  if (options.pan) map.setView(ll, options.zoom || 16);
}

function initMap() {
  if (!mapEl || typeof L === "undefined") return;

  // fallback Cajazeiras - PB
  const lat0 = -6.8896;
  const lng0 = -38.5616;

  // zoom inicial melhor
  map = L.map("map").setView([lat0, lng0], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // clique no mapa => pega lat/lng
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    setLatLng(lat, lng, { pan: true, zoom: 16 });
  });

  // se já tinha local salvo, pré-carrega (aceita string/number)
  const raw = localStorage.getItem("selected_local");
  if (raw) {
    try {
      const loc = JSON.parse(raw);

      const lat = toNumber(loc?.latitude);
      const lng = toNumber(loc?.longitude);

      if (lat !== null && lng !== null) {
        if (inputNome && !inputNome.value) inputNome.value = loc?.nome || "";
        setLatLng(lat, lng, { pan: true, zoom: 16 });
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
      setLatLng(lat, lng, { pan: true, zoom: 16 });
      alert("Localização capturada! (Você pode clicar no mapa para ajustar.)");
    },
    () => alert("Não foi possível obter localização. Permita o acesso e tente novamente.")
  );
});

// ===== SALVAR (submit) =====
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = (inputNome?.value || "").trim();
  const latitude = toNumber(inputLat?.value);
  const longitude = toNumber(inputLng?.value);

  if (!nome || latitude === null || longitude === null) {
    alert("Preencha o nome e selecione um ponto no mapa (ou use sua localização).");
    return;
  }

  // GeoJSON (Point) + campos antigos (pra não quebrar nada no sistema)
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
