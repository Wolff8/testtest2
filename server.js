const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const trainSim = require("./src/trainSim");
const loraSim = require("./src/loraSim");
const { buildSnapshot } = require("./src/signals");

const PORT = process.env.PORT || 3000;
const TICK_SECONDS = 3;
const APRS_FI_API_KEY = process.env.APRS_FI_API_KEY || "";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/signals", async (req, res) => {
  const place = String(req.query.place || "ms");
  try {
    const snap = await buildSnapshot(place, APRS_FI_API_KEY);
    res.json(snap);
  } catch (err) {
    res.status(500).json({ error: "failed to build signals snapshot", message: err.message });
  }
});

app.get("/api/lora", (req, res) => {
  res.json({ items: loraSim.list(req.query.kind) });
});

app.get("/api/sip", (req, res) => {
  res.json(loraSim.sipStatus());
});

io.on("connection", (socket) => {
  socket.emit("hello", { ok: true });
});

async function tickLoop() {
  const trains = trainSim.tick(TICK_SECONDS);
  loraSim.generate(trains);
  io.emit("feed", { at: new Date().toISOString() });
}
setInterval(() => {
  tickLoop().catch((err) => console.error("tick loop error", err));
}, TICK_SECONDS * 1000);

server.listen(PORT, () => {
  console.log(`SignalsSnap NOC listening on http://localhost:${PORT}`);
});
