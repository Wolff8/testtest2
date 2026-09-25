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

app.get("/api/signals", async (req, res) => {
  const place = String(req.query.place || "ms");
  try {
    const snap = await buildSnapshot(place, TTI_API_KEY);
    res.json(snap);
  } catch (err) {
    res.status(500).json({ error: "failed to build signals snapshot", message: err.message });
  }
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

server.listen(PORT, () => {
  console.log(`SignalsSnap NOC listening on http://localhost:${PORT}`);
});
