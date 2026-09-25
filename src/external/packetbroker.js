// Real public LoRaWAN gateway data from Packet Broker's public mapper API
// — the actual global exchange The Things Network gateways publish
// through. No API key required for this basic gateway list/traffic view.
// Optional deeper per-gateway connection stats are available if the
// operator supplies their own TTN/TTI API key (TTI_API_KEY) for gateways
// registered under their own account — that part is real too, just scoped
// to gateways that key has access to, not arbitrary public gateways.

const TIMEOUT_MS = 12000;

async function getJson(url, opts) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGateways(lat, lon, radiusKm) {
  const qs = new URLSearchParams({
    "distanceWithin[latitude]": String(lat),
    "distanceWithin[longitude]": String(lon),
    "distanceWithin[distance]": String(Math.round(radiusKm * 1000)),
    netID: "000013",
    tenantID: "ttn",
  });
  try {
    const raw = await getJson(`https://mapper.packetbroker.net/api/v2/gateways?${qs}`, {
      headers: { "user-agent": "signalssnap-noc/1.0 (public preview)" },
    });
    const list = Array.isArray(raw) ? raw : [];
    return list
      .filter((g) => g.id)
      .slice(0, 40)
      .map((g) => {
        const loc = g.location || {};
        return {
          id: String(g.id),
          eui: String(g.eui || ""),
          online: Boolean(g.online),
          updated: String(g.updatedAt || ""),
          lat: Number(loc.latitude || 0),
          lon: Number(loc.longitude || 0),
          rx: typeof g.rxRate === "number" ? g.rxRate : null,
          tx: typeof g.txRate === "number" ? g.txRate : null,
          source: "packetbroker",
        };
      })
      .filter((g) => g.lat && g.lon);
  } catch (err) {
    return null;
  }
}

// Optional richer per-gateway stats for gateways the caller's TTI API key
// can see. Returns null (not an error) when no key is configured.
async function fetchConnectionStats(gatewayId, ttiApiKey) {
  if (!ttiApiKey) return null;
  try {
    const s = await getJson(`https://eu1.cloud.thethings.network/api/v3/gs/gateways/${encodeURIComponent(gatewayId)}/connection/stats`, {
      headers: {
        authorization: `Bearer ${ttiApiKey}`,
        accept: "application/json",
        "user-agent": "signalssnap-noc/1.0 (public preview)",
      },
    });
    return {
      connected: !s.disconnected_at,
      uplink: Number(s.uplink_count || 0),
      downlink: Number(s.downlink_count || 0),
      lastUplinkAt: s.last_uplink_received_at || "",
    };
  } catch (err) {
    return null;
  }
}

module.exports = { fetchGateways, fetchConnectionStats };
