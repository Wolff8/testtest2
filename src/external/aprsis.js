// Live APRS station positions from the real APRS-IS network
// (aprs.net / aprs2.net), the actual protocol amateur-radio APRS clients
// use — a persistent read-only TCP feed, filtered by geography server-side.
// No API key needed; login uses any callsign with passcode -1 (read-only,
// "verified" filtered feeds require a real passcode, but an unverified
// login still receives traffic matching the filter for most servers).
// Docs: http://www.aprs-is.net/Connecting.aspx

const { createConnection } = require("node:net");

const stations = new Map();
const MAX_STATIONS = 120;

function parseAprsLine(line) {
  if (!line || line.startsWith("#")) return null;
  const gt = line.indexOf(">");
  const col = line.indexOf(":");
  if (gt < 1 || col < 3) return null;
  const call = line.slice(0, gt).trim();
  const path = line.slice(gt + 1, col);
  const body = line.slice(col + 1);
  let lat = 0;
  let lon = 0;
  const m = body.match(/^[!=/@](?:\d{6}z)?(\d{4}\.\d{2})([NS])[^\d](\d{5}\.\d{2})([EW])/);
  if (m) {
    const dlat = Number(m[1].slice(0, 2)) + Number(m[1].slice(2)) / 60;
    const dlon = Number(m[3].slice(0, 3)) + Number(m[3].slice(3)) / 60;
    lat = m[2] === "S" ? -dlat : dlat;
    lon = m[4] === "W" ? -dlon : dlon;
  }
  const comment = body.replace(/^[!=/@][^\s]{0,24}\s*/, "").slice(0, 160);
  return { call, path: path.slice(0, 80), comment, lat, lon, at: Date.now() };
}

function ingest(line) {
  const row = parseAprsLine(line);
  if (!row || !row.call) return;
  const prev = stations.get(row.call) || {};
  stations.set(row.call, { ...prev, ...row, lat: row.lat || prev.lat || 0, lon: row.lon || prev.lon || 0 });
  if (stations.size > MAX_STATIONS) {
    const oldest = [...stations.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) stations.delete(oldest[0]);
  }
}

function filterFor(lat, lon, radiusKm) {
  // APRS-IS server-side filter syntax: r/lat/lon/radiusKm
  return `filter r/${lat.toFixed(2)}/${lon.toFixed(2)}/${Math.max(50, Math.round(radiusKm * 2))}`;
}

let started = false;

// Starts (once) a persistent background connection so stations accumulate
// over time. Safe to call repeatedly.
function startFeed(lat, lon, radiusKm) {
  if (started) return;
  started = true;
  const connect = () => {
    const sock = createConnection({ host: "rotate.aprs2.net", port: 14580 });
    sock.setEncoding("latin1");
    sock.setTimeout(300_000);
    let buf = "";
    sock.on("connect", () => {
      sock.write(`user SIGSNAP1 pass -1 vers signalssnap-noc 1.0 ${filterFor(lat, lon, radiusKm)}\r\n`);
    });
    sock.on("data", (chunk) => {
      buf += chunk;
      let n;
      while ((n = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, n).replace(/\r/g, "").trim();
        buf = buf.slice(n + 1);
        ingest(line);
      }
    });
    let retrying = false;
    const retry = () => {
      if (retrying) return;
      retrying = true;
      setTimeout(connect, 8000);
    };
    sock.on("error", retry);
    sock.on("close", retry);
    sock.on("timeout", () => sock.destroy());
  };
  connect();
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Returns stations heard within the last `maxAgeSec` seconds, near (lat, lon).
// Returns [] (never null) — an empty live feed is a legitimate real state,
// not a failure, since APRS traffic is inherently sparse in quiet areas.
function recentStations(lat, lon, radiusKm, maxAgeSec = 40 * 60) {
  const cutoff = Date.now() - maxAgeSec * 1000;
  return [...stations.values()]
    .filter((s) => s.at > cutoff && s.lat)
    .map((s) => ({ ...s, km: Math.round(haversineKm(lat, lon, s.lat, s.lon) * 10) / 10, age: Math.round((Date.now() - s.at) / 1000) }))
    .filter((s) => s.km <= radiusKm * 2.5)
    .sort((a, b) => a.km - b.km)
    .slice(0, 30);
}

module.exports = { startFeed, recentStations };
