const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { buildSnapshot } = require("./src/signals");
const { startFeed } = require("./src/external/aprsis");
const ttnPackets = require("./src/external/ttnPackets");
const { PLACE_BOUNDS } = require("./src/geo");

const PORT = process.env.PORT || 3000;
// Real external APIs (ADS-B, ARSO, Packet Broker, Overpass, Hearham,
// Transitous, SIP probes) are polled on a much longer interval than a fake
// simulation would need, to stay a reasonable, well-behaved client of
// free public services.
const TICK_SECONDS = 30;
// Optional: a TTN/TTI API key for deeper per-gateway LoRaWAN connection
// stats, scoped to gateways that key can see. Not required for the base
// Packet Broker gateway view.
const TTI_API_KEY = process.env.TTI_API_KEY || "";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const { getAsterixSurveillanceSnapshot } = require("./src/external/asterix");

let arsoRadarCache = { buffer: null, fetchedAt: 0, contentType: "image/gif" };

async function fetchArsoRadarImage() {
  const now = Date.now();
  if (arsoRadarCache.buffer && now - arsoRadarCache.fetchedAt < 60000) {
    return arsoRadarCache;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://meteo.arso.gov.si/uploads/probase/www/observ/radar/si0-rm.gif", {
      signal: controller.signal,
      headers: { "user-agent": "signalssnap-noc/1.0" },
    });
    if (!res.ok) throw new Error(`ARSO Radar HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    arsoRadarCache = {
      buffer: Buffer.from(arrayBuffer),
      fetchedAt: now,
      contentType: res.headers.get("content-type") || "image/gif",
    };
    return arsoRadarCache;
  } catch (err) {
    if (arsoRadarCache.buffer) return arsoRadarCache;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

app.get("/api/signals", async (req, res) => {
  const place = String(req.query.place || "ms");
  try {
    const snap = await buildSnapshot(place, TTI_API_KEY);
    res.json(snap);
  } catch (err) {
    res.status(500).json({ error: "failed to build signals snapshot", message: err.message });
  }
});

app.get("/api/sdr/asterix", async (req, res) => {
  const place = String(req.query.place || "ms");
  const mode = String(req.query.mode || "auto");
  const bounds = PLACE_BOUNDS[place] || PLACE_BOUNDS.ms;
  try {
    const data = await getAsterixSurveillanceSnapshot({ ...bounds, place }, mode);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch asterix surveillance data", message: err.message });
  }
});

app.get("/api/radar/arso-image", async (req, res) => {
  try {
    const cache = await fetchArsoRadarImage();
    res.setHeader("Content-Type", cache.contentType);
    res.setHeader("Cache-Control", "public, max-age=60");
    res.send(cache.buffer);
  } catch (err) {
    // Generate clean fallback SVG if upstream ARSO GIF is temporarily unreachable
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="#070b14" opacity="0.4"/><text x="50%" y="50%" fill="#34d399" font-family="monospace" font-size="14" text-anchor="middle" dominant-baseline="middle">ARSO RADAR NI DOSEGLJIV (${err.message})</text></svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  }
});

app.get("/api/radar/arso-meta", (req, res) => {
  res.json({
    available: true,
    source: "ARSO - Agencija RS za okolje",
    description: "Slovenski radarski kompozit padavin",
    // Calibrated radar geographic extent for Slovenia
    bounds: [
      [45.30, 13.25], // South-West
      [46.95, 16.65], // North-East
    ],
    lastUpdate: arsoRadarCache.fetchedAt ? new Date(arsoRadarCache.fetchedAt).toISOString() : null,
  });
});

app.get("/api/packets", (req, res) => {
  res.json({ items: ttnPackets.list(), watching: Boolean(TTI_API_KEY) });
});

io.on("connection", (socket) => {
  socket.emit("hello", { ok: true });
});

setInterval(() => {
  io.emit("feed", { at: new Date().toISOString() });
}, TICK_SECONDS * 1000);

// Start the persistent APRS-IS feed once, filtered around the default
// place - it accumulates real traffic in the background regardless of
// which place a given request asks for.
const defaultBounds = PLACE_BOUNDS.ms;
startFeed(defaultBounds.lat, defaultBounds.lon, defaultBounds.radiusKm * 3);

// Real live LoRaWAN uplink packets from the operator's own TTN
// application(s), pushed to every connected client the instant they
// arrive. No-op without TTI_API_KEY.
ttnPackets.setOnPacket((packet) => io.emit("packet", packet));
ttnPackets.start(TTI_API_KEY);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`SignalsSnap NOC listening on http://0.0.0.0:${PORT}`);
});
