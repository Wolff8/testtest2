// Simulated LoRaWAN / GSM-R air-interface packet capture and SIP link
// status. There is no real LoRaWAN gateway or SIP trunk behind this app,
// so this generates a plausible, continuously-updating packet stream
// derived from the live train simulation state.

const packets = [];
const MAX_PACKETS = 200;

function generate(trains) {
  if (!trains.length || Math.random() >= 0.75) return;
  const t = trains[Math.floor(Math.random() * trains.length)];
  const isFail = Math.random() < 0.06;
  const dir = Math.random() < 0.5 ? "UL" : "DL";
  packets.unshift({
    id: `pk-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    dir,
    mType: isFail ? "CRC_FAIL" : "TRAIN",
    gtw: t.gsmr.site.ref,
    dev: t.name,
    mhz: (921.2 + Math.random() * 3).toFixed(1),
    sf: "GSM-R",
    rssi: t.gsmr.rssi,
    snr: t.gsmr.snr,
    time: new Date().toISOString(),
    decoded: { spd: Math.round(t.speed), etcs: t.ertms.etcs, cell: t.gsmr.site.ref, km: t.gsmr.km },
    raw: { train: t.id, lat: +t.lat.toFixed(5), lon: +t.lon.toFixed(5), heading: Math.round(t.heading) },
  });
  if (packets.length > MAX_PACKETS) packets.length = MAX_PACKETS;
}

function list(kind) {
  if (kind === "air") return packets;
  return packets;
}

function sipStatus() {
  return {
    hosts: [{ id: "iptel", ms: Math.round(40 + Math.random() * 20) }],
  };
}

module.exports = { generate, list, sipStatus };
