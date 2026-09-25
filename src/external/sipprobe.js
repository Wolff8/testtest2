// Real active SIP health probe: sends a genuine SIP OPTIONS request over
// UDP to public SIP test servers and measures whether/how fast they
// respond. This is a real network measurement (a standard SIP
// keep-alive/health-check technique), not a fabricated status value — if
// a server doesn't answer, that's a real timeout, reported as such.

const { createSocket } = require("node:dgram");

const SIP_HOSTS = [
  { id: "iptel", host: "iptel.org", aor: "echo@iptel.org" },
  { id: "linphone", host: "sip.linphone.org", aor: "thetestcall@sip.linphone.org" },
  { id: "opensips", host: "opensips.org", aor: "thetestcall@opensips.org" },
];

function sipOptions(host, aor, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const sock = createSocket("udp4");
    const id = `snap${Date.now().toString(36)}`;
    const msg = [
      `OPTIONS sip:${aor} SIP/2.0`,
      `Via: SIP/2.0/UDP 0.0.0.0:5060;branch=z9hG4bK${id}`,
      `From: <sip:probe@invalid>;tag=${id}`,
      `To: <sip:${aor}>`,
      `Call-ID: ${id}@${host}`,
      "CSeq: 1 OPTIONS",
      "Max-Forwards: 70",
      "User-Agent: SignalsSnapNOC OPTIONS ping",
      "Content-Length: 0",
      "",
      "",
    ].join("\r\n");
    const t0 = Date.now();
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      try {
        sock.close();
      } catch {
        /* ignore */
      }
      resolve(result);
    };
    const timer = setTimeout(() => done({ host, aor, ok: false, status: "timeout", ms: Date.now() - t0 }), timeoutMs);
    sock.once("message", (buf) => {
      clearTimeout(timer);
      const line = String(buf).split("\r\n")[0];
      done({ host, aor, ok: /^SIP\/2\.0 [12]/.test(line), status: line, ms: Date.now() - t0 });
    });
    sock.once("error", (err) => {
      clearTimeout(timer);
      done({ host, aor, ok: false, status: err.message, ms: Date.now() - t0 });
    });
    sock.send(msg, 5060, host, (err) => {
      if (err) {
        clearTimeout(timer);
        done({ host, aor, ok: false, status: err.message, ms: Date.now() - t0 });
      }
    });
  });
}

async function pingAll() {
  return Promise.all(SIP_HOSTS.map((h) => sipOptions(h.host, h.aor).then((r) => ({ ...h, ...r }))));
}

module.exports = { pingAll };
