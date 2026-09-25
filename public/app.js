// ========================================================================
// ICONS (inline SVG — no external icon font dependency)
// ========================================================================
const ICONS = {
  tower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M8 6a4 4 0 0 1 8 0M5.5 9a7 7 0 0 1 13 0M4 22l2-9M20 22l-2-9"/></svg>',
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 12h14M8 16l-2 4M16 16l2 4M9 7h6"/><circle cx="8.5" cy="18.5" r=".6" fill="currentColor" stroke="none"/><circle cx="15.5" cy="18.5" r=".6" fill="currentColor" stroke="none"/></svg>',
  plane: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 15.5l-7-4V4.8c0-1-1.5-1.8-2.2-1-.4.4-.6.9-.6 1.4v6.3l-7 4v2l7-2.1v5l-2.4 1.8v1.4l3.4-1 3.4 1v-1.4L13.2 20v-5l7 2.1z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h11a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.5 12.1 4 4 0 0 0 7 18z"/><circle cx="18" cy="5" r="1.3" fill="currentColor" stroke="none"/></svg>',
  wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 15c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/></svg>',
  radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="15" r="3"/><path d="M12 12V4m-4 4l4-4 4 4M6 19h12"/></svg>',
  sat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M3 3l4 4M21 3l-4 4M3 21l4-4M21 21l-4-4M10.5 13.5l-6 6M13.5 10.5l6-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5c0 8 7 15 15 15l2-4-5-2-2 2c-2-1-4-3-5-5l2-2-2-5z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9 4l6 2 5-2v14l-5 2-6-2-5 2V6z"/><path d="M9 4v14M15 6v14"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  compress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg>'
};
function paintIcons(root) {
  (root || document).querySelectorAll('[data-i]').forEach(el => {
    if (!el.dataset.painted) { el.innerHTML = ICONS[el.dataset.i] || ''; el.dataset.painted = '1'; }
  });
}

function fmtCoord(lat, lon) { return (lat == null || lon == null) ? "—" : `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`; }
function rssiPct(rssi) { if (rssi == null) return 0; return Math.max(0, Math.min(100, Math.round(((rssi + 112) / 67) * 100))); }
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

let isSlovenian = true;
let currentPlace = "ms";
let activeSnap = { trains: [], planes: [], meteo: [], rivers: [], ham: [], aprs: [], board: [], gsmrSites: [], iss: null, lat: 46.68, lon: 16.16 };
let selectedTrainId = null;
let livePackets = [];
let currentFilter = 'ALL';
let activeInspectorTab = 'trains';

let map = null;
let railwayLineLayer = null;
const layerGroups = { trains: null, gsmr: null, planes: null, meteo: null, aprs: null };
const layerVisibility = { trains: true, gsmr: true, planes: true, meteo: true, aprs: false };
let activeModalPacket = null;

function selectedTrain() {
  return activeSnap.trains.find(t => t.id === selectedTrainId) || activeSnap.trains[0] || null;
}

function computeErtmsClient(t) {
  if (t.ertms) return t.ertms;
  const line = t.gsmr && t.gsmr.site ? String(t.gsmr.site.line) : "";
  let etcs = "L0", stm = "national / GSM-R", corridor = "Pomurje", area = "Murska Sobota";
  if (["10", "20", "60"].includes(line)) { etcs = "L1"; stm = "ETCS + national"; corridor = "TEN-T"; area = "Ljubljana"; }
  else if (line === "30") { etcs = "L1"; stm = "ETCS + national"; corridor = "TEN-T / 30"; area = "Maribor"; }
  const rssi = t.gsmr ? t.gsmr.rssi : null;
  const qos = rssi == null ? "—" : rssi >= -70 ? "good" : rssi >= -85 ? "fair" : "weak";
  return { etcs, stm, corridor, area, op: t.speed > 2 ? "run" : "standby", voice: t.speed > 2 ? "CIRCUIT" : "IDLE", qos };
}

// ========================================================================
// ERTMS WINDOW
// ========================================================================
function renderErtmsWindow() {
  const mount = document.getElementById('ertmsWindowMount');
  const t = selectedTrain();
  const sl = isSlovenian;
  if (!t) { mount.innerHTML = `<div class="s-ertms empty">${sl ? "Ni podatkov o vlakih." : "No train data."}</div>`; return; }
  const e = computeErtmsClient(t);
  const g = t.gsmr;
  const bar = rssiPct(g ? g.rssi : null);
  mount.innerHTML = `
    <section class="s-ertms">
      <header>
        <div class="s-title">
          <small>ERTMS &middot; ETCS &middot; GSM-R</small>
          <strong>${t.name}</strong>
          <span>${t.from} &rarr; ${t.to}</span>
        </div>
        <span class="text-[10px] px-2 py-0.5 h-fit rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold font-mono">${e.etcs} &middot; ${e.op}</span>
      </header>
      <div class="s-ertms-grid">
        <div class="s-ertms-pane">
          <div>
            <small>STM / omrežje</small>
            <b style="font-size:1rem">${e.stm}</b>
            <ul>
              <li><i>Koridor</i><span>${e.corridor}</span></li>
              <li><i>Območje</i><span>${e.area}</span></li>
              <li><i>Napredek</i><span>${t.progressPct ?? 0}%</span></li>
            </ul>
          </div>
          <div class="s-bar"><i style="width:${t.progressPct ?? 0}%"></i></div>
        </div>
        <div class="s-ertms-pane gsmr ${e.qos}">
          <div>
            <small>GSM-R signal</small>
            <b>${g ? g.rssi : "—"}<em>dBm</em></b>
            <ul>
              <li><i>Celica</i><span>${g ? g.site.ref : "—"}${g ? ` &middot; ${g.km} km` : ""}</span></li>
              <li><i>SNR</i><span>${g ? g.snr + " dB" : "—"}</span></li>
              <li><i>QoS</i><span>${e.qos} &middot; ${e.voice}</span></li>
            </ul>
          </div>
          <div class="s-bar gsmr ${e.qos}"><i style="width:${bar}%"></i></div>
        </div>
      </div>
      <footer>
        <span>${fmtCoord(t.lat, t.lon)} &middot; ${Math.round(t.speed)} km/h &middot; ${Math.round(t.heading)}&deg;</span>
        <em>${sl ? "razred proge + ocena RSSI — simulacija, ni kabina ETCS" : "line class + RSSI estimate — simulated, not cab ETCS"}</em>
      </footer>
    </section>`;
  paintIcons(mount);
  renderEnrichedSensors();
}
function toggleErtmsLanguage() { isSlovenian = !isSlovenian; document.getElementById('langLabel').innerText = isSlovenian ? "SL" : "EN"; renderErtmsWindow(); }

function renderEnrichedSensors() {
  const container = document.getElementById('sensorsGridContainer');
  const waysideEl = document.getElementById('waysideIndicator');
  const t = selectedTrain();
  if (!t) { container.innerHTML = '<div class="col-span-full text-slate-500 py-2 text-center">Ni izbranega vlaka.</div>'; return; }
  waysideEl.innerHTML = `Obprogovni element: <span class="text-amber-300 font-bold">${t.gsmr.site.name} (${t.gsmr.km} km)</span>`;
  const sensors = [
    { label: "Hitrost", val: Math.round(t.speed), unit: "km/h" },
    { label: "Smer", val: Math.round(t.heading), unit: "°" },
    { label: "GSM-R signal", val: t.gsmr.rssi, unit: "dBm" },
    { label: "Bazna celica", val: t.gsmr.site.ref },
    { label: "Temp. tirnic", val: t.trackTemp, unit: "°C" },
    { label: "Preostanek", val: t.etaMin, unit: "min" }
  ];
  container.innerHTML = sensors.map(s => `<div class="p-2 rounded-xl bg-space-950 border border-slate-800 flex flex-col justify-between">
      <div class="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between"><span>${s.label}</span><span class="text-[8px] text-emerald-400">QC 192</span></div>
      <div class="text-sm sm:text-base font-bold text-white mt-1">${s.val}<span class="text-[10px] text-slate-400 font-normal"> ${s.unit || ''}</span></div>
    </div>`).join('');
}

// ========================================================================
// SERVER SYNC
// ========================================================================
function changePlace(p) {
  currentPlace = p;
  document.getElementById('boardStationLabel').innerText = document.getElementById('placeSelect').selectedOptions[0].text;
  refreshAllServerData();
}
async function refreshAllServerData() {
  const icon = document.getElementById('refreshIcon');
  icon.style.transition = 'transform .6s'; icon.style.transform = 'rotate(360deg)';
  setTimeout(() => { icon.style.transition = ''; icon.style.transform = ''; }, 650);
  try {
    await Promise.allSettled([fetchSignalsSnap(), fetchLoraAirEndpoint(), fetchSipStatus()]);
    document.getElementById('backendStatusText').innerText = "NODE API (200 OK)";
    document.getElementById('backendStatusBadge').classList.remove('text-rose-400', 'bg-rose-950/60', 'border-rose-500/30');
    document.getElementById('backendStatusBadge').classList.add('text-emerald-400', 'bg-emerald-950/60', 'border-emerald-500/30');
  } catch (e) {
    document.getElementById('backendStatusText').innerText = "STREŽNIK NEDOSEGLJIV";
  } finally {
    document.getElementById('lastApiUpdateTime').innerText = `Sinhronizirano: ${new Date().toLocaleTimeString('sl-SI')}`;
    updateAllUiViews();
  }
}
async function fetchSignalsSnap() {
  const res = await fetch(`/api/signals?place=${encodeURIComponent(currentPlace)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  activeSnap = data;
  if (!selectedTrainId && data.trains.length) selectedTrainId = data.trains[0].id;
  if (selectedTrainId && !data.trains.find(t => t.id === selectedTrainId)) selectedTrainId = data.trains[0]?.id || null;
}
async function fetchLoraAirEndpoint() {
  const res = await fetch('/api/lora?kind=air');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data.items)) livePackets = data.items;
}
async function fetchSipStatus() {
  const res = await fetch('/api/sip');
  if (!res.ok) return;
  const data = await res.json();
  if (Array.isArray(data.hosts) && data.hosts.length) {
    document.getElementById('sipStatusVal').innerText = `${data.hosts[0].id} (${data.hosts[0].ms} ms)`;
  }
}

// ========================================================================
// UI VIEWS
// ========================================================================
function updateAllUiViews() {
  document.getElementById('badgeCountTrains').innerText = `${activeSnap.trains.length} vlakov`;
  document.getElementById('badgeCountGsmr').innerText = `${activeSnap.gsmrSites.length} GSM-R`;
  document.getElementById('badgeCountPlanes').innerText = `${activeSnap.planes.length} letal`;
  document.getElementById('badgeCountMeteo').innerText = `${activeSnap.meteo.length} ARSO`;
  document.getElementById('badgeCountRivers').innerText = `${activeSnap.rivers.length} rek`;
  document.getElementById('badgeCountAprs').innerText = `${activeSnap.aprs.length} APRS`;
  if (activeSnap.iss) {
    document.getElementById('issText').innerText = `ISS: ${activeSnap.iss.km} km${activeSnap.iss.source === 'demo' ? ' (demo)' : ''}`;
  }
  renderErtmsWindow();
  renderTrainTabs();
  renderTrainRoster();
  renderStationBoard();
  renderPlanesList();
  renderMeteoAndRiversList();
  renderAprsAndHamList();
  renderPacketsTable();
  updateMapLayers();
  updateHud();
}
function updateHud() {
  const t = selectedTrain();
  if (!t) return;
  document.getElementById('hudName').innerText = t.name;
  document.getElementById('hudRoute').innerText = `${t.from} → ${t.to}`;
  document.getElementById('hudRssi').innerText = `${t.gsmr.rssi} dBm`;
  document.getElementById('hudSnr').innerText = `${t.gsmr.snr} dB`;
  document.getElementById('hudSpd').innerText = `${Math.round(t.speed)} km/h`;
  document.getElementById('hudTrack').innerText = `${t.trackTemp} °C`;
}
function selectTrain(id) {
  selectedTrainId = id;
  renderErtmsWindow(); renderTrainTabs(); renderTrainRoster(); updateHud();
  const t = selectedTrain();
  if (map && t) map.flyTo([t.lat, t.lon], 12, { duration: 1.2 });
}
function renderTrainTabs() {
  const c = document.getElementById('fleetTabsContainer');
  c.innerHTML = activeSnap.trains.map(t => {
    const sel = t.id === selectedTrainId;
    return `<button onclick="selectTrain('${t.id}')" class="px-3 py-1.5 rounded-xl shrink-0 transition flex items-center gap-1.5 font-bold ${sel ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-space-900 text-slate-300 hover:bg-slate-800 border border-slate-800'}">
      <span class="ic text-amber-400" data-i="train"></span><span>${t.name}</span>
      <span class="text-[9px] px-1 rounded ${t.speed > 2 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'} font-normal">${Math.round(t.speed)} km/h</span>
    </button>`;
  }).join('');
  paintIcons(c);
  document.getElementById('trainsCounterText').innerText = `${activeSnap.trains.length} vlakov`;
}
function renderTrainRoster() {
  const c = document.getElementById('trainSignalsList');
  c.innerHTML = activeSnap.trains.map(t => {
    const sel = t.id === selectedTrainId;
    const e = computeErtmsClient(t);
    return `<div onclick="selectTrain('${t.id}')" class="p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${sel ? 'bg-amber-500/20 border-amber-500/50' : 'bg-space-900 border-slate-800 hover:border-slate-700'}">
      <div>
        <div class="flex items-center gap-1.5 font-bold font-mono text-white text-xs"><span class="ic text-amber-400" data-i="train"></span><span>${t.name}</span>
          <span class="text-[9px] px-1 rounded ${t.speed > 2 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'} font-normal">${t.speed > 2 ? 'v teku' : 'postanek'}</span></div>
        <div class="text-[10px] text-slate-400 font-mono mt-0.5">${t.from} → ${t.to} · ${Math.round(t.speed)} km/h</div>
      </div>
      <div class="text-right font-mono text-[10px]">
        <div class="text-emerald-400 font-bold">${t.gsmr.rssi} dBm</div>
        <div class="text-slate-400">${e.etcs} · ${t.gsmr.site.ref}</div>
      </div>
    </div>`;
  }).join('');
  paintIcons(c);
}
function renderStationBoard() {
  document.getElementById('stationBoardList').innerHTML = (activeSnap.board || []).map(b => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800/80 flex items-center justify-between">
    <div class="truncate"><span class="font-bold text-amber-400">${b.name}</span><span class="text-slate-400 text-[10px] ml-1">→ ${b.dest}</span></div>
    <span class="text-emerald-400 text-[10px] shrink-0 ml-2">${b.at}</span></div>`).join('');
}
function renderPlanesList() {
  const c = document.getElementById('planesListContainer');
  const planes = activeSnap.planes || [];
  document.getElementById('planesSourceLabel').innerText = planes.length && planes[0].source === 'live' ? 'živo' : 'demo';
  c.innerHTML = planes.length === 0
    ? '<div class="p-3 text-slate-500 text-center">Ni zaznanih letal v območju.</div>'
    : planes.map(p => {
        const km = haversineKm(activeSnap.lat, activeSnap.lon, p.lat, p.lon);
        return `<div class="p-2 rounded-xl bg-space-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
          <div><div class="flex items-center gap-1.5 font-bold text-sky-400"><span class="ic" data-i="plane" style="display:inline-block;transform:rotate(${p.track || 0}deg)"></span><span>${p.flight || p.id}</span><span class="text-[9px] px-1 rounded bg-slate-800 text-slate-300 font-normal">${p.type || 'A/C'}</span></div>
          <div class="text-[10px] text-slate-400 mt-0.5">Squawk: ${p.squawk || '—'} · Smer: ${p.track || 0}° · ${km.toFixed(0)} km</div></div>
          <div class="text-right text-[10px]"><div class="text-amber-300 font-bold">${p.alt ?? '—'} ft</div><div class="text-slate-400">${p.gs ?? '—'} vozlov</div></div></div>`;
      }).join('');
  paintIcons(c);
}
function renderMeteoAndRiversList() {
  const meteo = activeSnap.meteo || [];
  document.getElementById('meteoSourceLabel').innerText = meteo.length && meteo[0].source === 'arso' ? 'živo' : 'demo';
  document.getElementById('meteoListContainer').innerHTML = meteo.map(m => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
    <div class="truncate"><span class="font-bold text-white">${m.name}</span><span class="text-slate-400 text-[10px] ml-1">(${m.sky || '—'})</span></div>
    <div class="text-right text-[10px] shrink-0 ml-2"><span class="text-emerald-400 font-bold">${m.t} °C</span><span class="text-slate-400 ml-1">${m.wind} km/h ${m.dir}</span></div></div>`).join('');
  document.getElementById('riversListContainer').innerHTML = (activeSnap.rivers || []).map(r => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
    <div class="truncate"><span class="font-bold text-blue-400">${r.river}</span><span class="text-slate-400 text-[10px] ml-1">${r.name}</span></div>
    <div class="text-right text-[10px] shrink-0 ml-2"><span class="text-cyan-300 font-bold">${r.cm} cm</span><span class="text-slate-400 ml-1">${r.flow} m³/s</span></div></div>`).join('');
}
function renderAprsAndHamList() {
  const aprs = activeSnap.aprs || [];
  document.getElementById('aprsSourceLabel').innerText = aprs.length && aprs[0].source === 'aprs.fi' ? 'živo' : 'demo';
  document.getElementById('aprsListContainer').innerHTML = aprs.map(a => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
    <div class="truncate"><span class="font-bold text-purple-400">${a.call}</span><span class="text-slate-400 text-[9px] ml-1 truncate">${a.comment || a.path || ''}</span></div>
    <div class="text-right text-[10px] shrink-0 ml-2 text-slate-400">${Math.round(a.age || 0)}s</div></div>`).join('');
  document.getElementById('hamListContainer').innerHTML = (activeSnap.ham || []).map(h => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
    <div><span class="font-bold text-white">${h.call}</span><span class="text-slate-400 text-[10px] ml-1">${h.city} (${h.mode})</span></div>
    <div class="text-right text-[10px] text-amber-300 font-bold">${h.mhz} MHz</div></div>`).join('');
}
function switchInspectorTab(tabId) {
  activeInspectorTab = tabId;
  ['trains', 'planes', 'meteo', 'aprs'].forEach(t => {
    const btn = document.getElementById(`tabBtn-${t}`), panel = document.getElementById(`inspectorTab-${t}`);
    if (t === tabId) { btn.className = 'px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold whitespace-nowrap'; panel.classList.remove('hidden'); }
    else { btn.className = 'px-2 py-1 rounded-lg bg-space-950 text-slate-400 border border-slate-800 text-[11px] font-mono font-bold hover:text-white whitespace-nowrap'; panel.classList.add('hidden'); }
  });
  const countEl = document.getElementById('tabItemsCount');
  if (tabId === 'trains') countEl.innerText = `${activeSnap.trains.length} vlakov`;
  if (tabId === 'planes') countEl.innerText = `${activeSnap.planes.length} letal`;
  if (tabId === 'meteo') countEl.innerText = `${activeSnap.meteo.length + activeSnap.rivers.length} postaj`;
  if (tabId === 'aprs') countEl.innerText = `${activeSnap.aprs.length + activeSnap.ham.length} zvez`;
}

// ========================================================================
// LEAFLET MAP
// ========================================================================
function initMap() {
  map = L.map('leafletMap', { center: [46.68, 16.15], zoom: 10, zoomControl: true, attributionControl: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
  layerGroups.trains = L.layerGroup().addTo(map);
  layerGroups.gsmr = L.layerGroup().addTo(map);
  layerGroups.planes = L.layerGroup().addTo(map);
  layerGroups.meteo = L.layerGroup().addTo(map);
  layerGroups.aprs = L.layerGroup();
  setTimeout(() => { if (map) map.invalidateSize(); }, 350);
}
function toggleMapLayer(layerName) {
  layerVisibility[layerName] = !layerVisibility[layerName];
  const isVisible = layerVisibility[layerName];
  const btn = document.getElementById(`btnLayer${layerName.charAt(0).toUpperCase() + layerName.slice(1)}`);
  const activeClasses = { trains: ['bg-amber-500/20', 'text-amber-300', 'border-amber-500/40'], gsmr: ['bg-sky-500/20', 'text-sky-300', 'border-sky-500/40'], planes: ['bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/40'], meteo: ['bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40'], aprs: ['bg-purple-500/20', 'text-purple-300', 'border-purple-500/40'] }[layerName];
  if (btn) {
    if (isVisible) { btn.classList.add(...activeClasses); btn.classList.remove('bg-space-950', 'text-slate-400', 'border-slate-800'); }
    else { btn.classList.remove(...activeClasses); btn.classList.add('bg-space-950', 'text-slate-400', 'border-slate-800'); }
  }
  const group = layerGroups[layerName];
  if (group) { if (isVisible) map.addLayer(group); else map.removeLayer(group); }
}
function updateMapLayers() {
  if (!map) return;
  if (!railwayLineLayer) {
    const trackCoords = [[46.8231, 16.3342], [46.8042, 16.2764], [46.7846, 16.1682], [46.7053, 16.1586], [46.6617, 16.1664], [46.6078, 16.2361], [46.5194, 16.1969], [46.4095, 16.1507], [46.3964, 15.6625], [46.4545, 15.6643], [46.5525, 15.6548]];
    railwayLineLayer = L.polyline(trackCoords, { color: '#f59e0b', weight: 3.5, dashArray: '8, 6', opacity: 0.85 }).addTo(map);
  }
  layerGroups.trains.clearLayers();
  activeSnap.trains.forEach(t => {
    if (!t.lat || !t.lon) return;
    const isSelected = t.id === selectedTrainId;
    const icon = L.divIcon({ className: 'custom-train-marker', html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full ${isSelected ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/50 scale-110' : 'bg-amber-500 text-slate-950 ring-2 ring-amber-500/30'} shadow-lg font-bold text-xs transition">🚆</div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
    const marker = L.marker([t.lat, t.lon], { icon }).addTo(layerGroups.trains);
    marker.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-amber-400 mb-1">🚆 ${t.name}</div><div class="text-slate-300 text-[11px]">${t.from} → ${t.to}</div><div class="text-[10px] text-slate-400 mt-1">${fmtCoord(t.lat, t.lon)} · ${Math.round(t.speed)} km/h</div><div class="text-[10px] text-emerald-400 mt-0.5">GSM-R: ${t.gsmr.rssi} dBm</div><button onclick="selectTrain('${t.id}')" class="mt-2 w-full py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px]">Izberi v ERTMS oknu</button></div>`);
    marker.on('click', () => selectTrain(t.id));
  });
  layerGroups.gsmr.clearLayers();
  (activeSnap.gsmrSites || []).forEach(site => {
    const icon = L.divIcon({ className: 'custom-gsmr-marker', html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/90 text-white ring-2 ring-sky-500/40 shadow text-[10px]">📡</div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
    const m = L.marker([site.lat, site.lon], { icon }).addTo(layerGroups.gsmr);
    m.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-sky-400">📡 GSM-R BTS: ${site.name}</div><div class="text-slate-300 text-[11px]">Ref: ${site.ref} · Proga ${site.line}</div><div class="text-[10px] text-slate-400">${fmtCoord(site.lat, site.lon)}</div></div>`);
  });
  layerGroups.planes.clearLayers();
  (activeSnap.planes || []).forEach(p => {
    if (!p.lat || !p.lon) return;
    const icon = L.divIcon({ className: 'plane-marker-icon', html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/90 text-slate-950 shadow-lg text-xs" style="transform:rotate(${p.track || 0}deg)">✈️</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
    const m = L.marker([p.lat, p.lon], { icon }).addTo(layerGroups.planes);
    m.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-cyan-400">✈️ ${p.flight || p.id} (${p.type || 'A/C'})</div><div class="text-slate-300 text-[11px]">Višina: ${p.alt ?? '—'} ft · Hitrost: ${p.gs ?? '—'} kts</div><div class="text-[10px] text-slate-400 mt-0.5">Squawk: ${p.squawk || '—'} · Smer: ${p.track || 0}°</div></div>`);
  });
  layerGroups.meteo.clearLayers();
  (activeSnap.meteo || []).forEach((m, i) => {
    const lat = m.lat || (activeSnap.lat + (i === 0 ? -0.02 : 0.1));
    const lon = m.lon || (activeSnap.lon + (i === 0 ? 0.03 : 0.29));
    const icon = L.divIcon({ className: 'custom-meteo-marker', html: `<div class="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] border border-emerald-400 shadow">${m.t}°C</div>`, iconSize: [36, 18], iconAnchor: [18, 9] });
    const marker = L.marker([lat, lon], { icon }).addTo(layerGroups.meteo);
    marker.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-emerald-400">🌤️ ${m.name}</div><div class="text-slate-200">Temp: ${m.t} °C · Vlaga: ${m.rh}%</div><div class="text-slate-400 text-[10px]">Veter: ${m.wind} km/h (${m.dir}) · ${m.sky}</div></div>`);
  });
  layerGroups.aprs.clearLayers();
  (activeSnap.aprs || []).forEach(a => {
    if (!a.lat || !a.lon) return;
    const icon = L.divIcon({ className: 'custom-aprs-marker', html: `<div class="flex items-center justify-center w-5 h-5 rounded bg-purple-600/90 text-white shadow text-[9px] font-bold">📻</div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
    const m = L.marker([a.lat, a.lon], { icon }).addTo(layerGroups.aprs);
    m.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-purple-400">📻 APRS: ${a.call}</div><div class="text-slate-300 text-[11px]">${a.comment || 'Beacon'}</div><div class="text-[10px] text-slate-400 mt-0.5">Pot: ${a.path || '—'} · Pred ${Math.round(a.age || 0)}s</div></div>`);
  });
}
function toggleExpandMap() {
  const wrapper = document.getElementById('mapWrapper');
  const expanded = wrapper.style.height === '720px';
  wrapper.style.height = expanded ? '480px' : '720px';
  document.getElementById('expandIcon').dataset.i = expanded ? 'expand' : 'compress';
  document.getElementById('expandIcon').dataset.painted = '';
  paintIcons(document.getElementById('expandIcon').parentElement);
  setTimeout(() => { if (map) map.invalidateSize(); }, 350);
}
function scrollToLiveMap() { document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' }); }

// ========================================================================
// PACKETS TABLE + MODAL
// ========================================================================
function renderPacketsTable() {
  const tbody = document.getElementById('packetsTableTbody');
  const filtered = livePackets.filter(p => {
    if (currentFilter === 'ALL') return true;
    if (currentFilter === 'TRAIN') return p.mType === 'TRAIN';
    if (currentFilter === 'UL') return p.dir === 'UL';
    if (currentFilter === 'DL') return p.dir === 'DL';
    if (currentFilter === 'CRC_FAIL') return p.mType === 'CRC_FAIL';
    return true;
  });
  tbody.innerHTML = filtered.slice(0, 60).map(p => {
    let badge = '<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold">UL</span>';
    if (p.dir === 'DL') badge = '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">DL</span>';
    if (p.mType === 'CRC_FAIL') badge = '<span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">CRC</span>';
    return `<tr class="hover:bg-slate-800/40 transition cursor-pointer" onclick="openPacketModal('${p.id}')">
      <td class="py-2.5 px-3">${badge} <span class="text-slate-400 text-[10px] ml-1">${p.mType}</span></td>
      <td class="py-2.5 px-3 font-bold text-white">${p.gtw}</td>
      <td class="py-2.5 px-3 text-sky-400 font-mono text-[11px]">${p.dev}</td>
      <td class="py-2.5 px-3 text-amber-300">${p.mhz} MHz · ${p.sf}</td>
      <td class="py-2.5 px-3 font-bold text-emerald-400">${p.rssi} dBm <span class="text-slate-500 text-[10px]">(${p.snr} dB)</span></td>
      <td class="py-2.5 px-3 text-slate-400 text-[10px]">${(p.time || '').slice(11, 19)}</td>
      <td class="py-2.5 px-3 text-right"><button onclick="event.stopPropagation();openPacketModal('${p.id}')" class="px-2 py-1 rounded bg-space-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px]">Pregled</button></td>
    </tr>`;
  }).join('');
  document.getElementById('packetBadgeCount').innerText = `${filtered.length} paketov`;
}
function setPacketFilter(type) {
  currentFilter = type;
  ['ALL', 'TRAIN', 'UL', 'DL', 'CRC_FAIL'].forEach(t => {
    const btn = document.getElementById(`filterBtn-${t}`);
    btn.className = t === type ? 'px-2.5 py-1 rounded-lg bg-sky-600 text-white text-xs font-mono font-bold transition' : 'px-2.5 py-1 rounded-lg bg-space-950 text-slate-300 hover:bg-slate-800 text-xs font-mono border border-slate-800 transition';
  });
  renderPacketsTable();
}
function applyPacketSearch() {
  const q = (document.getElementById('packetSearchInput').value || '').toLowerCase();
  document.querySelectorAll('#packetsTableTbody tr').forEach(r => { r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none'; });
}
function openPacketModal(id) {
  const p = livePackets.find(x => x.id === id);
  if (!p) return;
  activeModalPacket = p;
  document.getElementById('modalPacketId').innerText = p.id;
  document.getElementById('modalTypeBadge').innerText = p.dir;
  document.getElementById('modalOverviewGw').innerText = p.gtw;
  document.getElementById('modalOverviewDev').innerText = p.dev;
  document.getElementById('modalOverviewFreq').innerText = `${p.mhz} MHz · ${p.sf}`;
  document.getElementById('modalOverviewTime').innerText = p.time;
  document.getElementById('modalOverviewPayload').innerText = JSON.stringify(p.decoded, null, 2);
  document.getElementById('modalRawJson').innerText = JSON.stringify(p.raw, null, 2);
  document.getElementById('packetModal').classList.remove('hidden');
  document.getElementById('packetModal').classList.add('flex');
}
function closePacketModal() { document.getElementById('packetModal').classList.add('hidden'); document.getElementById('packetModal').classList.remove('flex'); }
function copyModalJson() {
  if (!activeModalPacket) return;
  const text = JSON.stringify(activeModalPacket, null, 2);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(() => {});
}

// ========================================================================
// SOCKET.IO + INIT
// ========================================================================
function initSocketIo() {
  if (typeof io === 'undefined') return;
  try {
    const socket = io();
    socket.on('connect', () => { document.getElementById('backendStatusText').innerText = 'NODE API AKTIVEN'; });
    socket.on('feed', () => { refreshAllServerData(); });
    socket.on('disconnect', () => { document.getElementById('backendStatusText').innerText = 'POVEZAVA PREKINJENA'; });
  } catch (e) {}
}

window.onload = function () {
  paintIcons(document);
  initMap();
  initSocketIo();
  refreshAllServerData();
};

window.selectTrain = selectTrain;
window.changePlace = changePlace;
window.toggleErtmsLanguage = toggleErtmsLanguage;
window.refreshAllServerData = refreshAllServerData;
window.scrollToLiveMap = scrollToLiveMap;
window.toggleExpandMap = toggleExpandMap;
window.toggleMapLayer = toggleMapLayer;
window.switchInspectorTab = switchInspectorTab;
window.openPacketModal = openPacketModal;
window.closePacketModal = closePacketModal;
window.copyModalJson = copyModalJson;
window.setPacketFilter = setPacketFilter;
window.applyPacketSearch = applyPacketSearch;

switchInspectorTab('trains');
setPacketFilter('ALL');
