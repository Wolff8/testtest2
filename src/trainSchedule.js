// Derives a displayed train "position" from real published timetable data
// only. There is no live GPS feed for SŽ trains, so this is explicitly an
// estimate: for a trip currently between two real scheduled stop times, it
// linearly interpolates a straight-line position between those two real
// station coordinates by elapsed-time fraction. It is never randomly
// generated — a trip with no real schedule data simply isn't shown.

const { fetchCorridorTrips } = require("./external/transitous");
const { haversineKm, bearing } = require("./geo");

const STATIONS = ["Hodoš", "Murska Sobota", "Maribor"];

async function currentTrains() {
  const trips = await fetchCorridorTrips(STATIONS);
  const now = Date.now();
  const active = [];

  for (const trip of trips) {
    for (let i = 0; i < trip.stops.length - 1; i++) {
      const a = trip.stops[i];
      const b = trip.stops[i + 1];
      const ta = new Date(a.scheduled).getTime();
      const tb = new Date(b.scheduled).getTime();
      if (!Number.isFinite(ta) || !Number.isFinite(tb) || tb <= ta) continue;
      if (now < ta || now > tb) continue; // only show trips currently in transit per the real timetable

      const frac = (now - ta) / (tb - ta);
      const lat = a.lat + (b.lat - a.lat) * frac;
      const lon = a.lon + (b.lon - a.lon) * frac;
      const remainingKm = haversineKm(lat, lon, b.lat, b.lon);
      const totalKm = haversineKm(a.lat, a.lon, b.lat, b.lon);
      const etaMin = Math.round(((tb - now) / 60000));

      active.push({
        id: trip.id,
        name: trip.routeName,
        headsign: trip.headsign,
        from: a.name,
        to: b.name,
        lat,
        lon,
        heading: bearing(a.lat, a.lon, b.lat, b.lon),
        progressPct: totalKm > 0 ? Math.round((1 - remainingKm / totalKm) * 100) : null,
        etaMin,
        source: "transitous-schedule-estimate",
      });
      break;
    }
  }
  return active;
}

module.exports = { currentTrains, STATIONS };
