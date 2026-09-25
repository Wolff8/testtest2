// Server-authoritative train simulation.
//
// There is no live SŽ (Slovenian Railways) vehicle-position feed wired in
// here — Transitous only exposes routed journey planning, not per-train
// GSM-R telemetry, so real-time positions are out of scope for this pass.
// Instead this runs a small physics simulation along the real Hodoš-Maribor
// corridor and derives a plausible GSM-R signal from distance to the
// nearest real GSM-R site. It is deterministic-ish and continuous so the
// dashboard has something genuinely live to watch over Socket.IO, clearly
// labeled as simulated in the UI.

const { CORR_LEN, pointAtKm, nearestSite, jitter, clamp } = require("./geo");

const trains = [
  { id: "rg-621", name: "RG 621", from: "Hodoš", to: "Maribor", km: CORR_LEN * 0.06, dir: 1, speedTarget: 78, speed: 0, dwell: 0, delay: 0 },
  { id: "mv-246", name: "MV 246 Citadella", from: "Budimpešta", to: "Ljubljana (prek MS)", km: CORR_LEN * 0.42, dir: -1, speedTarget: 96, speed: 62, dwell: 0, delay: 2 },
];

function computeErtms(t) {
  const line = t.gsmr && t.gsmr.site ? t.gsmr.site.line : "";
  let etcs = "L0";
  let stm = "national / GSM-R";
  let corridor = "Pomurje";
  let area = "Murska Sobota";
  if (["10", "20", "60"].includes(line)) {
    etcs = "L1";
    stm = "ETCS + national";
    corridor = "TEN-T";
    area = "Ljubljana";
  } else if (line === "30") {
    etcs = "L1";
    stm = "ETCS + national";
    corridor = "TEN-T / 30";
    area = "Maribor";
  }
  const rssi = t.gsmr ? t.gsmr.rssi : null;
  const qos = rssi == null ? "—" : rssi >= -70 ? "good" : rssi >= -85 ? "fair" : "weak";
  return { etcs, stm, corridor, area, op: t.speed > 2 ? "run" : "standby", voice: t.speed > 2 ? "CIRCUIT" : "IDLE", qos };
}

function tick(dtSec) {
  trains.forEach((t) => {
    if (t.dwell > 0) {
      t.dwell -= dtSec;
      t.speed = 0;
    } else {
      t.speed = clamp(jitter(t.speedTarget, 4), 0, 140);
      t.km += t.dir * (t.speed / 3600) * dtSec;
      if (t.km >= CORR_LEN) {
        t.km = CORR_LEN;
        t.dir = -1;
        t.dwell = 14;
        [t.from, t.to] = [t.to, t.from];
      }
      if (t.km <= 0) {
        t.km = 0;
        t.dir = 1;
        t.dwell = 14;
        [t.from, t.to] = [t.to, t.from];
      }
    }
    const p = pointAtKm(t.km);
    t.lat = p.lat;
    t.lon = p.lon;
    t.heading = t.dir > 0 ? p.heading : (p.heading + 180) % 360;
    const { site, km } = nearestSite(t.lat, t.lon);
    const rssi = Math.round(clamp(-50 - km * 4.2 + (Math.random() * 4 - 2), -108, -45));
    const snr = Math.round(clamp(20 - km * 1.6 + (Math.random() * 3 - 1.5), -4, 22));
    t.gsmr = { site, km: +km.toFixed(1), rssi, snr };
    t.trackTemp = +jitter(7.5, 0.6).toFixed(1);
    t.progressPct = Math.round((t.km / CORR_LEN) * 100);
    t.etaMin = Math.max(0, Math.round(((CORR_LEN - (t.dir > 0 ? t.km : CORR_LEN - t.km)) / Math.max(t.speedTarget, 40)) * 60));
    t.delay = Math.max(0, Math.round(jitter(t.delay, 0.4)));
    t.ertms = computeErtms(t);
  });
  return trains;
}

function snapshot() {
  return trains.map((t) => ({ ...t, gsmr: { ...t.gsmr, site: { ...t.gsmr.site } }, ertms: { ...t.ertms } }));
}

function board() {
  return [
    { name: "RG 621", dest: "Maribor", at: "05:12" },
    { name: "MV 246", dest: "Ljubljana", at: "05:48" },
    { name: "LPV 3814", dest: "Ormož", at: "06:15" },
  ];
}

module.exports = { tick, snapshot, board };
