# SignalsSnap NOC

An unofficial concept dashboard for real public rail, air, weather, and
amateur-radio data around the Hodoš–Maribor corridor (Pomurje region,
Slovenia). Not affiliated with, and not an official tool of, SŽ, DRI, or
ARSO.

**No field is ever fabricated or randomly generated.** Every value shown is
either fetched live from a real public source, or the panel explicitly
says "ni podatkov" (no data) when that source is unreachable — it never
substitutes a made-up number.

## Run it

```bash
npm install
npm start
```

Then open http://localhost:3000.

Optional: copy `.env.example` to `.env` and set `APRS_FI_API_KEY` (a free
key from https://aprs.fi/page/api) to enable APRS station lookups; without
it the APRS panel shows "ni podatkov".

## Data sources

| Feature | Source | Notes |
|---|---|---|
| Trains | [Transitous](https://transitous.org) real published timetable | There is no public live GPS feed for SŽ trains. Position shown is a straight-line interpolation between two real station coordinates, based on elapsed time between two real scheduled stop times for the same trip. Only trains currently between two such stops are shown; if none are in transit or the schedule feed is unreachable, the panel says so — it never shows an idle or fabricated train. |
| Railway stations | [OpenStreetMap Overpass API](https://overpass-api.de) | Real community-mapped `railway=station` nodes. SŽ does not publish GSM-R/telecom infrastructure locations, so this is stations only, not base-station sites. |
| Aircraft | [adsb.lol](https://api.adsb.lol/) (no key) | Live ADS-B near the selected place. |
| ISS position | [Open Notify](http://open-notify.org/) (no key) | Live. |
| Weather | ARSO's unofficial `vreme.arso.gov.si` JSON feed | Undocumented, unofficial endpoint used by several community projects, not a published API contract — parsed defensively. |
| Rivers/hydro | — | No verified public real-time hydro API is wired in; this panel always shows "ni podatkov" rather than guess at an unconfirmed endpoint. |
| APRS | [aprs.fi](https://aprs.fi/page/api) (requires a free key) | aprs.fi's free API is a callsign lookup, not a radius search, so this checks a small fixed watchlist rather than discovering arbitrary nearby stations. |
| Amateur radio repeaters | [RepeaterBook](https://www.repeaterbook.com/wiki/doku.php?id=api) (no key) | Community-maintained database. |

**Important caveat:** this was built in a sandbox whose outbound network
access was restricted by policy, so none of the external calls above
could be exercised against the live network before being pushed. Each
adapter (`src/external/*.js`) is written defensively against each
service's documented or commonly-used response shape and returns `null`
on any failure or mismatch, so a wrong assumption surfaces as "ni
podatkov" in the UI rather than breaking the app or showing fabricated
data — but please smoke-test `/api/signals` once you run this with normal
internet access. The Transitous and ARSO integrations are the least
certain and most likely to need a field-name adjustment.

## Architecture

- `server.js` — Express app serving `public/` statically, the
  `/api/signals` route, and a Socket.IO `feed` event broadcast every 30
  seconds telling connected clients to refetch (kept infrequent to be a
  reasonable client of free public APIs).
- `src/trainSchedule.js` — turns real Transitous timetable data into a
  schedule-estimated position; returns `[]` if no real data is available.
- `src/geo.js` — generic geo math (haversine, bearing) and map-view
  presets only, no data.
- `src/external/*.js` — one adapter per external source, each returning
  `null` on any failure so the caller can render "ni podatkov".
- `src/signals.js` — merges all of the above into one snapshot per place,
  tagging every field `available: true/false`.
- `public/` — the dashboard frontend (Leaflet map, Socket.IO client).
