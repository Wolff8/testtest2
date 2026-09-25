// Live ISS position via the free public Open Notify API (no key required).
// Docs: http://open-notify.org/Open-Notify-API/ISS-Location-Now/
// Response: { iss_position: { latitude, longitude }, timestamp }

const TIMEOUT_MS = 5000;

async function fetchIss() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("http://api.open-notify.org/iss-now.json", {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`open-notify HTTP ${res.status}`);
    const data = await res.json();
    const lat = parseFloat(data?.iss_position?.latitude);
    const lon = parseFloat(data?.iss_position?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("bad iss payload");
    return { lat, lon, source: "open-notify" };
  } catch (err) {
    return null; // caller falls back to a simulated position
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchIss };
