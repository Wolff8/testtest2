// Generic geography math only. No infrastructure or telemetry data lives
// here — real reference data (stations, repeaters, etc.) is fetched from
// public sources in src/external/*.js.

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function bearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lon2 - lon1) * Math.PI) / 180);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

// Map-view presets (center + radius for each place selector option). These
// are just UI navigation targets, not a claim about any real infrastructure.
const PLACE_BOUNDS = {
  ms: { lat: 46.68, lon: 16.16, radiusKm: 26, label: "Murska Sobota" },
  pomurje: { lat: 46.63, lon: 16.22, radiusKm: 42, label: "Pomurje regija" },
  lendava: { lat: 46.5634, lon: 16.4512, radiusKm: 20, label: "Lendava" },
  ljutomer: { lat: 46.5194, lon: 16.1969, radiusKm: 20, label: "Ljutomer" },
  radgona: { lat: 46.6778, lon: 15.9924, radiusKm: 20, label: "G. Radgona" },
  lj: { lat: 46.15, lon: 14.85, radiusKm: 55, label: "Ljubljana vozlišče" },
  si: { lat: 46.05, lon: 14.9, radiusKm: 170, label: "Vsa Slovenija" },
};

module.exports = { haversineKm, bearing, clamp, PLACE_BOUNDS };
