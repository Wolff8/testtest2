// Real railway station locations from OpenStreetMap's public Overpass API
// (no key required). Docs: https://wiki.openstreetmap.org/wiki/Overpass_API
// Replaces any made-up "GSM-R site" coordinate list — these are genuine
// community-mapped station nodes, not telecom infrastructure (SŽ does not
// publish GSM-R base station locations), so the UI must label this layer
// as railway stations, not base stations.

const TIMEOUT_MS = 12000;
const ENDPOINT = "https://overpass-api.de/api/interpreter";

async function fetchRailStations(bounds) {
  const { lat, lon, radiusKm } = bounds;
  const radiusM = Math.round(radiusKm * 1000);
  const query = `
    [out:json][timeout:10];
    node["railway"="station"](around:${radiusM},${lat},${lon});
    out body;
  `;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "text/plain" },
      body: query,
    });
    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
    const data = await res.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];
    return elements
      .filter((e) => typeof e.lat === "number" && typeof e.lon === "number")
      .map((e) => ({
        id: `osm-${e.id}`,
        name: e.tags?.name || e.tags?.["name:sl"] || "—",
        lat: e.lat,
        lon: e.lon,
        source: "osm",
      }));
  } catch (err) {
    return null; // caller shows the layer as unavailable, never fabricates sites
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchRailStations };
