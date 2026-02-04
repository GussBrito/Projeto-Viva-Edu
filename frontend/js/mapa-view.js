function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseLocalFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("local");
  if (!raw) return null;

  try {
    // vem URL-encoded, então precisa decode
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

(function init() {
  const loc = parseLocalFromQuery();

  // fallback Cajazeiras-PB
  const lat0 = -6.8896;
  const lng0 = -38.5616;

  const map = L.map("map").setView([lat0, lng0], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  const info = document.getElementById("info");

  if (!loc) {
    if (info) info.innerHTML = "Local não encontrado. (Usando Cajazeiras-PB como fallback)";
    return;
  }

  // aceita tanto {latitude, longitude} quanto geojson {geo:{coordinates:[lng,lat]}}
  let lat = Number(loc.latitude);
  let lng = Number(loc.longitude);

  if ((Number.isNaN(lat) || Number.isNaN(lng)) && loc.geo?.type === "Point" && Array.isArray(loc.geo.coordinates)) {
    lng = Number(loc.geo.coordinates[0]);
    lat = Number(loc.geo.coordinates[1]);
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    if (info) info.innerHTML = "Coordenadas inválidas. (Usando Cajazeiras-PB como fallback)";
    return;
  }

  map.setView([lat, lng], 16);
  L.marker([lat, lng]).addTo(map);

  if (info) {
    info.innerHTML = `<strong>${escapeHtml(loc.nome || "Local")}</strong> • ${escapeHtml(lat)}, ${escapeHtml(lng)}`;
  }
})();
