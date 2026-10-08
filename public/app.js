// ========================================================================
// ICONS
// ========================================================================
const ICONS = {
  tower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v20M8 6a4 4 0 0 1 8 0M5.5 9a7 7 0 0 1 13 0M4 22l2-9M20 22l-2-9"/></svg>',
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 12h14M8 16l-2 4M16 16l2 4M9 7h6"/><circle cx="8.5" cy="18.5" r=".6" fill="currentColor" stroke="none"/><circle cx="15.5" cy="18.5" r=".6" fill="currentColor" stroke="none"/></svg>',
  plane: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 15.5l-7-4V4.8c0-1-1.5-1.8-2.2-1-.4.4-.6.9-.6 1.4v6.3l-7 4v2l7-2.1v5l-2.4 1.8v1.4l3.4-1 3.4 1v-1.4L13.2 20v-5l7 2.1z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h11a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.5 12.1 4 4 0 0 0 7 18z"/><circle cx="18" cy="5" r="1.3" fill="currentColor" stroke="none"/></svg>',
  radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="15" r="3"/><path d="M12 12V4m-4 4l4-4 4 4M6 19h12"/></svg>',
  sat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M3 3l4 4M21 3l-4 4M3 21l4-4M21 21l-4-4M10.5 13.5l-6 6M13.5 10.5l6-6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9 4l6 2 5-2v14l-5 2-6-2-5 2V6z"/><path d="M9 4v14M15 6v14"/></svg>',
  expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  compress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5c0 8 7 15 15 15l2-4-5-2-2 2c-2-1-4-3-5-5l2-2-2-5z"/></svg>',
  radar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M12 12l6.5-6.5"/></svg>'
};
function paintIcons(root) {
  (root || document).querySelectorAll('[data-i]').forEach(el => {
    if (!el.dataset.painted) { el.innerHTML = ICONS[el.dataset.i] || ''; el.dataset.painted = '1'; }
  });
}

function fmtCoord(lat, lon) { return (lat == null || lon == null) ? "—" : `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`; }
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function unavailableHtml(note) { return `<div class="unavailable">Ni podatkov${note ? ' — ' + note : ''}</div>`; }

let currentPlace = "ms";
let activeSnap = null;
let selectedTrainId = null;
let selectedAsterixTargetId = null;
let activeInspectorTab = 'trains';
let currentRadarMode = 'auto';
let arsoRadarOpacity = 0.65;
let arsoRadarOverlay = null;

let map = null;
const layerGroups = { trains: null, stations: null, asterix: null, arsoRadar: null, planes: null, meteo: null, aprs: null, lorawan: null };
const layerVisibility = { trains: true, stations: true, asterix: true, arsoRadar: true, planes: true, meteo: true, aprs: false, lorawan: false };

function selectedTrain() {
  if (!activeSnap || !activeSnap.trains.available) return null;
  return activeSnap.trains.items.find(t => t.id === selectedTrainId) || activeSnap.trains.items[0] || null;
}

// ========================================================================
// SERVER SYNC
// ========================================================================
function changePlace(p) { currentPlace = p; refreshAllServerData(); }

async function refreshAllServerData() {
  const icon = document.getElementById('refreshIcon');
  icon.style.transition = 'transform .6s'; icon.style.transform = 'rotate(360deg)';
  setTimeout(() => { icon.style.transition = ''; icon.style.transform = ''; }, 650);
  const badge = document.getElementById('backendStatusBadge');
  const text = document.getElementById('backendStatusText');
  try {
    const res = await fetch(`/api/signals?place=${encodeURIComponent(currentPlace)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    activeSnap = await res.json();
    if (activeSnap.trains.available) {
      if (!selectedTrainId || !activeSnap.trains.items.find(t => t.id === selectedTrainId)) {
        selectedTrainId = activeSnap.trains.items[0]?.id || null;
      }
    } else {
      selectedTrainId = null;
    }
    text.innerText = "STREŽNIK POVEZAN";
    badge.className = "inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30";
  } catch (e) {
    text.innerText = "STREŽNIK NEDOSEGLJIV";
    badge.className = "inline-flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30";
  } finally {
    document.getElementById('lastApiUpdateTime').innerText = `Sinhronizirano: ${new Date().toLocaleTimeString('sl-SI')}`;
    updateAllUiViews();
  }
}

// ========================================================================
// UI VIEWS
// ========================================================================
function updateAllUiViews() {
  if (!activeSnap) return;
  document.getElementById('badgeCountTrains').innerText = activeSnap.trains.available ? `${activeSnap.trains.items.length} vlakov` : "ni vlakov";
  document.getElementById('badgeCountStations').innerText = activeSnap.railStations.available ? `${activeSnap.railStations.items.length} postaj` : "ni postaj";
  document.getElementById('badgeCountPlanes').innerText = activeSnap.planes.available ? `${activeSnap.planes.items.length} letal` : "ni letal";
  const astBadge = document.getElementById('badgeCountAsterix');
  if (astBadge) {
    astBadge.innerText = activeSnap.asterix?.available
      ? `${activeSnap.asterix.metrics?.totalTargets ?? activeSnap.asterix.targets?.length ?? 0} radar (ASTERIX)`
      : "radar: ni podatkov";
  }
  document.getElementById('badgeCountMeteo').innerText = activeSnap.meteo.available ? `${activeSnap.meteo.items.length} ARSO` : "ni ARSO";
  document.getElementById('badgeCountAprs').innerText = activeSnap.aprs.available ? `${activeSnap.aprs.items.length} APRS` : "ni APRS";
  document.getElementById('badgeCountLora').innerText = activeSnap.lorawan.available ? `${activeSnap.lorawan.items.length} LoRaWAN` : "ni LoRaWAN";
  document.getElementById('issText').innerText = activeSnap.iss.available ? `ISS: ${activeSnap.iss.km} km` : "ISS: ni podatkov";
  if (activeSnap.sip.available) {
    const ok = activeSnap.sip.items.find((h) => h.ok) || activeSnap.sip.items[0];
    document.getElementById('sipStatusVal').innerText = ok ? `${ok.id} (${ok.ok ? ok.ms + ' ms' : 'ni odziva'})` : "ni odziva";
  }

  renderTrainsList();
  renderAsterixList();
  renderPlanesList();
  renderMeteoAndRiversList();
  renderAprsAndHamList();
  renderNetworkTab();
  updateMapLayers();
  updateHud();
}

function updateHud() {
  const t = selectedTrain();
  if (!t) {
    document.getElementById('hudName').innerText = "Ni vlaka po voznem redu";
    document.getElementById('hudRoute').innerText = "—";
    document.getElementById('hudProgress').innerText = "—";
    document.getElementById('hudEta').innerText = "—";
    document.getElementById('hudSource').innerText = "—";
    return;
  }
  document.getElementById('hudName').innerText = t.name;
  document.getElementById('hudRoute').innerText = `${t.from} → ${t.to}`;
  document.getElementById('hudProgress').innerText = t.progressPct != null ? `${t.progressPct}%` : "—";
  document.getElementById('hudEta').innerText = t.etaMin != null ? `${t.etaMin} min` : "—";
  document.getElementById('hudSource').innerText = "Ocena po objavljenem voznem redu (Transitous), ni GPS";
}

function selectTrain(id) {
  selectedTrainId = id;
  renderTrainsList(); updateHud();
  const t = selectedTrain();
  if (map && t) map.flyTo([t.lat, t.lon], 11, { duration: 1.2 });
}

function renderTrainsList() {
  const c = document.getElementById('trainSignalsList');
  const label = document.getElementById('trainsSourceLabel');
  if (!activeSnap.trains.available) {
    label.innerText = "ni podatkov";
    c.innerHTML = unavailableHtml(activeSnap.trains.note);
    return;
  }
  label.innerText = "vozni red · ocena";
  c.innerHTML = activeSnap.trains.items.map(t => {
    const sel = t.id === selectedTrainId;
    return `<div onclick="selectTrain('${t.id}')" class="p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${sel ? 'bg-amber-500/20 border-amber-500/50' : 'bg-space-900 border-slate-800 hover:border-slate-700'}">
      <div>
        <div class="flex items-center gap-1.5 font-bold font-mono text-white text-xs"><span class="ic text-amber-400" data-i="train"></span><span>${t.name}</span></div>
        <div class="text-[10px] text-slate-400 font-mono mt-0.5">${t.from} → ${t.to}</div>
      </div>
      <div class="text-right font-mono text-[10px]">
        <div class="text-amber-400 font-bold">${t.progressPct != null ? t.progressPct + '%' : '—'}</div>
        <div class="text-slate-400">ETA ${t.etaMin != null ? t.etaMin + ' min' : '—'}</div>
      </div>
    </div>`;
  }).join('');
  paintIcons(c);
}

function changeArsoOpacity(val) {
  arsoRadarOpacity = Math.max(0, Math.min(100, Number(val))) / 100;
  const valEl = document.getElementById('arsoOpacityValue');
  if (valEl) valEl.innerText = `${val}%`;
  const badgeEl = document.getElementById('badgeArsoRadar');
  if (badgeEl) badgeEl.innerText = `ARSO Radar: ${val}%`;
  if (arsoRadarOverlay) {
    arsoRadarOverlay.setOpacity(arsoRadarOpacity);
  }
}

async function setRadarMode(mode) {
  currentRadarMode = mode;
  ['auto', 'force_sdr', 'force_grid', 'force_replay'].forEach(m => {
    const b = document.getElementById(`radarModeBtn-${m}`);
    if (b) {
      if (m === mode) {
        b.className = 'px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
      } else {
        b.className = 'px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200';
      }
    }
  });

  const alertEl = document.getElementById('radarFailoverAlert');
  if (alertEl) {
    alertEl.classList.remove('hidden');
    alertEl.innerText = `Prenašam način: ${mode}...`;
  }

  try {
    const res = await fetch(`/api/sdr/asterix?place=${encodeURIComponent(currentPlace)}&mode=${mode}`);
    if (res.ok) {
      const data = await res.json();
      if (activeSnap) {
        activeSnap.asterix = data;
        updateAllUiViews();
      }
    }
  } catch (e) {
    console.error("Napaka pri preklopu načina radarja:", e);
  }
}

function selectAsterixTarget(id) {
  selectedAsterixTargetId = id;
  renderAsterixList();
  if (!activeSnap || !activeSnap.asterix || !activeSnap.asterix.targets) return;
  const target = activeSnap.asterix.targets.find(t => t.id === id);
  if (target && map) {
    map.flyTo([target.lat, target.lon], 11, { duration: 1.2 });
    document.getElementById('hudName').innerText = `${target.flight} (${target.catName})`;
    document.getElementById('hudRoute').innerText = `Squawk: ${target.squawk || '—'} · ${target.fl ? 'FL' + target.fl : (target.alt ? target.alt + ' ft' : '—')} · Odmik: ${target.distKm} km`;
    document.getElementById('hudProgress').innerText = target.gs != null ? `${target.gs} kt` : '—';
    document.getElementById('hudEta').innerText = target.bearingDeg != null ? `${target.bearingDeg}°` : '—';
    document.getElementById('hudSource').innerText = `${target.sourceType} · ${activeSnap.asterix.radarStation || 'SDR'}`;
  }
}

function renderAsterixList() {
  const c = document.getElementById('asterixListContainer');
  const srcLabel = document.getElementById('asterixSourceLabel');
  const stName = document.getElementById('radarStationName');
  const pktCount = document.getElementById('asterixPktCount');
  const cat021El = document.getElementById('cat021CountVal');
  const cat048El = document.getElementById('cat048CountVal');
  const alertEl = document.getElementById('radarFailoverAlert');
  const dot = document.getElementById('radarStatusDot');

  if (!activeSnap || !activeSnap.asterix || !activeSnap.asterix.available) {
    if (srcLabel) srcLabel.innerText = "ni podatkov";
    if (c) c.innerHTML = unavailableHtml(activeSnap?.asterix?.note || "SDR ASTERIX vir ni dosegljiv");
    return;
  }

  const ast = activeSnap.asterix;
  if (stName) stName.innerText = ast.radarStation || "Murska Sobota Regional SDR";
  if (pktCount) pktCount.innerText = `${ast.metrics?.totalTargets ?? ast.targets?.length ?? 0} tarč`;
  if (cat021El) cat021El.innerText = `${ast.metrics?.cat021Count ?? 0} tarč`;
  if (cat048El) cat048El.innerText = `${ast.metrics?.cat048Count ?? 0} tarč`;

  if (ast.engineStatus === "sdr_live") {
    if (srcLabel) { srcLabel.innerText = "SDR Živo (100.67.196.96)"; srcLabel.className = "text-emerald-400 font-bold"; }
    if (dot) dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
    if (alertEl) alertEl.classList.add('hidden');
  } else if (ast.engineStatus === "replay_mode") {
    if (srcLabel) { srcLabel.innerText = "Zgodovinski posnetek"; srcLabel.className = "text-amber-400 font-bold"; }
    if (dot) dot.className = "w-2 h-2 rounded-full bg-amber-400";
    if (alertEl) {
      alertEl.classList.remove('hidden');
      alertEl.innerText = "Predvajanje umerjenega radarskega posnetka za slovenski zračni prostor.";
    }
  } else {
    if (srcLabel) { srcLabel.innerText = "Preklop: adsb.lol + ASTERIX"; srcLabel.className = "text-cyan-400 font-bold"; }
    if (dot) dot.className = "w-2 h-2 rounded-full bg-cyan-400 animate-pulse";
    if (alertEl) {
      alertEl.classList.remove('hidden');
      alertEl.innerText = ast.failoverReason || "SDR vozlišče ni dosegljivo — aktiviran avtomatski preklop na regionalno mrežo.";
    }
  }

  const targets = ast.targets || [];
  if (targets.length === 0) {
    c.innerHTML = '<div class="p-3 text-slate-500 text-center font-mono text-[10px]">Trenutno ni zaznanih ASTERIX radijskih tarč v dosegu.</div>';
    return;
  }

  c.innerHTML = targets.map(t => {
    const isCat048 = t.cat === 48;
    const isSel = t.id === selectedAsterixTargetId;
    const catBadgeClass = isCat048 ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
    const catLabel = isCat048 ? 'CAT 048 SSR/PSR' : 'CAT 021 ADS-B';
    return `<div onclick="selectAsterixTarget('${t.id}')" class="p-2 rounded-xl border transition cursor-pointer ${isSel ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-space-900 border-slate-800 hover:border-slate-700'}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="w-1.5 h-1.5 rounded-full ${isCat048 ? 'bg-emerald-400' : 'bg-cyan-400'}"></span>
          <span class="font-bold text-white text-xs truncate">${t.flight}</span>
          <span class="text-[9px] px-1 py-0.2 rounded border font-mono ${catBadgeClass}">${catLabel}</span>
        </div>
        <div class="text-right text-[10px] text-amber-300 font-bold tabular-nums">
          ${t.fl ? 'FL' + t.fl : (t.alt ? t.alt + ' ft' : '—')}
        </div>
      </div>
      <div class="grid grid-cols-3 gap-1 mt-1 text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
        <div>SQK: <span class="text-slate-200 font-bold">${t.squawk || '—'}</span></div>
        <div>Odmik: <span class="text-slate-200">${t.distKm} km</span></div>
        <div class="text-right">Smer: <span class="text-slate-200">${t.bearingDeg}°</span></div>
      </div>
      <div class="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-0.5">
        <span>ICAO: <code class="text-slate-400">${t.icao || String(t.id).slice(0, 8)}</code></span>
        <span>Hitrost: ${t.gs ? t.gs + ' kt' : '—'}</span>
      </div>
    </div>`;
  }).join('');
}

function renderPlanesList() {
  const c = document.getElementById('planesListContainer');
  const label = document.getElementById('planesSourceLabel');
  if (!activeSnap.planes.available) { label.innerText = "ni podatkov"; c.innerHTML = unavailableHtml(activeSnap.planes.note); return; }
  label.innerText = "živo · adsb.lol";
  const planes = activeSnap.planes.items;
  c.innerHTML = planes.length === 0
    ? '<div class="p-3 text-slate-500 text-center">Trenutno ni zaznanih letal v območju.</div>'
    : planes.map(p => {
        const km = haversineKm(activeSnap.lat, activeSnap.lon, p.lat, p.lon);
        return `<div class="p-2 rounded-xl bg-space-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
          <div><div class="flex items-center gap-1.5 font-bold text-sky-400"><span class="ic" data-i="plane" style="display:inline-block;transform:rotate(${p.track || 0}deg)"></span><span>${p.flight}</span><span class="text-[9px] px-1 rounded bg-slate-800 text-slate-300 font-normal">${p.type || 'A/C'}</span></div>
          <div class="text-[10px] text-slate-400 mt-0.5">Squawk: ${p.squawk || '—'} · Smer: ${p.track || 0}° · ${km.toFixed(0)} km</div></div>
          <div class="text-right text-[10px]"><div class="text-amber-300 font-bold">${p.alt ?? '—'} ft</div><div class="text-slate-400">${p.gs ?? '—'} vozlov</div></div></div>`;
      }).join('');
  paintIcons(c);
}

function renderMeteoAndRiversList() {
  const meteoLabel = document.getElementById('meteoSourceLabel');
  if (!activeSnap.meteo.available) { meteoLabel.innerText = "ni podatkov"; document.getElementById('meteoListContainer').innerHTML = unavailableHtml(activeSnap.meteo.note); }
  else {
    meteoLabel.innerText = "živo · ARSO";
    document.getElementById('meteoListContainer').innerHTML = activeSnap.meteo.items.map(m => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
      <div class="truncate"><span class="font-bold text-white">${m.name}</span><span class="text-slate-400 text-[10px] ml-1">(${m.sky || '—'})</span></div>
      <div class="text-right text-[10px] shrink-0 ml-2"><span class="text-emerald-400 font-bold">${m.t} °C</span><span class="text-slate-400 ml-1">${m.wind} km/h ${m.dir}</span></div></div>`).join('');
  }
  document.getElementById('riversListContainer').innerHTML = unavailableHtml(activeSnap.rivers.note);
}

function renderAprsAndHamList() {
  const aprsLabel = document.getElementById('aprsSourceLabel');
  if (!activeSnap.aprs.available) { aprsLabel.innerText = "ni podatkov"; document.getElementById('aprsListContainer').innerHTML = unavailableHtml(activeSnap.aprs.note); }
  else {
    aprsLabel.innerText = "živo · APRS-IS";
    document.getElementById('aprsListContainer').innerHTML = activeSnap.aprs.items.length === 0
      ? '<div class="unavailable">Trenutno ni slišanih APRS postaj v območju (živi feed, lahko traja nekaj minut po zagonu).</div>'
      : activeSnap.aprs.items.map(a => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
      <div class="truncate"><span class="font-bold text-purple-400">${a.call}</span><span class="text-slate-400 text-[9px] ml-1 truncate">${a.comment || a.path || ''}</span></div>
      <div class="text-right text-[10px] shrink-0 ml-2 text-slate-400">${Math.round(a.age || 0)}s</div></div>`).join('');
  }
  const hamLabel = document.getElementById('hamSourceLabel');
  if (!activeSnap.ham.available) { hamLabel.innerText = "ni podatkov"; document.getElementById('hamListContainer').innerHTML = unavailableHtml(activeSnap.ham.note); }
  else {
    hamLabel.innerText = "živo · Hearham";
    document.getElementById('hamListContainer').innerHTML = activeSnap.ham.items.map(h => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
      <div><span class="font-bold text-white">${h.call}</span><span class="text-slate-400 text-[10px] ml-1">${h.city} (${h.mode})</span></div>
      <div class="text-right text-[10px] text-amber-300 font-bold">${h.mhz} MHz</div></div>`).join('');
  }
}

function renderNetworkTab() {
  const sipC = document.getElementById('sipListContainer');
  sipC.innerHTML = (activeSnap.sip.items || []).map(h => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
    <div class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full ${h.ok ? 'bg-emerald-400' : 'bg-rose-500'}"></span><span class="font-bold text-white">${h.id}</span><span class="text-slate-500 text-[10px]">${h.host}</span></div>
    <div class="text-right text-[10px] ${h.ok ? 'text-emerald-400' : 'text-rose-400'} font-bold">${h.ok ? h.ms + ' ms' : 'ni odziva'}</div></div>`).join('');

  const loraLabel = document.getElementById('loraSourceLabel');
  if (!activeSnap.lorawan.available) { loraLabel.innerText = "ni podatkov"; document.getElementById('loraListContainer').innerHTML = unavailableHtml(activeSnap.lorawan.note); }
  else {
    loraLabel.innerText = "živo · Packet Broker";
    document.getElementById('loraListContainer').innerHTML = activeSnap.lorawan.items.length === 0
      ? '<div class="unavailable">Ni javnih LoRaWAN prehodov v tem območju.</div>'
      : activeSnap.lorawan.items.map(g => `<div class="p-1.5 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-1.5 truncate"><span class="w-1.5 h-1.5 rounded-full ${g.online ? 'bg-emerald-400' : 'bg-slate-600'}"></span><span class="font-bold text-white truncate">${g.id}</span></div>
      <div class="text-right text-[10px] text-slate-400 shrink-0 ml-2">${g.online ? 'online' : 'offline'}${g.stats ? ` · UL ${g.stats.uplink}` : ''}</div></div>`).join('');
  }
}

function switchInspectorTab(tabId) {
  activeInspectorTab = tabId;
  ['trains', 'asterix', 'planes', 'meteo', 'aprs', 'network'].forEach(t => {
    const btn = document.getElementById(`tabBtn-${t}`), panel = document.getElementById(`inspectorTab-${t}`);
    if (btn && panel) {
      if (t === tabId) { btn.className = 'px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold whitespace-nowrap'; panel.classList.remove('hidden'); }
      else { btn.className = 'px-2 py-1 rounded-lg bg-space-950 text-slate-400 border border-slate-800 text-[11px] font-mono font-bold hover:text-white whitespace-nowrap'; panel.classList.add('hidden'); }
    }
  });
  if (!activeSnap) return;
  const countEl = document.getElementById('tabItemsCount');
  if (tabId === 'trains') countEl.innerText = activeSnap.trains.available ? `${activeSnap.trains.items.length} vlakov` : "0";
  if (tabId === 'asterix') countEl.innerText = activeSnap.asterix?.available ? `${activeSnap.asterix.metrics?.totalTargets ?? activeSnap.asterix.targets?.length ?? 0} tarč` : "0";
  if (tabId === 'planes') countEl.innerText = activeSnap.planes.available ? `${activeSnap.planes.items.length} letal` : "0";
  if (tabId === 'meteo') countEl.innerText = activeSnap.meteo.available ? `${activeSnap.meteo.items.length} postaj` : "0";
  if (tabId === 'aprs') countEl.innerText = (activeSnap.aprs.available ? activeSnap.aprs.items.length : 0) + (activeSnap.ham.available ? activeSnap.ham.items.length : 0);
  if (tabId === 'network') countEl.innerText = (activeSnap.lorawan.available ? activeSnap.lorawan.items.length : 0);
}

// ========================================================================
// LEAFLET MAP
// ========================================================================
function initMap() {
  map = L.map('leafletMap', { center: [46.68, 16.15], zoom: 10, zoomControl: true, attributionControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  layerGroups.trains = L.layerGroup().addTo(map);
  layerGroups.stations = L.layerGroup().addTo(map);
  layerGroups.arsoRadar = L.layerGroup().addTo(map);
  layerGroups.asterix = L.layerGroup().addTo(map);
  layerGroups.planes = L.layerGroup().addTo(map);
  layerGroups.meteo = L.layerGroup().addTo(map);
  layerGroups.aprs = L.layerGroup();
  layerGroups.lorawan = L.layerGroup();

  try {
    arsoRadarOverlay = L.imageOverlay('/api/radar/arso-image', [[45.30, 13.25], [46.95, 16.65]], {
      opacity: arsoRadarOpacity,
      interactive: false
    }).addTo(layerGroups.arsoRadar);
  } catch (e) {
    console.warn("Napaka pri dodajanju ARSO radar sloja:", e);
  }

  setTimeout(() => { if (map) map.invalidateSize(); }, 350);
}
function toggleMapLayer(layerName) {
  layerVisibility[layerName] = !layerVisibility[layerName];
  const isVisible = layerVisibility[layerName];
  const btn = document.getElementById(`btnLayer${layerName.charAt(0).toUpperCase() + layerName.slice(1)}`);
  const activeClasses = {
    trains: ['bg-amber-500/20', 'text-amber-300', 'border-amber-500/40'],
    stations: ['bg-sky-500/20', 'text-sky-300', 'border-sky-500/40'],
    asterix: ['bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40'],
    arsoRadar: ['bg-teal-500/20', 'text-teal-300', 'border-teal-500/40'],
    planes: ['bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/40'],
    meteo: ['bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40'],
    aprs: ['bg-purple-500/20', 'text-purple-300', 'border-purple-500/40'],
    lorawan: ['bg-indigo-500/20', 'text-indigo-300', 'border-indigo-500/40']
  }[layerName] || ['bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40'];
  if (btn) {
    if (isVisible) { btn.classList.add(...activeClasses); btn.classList.remove('bg-space-950', 'text-slate-400', 'border-slate-800'); }
    else { btn.classList.remove(...activeClasses); btn.classList.add('bg-space-950', 'text-slate-400', 'border-slate-800'); }
  }
  const group = layerGroups[layerName];
  if (group) { if (isVisible) map.addLayer(group); else map.removeLayer(group); }
}
function updateMapLayers() {
  if (!map || !activeSnap) return;

  // Refresh ARSO Radar Overlay Opacity & Visibility
  if (arsoRadarOverlay) {
    arsoRadarOverlay.setOpacity(arsoRadarOpacity);
  }

  // ASTERIX Radar Surveillance Layer
  layerGroups.asterix.clearLayers();
  if (activeSnap.asterix && activeSnap.asterix.available) {
    const radarSite = activeSnap.asterix.radarSiteCoords || { lat: activeSnap.lat, lon: activeSnap.lon };

    // Range rings at 10 NM (18.52 km), 20 NM (37.04 km), 40 NM (74.08 km)
    [10, 20, 40].forEach((nm) => {
      L.circle([radarSite.lat, radarSite.lon], {
        radius: nm * 1852,
        color: '#10b981',
        weight: 1,
        dashArray: '3, 6',
        fill: false,
        opacity: 0.35,
        interactive: false
      }).addTo(layerGroups.asterix);
    });

    // Radar Center Sensor Icon
    const centerIcon = L.divIcon({
      className: 'radar-site-marker',
      html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px] shadow"><span class="ic" data-i="radar"></span></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    const centerMarker = L.marker([radarSite.lat, radarSite.lon], { icon: centerIcon }).addTo(layerGroups.asterix);
    centerMarker.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-emerald-400">📡 ${activeSnap.asterix.radarStation || 'ASTERIX Radar'}</div><div class="text-[10px] text-slate-300">${fmtCoord(radarSite.lat, radarSite.lon)} · Senzorsko vozlišče</div></div>`);

    // Target blips
    (activeSnap.asterix.targets || []).forEach(t => {
      if (t.lat == null || t.lon == null) return;
      const isSelected = t.id === selectedAsterixTargetId;
      const isCat048 = t.cat === 48;

      let html = '';
      if (isCat048) {
        html = `<div class="relative flex items-center justify-center w-7 h-7 ${isSelected ? 'scale-125' : ''}">
          <span class="absolute w-5 h-5 rounded-full border border-emerald-400/80 bg-emerald-500/20"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300/80 shadow"></span>
        </div>`;
      } else {
        html = `<div class="flex items-center justify-center w-7 h-7 rounded-full ${isSelected ? 'bg-cyan-400 text-slate-950 scale-125 ring-2 ring-white' : 'bg-cyan-500/90 text-slate-950'} shadow-lg text-[10px] font-bold" style="transform:rotate(${t.track || 0}deg)">▲</div>`;
      }

      const icon = L.divIcon({
        className: 'asterix-target-marker',
        html,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([t.lat, t.lon], { icon }).addTo(layerGroups.asterix);
      m.bindPopup(`<div class="font-mono text-xs p-1">
        <div class="font-bold ${isCat048 ? 'text-emerald-400' : 'text-cyan-400'} flex items-center gap-1.5">
          <span>${t.flight}</span>
          <span class="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">${isCat048 ? 'CAT 048 SSR/PSR' : 'CAT 021 ADS-B'}</span>
        </div>
        <div class="text-slate-300 text-[11px] mt-1">Višina: ${t.fl ? 'FL' + t.fl : (t.alt ? t.alt + ' ft' : '—')} · Hitrost: ${t.gs ? t.gs + ' kt' : '—'}</div>
        <div class="text-[10px] text-slate-400 mt-0.5">Squawk: ${t.squawk || '—'} · Odmik: ${t.distKm} km · Smer: ${t.bearingDeg}°</div>
        <div class="text-[9px] text-slate-500 italic mt-0.5">${t.sourceType} · ICAO: ${t.icao || t.id}</div>
        <button onclick="selectAsterixTarget('${t.id}')" class="mt-2 w-full py-1 rounded ${isCat048 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white font-bold text-[10px]">Izberi tarčo</button>
      </div>`);
      m.on('click', () => selectAsterixTarget(t.id));
    });
  }
  layerGroups.trains.clearLayers();
  if (activeSnap.trains.available) activeSnap.trains.items.forEach(t => {
    const isSelected = t.id === selectedTrainId;
    const icon = L.divIcon({ className: 'custom-train-marker', html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full ${isSelected ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/50 scale-110' : 'bg-amber-500 text-slate-950 ring-2 ring-amber-500/30'} shadow-lg font-bold text-xs transition">🚆</div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
    const marker = L.marker([t.lat, t.lon], { icon }).addTo(layerGroups.trains);
    marker.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-amber-400 mb-1">🚆 ${t.name}</div><div class="text-slate-300 text-[11px]">${t.from} → ${t.to}</div><div class="text-[10px] text-slate-400 mt-1">${fmtCoord(t.lat, t.lon)}</div><div class="text-[9px] text-slate-500 italic mt-1">Ocena po voznem redu, ni GPS</div><button onclick="selectTrain('${t.id}')" class="mt-2 w-full py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px]">Izberi</button></div>`);
    marker.on('click', () => selectTrain(t.id));
  });
  layerGroups.stations.clearLayers();
  if (activeSnap.railStations.available) activeSnap.railStations.items.forEach(site => {
    const icon = L.divIcon({ className: 'custom-station-marker', html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/90 text-white ring-2 ring-sky-500/40 shadow text-[10px]">🚉</div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
    const m = L.marker([site.lat, site.lon], { icon }).addTo(layerGroups.stations);
    m.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-sky-400">🚉 ${site.name}</div><div class="text-[10px] text-slate-400">${fmtCoord(site.lat, site.lon)} · OpenStreetMap</div></div>`);
  });
  layerGroups.planes.clearLayers();
  if (activeSnap.planes.available) activeSnap.planes.items.forEach(p => {
    if (!p.lat || !p.lon) return;
    const icon = L.divIcon({ className: 'plane-marker-icon', html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/90 text-slate-950 shadow-lg text-xs" style="transform:rotate(${p.track || 0}deg)">✈️</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
    const m = L.marker([p.lat, p.lon], { icon }).addTo(layerGroups.planes);
    m.bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-cyan-400">✈️ ${p.flight} (${p.type || 'A/C'})</div><div class="text-slate-300 text-[11px]">Višina: ${p.alt ?? '—'} ft · Hitrost: ${p.gs ?? '—'} kts</div></div>`);
  });
  layerGroups.meteo.clearLayers();
  if (activeSnap.meteo.available) activeSnap.meteo.items.forEach((m) => {
    if (m.lat == null || m.lon == null) return;
    const icon = L.divIcon({ className: 'custom-meteo-marker', html: `<div class="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] border border-emerald-400 shadow">${m.t}°C</div>`, iconSize: [36, 18], iconAnchor: [18, 9] });
    L.marker([m.lat, m.lon], { icon }).addTo(layerGroups.meteo).bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-emerald-400">🌤️ ${m.name}</div><div class="text-slate-200">Temp: ${m.t} °C · Vlaga: ${m.rh}%</div></div>`);
  });
  layerGroups.aprs.clearLayers();
  if (activeSnap.aprs.available) activeSnap.aprs.items.forEach(a => {
    if (!a.lat || !a.lon) return;
    const icon = L.divIcon({ className: 'custom-aprs-marker', html: `<div class="flex items-center justify-center w-5 h-5 rounded bg-purple-600/90 text-white shadow text-[9px] font-bold">📻</div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
    L.marker([a.lat, a.lon], { icon }).addTo(layerGroups.aprs).bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-purple-400">📻 ${a.call}</div><div class="text-slate-300 text-[11px]">${a.comment || ''}</div></div>`);
  });
  layerGroups.lorawan.clearLayers();
  if (activeSnap.lorawan.available) activeSnap.lorawan.items.forEach(g => {
    if (!g.lat || !g.lon) return;
    const icon = L.divIcon({ className: 'custom-lora-marker', html: `<div class="flex items-center justify-center w-5 h-5 rounded-full ${g.online ? 'bg-indigo-500' : 'bg-slate-600'}/90 text-white shadow text-[9px] font-bold">📡</div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
    L.marker([g.lat, g.lon], { icon }).addTo(layerGroups.lorawan).bindPopup(`<div class="font-mono text-xs p-1"><div class="font-bold text-indigo-400">📡 ${g.id}</div><div class="text-slate-300 text-[11px]">${g.online ? 'online' : 'offline'} · Packet Broker</div></div>`);
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
// LIVE LORAWAN PACKETS (real uplinks from your own TTN application)
// ========================================================================
let livePackets = [];
function renderPacketsTable() {
  const tbody = document.getElementById('packetsTableTbody');
  tbody.innerHTML = livePackets.slice(0, 60).map(p => `<tr>
    <td class="py-2.5 px-3 text-sky-400 font-mono text-[11px]">${p.dev}</td>
    <td class="py-2.5 px-3 text-slate-300">${p.app || '—'}</td>
    <td class="py-2.5 px-3 font-bold text-white">${p.gtw || '—'}</td>
    <td class="py-2.5 px-3 text-amber-300">${p.mhz ? p.mhz + ' MHz' : '—'}${p.sf ? ' · SF' + p.sf : ''}</td>
    <td class="py-2.5 px-3 font-bold text-emerald-400">${p.rssi != null ? p.rssi + ' dBm' : '—'} <span class="text-slate-500 text-[10px]">${p.snr != null ? '(' + p.snr + ' dB)' : ''}</span></td>
    <td class="py-2.5 px-3 text-slate-400">${p.fcnt ?? '—'}</td>
    <td class="py-2.5 px-3 text-slate-400 text-[10px]">${(p.time || '').slice(11, 19)}</td>
  </tr>`).join('');
  document.getElementById('packetBadgeCount').innerText = `${livePackets.length} paketov`;
}
async function fetchPackets() {
  try {
    const res = await fetch('/api/packets');
    if (!res.ok) return;
    const data = await res.json();
    livePackets = data.items || [];
    document.getElementById('packetsWatchLabel').innerText = data.watching
      ? (livePackets.length ? 'živo · TTN aplikacija' : 'živo · čaka na prvi paket')
      : 'ni nastavljenega TTN ključa';
    renderPacketsTable();
  } catch (e) {}
}
function addLivePacket(p) {
  if (livePackets.some(x => x.id === p.id)) return;
  livePackets.unshift(p);
  if (livePackets.length > 150) livePackets.length = 150;
  document.getElementById('packetsWatchLabel').innerText = 'živo · TTN aplikacija';
  renderPacketsTable();
}

// ========================================================================
// SOCKET.IO + INIT
// ========================================================================
function initSocketIo() {
  if (typeof io === 'undefined') return;
  try {
    const socket = io();
    socket.on('feed', () => { refreshAllServerData(); });
    socket.on('packet', (p) => { addLivePacket(p); });
  } catch (e) {}
}

window.onload = function () {
  paintIcons(document);
  initMap();
  initSocketIo();
  refreshAllServerData();
  fetchPackets();
};

window.selectTrain = selectTrain;
window.selectAsterixTarget = selectAsterixTarget;
window.changeArsoOpacity = changeArsoOpacity;
window.setRadarMode = setRadarMode;
window.changePlace = changePlace;
window.refreshAllServerData = refreshAllServerData;
window.scrollToLiveMap = scrollToLiveMap;
window.toggleExpandMap = toggleExpandMap;
window.toggleMapLayer = toggleMapLayer;
window.switchInspectorTab = switchInspectorTab;

switchInspectorTab('trains');
