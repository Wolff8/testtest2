// Shared geography helpers + static reference infrastructure data.
// GSM-R site coordinates and the Hodoš-Maribor corridor polyline are the
// same planning-grade reference points used by the original SignalsSnap
// concept sketch; they are static infrastructure references, not fetched
// from any API.

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function bearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lon2 - lon1) * Math.PI) / 180);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function jitter(v, amt) {
  return v + (Math.random() * 2 - 1) * amt;
}

const GSMR_SITES = [
  { id: "gsmr-ms", name: "Murska Sobota", ref: "MS", lat: 46.6617, lon: 16.1664, line: "34" },
  { id: "gsmr-puc", name: "Puconci", ref: "PUC", lat: 46.7053, lon: 16.1586, line: "34" },
  { id: "gsmr-mac", name: "Mačkovci", ref: "MAC", lat: 46.7846, lon: 16.1682, line: "34" },
  { id: "gsmr-hod", name: "Hodoš", ref: "HOD", lat: 46.8231, lon: 16.3342, line: "34" },
  { id: "gsmr-ljt", name: "Ljutomer", ref: "LJT", lat: 46.5194, lon: 16.1969, line: "41" },
  { id: "gsmr-len", name: "Lendava", ref: "LEN", lat: 46.5634, lon: 16.4512, line: "42" },
  { id: "gsmr-bel", name: "Beltinci", ref: "BEL", lat: 46.6078, lon: 16.2361, line: "41" },
  { id: "gsmr-rad", name: "Gornja Radgona", ref: "RAD", lat: 46.6778, lon: 15.9924, line: "34" },
  { id: "gsmr-orm", name: "Ormož", ref: "ORM", lat: 46.4095, lon: 16.1507, line: "40" },
  { id: "gsmr-ptj", name: "Ptuj", ref: "PTJ", lat: 46.4212, lon: 15.8756, line: "40" },
  { id: "gsmr-30-19", name: "Maribor", ref: "BP-30.19", lat: 46.5525, lon: 15.6548, line: "30" },
  { id: "gsmr-30-07", name: "Celje", ref: "BP-30.07", lat: 46.232974, lon: 15.271624, line: "30" },
  { id: "gsmr-lj", name: "Ljubljana", ref: "LJ", lat: 46.0581, lon: 14.5123, line: "10" },
  { id: "gsmr-kr", name: "Kranj", ref: "KR", lat: 46.2447, lon: 14.3556, line: "20" },
  { id: "gsmr-je", name: "Jesenice", ref: "JE", lat: 46.4364, lon: 14.0531, line: "20" },
  { id: "gsmr-kp", name: "Koper", ref: "KP", lat: 45.5394, lon: 13.7378, line: "60" },
  { id: "gsmr-ng", name: "Nova Gorica", ref: "NG", lat: 45.9553, lon: 13.6406, line: "50" },
  { id: "gsmr-do", name: "Dobova", ref: "DO", lat: 45.8967, lon: 15.6583, line: "10" },
  { id: "gsmr-zg", name: "Zidani Most", ref: "ZM", lat: 46.0864, lon: 15.1728, line: "10" },
  { id: "gsmr-nm", name: "Novo mesto", ref: "NM", lat: 45.8028, lon: 15.1692, line: "80" },
];

const CORRIDOR = [
  [46.8231, 16.3342],
  [46.8042, 16.2764],
  [46.7846, 16.1682],
  [46.7053, 16.1586],
  [46.6617, 16.1664],
  [46.6078, 16.2361],
  [46.5194, 16.1969],
  [46.4095, 16.1507],
  [46.3964, 15.6625],
  [46.4545, 15.6643],
  [46.5525, 15.6548],
];

const CORR_CUM = [0];
for (let i = 1; i < CORRIDOR.length; i++) {
  CORR_CUM.push(CORR_CUM[i - 1] + haversineKm(CORRIDOR[i - 1][0], CORRIDOR[i - 1][1], CORRIDOR[i][0], CORRIDOR[i][1]));
}
const CORR_LEN = CORR_CUM[CORR_CUM.length - 1];

function pointAtKm(km) {
  km = clamp(km, 0, CORR_LEN);
  let i = 0;
  while (i < CORR_CUM.length - 2 && CORR_CUM[i + 1] < km) i++;
  const segLen = CORR_CUM[i + 1] - CORR_CUM[i] || 1;
  const t = (km - CORR_CUM[i]) / segLen;
  const [lat1, lon1] = CORRIDOR[i];
  const [lat2, lon2] = CORRIDOR[i + 1];
  return {
    lat: lat1 + (lat2 - lat1) * t,
    lon: lon1 + (lon2 - lon1) * t,
    heading: bearing(lat1, lon1, lat2, lon2),
  };
}

function nearestSite(lat, lon) {
  let best = null;
  let bestKm = Infinity;
  for (const s of GSMR_SITES) {
    const km = haversineKm(lat, lon, s.lat, s.lon);
    if (km < bestKm) {
      bestKm = km;
      best = s;
    }
  }
  return { site: best, km: bestKm };
}

const PLACE_BOUNDS = {
  ms: { lat: 46.68, lon: 16.16, radiusKm: 26, label: "Murska Sobota" },
  pomurje: { lat: 46.63, lon: 16.22, radiusKm: 42, label: "Pomurje regija" },
  lendava: { lat: 46.5634, lon: 16.4512, radiusKm: 20, label: "Lendava" },
  ljutomer: { lat: 46.5194, lon: 16.1969, radiusKm: 20, label: "Ljutomer" },
  radgona: { lat: 46.6778, lon: 15.9924, radiusKm: 20, label: "G. Radgona" },
  lj: { lat: 46.15, lon: 14.85, radiusKm: 55, label: "Ljubljana vozlišče" },
  si: { lat: 46.05, lon: 14.9, radiusKm: 170, label: "Vsa Slovenija" },
};

module.exports = {
  haversineKm,
  bearing,
  clamp,
  jitter,
  GSMR_SITES,
  CORRIDOR,
  CORR_LEN,
  pointAtKm,
  nearestSite,
  PLACE_BOUNDS,
};
