// Live ADS-B aircraft near a point, via the free public adsb.lol API
// (no API key required): GET /v2/lat/{lat}/lon/{lon}/dist/{radiusNm}
// Docs: https://api.adsb.lol/docs
// Expected shape: { ac: [ { hex, flight, t (type), r (registration),
//   alt_baro, gs, track, squawk, lat, lon }, ... ] }
// This endpoint's exact field names can drift, so every field is read
// defensively and the whole call is wrapped so a bad/slow response just
// falls back to demo data instead of breaking the dashboard.

const TIMEOUT_MS = 6000;

async function fetchPlanes(lat, lon, radiusNm) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${radiusNm}`;
    const res = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`adsb.lol HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data?.ac) ? data.ac : [];
    return list
      .filter((a) => typeof a.lat === "number" && typeof a.lon === "number")
      .slice(0, 40)
      .map((a) => ({
        id: a.hex || `${a.lat},${a.lon}`,
        flight: (a.flight || "").trim() || a.hex || "—",
        type: a.t || "A/C",
        reg: a.r || "—",
        lat: a.lat,
        lon: a.lon,
        alt: typeof a.alt_baro === "number" ? a.alt_baro : null,
        gs: typeof a.gs === "number" ? Math.round(a.gs) : null,
        track: typeof a.track === "number" ? Math.round(a.track) : 0,
        squawk: a.squawk || "—",
      }));
  } catch (err) {
    return null; // caller falls back to simulated planes
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchPlanes };
