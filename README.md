# SignalsSnap NOC

An unofficial concept dashboard for GSM-R, LoRaWAN and multi-sensor railway
telemetry along the Hodoš–Maribor corridor (Pomurje region, Slovenia). Not
affiliated with, and not an official tool of, SŽ, DRI, or ARSO.

## Run it

```bash
npm install
npm start
```

Then open http://localhost:3000.

Optional: copy `.env.example` to `.env` and set `APRS_FI_API_KEY` (a free
key from https://aprs.fi/page/api) to enable live APRS lookups; without it
APRS stations show as demo data.

## What's real vs. simulated

| Feature | Status | Notes |
|---|---|---|
| Trains, GSM-R signal, ETCS level | **Simulated** | Runs a small server-side physics simulation along the real Hodoš–Maribor corridor and derives signal strength from distance to the nearest real GSM-R site. There's no public live SŽ vehicle-position feed to plug in here — Transitous only exposes journey planning, not per-train telemetry. |
| GSM-R base station locations | Static reference data | Planning-grade coordinates, not fetched from an API. |
| LoRaWAN/GSM-R packet capture, SIP status | **Simulated** | No real LoRaWAN gateway or SIP trunk exists behind this app; the packet stream is generated from the live train simulation so the table has continuous, plausible activity. |
| Aircraft (ADS-B) | **Live**, via [adsb.lol](https://api.adsb.lol/) (no key) | Falls back to two demo aircraft if the API is unreachable or times out. |
| ISS position | **Live**, via [Open Notify](http://open-notify.org/) (no key) | Falls back to a fixed demo position on failure. |
| Weather | **Best-effort live**, via ARSO's unofficial `vreme.arso.gov.si` JSON feed | This is an undocumented, unofficial endpoint (not a published API contract), so it's read defensively and falls back to demo stations on any shape mismatch or failure. |
| Rivers/hydro | Demo only | No verified public real-time hydro endpoint is wired in yet. |
| APRS | **Live if `APRS_FI_API_KEY` is set**, via [aprs.fi](https://aprs.fi/page/api) | aprs.fi's free API is a callsign lookup, not a radius search, so this checks a small fixed watchlist rather than discovering arbitrary nearby stations. |
| Ham repeaters | Demo/static | No public API for this exists; kept as reference data. |

**Important caveat on the live integrations:** the external API calls
(ADS-B, ISS, ARSO, aprs.fi) were written against each service's documented
or commonly-used shape, but the sandbox this was built in had outbound
network access blocked by policy, so none of them could be exercised
against the live network before this was pushed. Each call is wrapped so a
failure or a shape mismatch just falls back to demo data rather than
crashing the endpoint — but please smoke-test `/api/signals` once you run
this somewhere with normal internet access, and treat the ARSO adapter in
particular as unverified until then.

## Architecture

- `server.js` — Express app serving `public/` statically, JSON routes
  (`/api/signals`, `/api/lora`, `/api/sip`), and a Socket.IO `feed` event
  broadcast every 3 seconds so connected clients know to refetch.
- `src/trainSim.js` — server-authoritative train simulation.
- `src/loraSim.js` — simulated packet capture + SIP latency.
- `src/geo.js` — shared geo helpers and static reference data (GSM-R
  sites, corridor polyline, place bounding boxes).
- `src/external/*.js` — one adapter per external data source, each
  returning `null` on any failure so the caller can fall back to demo data.
- `src/signals.js` — merges all of the above into one snapshot per place.
- `public/` — the dashboard frontend (Leaflet map, Socket.IO client).
