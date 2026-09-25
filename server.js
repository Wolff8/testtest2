const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { buildSnapshot } = require("./src/signals");

const PORT = process.env.PORT || 3000;
// Real external APIs (ADS-B, ARSO, aprs.fi, Overpass, RepeaterBook,
// Transitous) are polled on a much longer interval than a fake simulation
// would need, to stay a reasonable, well-behaved client of free public
// services.
const TICK_SECONDS = 30;
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

io.on("connection", (socket) => {
  socket.emit("hello", { ok: true });
});

setInterval(() => {
  io.emit("feed", { at: new Date().toISOString() });
}, TICK_SECONDS * 1000);

server.listen(PORT, () => {
  console.log(`SignalsSnap NOC listening on http://localhost:${PORT}`);
});
