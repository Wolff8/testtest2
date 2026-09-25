// Aggregates the live train simulation, static reference infrastructure,
// and best-effort external data (ADS-B, ISS, ARSO, APRS) into one snapshot
// per "place". Any external source that fails or times out falls back to
// small demo data so the dashboard always has something to render — the
// `source` field on each item says whether it's "live" or "demo".

const { GSMR_SITES, PLACE_BOUNDS, haversineKm } = require("./geo");
const trainSim = require("./trainSim");
const { fetchPlanes } = require("./external/adsb");
const { fetchIss } = require("./external/iss");
const { fetchMeteo } = require("./external/arso");
const { fetchAprs } = require("./external/aprs");

const DEMO_PLANES = [
  { id: "4401a2", flight: "ADR302", type: "CRJ9", reg: "S5-AAK", lat: 46.72, lon: 16.02, alt: 28000, gs: 420, track: 215, squawk: "7001" },
  { id: "3c66b8", flight: "DLH41K", type: "A321", reg: "D-AIDA", lat: 46.54, lon: 16.31, alt: 35000, gs: 465, track: 140, squawk: "3412" },
];
const DEMO_METEO = [
  { id: "ms-arso", name: "Murska Sobota - Rakičan", t: 7.4, rh: 84, wind: 7, dir: "Z", sky: "jasno" },
  { id: "lendava-arso", name: "Lendava", t: 7.9, rh: 81, wind: 5, dir: "SZ", sky: "jasno" },
];
const DEMO_RIVERS = [
  { id: "mura-petanjci", name: "Petanjci", river: "Mura", cm: 168, flow: 142, temp: 11.2 },
  { id: "mura-radgona", name: "Gornja Radgona", river: "Mura", cm: 112, flow: 138, temp: 11.1 },
];
const DEMO_HAM = [
  { call: "S55VMS", city: "Murska Sobota", mode: "FM", mhz: "145.725" },
  { call: "S55VGO", city: "Križevci", mode: "D-Star", mhz: "438.825" },
];
const DEMO_APRS = [
  { call: "S50B-9", comment: "SŽ D1 Gateway Probe", path: "WIDE1-1", lat: 46.662, lon: 16.168, age: 45 },
  { call: "S57A-1", comment: "Digipeater Pomurje", path: "WIDE2-2", lat: 46.685, lon: 16.21, age: 110 },
];

function jitterDemo(list, keys) {
  return list.map((item) => {
    const copy = { ...item, source: "demo" };
    for (const k of keys) {
      if (typeof copy[k] === "number") copy[k] = +(copy[k] + (Math.random() * 2 - 1) * copy[k] * 0.03).toFixed(1);
    }
    return copy;
  });
}

async function buildSnapshot(place, aprsApiKey) {
  const bounds = PLACE_BOUNDS[place] || PLACE_BOUNDS.ms;
  const radiusNm = Math.round((bounds.radiusKm / 1.852) * 1.4);

  const [planesLive, issLive, meteoLive, aprsLive] = await Promise.all([
    fetchPlanes(bounds.lat, bounds.lon, radiusNm),
    fetchIss(),
    fetchMeteo(place),
    fetchAprs(aprsApiKey),
  ]);

  const trains = trainSim.snapshot();
  const planes = planesLive && planesLive.length ? planesLive.map((p) => ({ ...p, source: "live" })) : jitterDemo(DEMO_PLANES, ["gs", "alt"]);
  const meteo = meteoLive || jitterDemo(DEMO_METEO, ["t", "rh", "wind"]);
  const rivers = jitterDemo(DEMO_RIVERS, ["cm", "flow", "temp"]); // no verified public real-time hydro endpoint wired in yet
  const aprs = aprsLive && aprsLive.length ? aprsLive : jitterDemo(DEMO_APRS, []);
  const iss = issLive
    ? { ...issLive, km: Math.round(haversineKm(bounds.lat, bounds.lon, issLive.lat, issLive.lon)) }
    : { lat: bounds.lat + 5, lon: bounds.lon + 5, source: "demo", km: 780 };

  return {
    at: new Date().toISOString(),
    place,
    lat: bounds.lat,
    lon: bounds.lon,
    gsmrSites: GSMR_SITES,
    trains,
    planes,
    meteo,
    rivers,
    ham: DEMO_HAM,
    aprs,
    iss,
    board: trainSim.board(),
  };
}

module.exports = { buildSnapshot };
