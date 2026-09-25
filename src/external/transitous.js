// Real published rail timetable data from Transitous (transitous.org), a
// public-transport router built on MOTIS that aggregates GTFS feeds across
// Europe. Public instance, no key required: https://api.transitous.org
//
// IMPORTANT CAVEAT: this was written against MOTIS v2's documented
// OTP-compatible REST endpoints (`/api/v1/geocode`, `/api/v1/stoptimes`)
// from documentation, not against a live response — the sandbox this was
// built in had outbound network access blocked by policy, so this call
// chain could not be exercised end to end. Every step is parsed
// defensively and returns null on any failure or shape mismatch, so a
// wrong assumption here surfaces as "schedule unavailable" in the UI
// rather than fabricated train data. Treat this as unverified until
// smoke-tested with real network access.

const BASE = "https://api.transitous.org/api/v1";
const TIMEOUT_MS = 10000;

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Transitous HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function geocodeStop(name) {
  const data = await getJson(`${BASE}/geocode?text=${encodeURIComponent(name)}&type=STOP`);
  const hit = Array.isArray(data) ? data[0] : Array.isArray(data?.results) ? data.results[0] : null;
  if (!hit || !hit.id) return null;
  return { id: hit.id, name: hit.name || name, lat: hit.lat, lon: hit.lon };
}

async function stoptimesFor(stopId) {
  const data = await getJson(`${BASE}/stoptimes?stopId=${encodeURIComponent(stopId)}&n=20`);
  const list = Array.isArray(data?.stopTimes) ? data.stopTimes : Array.isArray(data) ? data : null;
  if (!list) return null;
  return list
    .map((s) => ({
      tripId: s.tripId || s.trip?.id,
      routeName: s.trip?.routeShortName || s.routeShortName || s.headsign || "?",
      headsign: s.headsign || s.trip?.headsign || "",
      scheduled: s.scheduledDeparture || s.scheduledArrival || s.time,
    }))
    .filter((s) => s.tripId && s.scheduled);
}

// Fetches real upcoming trips through a small list of named stations and
// reconstructs simple two-point (origin -> destination) segments for any
// trip seen at 2+ of them, so a position can be interpolated between real
// scheduled times at real stations. Returns [] (never fabricated trains)
// if the feed can't be reached or no matching trips are found.
async function fetchCorridorTrips(stationNames) {
  try {
    const stops = [];
    for (const name of stationNames) {
      const stop = await geocodeStop(name);
      if (stop) stops.push(stop);
    }
    if (stops.length < 2) return [];

    const byTrip = new Map();
    for (const stop of stops) {
      const times = await stoptimesFor(stop.id);
      if (!times) continue;
      for (const t of times) {
        if (!byTrip.has(t.tripId)) byTrip.set(t.tripId, []);
        byTrip.get(t.tripId).push({ ...t, stop });
      }
    }

    const trips = [];
    for (const [tripId, stops2] of byTrip.entries()) {
      if (stops2.length < 2) continue;
      stops2.sort((a, b) => new Date(a.scheduled) - new Date(b.scheduled));
      trips.push({
        id: tripId,
        routeName: stops2[0].routeName,
        headsign: stops2[0].headsign,
        stops: stops2.map((s) => ({ name: s.stop.name, lat: s.stop.lat, lon: s.stop.lon, scheduled: s.scheduled })),
      });
    }
    return trips;
  } catch (err) {
    return [];
  }
}

module.exports = { fetchCorridorTrips };
