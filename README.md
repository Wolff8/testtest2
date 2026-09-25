# SignalsSnap NOC

An unofficial concept dashboard for real public rail, air, weather, and
amateur-radio data around the Hodoš–Maribor corridor (Pomurje region,
Slovenia). Not affiliated with, and not an official tool of, SŽ, DRI, or
ARSO.

**No field is ever fabricated or randomly generated.** Every value shown is
either fetched live from a real public source, or measured by an active
real probe (SIP), or the panel explicitly says "ni podatkov" (no data)
when a source is unreachable — it never substitutes a made-up number.

## Run it

```bash
npm install
npm start
```

Then open http://localhost:3000.

Optional: copy `.env.example` to `.env` and set `TTI_API_KEY` (a TTN/TTI
API key for gateways registered under your own account) for deeper
per-gateway LoRaWAN connection stats. Without it, the LoRaWAN panel still
shows the public Packet Broker gateway list.

## Data sources

| Feature | Source | Notes |
|---|---|---|
| Trains | [Transitous](https://transitous.org) real published timetable | No public live GPS feed exists for SŽ trains. Position is a straight-line interpolation between two real station coordinates, based on elapsed time between two real scheduled stop times for the same trip. Only trains currently between two such stops are shown. |
| Railway stations | [OpenStreetMap Overpass API](https://overpass-api.de) | Real community-mapped `railway=station` nodes. SŽ does not publish GSM-R/telecom infrastructure locations, so this is stations only. |
| Aircraft | [adsb.lol](https://api.adsb.lol/) (no key) | Live ADS-B near the selected place. |
| ISS position | [Open Notify](http://open-notify.org/) (no key) | Live. |
| Weather | ARSO's public `observation_si_latest.xml` feed | The same feed ARSO's own site loads; unofficial in the sense of having no published API contract, parsed defensively. |
| Rivers/hydro | ARSO's public `hidro_podatki_zadnji.xml` feed | Same caveat as weather. |
| APRS | Live [APRS-IS](http://www.aprs-is.net/) feed (`rotate.aprs2.net:14580`), geo-filtered | The real amateur-radio APRS network itself, not a polling API — no key needed. An empty list shortly after the server starts, or in a quiet area, is a real "nothing heard yet" state, not a failure. |
| SIP | Real active `OPTIONS` probe (UDP) to iptel.org, sip.linphone.org, opensips.org | A genuine network health check, not a status flag — a real timeout shows as "ni odziva". |
| LoRaWAN gateways | [Packet Broker](https://www.packetbroker.org/) public mapper API (no key) | Real public gateway locations/online status. Deeper per-gateway uplink/downlink counts if `TTI_API_KEY` is set, scoped to gateways that key can see. |
| Amateur radio repeaters | [Hearham](https://hearham.com/) public API (no key) | Community-maintained database. |

**Important caveat:** this was built in a sandbox whose outbound network
access was restricted by policy, so none of the external calls above
could be exercised against the live network before being pushed. Each
adapter (`src/external/*.js`) is written defensively against each
service's documented or commonly-used response shape and returns `null`
(or an empty list, where empty is a legitimate real state) on any failure
or mismatch, so a wrong assumption surfaces as "ni podatkov" in the UI
rather than breaking the app or showing fabricated data — but please
smoke-test `/api/signals` once you run this with normal internet access.
The Transitous and ARSO integrations are the least certain and most
likely to need a field-name adjustment.

## Architecture

- `server.js` — Express app serving `public/` statically, the
  `/api/signals` route, a Socket.IO `feed` event broadcast every 30
  seconds telling connected clients to refetch, and starts the persistent
  APRS-IS background feed on boot.
- `src/trainSchedule.js` — turns real Transitous timetable data into a
  schedule-estimated position; returns `[]` if no real data is available.
- `src/geo.js` — generic geo math (haversine, bearing) and map-view
  presets only, no data.
- `src/external/*.js` — one adapter per external source. HTTP-based ones
  return `null` on any failure; `aprsis.js` runs a persistent background
  TCP connection and exposes recently-heard stations.
- `src/signals.js` — merges all of the above into one snapshot per place,
  tagging every field `available: true/false`.
- `public/` — the dashboard frontend (Leaflet map, Socket.IO client).
