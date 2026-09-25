// Real amateur radio repeater data from RepeaterBook's public export API
// (no key required for the "rest of world" export).
// Docs: https://www.repeaterbook.com/wiki/doku.php?id=api
// GET https://www.repeaterbook.com/api/exportROW.php?country=Slovenia
// This is a community-maintained database, not an official registry, and
// this integration is unverified against a live response (see README) —
// it returns null on any failure so the caller shows "unavailable"
// instead of fabricated repeaters.

const TIMEOUT_MS = 8000;

async function fetchRepeaters(country) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://www.repeaterbook.com/api/exportROW.php?country=${encodeURIComponent(country)}`;
    const res = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`RepeaterBook HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data?.results) ? data.results : null;
    if (!list) throw new Error("unexpected RepeaterBook payload");
    return list
      .filter((r) => r.Callsign && r.Lat && r.Long)
      .slice(0, 60)
      .map((r) => ({
        call: r.Callsign,
        city: r.Landmark || r.Nearest_City || "",
        mode: r.FM_Analog === "Yes" ? "FM" : r.DMR === "Yes" ? "DMR" : r["D-Star"] === "Yes" ? "D-Star" : "—",
        mhz: r.Frequency,
        lat: parseFloat(r.Lat),
        lon: parseFloat(r.Long),
        source: "repeaterbook",
      }));
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchRepeaters };
