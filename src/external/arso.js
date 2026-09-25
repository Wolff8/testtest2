// Best-effort live weather from ARSO's (Slovenian Environment Agency)
// public JSON feed, e.g. https://vreme.arso.gov.si/api/1.0/location/?location=<slug>
// This is an unofficial, undocumented endpoint used by several community
// projects rather than a published/stable API contract, so every field is
// read defensively and any shape mismatch or failure falls back to demo
// stations instead of breaking the dashboard. It could not be exercised
// against the live network from the environment this was built in
// (outbound access was restricted there) — verify once deployed somewhere
// with normal internet access, and treat this adapter as best-effort.

const TIMEOUT_MS = 6000;

const STATION_SLUGS = {
  ms: "murska_sobota_-_rakican",
  pomurje: "murska_sobota_-_rakican",
  lendava: "lendava",
  ljutomer: "murska_sobota_-_rakican",
  radgona: "gornja_radgona",
  lj: "ljubljana_-_bezigrad",
  si: "ljubljana_-_bezigrad",
};

async function fetchMeteo(place) {
  const slug = STATION_SLUGS[place] || STATION_SLUGS.ms;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://vreme.arso.gov.si/api/1.0/location/?location=${encodeURIComponent(slug)}`;
    const res = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`ARSO HTTP ${res.status}`);
    const data = await res.json();
    const obs = data?.features?.[0]?.properties?.days?.[0]?.timeline?.[0];
    if (!obs) throw new Error("unexpected ARSO payload shape");
    return [
      {
        id: slug,
        name: data?.features?.[0]?.properties?.title || slug,
        t: typeof obs.t === "number" ? obs.t : parseFloat(obs.t),
        rh: typeof obs.rh === "number" ? obs.rh : parseFloat(obs.rh),
        wind: typeof obs.ff_val === "number" ? obs.ff_val : parseFloat(obs.ff_val) || 0,
        dir: obs.dd_shortText || "—",
        sky: obs.clouds_shortText || obs.clouds_icon_wwsyn_shortText || "—",
        source: "arso",
      },
    ];
  } catch (err) {
    return null; // caller falls back to demo stations
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchMeteo };
