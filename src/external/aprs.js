// Live APRS station positions via aprs.fi's public JSON API.
// Docs: https://aprs.fi/page/api
// Requires a free API key (https://aprs.fi/page/api) passed as
// APRS_FI_API_KEY. aprs.fi's free API is a callsign lookup ("what=loc"),
// not a radius search, so this checks a small fixed watchlist of local
// callsigns rather than discovering arbitrary nearby stations — a true
// "everything within N km" view needs a raw APRS-IS feed connection,
// which is out of scope here.

const TIMEOUT_MS = 6000;
const WATCHLIST = ["S50B-9", "S57A-1"];

async function fetchAprs(apiKey) {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://api.aprs.fi/api/get?name=${encodeURIComponent(WATCHLIST.join(","))}&what=loc&apikey=${encodeURIComponent(apiKey)}&format=json`;
    const res = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`aprs.fi HTTP ${res.status}`);
    const data = await res.json();
    if (data?.result !== "ok" || !Array.isArray(data.entries)) throw new Error("unexpected aprs.fi payload");
    return data.entries.map((e) => ({
      call: e.name,
      comment: e.comment || e.status || "",
      path: e.path || "",
      lat: parseFloat(e.lat),
      lon: parseFloat(e.lng),
      age: Math.max(0, Math.round(Date.now() / 1000 - Number(e.lasttime || 0))),
      source: "aprs.fi",
    }));
  } catch (err) {
    return null; // caller falls back to demo stations
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchAprs, WATCHLIST };
