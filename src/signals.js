// Aggregates only real data into one snapshot per "place". Nothing here is
// fabricated or randomly generated: every field is either populated from a
// live public source (tagged with its `source`) or left as an explicit
// unavailable state (`available: false`) when that source can't be
// reached or its response doesn't parse as expected. The frontend must
// render the unavailable state as "no data", never substitute a number.

const { PLACE_BOUNDS, haversineKm } = require("./geo");
const { fetchPlanes } = require("./external/adsb");
const { fetchIss } = require("./external/iss");
const { fetchMeteo, fetchRivers } = require("./external/arso");
const { fetchRailStations } = require("./external/osm");
const { fetchRepeaters } = require("./external/hearham");
const { recentStations } = require("./external/aprsis");
const { fetchGateways, fetchConnectionStats } = require("./external/packetbroker");
const { pingAll } = require("./external/sipprobe");
const { currentTrains } = require("./trainSchedule");

function unavailable(note) {
  return { available: false, items: [], note };
}
function available(items, source) {
  return { available: true, items, source };
}

async function buildSnapshot(place, ttiApiKey) {
  const bounds = PLACE_BOUNDS[place] || PLACE_BOUNDS.ms;
  const radiusNm = Math.round((bounds.radiusKm / 1.852) * 1.4);

  const [planesLive, issLive, meteoLive, riversLive, stationsLive, repeatersLive, gatewaysLive, sipHosts, trainsLive] = await Promise.all([
    fetchPlanes(bounds.lat, bounds.lon, radiusNm),
    fetchIss(),
    fetchMeteo(bounds.lat, bounds.lon, bounds.radiusKm * 3.5),
    fetchRivers(bounds.lat, bounds.lon, bounds.radiusKm * 1.8),
    fetchRailStations(bounds),
    fetchRepeaters(bounds.lat, bounds.lon, bounds.radiusKm * 3),
    fetchGateways(bounds.lat, bounds.lon, bounds.radiusKm * 1.5),
    pingAll(),
    currentTrains(),
  ]);

  if (ttiApiKey && gatewaysLive) {
    await Promise.all(
      gatewaysLive.map(async (g) => {
        g.stats = await fetchConnectionStats(g.id, ttiApiKey);
      }),
    );
  }

  const aprsLive = recentStations(bounds.lat, bounds.lon, bounds.radiusKm);

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
    meteo: meteoLive ? available(meteoLive, "arso") : unavailable("ARSO vremenski vir ni dosegljiv ali v tem območju ni postaje."),
    rivers: riversLive ? available(riversLive, "arso") : unavailable("ARSO hidrološki vir ni dosegljiv ali v tem območju ni merilne postaje."),
    // APRS-IS is a live feed that accumulates over time after server start;
    // an empty list shortly after boot, or in a quiet area, is a real
    // state (no traffic heard yet), not a failure - so this is always
    // "available", just possibly empty.
    aprs: available(aprsLive, "aprs-is"),
    ham: repeatersLive ? available(repeatersLive, "hearham") : unavailable("Hearham API ni dosegljiv."),
    lorawan: gatewaysLive ? available(gatewaysLive, "packetbroker") : unavailable("Packet Broker mapper API ni dosegljiv."),
    sip: available(sipHosts, "sip-options-probe"),
    iss: issLive
      ? { available: true, ...issLive, km: Math.round(haversineKm(bounds.lat, bounds.lon, issLive.lat, issLive.lon)) }
      : unavailable("Open Notify ISS API ni dosegljiv."),
  };
}

module.exports = { buildSnapshot };
