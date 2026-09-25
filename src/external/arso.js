// Real weather and hydrology data from ARSO's (Slovenian Environment
// Agency) public XML feeds — the same endpoints ARSO's own site loads,
// no key required. These are unofficial in the sense of having no
// published API contract, so both are parsed defensively.

const TIMEOUT_MS = 8000;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function getText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "user-agent": "signalssnap-noc/1.0 (public preview)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchMeteo(lat, lon, radiusKm) {
  try {
    const xml = await getText("https://meteo.arso.gov.si/uploads/probase/www/observ/surface/text/sl/observation_si_latest.xml");
    const docs = xml.split("<metData").slice(1).map((chunk) => "<metData" + chunk.split("</metData>")[0] + "</metData>");
    const out = [];
    for (const block of docs) {
      const pick = (tag) => block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1] || "";
      const slat = Number(pick("domain_lat"));
      const slon = Number(pick("domain_lon"));
      if (!slat || !slon) continue;
      const km = haversineKm(lat, lon, slat, slon);
      if (km > radiusKm) continue;
      out.push({
        id: pick("domain_meteosiId") || pick("domain_title"),
        name: pick("domain_longTitle") || pick("domain_title"),
        t: parseFloat(pick("t")),
        rh: parseFloat(pick("rh")),
        wind: parseFloat(pick("ff_val_kmh") || pick("ff_val")) || 0,
        dir: pick("dd_shortText"),
        sky: pick("nn_shortText") || pick("nn_decodeText"),
        lat: slat,
        lon: slon,
        km: Math.round(km * 10) / 10,
        source: "arso",
      });
    }
    out.sort((a, b) => a.km - b.km);
    return out.length ? out : null;
  } catch (err) {
    return null;
  }
}

async function fetchRivers(lat, lon, radiusKm) {
  try {
    const xml = await getText("https://www.arso.gov.si/xml/vode/hidro_podatki_zadnji.xml");
    const posts = xml.split("<postaja ").slice(1);
    const out = [];
    for (const chunk of posts) {
      const slat = Number(chunk.match(/wgs84_sirina="([^"]+)"/)?.[1] || 0);
      const slon = Number(chunk.match(/wgs84_dolzina="([^"]+)"/)?.[1] || 0);
      if (!slat || !slon) continue;
      const km = haversineKm(lat, lon, slat, slon);
      if (km > radiusKm) continue;
      const pick = (tag) => chunk.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1] || "";
      out.push({
        id: chunk.match(/sifra="([^"]+)"/)?.[1] || pick("ime"),
        name: pick("ime"),
        river: pick("reka"),
        cm: pick("vodostaj"),
        flow: pick("pretok"),
        temp: pick("temp_vode"),
        km: Math.round(km * 10) / 10,
        source: "arso",
      });
    }
    out.sort((a, b) => a.km - b.km);
    return out.length ? out.slice(0, 10) : null;
  } catch (err) {
    return null;
  }
}

module.exports = { fetchMeteo, fetchRivers };
