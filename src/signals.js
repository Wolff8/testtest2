// Aggregates only real data into one snapshot per "place". Nothing here is
// fabricated or randomly generated: every field is either populated from a
// live public source (tagged with its `source`) or left as an explicit
// unavailable state (`available: false`) when that source can't be
// reached or its response doesn't parse as expected. The frontend must
// render the unavailable state as "no data", never substitute a number.

const { PLACE_BOUNDS, haversineKm } = require("./geo");
const { fetchPlanes } = require("./external/adsb");
const { fetchIss } = require("./external/iss");
const { fetchMeteo } = require("./external/arso");
const { fetchAprs } = require("./external/aprs");
const { fetchRailStations } = require("./external/osm");
const { fetchRepeaters } = require("./external/repeaterbook");
const { currentTrains } = require("./trainSchedule");

function unavailable(note) {
  return { available: false, items: [], note };
}
function available(items, source) {
  return { available: true, items, source };
}

async function buildSnapshot(place, aprsApiKey) {
  const bounds = PLACE_BOUNDS[place] || PLACE_BOUNDS.ms;
  const radiusNm = Math.round((bounds.radiusKm / 1.852) * 1.4);

  const [planesLive, issLive, meteoLive, aprsLive, stationsLive, repeatersLive, trainsLive] = await Promise.all([
    fetchPlanes(bounds.lat, bounds.lon, radiusNm),
    fetchIss(),
    fetchMeteo(place),
    fetchAprs(aprsApiKey),
    fetchRailStations(bounds),
    fetchRepeaters("Slovenia"),
    currentTrains(),
  ]);

  return {
    at: new Date().toISOString(),
    place,
    lat: bounds.lat,
    lon: bounds.lon,
    trains:
      trainsLive.length > 0
        ? available(trainsLive, "transitous-schedule-estimate")
        : unavailable("Ni vlakov, ki bi bili trenutno po objavljenem voznem redu na progi Hodoš–Murska Sobota–Maribor, ali vir urnika ni dosegljiv."),
    railStations: stationsLive ? available(stationsLive, "osm") : unavailable("OpenStreetMap Overpass API ni dosegljiv."),
    planes: planesLive ? available(planesLive, "adsb.lol") : unavailable("adsb.lol ni dosegljiv."),
    meteo: meteoLive ? available(meteoLive, "arso") : unavailable("ARSO vremenski vir ni dosegljiv."),
    rivers: unavailable("Ni preverjenega javnega vira hidroloških podatkov v realnem času."),
    aprs: aprsApiKey ? (aprsLive ? available(aprsLive, "aprs.fi") : unavailable("aprs.fi ni dosegljiv.")) : unavailable("APRS_FI_API_KEY ni nastavljen."),
    ham: repeatersLive ? available(repeatersLive, "repeaterbook") : unavailable("RepeaterBook API ni dosegljiv."),
    iss: issLive
      ? { available: true, ...issLive, km: Math.round(haversineKm(bounds.lat, bounds.lon, issLive.lat, issLive.lon)) }
      : unavailable("Open Notify ISS API ni dosegljiv."),
  };
}

module.exports = { buildSnapshot };
