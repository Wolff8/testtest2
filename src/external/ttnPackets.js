// Real live LoRaWAN uplink packets from the operator's own TTN (The Things
// Network) applications, via TTN's v3 event stream API. Requires
// TTI_API_KEY - without it this module does nothing (no packets, no
// fabricated ones either). Only subscribes to applications that key has
// rights on (never arbitrary public devices - that data isn't public).
//
// This talks to a real, documented API but the exact event JSON shape
// could not be exercised against a live account from the sandbox this was
// built in (network access was restricted there), so parsing is
// defensive: a packet missing the fields we look for is just skipped
// rather than pushed as a broken row.

const REGION = "eu1.cloud.thethings.network";
const MAX_PACKETS = 150;
const packets = [];
let onPacket = null;

function setOnPacket(fn) {
  onPacket = fn;
}

function list() {
  return packets;
}

async function fetchApplications(apiKey) {
  const res = await fetch(`https://${REGION}/api/v3/applications?limit=20`, {
    headers: { authorization: `Bearer ${apiKey}`, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TTN applications HTTP ${res.status}`);
  const data = await res.json();
  return (data.applications || []).map((a) => a.ids && a.ids.application_id).filter(Boolean);
}

function payloadInfo(raw) {
  if (!raw || typeof raw !== "string") return { hex: "", bytes: 0 };
  try {
    const buf = Buffer.from(raw, "base64");
    return { hex: buf.toString("hex").slice(0, 96), bytes: buf.length };
  } catch {
    return { hex: "", bytes: 0 };
  }
}

function packetFromEvent(e) {
  const up = e.uplink_message || e.data?.uplink_message;
  if (!up) return null;
  const ids = e.end_device_ids || e.identifiers?.[0]?.device_ids || {};
  const meta = (up.rx_metadata || [])[0] || {};
  const settings = up.settings || {};
  const lora = settings.data_rate?.lora || {};
  const frm = payloadInfo(up.frm_payload);
  return {
    id: e.unique_id || `${up.received_at || Date.now()}-${ids.device_id || "pkt"}`,
    dir: "UL",
    dev: ids.device_id || ids.dev_eui || "?",
    app: ids.application_ids?.application_id || "",
    gtw: meta.gateway_ids?.gateway_id || "",
    time: up.received_at || new Date().toISOString(),
    mhz: settings.frequency ? (Number(settings.frequency) / 1e6).toFixed(1) : "",
    sf: lora.spreading_factor || null,
    rssi: typeof meta.rssi === "number" ? meta.rssi : null,
    snr: typeof meta.snr === "number" ? meta.snr : null,
    fcnt: up.f_cnt ?? null,
    fport: up.f_port ?? null,
    bytes: frm.bytes,
    hex: frm.hex,
    decoded: up.decoded_payload || null,
    source: "ttn-application-events",
  };
}

function push(p) {
  if (!p) return;
  if (packets.some((x) => x.id === p.id)) return;
  packets.unshift(p);
  if (packets.length > MAX_PACKETS) packets.length = MAX_PACKETS;
  if (onPacket) onPacket(p);
}

// Opens a persistent server-sent-events connection for one application's
// uplink stream and reconnects (with backoff) if it drops.
async function watchApplication(apiKey, appId) {
  const backoffMs = [3000, 8000, 20000, 45000];
  let attempt = 0;
  for (;;) {
    try {
      const res = await fetch(`https://${REGION}/api/v3/events`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          accept: "text/event-stream",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          identifiers: [{ application_ids: { application_id: appId } }],
          names: ["as.up.data.receive", "gs.up.receive", "ns.up.data.receive"],
          tail: 20,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`TTN events HTTP ${res.status} for ${appId}`);
      attempt = 0;
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let n;
        while ((n = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, n).trim();
          buf = buf.slice(n + 1);
          if (!line.startsWith("{")) continue;
          try {
            const j = JSON.parse(line);
            push(packetFromEvent(j.result || j));
          } catch {
            /* skip malformed line, never crash the watcher */
          }
        }
      }
    } catch (err) {
      /* fall through to retry below */
    }
    const delay = backoffMs[Math.min(attempt, backoffMs.length - 1)];
    attempt++;
    await new Promise((r) => setTimeout(r, delay));
  }
}

let started = false;

// Discovers the applications this key can see and starts a persistent
// watcher per application. Safe to call once at boot; a no-op without a
// key. Errors (bad key, no access) are logged, not thrown - a broken key
// should degrade to "no live packets", not crash the server.
async function start(apiKey) {
  if (!apiKey || started) return;
  started = true;
  try {
    const apps = await fetchApplications(apiKey);
    if (!apps.length) {
      console.warn("TTN: key is valid but has no applications to watch");
      return;
    }
    apps.slice(0, 6).forEach((appId) => {
      watchApplication(apiKey, appId).catch(() => {});
    });
    console.log(`TTN: watching live uplinks for ${apps.length} application(s)`);
  } catch (err) {
    console.warn("TTN: could not start live packet watch -", err.message);
    started = false;
  }
}

module.exports = { start, list, setOnPacket };
