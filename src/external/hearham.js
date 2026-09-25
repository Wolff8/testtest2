// Real amateur radio repeater data from Hearham's public JSON API
// (no key required). Community-maintained, not an official registry.

const TIMEOUT_MS = 8000;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function fetchRepeaters(lat, lon, radiusKm) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://hearham.com/api/repeaters/v1", {
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": "signalssnap-noc/1.0 (public preview)" },
    });
    if (!res.ok) throw new Error(`hearham HTTP ${res.status}`);
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error("unexpected hearham payload");
    return list
      .filter((r) => r.latitude && r.longitude && r.callsign)
      .map((r) => ({
        call: String(r.callsign),
        city: r.city || "",
        mode: r.mode || "",
        mhz: r.frequency ? (Number(r.frequency) / 1e6).toFixed(3) : "",
        lat: Number(r.latitude),
        lon: Number(r.longitude),
        km: Math.round(haversineKm(lat, lon, Number(r.latitude), Number(r.longitude)) * 10) / 10,
        source: "hearham",
      }))
      .filter((r) => r.km < radiusKm)
      .sort((a, b) => a.km - b.km)
      .slice(0, 20);
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchRepeaters };
