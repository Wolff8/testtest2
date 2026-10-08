# ASTERIX Surveillance Radar Engine & ARSO Slovenian Weather Radar Integration

Integrates a direct SDR surveillance pipeline decoding binary Eurocontrol ASTERIX (Cat 021 ADS-B and Cat 048 Monopulse SSR/PSR) with automatic failover to regional receiver grids and recorded historical replays, paired with a calibrated ARSO Slovenian precipitation radar layer with real-time opacity controls.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via interactive clarification:

- **ASTERIX Data Stream Format**: Binary ASTERIX stream with full decoder support for Category 021 (ADS-B target reports, 24-bit ICAO, WGS-84 coordinates, barometric altitude, track angle, ground speed) and Category 048 (Monopulse SSR / Primary Surveillance Radar target reports, polar slant range and azimuth resolved to geographic coordinates, Mode 3/A squawk, flight level).
- **Radar Failover Behavior**: Automatic seamless failover to regional `adsb.lol` receiver grid combined with calibrated regional ASTERIX replay packets whenever the direct SDR node (`http://100.67.196.96:3000/api/sdr/raw`) is unreachable or offline, ensuring uninterrupted situational awareness.
- **ARSO Weather Radar Mode**: Static ARSO Slovenian composite precipitation radar tile layer on Leaflet with smooth opacity slider controls and station rain gauge metrics.

---

## 1. Overview & Core Concept

- **What It Does**: Connects the SignalsSnap NOC to an SDR node emitting raw binary ASTERIX data, parses surveillance targets (Cat 021 & Cat 048), plots radar sweeps and target tracks on Leaflet, and overlays live ARSO Slovenian precipitation radar with interactive transparency control.
- **Target Audience / Persona**: NOC operators, radio amateurs, aerospace enthusiasts, and regional dispatchers monitoring railway, airspace, and weather conditions across Slovenia.
- **Key Value**: Unifies primary and secondary radar telemetry (ASTERIX Cat 021/048) with meteorological ground truths (ARSO radar & river gauges) without relying on single-point network availability.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Surveillance Radar Inspection**:
   - Operator opens the **Radar (ASTERIX)** tab or activates the **Radar** map layer.
   - The system displays active radar tracks: Target ID, Cat type (Cat 021 ADS-B vs Cat 048 Primary/Secondary Radar), Flight Level, Squawk, slant range, azimuth, and Doppler/ground speed.
   - Status badge indicates whether feed is streaming from **Primary SDR Node (100.67.196.96)**, **Failover Regional Grid**, or **Replay Engine**.
2. **ARSO Precipitation Radar Layering**:
   - Operator clicks the **ARSO Vreme & Radar** map layer.
   - An interactive opacity scrubber appears in the map toolbar (`0%` to `100%`).
   - The official ARSO precipitation composite is projected onto Slovenia's geographic bounds (`45.42°N, 13.38°E` to `46.88°N, 16.61°E`), allowing operators to correlate low-altitude flights and rail operations with storm fronts.
3. **Failover & Replay Controls**:
   - Operator can manually test failover modes: switch between **Auto (SDR with Fallback)**, **Force SDR Node**, **Regional Grid**, and **Historical Replay** with simulated radar sweeps.

### Visual Identity & Theme

- **Aesthetic Direction**: Clinical aerospace telemetry and tactical NOC console (dark obsidian `#03050a` / `#070b14`, hairline borders `#1e293b`).
- **Color Hierarchy**:
  - `60% Neutral Canvas`: Space black `#03050a` with `#070b14` panels.
  - `30% Structural Panels`: Flat slate `#0f172a`, hairline borders `#1e293b`.
  - `10% Precision Accents`: Phosphor radar green `#10b981` (Cat 048 primary returns), laser cyan `#06b6d4` (Cat 021 ADS-B), and radar amber `#f59e0b` (failover/alerts).
- **Typography**: Clean neo-grotesque (`Plus Jakarta Sans`) for navigation and section headers; strict tabular monospace (`JetBrains Mono tabular-nums`) for coordinates, squawks, bearings, and radar metrics.
- **Map Visualizations**: Custom radar sweep beam simulation, range rings (10 NM, 20 NM, 40 NM), blip trails, and calibrated ARSO precipitation overlay.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Server-Side ASTERIX Binary Parser with Resilient Fallback
- **Chosen Approach**: Parse ASTERIX binary frames on the Node.js backend. Attempt connection to `http://100.67.196.96:3000/api/sdr/raw` with a 2.5-second timeout; upon failure, immediately synthesize realistic Cat 021/048 records from real regional ADS-B data combined with recorded local radar sweeps.
- **Why**: `100.67.196.96` is a Tailscale/CGNAT address that may be inaccessible outside the operator's VPN. Robust failover prevents request hanging or dashboard degradation.
- **Alternatives Considered**: Direct browser fetch to `100.67.196.96` (fails due to CORS, mixed-content, and private subnet routing).

### Decision 2: Static ARSO Radar Layer with Precise Geo-Registration
- **Chosen Approach**: Use Leaflet `L.imageOverlay` mapped to calibrated Slovenian bounding box coordinates, sourced via ARSO's live composite radar endpoint (`https://meteo.arso.gov.si/uploads/probase/www/observ/radar/si0-rm.gif`) with a server proxy to avoid CORS issues and cache freshness.
- **Why**: Lightweight, zero external API keys required, native opacity blending directly over Leaflet dark tiles.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SignalsSnap NOC Client                          │
│                                                                        │
│   ┌─────────────────────────────┐    ┌─────────────────────────────┐   │
│   │   Leaflet Tactical Map      │    │    Inspector Tab Panel      │   │
│   │ ─────────────────────────── │    │ ─────────────────────────── │   │
│   │ • Range rings (10/20/40 NM) │    │ • Vlaki (trains)            │   │
│   │ • ASTERIX Blips (021 / 048) │    │ • Letala (ADS-B)            │   │
│   │ • ARSO Radar Overlay & Bar  │    │ • Radar (ASTERIX SDR Engine)│   │
│   │ • Train / Station Markers   │    │ • Vreme & Reke (ARSO)       │   │
│   └──────────────▲──────────────┘    └──────────────▲──────────────┘   │
└──────────────────┼──────────────────────────────────┼──────────────────┘
                   │ HTTP / Socket.IO                 │
┌──────────────────▼──────────────────────────────────▼──────────────────┐
│                         Express Backend Server                         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    /api/sdr/asterix & /api/signals                │  │
│  └───────────────────▲──────────────────────────────▲───────────────┘  │
│                      │                              │                  │
│       ┌──────────────┴──────────────┐   ┌───────────┴──────────┐       │
│       │   ASTERIX Engine & Parser   │   │  ARSO Weather &      │       │
│       │   (src/external/asterix.js) │   │  Radar Proxy         │       │
│       └──────┬───────────────┬──────┘   └──────────────────────┘       │
│              │               │                                         │
│       ┌──────▼─────┐  ┌──────▼───────────────────────────┐             │
│       │ Primary    │  │ Automatic Failover               │             │
│       │ SDR Node   │  │ • adsb.lol Regional Grid         │             │
│       │ 100.67.x.x │  │ • Regional ASTERIX Replay Buffer │             │
│       └────────────┘  └──────────────────────────────────┘             │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

- `src/external/asterix.js`:
  - Implements ASTERIX Category 021 (ADS-B) and Category 048 (Monopulse SSR) binary frame unpackers.
  - Connects to `http://100.67.196.96:3000/api/sdr/raw` with fallback detection.
  - Provides sample replay buffer with realistic tracks centered on Slovenia/Pomurje/Ljubljana airspace.
- `server.js`:
  - Registers `/api/sdr/asterix` and `/api/radar/arso-image` (cached proxy for ARSO radar GIF to bypass CORS).
  - Integrates ASTERIX surveillance items into `/api/signals`.
- `public/app.js` & `public/index.html`:
  - Adds **Radar (ASTERIX)** inspector tab with live target telemetry table.
  - Adds **ARSO Radar** Leaflet overlay with an opacity slider control (`0%` - `100%`).
  - Displays radar source status badge: `SDR (Živo)`, `Preklop na mrežo`, or `Posnetek`.
