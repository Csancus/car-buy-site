/* ============================================================
   Car Buy Site — Vanilla JS
   Hasznaltauto.hu comparison app
   ============================================================ */

'use strict';

// ============================================================
// Constants
// ============================================================
const STORAGE_KEY = 'carbuy_cars';

/* eslint-disable */
const CAR_FEATURES = [
  'ABS (blokkolásgátló fék)','ESP (menetstabilizátor)','ASR (csúszásgátló)','EBD (elektronikus fékerőelosztó)',
  'Automatikus vészfékezés (AEB)','Gyalogos felismerő vészfékező','Kerékpáros felismerő vészfékező',
  'Sávtartó asszisztens','Sávváltás asszisztens','Sáv centráló asszisztens',
  'Holttér figyelő','Keresztforgalom figyelő (tolatáskor)','Keresztforgalom figyelő (előre haladáskor)',
  'Ütközésmegelőző rendszer','Fáradtságfigyelő rendszer','Figyelemfigyelő rendszer',
  'Éjjellátó rendszer (Night Vision)','Közlekedési tábla felismerő','Riasztó','Immobilizer',
  'GPS nyomkövető','Gumiabroncs-nyomásmérő (TPMS)',
  'Légzsák (vezető)','Légzsák (utas)','Oldallégzsákok (első)','Oldallégzsákok (hátsó)',
  'Fejlégzsák / Függönylégzsák','Térdelérlégzsák',
  'Hill Holder (lejtős indítás asszisztens)','Meredek leereszkedés asszisztens (HDC)',
  'ISOFIX gyermekülés rögzítő','Gyermekvédő zár (hátsó ajtók)','Mentőhívás (eCall)',
  'Tempomat','Adaptív tempomat (ACC)','Adaptív tempomat Stop & Go',
  'Prediktív tempomat (GPS alapú)','Sebességhatároló',
  'Parkolószenzor (hátsó)','Parkolószenzor (első)','Aktív parkoló asszisztens',
  'Remote parkoló asszisztens','Tolatókamera','Frontkamera','360° kamera rendszer',
  'Fűtött első ülések','Fűtött hátsó ülések','Fűtött középső hátsó ülés',
  'Szellőztetett ülések','Masszázsülések (első)','Masszázsülések (hátsó)','Hűtött ülések',
  'Elektromos vezető ülés','Elektromos utas ülés','Memória-ülés (vezető)','Memória-ülés (utas)',
  'Állítható ágyéktámasz','Sportülések','Ülőlap hosszúságának állítása',
  'Bőr ülések','Valódi bőr ülések','Nappa bőr ülések','Alcantara ülések','Szintetikus bőr ülések',
  '3-as osztott hátsó ülés (60/40)','Teljesen lenyomható hátsó ülések','7 személyes (3 sor ülés)',
  'Fűtött kormánykerék','Perforált bőrkormány','Multimédia gombok a kormányon',
  'Elektromos állítható kormányoszlop','Memória-kormány',
  'Halogén fényszórók','Xenon fényszórók (HID)','LED fényszórók','Full LED fényszórók',
  'Matrix LED fényszórók','Lézer fényszórók','Adaptív fényszórók (kanyarkövető)',
  'Nappali menetfények (DRL)','Automatikus fénykapcsoló','Automata távolsági fény (HBA)',
  'Ködlámpa (első)','Ködlámpa (hátsó)','LED hátsó lámpa','OLED hátsó lámpa',
  'Dinamikus irányjelző (folyó)','Sarokvilágítás',
  'Napfénytető','Elektromos napfénytető','Panorámatető','Nyitható panorámatető','Üvegtető (fix)',
  'Beépített GPS navigáció','Apple CarPlay (kábeles)','Apple CarPlay (vezeték nélküli)',
  'Android Auto (kábeles)','Android Auto (vezeték nélküli)',
  'Bluetooth','DAB+ digitális rádió','AM/FM rádió','CD lejátszó',
  'Érintőképernyős multimédia','Head-up kijelző (HUD)','Digitális műszerfal',
  'Prémium hangrendszer','Bose hangrendszer','Harman Kardon hangrendszer',
  'Bang & Olufsen hangrendszer','Meridian hangrendszer','Burmester hangrendszer',
  'Dynaudio hangrendszer','Subwoofer','Hátsó szórakoztató rendszer',
  'Okos hangvezérlő rendszer','Hátsó fejfejtámasz monitor',
  'USB-A csatlakozó (első)','USB-A csatlakozó (hátsó)','USB-C csatlakozó (első)','USB-C csatlakozó (hátsó)',
  'AUX csatlakozó','WiFi hotspot (beépített)','12V csatlakozó','230V konnektor','Vezeték nélküli töltő',
  'Manuális légkondicionáló','Automata klímaberendezés','Kétzónás klímaberendezés',
  'Háromzónás klímaberendezés','Négyzónás klímaberendezés','Pollenszűrő','Aktív szénszűrő',
  'Hőpumpa','Fűtött első szélvédő','Fűtött hátsó szélvédő','Fűtött visszapillantó tükrök',
  'Távirányítható klíma (app)','Távirányítható előfűtés (app)','Automata esőérzékelős törlő',
  'Elektromos ablakemelők (első)','Elektromos ablakemelők (hátsó)',
  'Sötétített hátsó ablakok','Napvédő roló (hátsó)','Napvédő roló (oldal)',
  'Akusztikus szélvédő','Akusztikus oldalsó ablakok',
  'Elektromos csomagtérajtó','Lábbal nyitható csomagtér',
  'Kulcs nélküli indítás (Start/Stop gomb)','Kulcs nélküli nyitás (Keyless Entry)',
  'Digitális kulcs (telefon alapú)','Soft-close ajtók',
  'Elektromos visszapillantó tükrök','Összecsukható visszapillantó tükrök',
  'Automata tompítású visszapillantó tükör','Kamerás visszapillantó (tükörpótló)',
  'Automatikus bekormányzó tükrök (tolatáskor)','Memória-tükrök',
  'Összkerékhajtás állandó (AWD)','Összkerékhajtás kapcsolható (4WD)',
  'Sport mód','Comfort mód','Eco mód','Egyéni menetmód','Offroad mód','Snow mód','Sand mód',
  'Launch Control','Aktív kipufogó rendszer','Sportkipufogó',
  'Légfelfüggesztés','Adaptív lengéscsillapítók','Hátsókerék-kormányzás',
  'Torque vectoring','Aktív differenciálmű',
  'Elektromos parkolófék','Auto Hold funkció','Kerámia fékek',
  'Automata váltó','Kéziváltó','DCT (kettős kuplungos váltó)','CVT (fokozat nélküli) váltó',
  'Szekvenciális váltó','Lapátos váltókar (kormányon)',
  'Vonóhorog (rögzített)','Vonóhorog (lecsukható)','Vonóhorog (elektromos, lecsukható)',
  'Tetőcsomagtartó (sínes)','Kerékpártartó (vonóhorogra)','Sítartó (tetőre)',
  'Elektromos csomagtér-takaró','Kettős csomagtér padló','Trailer asszisztens (pótkocsi)',
  'Defektálló gumiabroncs (RunFlat)','Pótkerék (teljes méretű)','Pótkerék (mini)',
  'Defektjavító készlet (spray)','Téli gumiabroncs (készlet)',
  '16 colos alufelnik','17 colos alufelnik','18 colos alufelnik',
  '19 colos alufelnik','20 colos alufelnik','21 colos alufelnik','22 colos alufelnik',
  'Ambiens megvilágítás','Ambiens megvilágítás (többszínű, RGB)',
  'Fa intarzia','Karbon intarzia','Alumínium betétek','Velúr belső burkolat',
  'Fűtött pohártartó','Hűtött kesztyűtartó','Légfrissítő / Parfümadagoló',
  'Automata tompítású belső visszapillantó tükör',
  'Gyorstöltő port (DC, CCS)','Gyorstöltő port (DC, CHAdeMO)',
  'AC töltő port (Type 2)','Fedélzeti töltő 7,4 kW','Fedélzeti töltő 11 kW','Fedélzeti töltő 22 kW',
  'V2L (jármű-hálózat töltés)','V2G (hálózatba visszatáplálás)',
  'Regeneratív fékezés (állítható)','Egypedálos vezetés',
  'Akkumulátor melegítő','OTA frissítés (Over-the-Air)','Előkondicionálás (app-ból)',
  'Gyártói garancia (aktív)','Kiterjesztett garancia','Szervizkönyv (teljes)',
  'Magyar forgalmú','Első tulajdonostól','Füstmentes','Kisállat-mentes',
  'Balesetmentes','Márkaszervizes karbantartás','Szervizcsomag (előre fizetett)',
  'Szélvédő-vízlepergető bevonat','Szélvédő gyorspáramentesítő',
  'OBD diagnosztikai csatlakozó','Hill Descent Control',
  'Prediktív energia visszanyerés','Valós idejű forgalmi info (navigáció)',
  'Automata szintező fényszóró','Elektromos rácsbetét (Grille Shutter)',
  'Track mód (zárt pályára)',
];
/* eslint-enable */

// ============================================================
// State
// ============================================================
let cars = [];
let autoRanks = {};
let activePersonFilter  = null;
let lightboxImages = [];
let lightboxIdx = 0;
let activeSortBy        = null;   // 'price_asc' | 'price_desc'
let activeQuickFilters  = new Set();
let activeAttrFilters   = {};     // { fuel, transmission, condition, yearFrom, yearTo }
let activeFeatureFilters = new Set();
let activeSearch = '';
let activeStatusFilters = new Set(['active', 'top']);
let statusFilterOpen = false;
let manualImageDataUrls = [];

const SCORE_WEIGHTS = { price: 35, mileage: 25, year: 20, location: 5 };

const QUICK_FILTERS = [
  {
    id: 'phev',
    label: '🔌 PHEV',
    test: car => { const f = (car.fuel || '').toLowerCase(); return f.includes('plug-in') || f.includes('plugin'); },
  },
  {
    id: 'hybrid',
    label: '⚡ Hybrid',
    test: car => { const f = (car.fuel || '').toLowerCase(); return f.includes('hibrid') && !f.includes('plug-in') && !f.includes('plugin'); },
  },
  {
    id: 'adj_seat',
    label: '💺 Áll. ülésmagasság',
    test: car => (car.equipment || []).some(e => {
      const el = e.toLowerCase();
      return el.includes('magasságra állítható') || (el.includes('állítható') && el.includes('ülés') && el.includes('magasság'));
    }),
  },
  {
    id: 'warranty',
    label: '🛡️ Garancia',
    test: car => {
      const eqLow = (car.equipment || []).map(s => s.toLowerCase());
      return eqLow.some(e => e.includes('garanci')) || (car.description || '').toLowerCase().includes('garanci');
    },
  },
  {
    id: 'private',
    label: '👤 Magánszemély',
    test: car => car.sellerLabel === 'private' || (car.sellerType || '').toLowerCase().includes('magán'),
  },
  {
    id: 'dealer',
    label: '🏢 Cég / Kereskedő',
    test: car => car.sellerLabel === 'dealer',
  },
  {
    id: 'new_car',
    label: '✨ Új autó',
    test: car => car.carConditionLabel === 'new',
  },
  {
    id: 'used_car',
    label: '🔧 Használt',
    test: car => car.carConditionLabel !== 'new',
  },
];

// ============================================================
// Utils
// ============================================================
function showToast(msg, duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

function formatPrice(n) {
  if (!n && n !== 0) return '—';
  return n.toLocaleString('hu-HU').replace(/\s/g, '\u00a0') + '\u00a0Ft';
}

function formatMileage(n) {
  if (!n && n !== 0) return '—';
  return n.toLocaleString('hu-HU').replace(/\s/g, '\u00a0') + '\u00a0km';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ============================================================
// Theme
// ============================================================
function initTheme() {
  const saved = localStorage.getItem('carbuy_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('carbuy_theme', next);
}

// ============================================================
// Custom confirm modal
// ============================================================
function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmModal');
    const msgEl = document.getElementById('confirmModalMsg');
    const okBtn = document.getElementById('confirmModalOk');
    const cancelBtn = document.getElementById('confirmModalCancel');

    msgEl.textContent = message;
    overlay.classList.add('visible');

    function cleanup(result) {
      overlay.classList.remove('visible');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onOverlay(e) { if (e.target === overlay) cleanup(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
  });
}

// ============================================================
// LocalStorage
// ============================================================
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function saveToStorage() {
  cars.sort((a, b) => a.order - b.order);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
  } catch (e) {
    console.warn('localStorage save failed', e);
  }
}

// ============================================================
// API helpers (local server mode)
// ============================================================
async function apiAddCar(url) {
  const resp = await fetch('/api/cars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`A szerver HTML hibaoldalt adott vissza (${resp.status}). Ellenőrizd a Vercel function logokat.`); }
  if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
  return data;
}

async function apiDeleteCar(id) {
  await fetch(`/api/cars?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

async function apiAddComment(id, author, text) {
  const resp = await fetch(`/api/comment?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, text }),
  });
  return resp.json();
}

async function apiSaveOrder(ids) {
  await fetch('/api/order', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

async function apiUpdateCar(id, fields) {
  await fetch(`/api/cars?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
}

async function apiLoadCars() {
  const resp = await fetch('/api/cars');
  const text = await resp.text();
  try { return JSON.parse(text); } catch { return []; }
}

// ============================================================
// Parsing
// ============================================================

/**
 * Extract the dataLayer object that contains listing_id.
 * Uses a balanced-brace finder so JSON values containing ")" don't break parsing.
 */
function parseDataLayer(html) {
  // Find all occurrences of dataLayer.push( and extract the argument
  const marker = 'dataLayer.push(';
  let searchFrom = 0;
  while (true) {
    const start = html.indexOf(marker, searchFrom);
    if (start === -1) break;
    searchFrom = start + marker.length;

    // Find the matching closing paren by walking characters and tracking braces/strings
    const argStart = start + marker.length;
    let i = argStart;
    // Skip optional whitespace
    while (i < html.length && (html[i] === ' ' || html[i] === '\n' || html[i] === '\r' || html[i] === '\t')) i++;
    if (html[i] !== '{') continue; // not an object push (could be array)

    // Walk to find matching closing brace, then closing paren
    let depth = 0;
    let inString = false;
    let strChar = '';
    let escaped = false;
    let j = i;
    for (; j < html.length; j++) {
      const ch = html[j];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\' && inString) { escaped = true; continue; }
      if (inString) {
        if (ch === strChar) inString = false;
        continue;
      }
      if (ch === '"' || ch === "'") { inString = true; strChar = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { j++; break; }
      }
    }

    const jsonCandidate = html.slice(i, j).trim();
    try {
      const obj = JSON.parse(jsonCandidate);
      if (obj && typeof obj.listing_id === 'number') {
        return obj;
      }
    } catch (e) { /* not valid JSON for our purposes */ }
  }
  return null;
}

/**
 * Extract from JSON-LD Product schema
 */
function parseJsonLd(doc) {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      if (data && data['@type'] === 'Product') {
        return data;
      }
    } catch (e) { /* ignore */ }
  }
  return null;
}

/**
 * Extract all equipment items from ul.grid li elements
 */
function parseEquipment(doc) {
  const items = [];
  const uls = doc.querySelectorAll('ul.grid');
  for (const ul of uls) {
    const lis = ul.querySelectorAll('li');
    for (const li of lis) {
      const text = li.textContent.trim();
      if (text) items.push(text);
    }
  }
  return [...new Set(items)]; // deduplicate
}

/**
 * Full parse of fetched HTML string
 */
function parseCarPage(html, url) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. dataLayer
  const dl = parseDataLayer(html);

  // 2. JSON-LD Product
  const ld = parseJsonLd(doc);

  // 3. Equipment
  const equipment = parseEquipment(doc);

  // --- Compose car object ---
  const listingId = dl?.listing_id || extractIdFromUrl(url);
  const images = ld?.image ? ld.image.map(img => (typeof img === 'string' ? img : img.url)).filter(Boolean) : [];

  const car = {
    id: listingId || generateId(),
    url: url,
    name: ld?.name || (dl ? `${dl.brand || ''} ${dl.model || ''}`.trim() : 'Ismeretlen'),
    brand: dl?.brand || ld?.brand?.name || '',
    model: dl?.model || '',
    year: dl?.year || null,
    price: ld?.offers?.price || dl?.price || null,
    mileage: dl?.mileage || null,
    fuel: dl?.fuel_type || '',
    transmission: dl?.transmission_type || '',
    condition: dl?.condition_type || '',
    bodyType: dl?.car_body_type || '',
    color: ld?.color || '',
    seller: ld?.offers?.seller?.name || '',
    description: ld?.description || '',
    images: images,
    equipment: equipment,
    top5: [],
    comments: [],
    order: cars.length,
    addedAt: new Date().toISOString(),
  };

  car.top5 = computeTop5(car);

  return car;
}

function extractIdFromUrl(url) {
  // hasznaltauto.hu URLs end with -NUMBERS
  const m = url.match(/-(\d+)(?:\?.*)?$/);
  return m ? parseInt(m[1], 10) : null;
}

// ============================================================
// Lightbox
// ============================================================
function openLightbox(images, idx) {
  if (!images || !images.length) return;
  lightboxImages = images;
  lightboxIdx = Math.max(0, Math.min(idx, images.length - 1));
  updateLightboxImg();
  document.getElementById('lightbox').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('visible');
  document.body.style.overflow = '';
}

function updateLightboxImg() {
  document.getElementById('lightboxImg').src = lightboxImages[lightboxIdx];
  document.getElementById('lightboxCounter').textContent = `${lightboxIdx + 1} / ${lightboxImages.length}`;
  const multi = lightboxImages.length > 1;
  document.getElementById('lightboxPrev').style.display = multi ? '' : 'none';
  document.getElementById('lightboxNext').style.display = multi ? '' : 'none';
}

// ============================================================
// Autocomplete
// ============================================================
function attachAutocomplete(inputEl, onSelect) {
  const wrap = inputEl.closest('.autocomplete-wrap');
  if (!wrap) return;
  let dropdown = wrap.querySelector('.autocomplete-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    wrap.appendChild(dropdown);
  }
  let activeIdx = -1;

  function showSuggestions() {
    const q = inputEl.value.trim().toLowerCase();
    dropdown.innerHTML = '';
    activeIdx = -1;
    if (q.length < 1) { dropdown.style.display = 'none'; return; }
    const matches = CAR_FEATURES.filter(f => f.toLowerCase().includes(q)).slice(0, 9);
    if (!matches.length) { dropdown.style.display = 'none'; return; }
    for (const match of matches) {
      const item = document.createElement('div');
      item.className = 'ac-item';
      const lo = match.toLowerCase();
      const start = lo.indexOf(q);
      item.innerHTML = escHtml(match.slice(0, start)) +
        `<strong>${escHtml(match.slice(start, start + q.length))}</strong>` +
        escHtml(match.slice(start + q.length));
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        inputEl.value = '';
        dropdown.style.display = 'none';
        onSelect(match);
      });
      dropdown.appendChild(item);
    }
    dropdown.style.display = 'block';
  }

  inputEl.addEventListener('input', showSuggestions);
  inputEl.addEventListener('focus', showSuggestions);
  inputEl.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 160));

  inputEl.addEventListener('keydown', (e) => {
    const items = [...dropdown.querySelectorAll('.ac-item')];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('ac-active', i === activeIdx));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      items.forEach((el, i) => el.classList.toggle('ac-active', i === activeIdx));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const val = activeIdx >= 0 ? items[activeIdx].textContent : inputEl.value.trim();
      if (val) { onSelect(val); inputEl.value = ''; dropdown.style.display = 'none'; }
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
    }
  });
}

// ============================================================
// Auto Ranking
// ============================================================
function computeAutoScore(car) {
  const W = SCORE_WEIGHTS;
  let score = 0;
  if (car.price) score += Math.max(0, W.price * (1 - car.price / 15_000_000));
  if (car.mileage != null) score += Math.max(0, W.mileage * (1 - car.mileage / 300_000));
  if (car.year) score += Math.max(0, Math.min(W.year, (car.year - 2010) / 16 * W.year));
  const loc = (car.sellerLocation || '').toLowerCase();
  if (loc.includes('budapest') || loc.includes('pest')) score += W.location;
  const fuel = (car.fuel || '').toLowerCase();
  if (fuel.includes('plug-in') || fuel.includes('plugin')) score += 10;
  const trans = (car.transmission || '').toLowerCase();
  if (trans.includes('automat') || trans.includes('fokozatmentes') || trans.includes('tiptronic') || trans.includes('dct') || trans.includes('cvt')) score += 10;
  if (car.carConditionLabel === 'new') score += 5;
  if (car.consumption != null) score += Math.max(0, Math.min(5, 5 * (1 - (car.consumption - 4.5) / 3)));
  return score;
}

function refreshAutoRanks() {
  const sorted = [...cars].sort((a, b) => computeAutoScore(b) - computeAutoScore(a));
  autoRanks = {};
  sorted.forEach((car, i) => { autoRanks[String(car.id)] = i + 1; });
}

// ============================================================
// Top 5 Algorithm
// ============================================================
function computeTop5(car) {
  const eq = (car.equipment || []).map(s => s.toLowerCase());
  const fuel = (car.fuel || '').toLowerCase();
  const condition = car.condition || '';

  const candidates = [];
  const added = new Set();

  function add(label, score) {
    if (!added.has(label)) {
      added.add(label);
      candidates.push({ label, score });
    }
  }

  // Special rules (high priority)
  if (fuel.includes('plug-in') || fuel.includes('plugin')) {
    add('🔌 PHEV (Plugin Hibrid)', 10);
  } else if (fuel.includes('hibrid')) {
    add('⚡ Hybrid hajtás', 9);
  } else if (fuel.includes('elektromos')) {
    add('⚡ Teljesen elektromos', 10);
  }
  if (car.mileage !== null && car.mileage < 30000) {
    add('📉 Alacsony km-óraállás', 9);
  }
  if (car.year !== null && car.year >= 2024) {
    add('✨ Szinte új autó', 9);
  }
  if (condition === 'Sérülésmentes') {
    add('✅ Sérülésmentes karosszéria', 8);
  }
  if (eqHas(eq, 'első tulajdonostól')) {
    add('👤 Első tulajdonostól', 7);
  }
  if (eqHas(eq, 'garanciális')) {
    add('🛡️ Garanciális', 8);
  }

  // Equipment keyword rules
  if (eqHas(eq, 'navigáci') || eqHas(eq, 'gps')) add('🗺️ GPS Navigáció', 9);
  if (eqHas(eq, '360')) add('📷 360° körülnézet', 9);
  if (eqHas(eq, 'panoráma') || eqHas(eq, 'üvegtető')) add('☀️ Panorámatető', 9);
  if (eqHas(eq, 'head-up') || eqHas(eq, 'hud')) add('📊 Head-up kijelző', 9);
  if (eqHas(eq, 'tolatókamera') || eqHas(eq, 'tolató kamera')) add('📷 Tolatókamera', 8);
  if (eqHas(eq, 'napfénytető')) add('🌤️ Napfénytető', 8);
  if (eqHas(eq, 'adaptív tempomat') || eqHas(eq, 'távolságtartó tempomat')) add('🚦 Adaptív tempomat', 8);
  if (eqHas(eq, 'kulcsnélküli') || eqHas(eq, 'kulcs nélk')) add('🔑 Kulcs nélküli kezelés', 8);
  if (eqHas(eq, '4wd') || eqHas(eq, 'awd') || eqHas(eq, '4x4') || eqHas(eq, 'összkerék')) add('🏔️ Összkerékhajtás 4WD', 8);
  if (eqHas(eq, 'bőrülés') || eqHas(eq, 'bőr ülés') || eqHas(eq, 'valódi bőr')) add('🪑 Valódi bőrülések', 8);
  if (eqHasAll(eq, ['fűthet', 'hátsó'])) add('🔥 Fűtött első+hátsó ülések', 8);
  if (eqHas(eq, 'apple carplay') || eqHas(eq, 'android auto')) add('📱 CarPlay / Android Auto', 7);
  if (eqHas(eq, 'vezeték nélküli töltés') || eqHas(eq, 'indukciós töltés')) add('⚡ Vezeték nélküli töltő', 7);
  if (eqHas(eq, 'holttér') || eqHas(eq, 'holtt')) add('👁️ Holttér-figyelő', 7);
  if (eqHas(eq, 'ventilált ülés') || eqHas(eq, 'légkondicionált ülés')) add('💨 Ventilált ülések', 7);
  if (eqHas(eq, 'masszázs')) add('💆 Masszázs funkció', 7);
  if (eqHas(eq, 'led fényszóró')) add('💡 LED fényszórók', 7);
  if (eqHas(eq, 'elektromos csomagtér')) add('🚪 Elektromos csomagtérajtó', 6);
  if (eqHas(eq, 'sávtartó')) add('🛣️ Sávtartó rendszer', 6);
  if (eqHas(eq, 'hologram') || eqHas(eq, 'éjjellátó') || eqHas(eq, 'night vision')) add('🌙 Éjjellátó / HUD', 8);

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 5).map(c => c.label);
}

function eqHas(eqLower, keyword) {
  return eqLower.some(item => item.includes(keyword.toLowerCase()));
}

function eqHasAll(eqLower, keywords) {
  // All keywords must appear somewhere across the equipment list as a whole
  const combined = eqLower.join(' ');
  return keywords.every(kw => combined.includes(kw.toLowerCase()));
}

// ============================================================
// Rendering
// ============================================================
function getDisplayCars() {
  const base = [...cars];
  if (activePersonFilter) {
    return base.sort((a, b) => {
      const posA = (a.rankings || []).find(r => r.name === activePersonFilter)?.position ?? 999;
      const posB = (b.rankings || []).find(r => r.name === activePersonFilter)?.position ?? 999;
      return posA - posB;
    });
  }
  if (activeSortBy === 'price_asc')  return base.sort((a, b) => (a.price || Infinity)  - (b.price || Infinity));
  if (activeSortBy === 'price_desc') return base.sort((a, b) => (b.price || -Infinity) - (a.price || -Infinity));
  // Default: auto-rank score (best first)
  return base.sort((a, b) => computeAutoScore(b) - computeAutoScore(a));
}

function renderAll() {
  const grid = document.getElementById('carsGrid');
  const empty = document.getElementById('emptyState');

  cars.sort((a, b) => a.order - b.order);
  refreshAutoRanks();

  if (cars.length === 0) {
    empty.style.display = 'block';
    grid.innerHTML = '';
    renderFilterBar();
    return;
  }

  empty.style.display = 'none';

  const currentIds = new Set(cars.map(c => String(c.id)));

  // Remove deleted cards
  for (const el of grid.querySelectorAll('.car-card')) {
    if (!currentIds.has(el.dataset.id)) el.remove();
  }

  // Reorder and insert missing (using display order which may differ from storage order)
  const fragment = document.createDocumentFragment();
  for (const car of getDisplayCars()) {
    let cardEl = grid.querySelector(`.car-card[data-id="${car.id}"]`);
    if (!cardEl) {
      try { cardEl = buildCard(car); } catch(err) { console.error('buildCard error', err, car); continue; }
    } else {
      try { updateCard(cardEl, car); } catch(err) { console.error('updateCard error', err, car); }
    }
    if (cardEl) fragment.appendChild(cardEl);
  }
  grid.appendChild(fragment);

  applyFilters();
  const anyVisible = [...grid.querySelectorAll('.car-card')].some(el => el.style.display !== 'none');
  empty.style.display = anyVisible ? 'none' : 'block';
  renderFilterBar();
}

function buildCard(car) {
  const template = document.getElementById('cardTemplate');
  const card = template.content.cloneNode(true).querySelector('.car-card');
  card.dataset.id = car.id;
  populateCard(card, car);
  attachCardEvents(card, car);
  return card;
}

function updateCard(card, car) {
  populateCard(card, car);
}

function populateCard(card, car) {
  // Status classes
  const status = car.status || 'active';
  card.classList.toggle('is-top', status === 'top');
  card.classList.toggle('is-archived', status === 'archived');
  const statusSel = card.querySelector('.status-select');
  if (statusSel) statusSel.value = status;

  // Summary thumbnail
  const summaryImg = card.querySelector('.summary-img');
  const thumbPh = card.querySelector('.thumb-placeholder');
  const summaryCounter = card.querySelector('.summary-img-counter');
  if (car.images && car.images.length > 0) {
    const sIdx = Math.min(parseInt(card.dataset.imgIdx || '0', 10), car.images.length - 1);
    summaryImg.src = car.images[sIdx];
    summaryImg.alt = car.name;
    if (thumbPh) thumbPh.style.display = 'none';
    if (summaryCounter) summaryCounter.textContent = car.images.length > 1 ? `${sIdx + 1}/${car.images.length}` : '';
  } else {
    summaryImg.removeAttribute('src');
    if (thumbPh) thumbPh.style.display = 'flex';
    if (summaryCounter) summaryCounter.textContent = '';
  }

  const btnListing = card.querySelector('.btn-listing');
  if (btnListing) {
    btnListing.href = car.url || '#';
    const isNew = car.carConditionLabel === 'new';
    const svgEl = btnListing.querySelector('svg');
    btnListing.textContent = isNew ? 'Árlista' : 'Hirdetés';
    if (svgEl) btnListing.prepend(svgEl);
    btnListing.style.display = (isNew && !car.url) ? 'none' : '';
  }

  // Auto rank badge + score info btn
  const rankBadge = card.querySelector('.auto-rank-badge');
  const rankInfoBtn = card.querySelector('.rank-score-btn');
  if (rankBadge) {
    const rank = autoRanks[String(car.id)];
    if (rank && cars.length > 1) {
      rankBadge.textContent = `#${rank}`;
      rankBadge.style.display = 'inline';
      rankBadge.className = `auto-rank-badge rank-${rank <= 3 ? rank : 'other'}`;
      if (rankInfoBtn) {
        const W = SCORE_WEIGHTS;
        const pPrice  = car.price    ? Math.max(0, W.price   * (1 - car.price / 15_000_000)).toFixed(1)  : '—';
        const pKm     = car.mileage != null ? Math.max(0, W.mileage * (1 - car.mileage / 300_000)).toFixed(1) : '—';
        const pYear   = car.year     ? Math.max(0, Math.min(W.year, (car.year - 2010) / 16 * W.year)).toFixed(1) : '—';
        const locLow  = (car.sellerLocation || '').toLowerCase();
        const pLoc    = (locLow.includes('budapest') || locLow.includes('pest')) ? `+${W.location}` : null;
        const fuelLow = (car.fuel || '').toLowerCase();
        const pPhev   = (fuelLow.includes('plug-in') || fuelLow.includes('plugin')) ? '+10' : null;
        const transLow = (car.transmission || '').toLowerCase();
        const pAuto   = (transLow.includes('automat') || transLow.includes('fokozatmentes') || transLow.includes('tiptronic') || transLow.includes('dct') || transLow.includes('cvt')) ? '+10' : null;
        const pNew    = car.carConditionLabel === 'new' ? '+5' : null;
        const pConsump = car.consumption != null
          ? Math.max(0, Math.min(5, 5 * (1 - (car.consumption - 4.5) / 3))).toFixed(1)
          : null;
        const total   = computeAutoScore(car).toFixed(1);
        const lines = [
          `Ár: ${pPrice} pt`,
          `Km-óra: ${pKm} pt`,
          `Évjárat: ${pYear} pt`,
          `Kiemelések (${(car.top5||[]).length}/5): ${pTop5} pt`,
          `Felszereltség (${(car.equipment||[]).length} elem): ${pEquip} pt`,
          pLoc     ? `Budapest/Pest: ${pLoc} pt` : null,
          pPhev    ? `PHEV bónusz: ${pPhev} pt` : null,
          pAuto    ? `Automata bónusz: ${pAuto} pt` : null,
          pNew     ? `Új autó bónusz: ${pNew} pt` : null,
          pConsump ? `Fogyasztás (${car.consumption} l): ${pConsump} pt` : null,
          `Összesen: ${total} pt`,
        ].filter(Boolean);
        rankInfoBtn.dataset.scoreHtml = lines.join('\n');
        rankInfoBtn.style.display = 'inline';
      }
    } else {
      rankBadge.style.display = 'none';
      if (rankInfoBtn) rankInfoBtn.style.display = 'none';
    }
  }

  // Name + price
  card.querySelector('.car-name').textContent = car.name || 'Ismeretlen';
  card.querySelector('.car-price').textContent = car.price ? formatPrice(car.price) : '—';

  // Summary spec badges
  const setSum = (cls, val) => {
    const el = card.querySelector(cls);
    if (!el) return;
    el.textContent = val || '';
    el.style.display = val ? '' : 'none';
  };
  setSum('.sum-year', car.year ? `📅 ${car.year}` : '');
  setSum('.sum-km', car.mileage != null ? `🛣 ${formatMileage(car.mileage)}` : '');
  setSum('.sum-fuel', car.fuel ? `⛽ ${car.fuel}` : '');
  setSum('.sum-trans', car.transmission ? `⚙️ ${car.transmission}` : '');
  setSum('.sum-trunk', car.trunkVolume ? `🧳 ${car.trunkVolume}` : '');
  // Consumption badge with disclaimer icon
  const consumEl = card.querySelector('.sum-consumption');
  if (consumEl) {
    if (car.consumption != null) {
      consumEl.innerHTML = `💧 ${car.consumption} l/100km <span class="consumption-disclaimer" title="Becsült WLTP adat, valós fogyasztás eltérhet a vezetési stílustól, töltöttségtől és körülményektől">⚠</span>`;
      consumEl.style.display = '';
    } else {
      consumEl.style.display = 'none';
    }
  }
  setSum('.sum-condition', car.condition || '');

  // Warranty badge
  const warrantyEl = card.querySelector('.sum-warranty');
  if (warrantyEl) {
    const eqLower = (car.equipment || []).map(s => s.toLowerCase());
    const descLower = (car.description || '').toLowerCase();
    const hasWarranty = eqHas(eqLower, 'garanci') || descLower.includes('garanci');
    warrantyEl.textContent = hasWarranty ? '🛡️ Garancia' : '';
    warrantyEl.style.display = hasWarranty ? '' : 'none';
  }

  // Track current image index (shared with summary thumbnail)
  let currentIdx = parseInt(card.dataset.imgIdx || '0', 10);
  if (currentIdx >= (car.images || []).length) currentIdx = 0;
  card.dataset.imgIdx = currentIdx;

  // Specs strip
  const setSpec = (cls, val) => { const el = card.querySelector(cls); if (el) el.textContent = val || '—'; };
  setSpec('.sval-year', car.manufactureDate || (car.year ? String(car.year) : null));
  setSpec('.sval-km', car.mileage != null ? formatMileage(car.mileage) : null);
  setSpec('.sval-fuel', car.fuel);
  setSpec('.sval-perf', car.performance);
  setSpec('.sval-cond', car.condition);
  setSpec('.sval-trans', car.transmission);

  // Top 5
  const top5El = card.querySelector('.top5-badges');
  top5El.innerHTML = '';
  if (car.top5 && car.top5.length > 0) {
    for (const label of car.top5) {
      const badge = document.createElement('span');
      badge.className = 'top5-badge';
      badge.textContent = label;
      top5El.appendChild(badge);
    }
  } else {
    top5El.innerHTML = '<span style="color:#94a3b8;font-size:.82rem">Nincsenek kiemelések</span>';
  }

  // Equipment
  const eqPreview = card.querySelector('.equipment-preview');
  const eqFull = card.querySelector('.equipment-full');
  eqPreview.innerHTML = '';
  eqFull.innerHTML = '';
  const eq = car.equipment || [];
  const previewCount = 6;
  for (let i = 0; i < Math.min(previewCount, eq.length); i++) {
    const tag = document.createElement('span');
    tag.className = 'equip-tag';
    tag.textContent = eq[i];
    eqPreview.appendChild(tag);
  }
  if (eq.length > previewCount) {
    const more = document.createElement('span');
    more.className = 'equip-tag';
    more.style.cssText = 'background:var(--bg-elevated);color:var(--text-dim)';
    more.textContent = `+${eq.length - previewCount} további`;
    eqPreview.appendChild(more);
  }
  for (const item of eq) {
    const li = document.createElement('li');
    li.textContent = item;
    eqFull.appendChild(li);
  }

  // Description
  const descEl = card.querySelector('.car-description');
  descEl.textContent = car.description || 'Nincs leírás.';
  descEl.classList.remove('expanded');
  descEl.style.cursor = car.description && car.description.length > 200 ? 'pointer' : 'default';

  // Seller
  const sellerTypeEl = card.querySelector('.seller-type-val');
  if (sellerTypeEl) {
    const autoType = car.sellerType === 'private' ? 'Magánszemély' : (car.sellerName || car.sellerType || '—');
    sellerTypeEl.textContent = autoType;
  }
  // Seller label buttons: reflect saved sellerLabel
  card.querySelectorAll('.btn-seller-lbl').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === (car.sellerLabel ?? ''));
  });
  const sellerLocEl = card.querySelector('.seller-location');
  if (sellerLocEl) sellerLocEl.textContent = car.sellerLocation || '—';
  const phoneEl = card.querySelector('.seller-phone');
  if (phoneEl) {
    const phone = car.sellerPhone || '';
    phoneEl.textContent = phone || 'Nem elérhető';
    phoneEl.href = phone ? `tel:${phone}` : '#';
    phoneEl.style.color = phone ? '' : 'var(--text-dim)';
  }

  // Extra & missing equipment
  renderExtraEquipment(card, car);
  renderMissingEquipment(card, car);

  // Personal rankings
  renderRankings(card, car);

  // Comments
  renderComments(card, car);
}

function renderExtraEquipment(card, car) {
  const list = card.querySelector('.extra-equip-list');
  if (!list) return;
  list.innerHTML = '';
  for (const item of (car.extraEquipment || [])) {
    const tag = document.createElement('span');
    tag.className = 'extra-equip-tag';
    tag.innerHTML = `${escHtml(item)}<button class="btn-tag-delete" data-item="${escHtml(item)}" title="Törlés">×</button>`;
    list.appendChild(tag);
  }
}

function renderMissingEquipment(card, car) {
  const list = card.querySelector('.missing-equip-list');
  if (!list) return;
  list.innerHTML = '';
  for (const item of (car.missingEquipment || [])) {
    const tag = document.createElement('span');
    tag.className = 'missing-equip-tag';
    tag.innerHTML = `⚠ ${escHtml(item)}<button class="btn-tag-delete" data-item="${escHtml(item)}" title="Törlés">×</button>`;
    list.appendChild(tag);
  }
}

function renderRankings(card, car) {
  const list = card.querySelector('.rankings-list');
  if (!list) return;
  list.innerHTML = '';
  for (const r of (car.rankings || [])) {
    const li = document.createElement('li');
    li.className = 'ranking-item';
    li.innerHTML = `
      <span class="ranking-pos">#${r.position}</span>
      <span class="ranking-name">${escHtml(r.name)}</span>
      <button class="btn-ranking-delete" data-name="${escHtml(r.name)}" title="Törlés">
        <svg class="ic" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    `;
    list.appendChild(li);
  }
}

function renderComments(card, car) {
  const list = card.querySelector('.comments-list');
  if (!list) return;
  list.innerHTML = '';
  for (const c of (car.comments || [])) {
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.innerHTML = `
      <div class="comment-author">${escHtml(c.author)}</div>
      <div class="comment-text">${escHtml(c.text)}</div>
      <div class="comment-time">${formatDate(c.at)}</div>
    `;
    list.appendChild(li);
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attachCardEvents(card, car) {
  const carId = car.id;


  // Summary image → lightbox at current slide
  card.querySelector('.summary-img').addEventListener('click', () => {
    const c = getCarById(carId);
    if (c && c.images && c.images.length) openLightbox(c.images, parseInt(card.dataset.imgIdx || '0', 10));
  });

  // Extra equipment
  const extraInput = card.querySelector('.extra-feature-input');
  const extraList = card.querySelector('.extra-equip-list');
  if (extraInput) {
    attachAutocomplete(extraInput, (val) => {
      const c = getCarById(carId);
      if (!c || (c.extraEquipment || []).includes(val)) return;
      c.extraEquipment = [...(c.extraEquipment || []), val];
      saveToStorage();
      renderExtraEquipment(card, c);
      apiUpdateCar(carId, { extraEquipment: c.extraEquipment });
    });
    card.querySelector('.btn-add-extra').addEventListener('click', () => {
      const val = extraInput.value.trim();
      if (!val) return;
      const c = getCarById(carId);
      if (!c || (c.extraEquipment || []).includes(val)) { extraInput.value = ''; return; }
      c.extraEquipment = [...(c.extraEquipment || []), val];
      saveToStorage();
      renderExtraEquipment(card, c);
      apiUpdateCar(carId, { extraEquipment: c.extraEquipment });
      extraInput.value = '';
    });
    extraList.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-tag-delete');
      if (!btn) return;
      const c = getCarById(carId);
      if (!c) return;
      c.extraEquipment = (c.extraEquipment || []).filter(x => x !== btn.dataset.item);
      saveToStorage();
      renderExtraEquipment(card, c);
      apiUpdateCar(carId, { extraEquipment: c.extraEquipment });
    });
  }

  // Missing equipment
  const missingInput = card.querySelector('.missing-feature-input');
  const missingList = card.querySelector('.missing-equip-list');
  if (missingInput) {
    attachAutocomplete(missingInput, (val) => {
      const c = getCarById(carId);
      if (!c || (c.missingEquipment || []).includes(val)) return;
      c.missingEquipment = [...(c.missingEquipment || []), val];
      saveToStorage();
      renderMissingEquipment(card, c);
      apiUpdateCar(carId, { missingEquipment: c.missingEquipment });
    });
    card.querySelector('.btn-add-missing').addEventListener('click', () => {
      const val = missingInput.value.trim();
      if (!val) return;
      const c = getCarById(carId);
      if (!c || (c.missingEquipment || []).includes(val)) { missingInput.value = ''; return; }
      c.missingEquipment = [...(c.missingEquipment || []), val];
      saveToStorage();
      renderMissingEquipment(card, c);
      apiUpdateCar(carId, { missingEquipment: c.missingEquipment });
      missingInput.value = '';
    });
    missingList.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-tag-delete');
      if (!btn) return;
      const c = getCarById(carId);
      if (!c) return;
      c.missingEquipment = (c.missingEquipment || []).filter(x => x !== btn.dataset.item);
      saveToStorage();
      renderMissingEquipment(card, c);
      apiUpdateCar(carId, { missingEquipment: c.missingEquipment });
    });
  }

  // Seller label toggle
  card.querySelectorAll('.btn-seller-lbl').forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = btn.dataset.val;
      const c = getCarById(carId);
      if (!c) return;
      c.sellerLabel = val;
      saveToStorage();
      card.querySelectorAll('.btn-seller-lbl').forEach(b => b.classList.toggle('active', b.dataset.val === val));
      await apiUpdateCar(carId, { sellerLabel: val });
    });
  });

  // Expand / collapse
  card.querySelector('.btn-expand').addEventListener('click', () => {
    card.classList.toggle('expanded');
    const label = card.querySelector('.btn-expand-label');
    if (label) label.textContent = card.classList.contains('expanded') ? 'Bezárás' : 'Részletek';
  });

  function setImgIdx(idx) {
    const c = getCarById(carId);
    if (!c || !c.images.length) return;
    card.dataset.imgIdx = idx;
    const si = card.querySelector('.summary-img');
    const sc = card.querySelector('.summary-img-counter');
    if (si) si.src = c.images[idx];
    if (sc && c.images.length > 1) sc.textContent = `${idx + 1}/${c.images.length}`;
  }

  // Summary thumbnail: tap left/right half or swipe to navigate images
  const thumbWrap = card.querySelector('.summary-thumb-wrap');
  const initCarForThumb = getCarById(carId);
  if (initCarForThumb && initCarForThumb.images && initCarForThumb.images.length > 1) {
    thumbWrap.classList.add('has-multiple');
  }
  let tsX = 0, wasSwiped = false;
  thumbWrap.addEventListener('touchstart', (e) => {
    tsX = e.touches[0].clientX;
    wasSwiped = false;
  }, { passive: true });
  thumbWrap.addEventListener('touchend', (e) => {
    const c = getCarById(carId);
    if (!c || !c.images || c.images.length <= 1) return;
    const dx = e.changedTouches[0].clientX - tsX;
    if (Math.abs(dx) > 25) {
      wasSwiped = true;
      setImgIdx((parseInt(card.dataset.imgIdx || '0', 10) + (dx < 0 ? 1 : -1) + c.images.length) % c.images.length);
    }
  });
  thumbWrap.addEventListener('click', (e) => {
    if (wasSwiped) { wasSwiped = false; return; }
    const c = getCarById(carId);
    if (!c || !c.images || c.images.length <= 1) return;
    const rect = thumbWrap.getBoundingClientRect();
    const delta = (e.clientX - rect.left) < rect.width / 2 ? -1 : 1;
    setImgIdx((parseInt(card.dataset.imgIdx || '0', 10) + delta + c.images.length) % c.images.length);
  });

  // Summary thumbnail prev/next arrow buttons
  card.querySelector('.sum-slide-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    const c = getCarById(carId);
    if (!c || !c.images || c.images.length <= 1) return;
    setImgIdx((parseInt(card.dataset.imgIdx || '0', 10) - 1 + c.images.length) % c.images.length);
  });
  card.querySelector('.sum-slide-next').addEventListener('click', (e) => {
    e.stopPropagation();
    const c = getCarById(carId);
    if (!c || !c.images || c.images.length <= 1) return;
    setImgIdx((parseInt(card.dataset.imgIdx || '0', 10) + 1) % c.images.length);
  });

  // Rank score info tooltip
  const rankScoreBtn = card.querySelector('.rank-score-btn');
  if (rankScoreBtn) {
    rankScoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.rank-score-tooltip').forEach(el => el.remove());
      const text = rankScoreBtn.dataset.scoreHtml || '';
      if (!text) return;
      const tip = document.createElement('div');
      tip.className = 'rank-score-tooltip';
      tip.innerHTML = text.split('\n').map((line, i, arr) =>
        i === arr.length - 1 ? `<strong>${line}</strong>` : escHtml(line)
      ).join('<br>');
      document.body.appendChild(tip);
      const btnRect = rankScoreBtn.getBoundingClientRect();
      tip.style.left = btnRect.left + 'px';
      tip.style.top  = (btnRect.bottom + 6) + 'px';
      const tipH = tip.getBoundingClientRect().height;
      if (btnRect.bottom + 6 + tipH > window.innerHeight - 8) {
        tip.style.top = (btnRect.top - tipH - 6) + 'px';
      }
      const close = () => { tip.remove(); document.removeEventListener('click', close); };
      setTimeout(() => document.addEventListener('click', close), 0);
    });
  }

  // Description expand
  card.querySelector('.car-description').addEventListener('click', function () {
    this.classList.toggle('expanded');
  });

  // Equipment toggle
  card.querySelector('.btn-toggle-equip').addEventListener('click', function () {
    const full = card.querySelector('.equipment-full');
    const preview = card.querySelector('.equipment-preview');
    const isHidden = full.style.display === 'none';
    full.style.display = isHidden ? 'block' : 'none';
    preview.style.display = isHidden ? 'none' : 'flex';
    this.textContent = isHidden ? 'Kevesebb mutatása' : 'Összes felszereltség mutatása';
  });

  // Archive button (quick archive)
  card.querySelector('.btn-archive').addEventListener('click', async () => {
    const c = getCarById(carId);
    if (!c) return;
    c.status = 'archived';
    saveToStorage();
    populateCard(card, c);
    applyFilters();
    await apiUpdateCar(carId, { status: 'archived' });
  });

  // Status dropdown
  card.querySelector('.status-select').addEventListener('change', async (e) => {
    const c = getCarById(carId);
    if (!c) return;
    c.status = e.target.value;
    saveToStorage();
    populateCard(card, c);
    applyFilters();
    await apiUpdateCar(carId, { status: c.status });
  });

  // Personal rankings form
  card.querySelector('.ranking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = card.querySelector('.ranking-input-name');
    const posEl = card.querySelector('.ranking-input-pos');
    const name = nameEl.value.trim();
    const position = parseInt(posEl.value, 10);
    if (!name || !position) return;
    const c = getCarById(carId);
    if (!c) return;
    if (!c.rankings) c.rankings = [];
    c.rankings = c.rankings.filter(r => r.name !== name);
    c.rankings.push({ name, position });
    c.rankings.sort((a, b) => a.position - b.position);
    saveToStorage();
    renderRankings(card, c);
    renderFilterBar();
    await apiUpdateCar(carId, { rankings: c.rankings });
    nameEl.value = '';
    posEl.value = '';
  });

  // Personal ranking delete (delegated)
  card.querySelector('.rankings-list').addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-ranking-delete');
    if (!btn) return;
    const name = btn.dataset.name;
    const c = getCarById(carId);
    if (!c) return;
    c.rankings = (c.rankings || []).filter(r => r.name !== name);
    saveToStorage();
    renderRankings(card, c);
    renderFilterBar();
    await apiUpdateCar(carId, { rankings: c.rankings });
  });

  // Comment form
  card.querySelector('.comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const authorEl = card.querySelector('.comment-input-author');
    const textEl = card.querySelector('.comment-input-text');
    const author = authorEl.value.trim();
    const text = textEl.value.trim();
    if (!author || !text) return;

    const c = getCarById(carId);
    if (!c) return;
    if (!c.comments) c.comments = [];
    const updated = await apiAddComment(carId, author, text);
    c.comments = updated.comments || c.comments;
    saveToStorage();
    renderComments(card, c);
    authorEl.value = '';
    textEl.value = '';
  });
}

function getCarById(id) {
  return cars.find(c => c.id === id);
}

// ============================================================
// Filter Bar
// ============================================================
function renderFilterBar() {
  const filterBar = document.getElementById('filterBar');
  if (!filterBar) return;
  filterBar.style.display = cars.length > 0 ? '' : 'none';
  const searchWrap = document.getElementById('searchBarWrap');
  if (searchWrap) searchWrap.style.display = cars.length > 0 ? '' : 'none';
  if (cars.length === 0) return;

  // ── Ár rendezés ───────────────────────────────────────────
  const rowSort = document.getElementById('filterRowSort');
  if (rowSort) {
    rowSort.innerHTML = '';
    const lbl = document.createElement('span');
    lbl.className = 'filter-section-label';
    lbl.textContent = 'Rendezés:';
    rowSort.appendChild(lbl);
    for (const [key, icon, txt] of [['rank','🏆','Rangsor'],['price_asc','↑','Ár: olcsó'],['price_desc','↓','Ár: drága']]) {
      const btn = document.createElement('button');
      btn.className = 'filter-pill' + (activeSortBy === key ? ' active' : '');
      btn.textContent = `${icon} ${txt}`;
      btn.addEventListener('click', () => {
        activeSortBy = activeSortBy === key ? null : key;
        renderAll(); renderFilterBar();
      });
      rowSort.appendChild(btn);
    }
  }

  // ── Quick filterek ────────────────────────────────────────
  const rowQuick = document.getElementById('filterRowQuick');
  if (rowQuick) {
    rowQuick.innerHTML = '';
    for (const qf of QUICK_FILTERS) {
      const isActive = activeQuickFilters.has(qf.id);
      const btn = document.createElement('button');
      btn.className = 'filter-pill' + (isActive ? ' active' : '');
      btn.innerHTML = escHtml(qf.label) + (isActive ? ' <span class="pill-x">×</span>' : '');
      btn.addEventListener('click', () => {
        if (activeQuickFilters.has(qf.id)) activeQuickFilters.delete(qf.id);
        else activeQuickFilters.add(qf.id);
        applyFilters(); renderFilterBar();
      });
      rowQuick.appendChild(btn);
    }
  }

  // ── Attribútum szűrők (Márka, Típus, Üzemanyag, Váltó, Állapot, Évjárat) ──
  const rowAttr = document.getElementById('filterRowAttr');
  if (rowAttr) {
    rowAttr.innerHTML = '';

    // Status checkbox dropdown
    const statusLabels = { active: '✅ Aktív', top: '⭐ Top', archived: '📦 Archivált' };
    const statusWrap = document.createElement('div');
    statusWrap.className = 'status-filter-wrap';
    statusWrap.addEventListener('click', e => e.stopPropagation());

    const activeNames = [...activeStatusFilters].map(s => statusLabels[s]).join(', ') || 'Nincs';
    const statusBtn = document.createElement('button');
    statusBtn.className = 'filter-attr-select status-filter-btn';
    statusBtn.textContent = `Státusz: ${activeNames}`;
    statusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      statusFilterOpen = !statusFilterOpen;
      statusPanel.style.display = statusFilterOpen ? 'block' : 'none';
    });

    const statusPanel = document.createElement('div');
    statusPanel.className = 'status-filter-panel';
    statusPanel.style.display = statusFilterOpen ? 'block' : 'none';
    for (const [val, lbl] of [['active', '✅ Aktív'], ['top', '⭐ Top'], ['archived', '📦 Archivált']]) {
      const row = document.createElement('label');
      row.className = 'status-filter-option';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = activeStatusFilters.has(val);
      cb.addEventListener('change', () => {
        if (cb.checked) activeStatusFilters.add(val);
        else activeStatusFilters.delete(val);
        applyFilters(); renderFilterBar();
      });
      row.appendChild(cb);
      row.append(' ' + lbl);
      statusPanel.appendChild(row);
    }
    statusWrap.appendChild(statusBtn);
    statusWrap.appendChild(statusPanel);
    rowAttr.appendChild(statusWrap);

    // Brand dropdown
    const brands = [...new Set(cars.map(c => c.brand).filter(Boolean))].sort();
    if (brands.length > 1) {
      const selBrand = document.createElement('select');
      selBrand.className = 'filter-attr-select';
      const defB = document.createElement('option');
      defB.value = ''; defB.textContent = 'Márka';
      selBrand.appendChild(defB);
      for (const b of brands) {
        const opt = document.createElement('option');
        opt.value = b; opt.textContent = b;
        if (activeAttrFilters.brand === b) opt.selected = true;
        selBrand.appendChild(opt);
      }
      selBrand.addEventListener('change', () => {
        activeAttrFilters.brand = selBrand.value || null;
        if (activeAttrFilters.model) {
          const modelsForBrand = [...new Set(cars.filter(c => !activeAttrFilters.brand || c.brand === activeAttrFilters.brand).map(c => c.model).filter(Boolean))];
          if (!modelsForBrand.includes(activeAttrFilters.model)) activeAttrFilters.model = null;
        }
        applyFilters(); renderFilterBar();
      });
      rowAttr.appendChild(selBrand);
    }

    // Model dropdown (filtered by selected brand)
    const modelsSource = activeAttrFilters.brand
      ? cars.filter(c => c.brand === activeAttrFilters.brand)
      : cars;
    const models = [...new Set(modelsSource.map(c => c.model).filter(Boolean))].sort();
    if (models.length > 1) {
      const selModel = document.createElement('select');
      selModel.className = 'filter-attr-select';
      const defM = document.createElement('option');
      defM.value = ''; defM.textContent = 'Típus';
      selModel.appendChild(defM);
      for (const m of models) {
        const opt = document.createElement('option');
        opt.value = m; opt.textContent = m;
        if (activeAttrFilters.model === m) opt.selected = true;
        selModel.appendChild(opt);
      }
      selModel.addEventListener('change', () => { activeAttrFilters.model = selModel.value || null; applyFilters(); });
      rowAttr.appendChild(selModel);
    }

    for (const { key, label } of [
      { key: 'fuel', label: 'Üzemanyag' },
      { key: 'transmission', label: 'Váltó' },
      { key: 'condition', label: 'Állapot' },
    ]) {
      const vals = [...new Set(cars.map(c => c[key]).filter(Boolean))].sort();
      if (!vals.length) continue;
      const sel = document.createElement('select');
      sel.className = 'filter-attr-select';
      const defOpt = document.createElement('option');
      defOpt.value = ''; defOpt.textContent = label;
      sel.appendChild(defOpt);
      for (const v of vals) {
        const opt = document.createElement('option');
        opt.value = v; opt.textContent = v;
        if (activeAttrFilters[key] === v) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener('change', () => { activeAttrFilters[key] = sel.value || null; applyFilters(); });
      rowAttr.appendChild(sel);
    }
    const yearVals = cars.map(c => c.year).filter(Boolean);
    if (yearVals.length > 1) {
      const yLbl = document.createElement('span');
      yLbl.className = 'filter-section-label'; yLbl.textContent = 'Évjárat:';
      rowAttr.appendChild(yLbl);
      for (const [field, ph] of [['yearFrom','tól'],['yearTo','ig']]) {
        const inp = document.createElement('input');
        inp.type = 'number'; inp.className = 'filter-year-input'; inp.placeholder = ph;
        inp.min = Math.min(...yearVals); inp.max = Math.max(...yearVals);
        inp.value = activeAttrFilters[field] || '';
        inp.addEventListener('change', () => {
          activeAttrFilters[field] = inp.value ? parseInt(inp.value) : null;
          applyFilters();
        });
        rowAttr.appendChild(inp);
      }
    }
  }

  // ── Felszereltség szűrő (keresés a CAR_FEATURES / tényleges eq-ban) ──
  const rowFeature = document.getElementById('filterRowFeature');
  if (rowFeature) {
    rowFeature.innerHTML = '';
    // Active feature pills
    for (const feat of activeFeatureFilters) {
      const pill = document.createElement('button');
      pill.className = 'filter-pill active';
      pill.innerHTML = escHtml(feat) + ' <span class="pill-x">×</span>';
      pill.addEventListener('click', () => {
        activeFeatureFilters.delete(feat);
        applyFilters(); renderFilterBar();
      });
      rowFeature.appendChild(pill);
    }
    // Search input
    const wrap = document.createElement('div');
    wrap.className = 'filter-feature-wrap';
    const input = document.createElement('input');
    input.type = 'text'; input.className = 'filter-feature-search';
    input.placeholder = '🔍 Felszereltség szűrő…';
    const suggestions = document.createElement('div');
    suggestions.className = 'filter-feature-suggestions';
    suggestions.style.display = 'none';

    const availEq = new Set();
    for (const car of cars) for (const e of (car.equipment || [])) availEq.add(e);

    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      suggestions.innerHTML = '';
      if (!q) { suggestions.style.display = 'none'; return; }
      const matches = [...availEq]
        .filter(f => f.toLowerCase().includes(q) && !activeFeatureFilters.has(f))
        .slice(0, 12);
      if (!matches.length) { suggestions.style.display = 'none'; return; }
      for (const m of matches) {
        const item = document.createElement('div');
        item.className = 'filter-feature-suggestion-item';
        item.textContent = m;
        item.addEventListener('mousedown', e => {
          e.preventDefault();
          activeFeatureFilters.add(m);
          input.value = '';
          suggestions.style.display = 'none';
          applyFilters(); renderFilterBar();
        });
        suggestions.appendChild(item);
      }
      suggestions.style.display = 'block';
    });
    input.addEventListener('blur', () => { setTimeout(() => { suggestions.style.display = 'none'; }, 150); });
    wrap.appendChild(input); wrap.appendChild(suggestions);
    rowFeature.appendChild(wrap);
  }

  // ── Személy filter (rangsorok alapján) ────────────────────
  const pillsContainer = document.getElementById('filterPills');
  const rowPerson = document.getElementById('filterRowPerson');
  if (pillsContainer) {
    pillsContainer.innerHTML = '';
    const names = new Set();
    for (const car of cars) for (const r of (car.rankings || [])) if (r.name) names.add(r.name);
    if (rowPerson) rowPerson.style.display = names.size > 0 ? '' : 'none';
    for (const name of [...names].sort()) {
      const pill = document.createElement('button');
      pill.className = 'filter-pill' + (activePersonFilter === name ? ' active' : '');
      pill.innerHTML = escHtml(name + ' rangsora') + (activePersonFilter === name ? ' <span class="pill-x">×</span>' : '');
      pill.addEventListener('click', () => {
        activePersonFilter = activePersonFilter === name ? null : name;
        applyFilters(); renderFilterBar();
      });
      pillsContainer.appendChild(pill);
    }
  }
}

function applyFilters() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;
  for (const cardEl of grid.querySelectorAll('.car-card')) {
    const car = cars.find(c => String(c.id) === String(cardEl.dataset.id));
    if (!car) { cardEl.style.display = 'none'; continue; }
    let v = true;
    // Status filter
    if (v) v = activeStatusFilters.has(car.status || 'active');
    if (v && activeSearch) {
      const q = activeSearch.toLowerCase();
      const hay = [car.name, car.brand, car.model, car.fuel, car.transmission, car.sellerLocation,
                   ...(car.equipment || []), ...(car.top5 || [])].join(' ').toLowerCase();
      v = hay.includes(q);
    }
    if (v && activePersonFilter)
      v = (car.rankings || []).some(r => r.name === activePersonFilter);
    for (const id of activeQuickFilters) {
      if (!v) break;
      const qf = QUICK_FILTERS.find(f => f.id === id);
      if (qf && !qf.test(car)) v = false;
    }
    if (v && activeAttrFilters.brand)        v = car.brand === activeAttrFilters.brand;
    if (v && activeAttrFilters.model)        v = car.model === activeAttrFilters.model;
    if (v && activeAttrFilters.fuel)         v = car.fuel === activeAttrFilters.fuel;
    if (v && activeAttrFilters.transmission) v = car.transmission === activeAttrFilters.transmission;
    if (v && activeAttrFilters.condition)    v = car.condition === activeAttrFilters.condition;
    if (v && activeAttrFilters.yearFrom)     v = (car.year || 0) >= activeAttrFilters.yearFrom;
    if (v && activeAttrFilters.yearTo)       v = (car.year || 9999) <= activeAttrFilters.yearTo;
    for (const feat of activeFeatureFilters) {
      if (!v) break;
      v = (car.equipment || []).includes(feat);
    }
    cardEl.style.display = v ? '' : 'none';
  }
}

// ============================================================
// Comparison Table
// ============================================================
function renderCompareTable() {
  if (document.getElementById('compareSection').style.display === 'none') return;
  buildCompareTable();
}

function buildCompareTable() {
  const thead = document.getElementById('compareHead');
  const tbody = document.getElementById('compareBody');

  if (cars.length === 0) {
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="2" style="padding:20px;color:#64748b">Nincs összehasonlítható autó</td></tr>';
    return;
  }

  const sorted = getDisplayCars();

  // Header
  thead.innerHTML = '';
  const headRow = document.createElement('tr');
  const thLabel = document.createElement('th');
  thLabel.textContent = 'Tulajdonság';
  headRow.appendChild(thLabel);
  for (const car of sorted) {
    const th = document.createElement('th');
    th.textContent = car.name || car.brand + ' ' + car.model;
    th.style.maxWidth = '180px';
    th.style.whiteSpace = 'normal';
    th.style.wordBreak = 'break-word';
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);

  // Rows definition
  const rows = [
    {
      label: 'Ár',
      getValue: c => c.price,
      display: c => c.price ? formatPrice(c.price) : '—',
      best: 'min',
    },
    {
      label: 'Km-óraállás',
      getValue: c => c.mileage,
      display: c => c.mileage != null ? formatMileage(c.mileage) : '—',
      best: 'min',
    },
    {
      label: 'Évjárat',
      getValue: c => c.year,
      display: c => c.year || '—',
      best: 'max',
    },
    {
      label: 'Üzemanyag',
      getValue: null,
      display: c => c.fuel || '—',
    },
    {
      label: 'Váltó',
      getValue: null,
      display: c => c.transmission || '—',
    },
    {
      label: 'Állapot',
      getValue: null,
      display: c => c.condition || '—',
    },
    {
      label: 'Karosszéria',
      getValue: null,
      display: c => c.bodyType || '—',
    },
    {
      label: 'Szín',
      getValue: null,
      display: c => c.color || '—',
    },
    {
      label: 'Eladó',
      getValue: null,
      display: c => c.seller || '—',
    },
  ];

  tbody.innerHTML = '';
  for (const row of rows) {
    const tr = document.createElement('tr');

    const tdLabel = document.createElement('td');
    tdLabel.textContent = row.label;
    tr.appendChild(tdLabel);

    const values = sorted.map(c => row.getValue ? row.getValue(c) : null);
    let minVal = null, maxVal = null;
    if (row.best) {
      const nums = values.filter(v => v != null && !isNaN(v));
      if (nums.length > 1) {
        minVal = Math.min(...nums);
        maxVal = Math.max(...nums);
      }
    }

    for (let i = 0; i < sorted.length; i++) {
      const td = document.createElement('td');
      const displayText = row.display(sorted[i]);
      td.textContent = displayText;

      if (row.getValue && minVal !== null && maxVal !== null) {
        const val = values[i];
        if (val != null) {
          if (row.best === 'min' && val === minVal) td.classList.add('cell-best');
          else if (row.best === 'max' && val === maxVal) td.classList.add('cell-best');
          if (row.best === 'min' && val === maxVal && minVal !== maxVal) td.classList.add('cell-worst');
          else if (row.best === 'max' && val === minVal && minVal !== maxVal) td.classList.add('cell-worst');
        }
      }

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
}

// ============================================================
// Manual Car Add
// ============================================================
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderManualImgPreview() {
  const preview = document.getElementById('manualImgPreview');
  if (!preview) return;
  preview.innerHTML = '';
  manualImageDataUrls.forEach((url, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'manual-img-thumb';
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Kép ${i + 1}`;
    const btn = document.createElement('button');
    btn.className = 'manual-img-remove';
    btn.type = 'button';
    btn.textContent = '×';
    btn.addEventListener('click', () => {
      manualImageDataUrls.splice(i, 1);
      renderManualImgPreview();
    });
    wrap.appendChild(img);
    wrap.appendChild(btn);
    preview.appendChild(wrap);
  });
}

function parseManualCarText(name, text) {
  const lower = text.toLowerCase();

  // Price: "11 900 000 Ft" or "11.900.000 Ft" or "11 900 000 forint"
  let price = null;
  const priceM = text.match(/(\d[\d\s.]*)[\s]*(millió\s*ft|millió\s*forint)/i);
  if (priceM) {
    price = Math.round(parseFloat(priceM[1].replace(/[\s.]/g, '').replace(',', '.')) * 1_000_000);
  } else {
    const priceM2 = text.match(/(\d[\d\s.]{4,})\s*(ft|forint)/i);
    if (priceM2) price = parseInt(priceM2[1].replace(/[\s.]/g, ''), 10);
  }

  // Year: 4-digit 1990-2030
  let year = null;
  const yearM = text.match(/\b(199\d|20[012]\d)\b/);
  if (yearM) year = parseInt(yearM[1], 10);

  // Mileage: "125 000 km"
  let mileage = null;
  const mileM = text.match(/(\d[\d\s.]*)\s*km/i);
  if (mileM) mileage = parseInt(mileM[1].replace(/[\s.]/g, ''), 10);

  // Fuel
  let fuel = '';
  if (lower.includes('plug-in') || lower.includes('plugin') || lower.includes('phev')) fuel = 'Plug-In Hibrid (PHEV)';
  else if (lower.includes('hibrid') || lower.includes('hybrid')) fuel = 'Hibrid';
  else if (lower.includes('elektromos') || lower.includes('electric') || lower.includes('bev')) fuel = 'Elektromos';
  else if (lower.includes('dízel') || lower.includes('diesel')) fuel = 'Dízel';
  else if (lower.includes('benzin') || lower.includes('petrol') || lower.includes('gasoline')) fuel = 'Benzin';

  // Transmission
  let transmission = '';
  if (lower.includes('fokozatmentes') || lower.includes('e-cvt') || lower.includes('cvt')) transmission = 'Fokozatmentes automata';
  else if (lower.includes('automata') || lower.includes('automatic') || lower.includes('tiptronic') || lower.includes('dct')) transmission = 'Automata';
  else if (lower.includes('manuális') || lower.includes('manual')) transmission = 'Manuális';

  // Equipment: meaningful lines (length 4-80, not pure numbers)
  const equipment = text.split(/[\n;]/)
    .map(s => s.trim())
    .filter(s => s.length >= 4 && s.length <= 80 && !/^\d+$/.test(s));

  // Seller location
  let sellerLocation = '';
  const locM = text.match(/\b(budapest|pest|győr|debrecen|miskolc|pécs|nyíregyháza|kecskemét|székesfehérvár|szombathely)\b/i);
  if (locM) sellerLocation = locM[0].charAt(0).toUpperCase() + locM[0].slice(1).toLowerCase();

  const nameParts = name.trim().split(/\s+/);
  const brand = nameParts[0] || '';
  const model = nameParts.slice(1).join(' ');

  return {
    id: 'manual_' + Date.now(),
    name: name.trim(),
    brand,
    model,
    price,
    year,
    mileage,
    fuel,
    transmission,
    equipment,
    top5: [],
    images: [],
    url: '',
    sellerLocation,
    sellerLabel: '',
    carConditionLabel: 'new',
    order: 0,
    manual: true,
  };
  car.top5 = computeTop5(car);
  return car;
}

async function handleManualAdd() {
  const nameEl      = document.getElementById('manualName');
  const textEl      = document.getElementById('manualText');
  const priceEl     = document.getElementById('manualPrice');
  const trunkEl     = document.getElementById('manualTrunk');
  const listingUrlEl = document.getElementById('manualListingUrl');
  const errorEl     = document.getElementById('manualError');
  const btnText     = document.getElementById('btnManualAddText');
  const spinner     = document.getElementById('btnManualAddSpinner');
  const btn         = document.getElementById('btnManualAdd');

  const name = nameEl.value.trim();
  const text = textEl.value.trim();
  errorEl.style.display = 'none';

  if (!name) { errorEl.textContent = 'Add meg az autó nevét!'; errorEl.style.display = 'block'; return; }

  const carData = parseManualCarText(name, text);

  // Explicit fields override auto-parsed values
  if (priceEl.value) carData.price = parseInt(priceEl.value.replace(/\D/g, ''), 10) || carData.price;
  if (trunkEl.value) carData.trunkVolume = trunkEl.value.trim() + ' l';
  if (listingUrlEl && listingUrlEl.value.trim()) carData.url = listingUrlEl.value.trim();
  if (manualImageDataUrls.length > 0) carData.images = [...manualImageDataUrls];

  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  btn.disabled = true;

  try {
    const resp = await fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manual: true, carData }),
    });
    if (!resp.ok) { const d = await resp.json(); throw new Error(d.error || 'Szerverhiba'); }
    const car = await resp.json();
    cars.push(car);
    saveToStorage();
    renderAll();
    renderCompareTable();
    nameEl.value = '';
    textEl.value = '';
    if (priceEl) priceEl.value = '';
    if (trunkEl) trunkEl.value = '';
    if (listingUrlEl) listingUrlEl.value = '';
    manualImageDataUrls = [];
    renderManualImgPreview();
    document.getElementById('manualForm').style.display = 'none';
    showToast(`✅ ${car.name} sikeresen hozzáadva!`);
  } catch (e) {
    errorEl.textContent = `Hiba: ${e.message}`;
    errorEl.style.display = 'block';
  } finally {
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    btn.disabled = false;
  }
}

// ============================================================
// Add Car Flow
// ============================================================
async function handleAddCar() {
  const urlInput = document.getElementById('urlInput');
  const errorEl = document.getElementById('addError');
  const btnAdd = document.getElementById('btnAdd');
  const btnText = document.getElementById('btnAddText');
  const spinner = document.getElementById('btnAddSpinner');

  const rawUrl = urlInput.value.trim();
  errorEl.style.display = 'none';

  if (!rawUrl) {
    showError('Kérlek illeszd be a hasznaltauto.hu hirdetés URL-jét!');
    return;
  }

  // Validate URL
  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch (e) {
    showError('Érvénytelen URL. Másold be a böngésző címsorából!');
    return;
  }

  if (!parsedUrl.hostname.includes('hasznaltauto.hu')) {
    showError('Csak hasznaltauto.hu URL-eket lehet hozzáadni!');
    return;
  }

  // Check duplicate
  const existingId = extractIdFromUrl(rawUrl);
  if (existingId && cars.some(c => c.id === existingId)) {
    showError('Ez a hirdetés már hozzá van adva!');
    return;
  }

  // Loading state
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  btnAdd.disabled = true;
  urlInput.disabled = true;

  try {
    const car = await apiAddCar(rawUrl);
    cars.push(car);
    saveToStorage();
    renderAll();
    renderCompareTable();
    urlInput.value = '';
    showToast(`✅ ${car.name || 'Autó'} sikeresen hozzáadva!`);
  } catch (e) {
    showError(`Hiba: ${e.message || 'Ismeretlen hiba'}`);
    console.error(e);
  } finally {
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    btnAdd.disabled = false;
    urlInput.disabled = false;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }
}

// ============================================================
// Export / Import
// ============================================================
function exportCars() {
  const data = JSON.stringify(cars, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cars_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCars(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Érvénytelen formátum');
      cars = data;
      cars.forEach((c, i) => { if (c.order == null) c.order = i; });
      saveToStorage();
      renderAll();
      renderCompareTable();
    } catch (err) {
      alert('Importálási hiba: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ============================================================
// Fetch from origin data/cars.json (fallback on empty)
// ============================================================
async function tryFetchLocalData() {
  try {
    const resp = await fetch('./data/cars.json');
    if (!resp.ok) return;
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      cars = data;
      cars.forEach((c, i) => { if (c.order == null) c.order = i; });
      saveToStorage();
      renderAll();
    }
  } catch (e) {
    // silently ignore — no local data file
  }
}

// ============================================================
// SortableJS init
// ============================================================
function initSortable() {
  const grid = document.getElementById('carsGrid');
  if (typeof Sortable === 'undefined') return;

  Sortable.create(grid, {
    animation: 180,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    handle: '.card-header-row',
    filter: '.btn-archive, .status-select, .slide-btn, .btn-toggle-equip, .comment-form, a',
    onEnd: async () => {
      const cardEls = grid.querySelectorAll('.car-card');
      cardEls.forEach((el, i) => {
        const id = parseInt(el.dataset.id, 10) || el.dataset.id;
        const car = cars.find(c => String(c.id) === String(id));
        if (car) car.order = i;
      });
      saveToStorage();
      await apiSaveOrder(cars.map(x => x.id));
      renderCompareTable();
    },
  });
}

// ============================================================
// Init
// ============================================================
async function init() {
  try {
    cars = await apiLoadCars();
    cars.forEach((c, i) => { if (c.order == null) c.order = i; });
    saveToStorage();
  } catch (e) {
    console.warn('API load failed, using localStorage cache', e);
    cars = loadFromStorage() || [];
  }
  renderAll();

  // Add car button
  document.getElementById('btnAdd').addEventListener('click', handleAddCar);
  document.getElementById('urlInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddCar();
  });

  // Search
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      activeSearch = searchInput.value.trim();
      applyFilters();
    });
  }

  // Close status filter panel on outside click
  document.addEventListener('click', () => {
    if (statusFilterOpen) {
      statusFilterOpen = false;
      const panel = document.querySelector('.status-filter-panel');
      if (panel) panel.style.display = 'none';
    }
  });

  // Manual add toggle
  document.getElementById('btnManualToggle').addEventListener('click', () => {
    const form = document.getElementById('manualForm');
    const visible = form.style.display !== 'none';
    form.style.display = visible ? 'none' : 'flex';
  });
  document.getElementById('btnManualAdd').addEventListener('click', handleManualAdd);

  // Image file upload for manual form
  document.getElementById('manualImages').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const compressed = await Promise.all(files.map(compressImage));
    manualImageDataUrls.push(...compressed);
    renderManualImgPreview();
    e.target.value = '';
  });

  // Image URL add for manual form
  document.getElementById('btnManualImageUrl').addEventListener('click', () => {
    const input = document.getElementById('manualImageUrl');
    const url = input.value.trim();
    if (!url) return;
    try { new URL(url); } catch { return; }
    manualImageDataUrls.push(url);
    renderManualImgPreview();
    input.value = '';
  });
  document.getElementById('manualImageUrl').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btnManualImageUrl').click();
  });

  // Compare toggle
  document.getElementById('btnCompare').addEventListener('click', () => {
    const section = document.getElementById('compareSection');
    const isHidden = section.style.display === 'none';
    section.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      buildCompareTable();
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  document.getElementById('btnCloseCompare').addEventListener('click', () => {
    document.getElementById('compareSection').style.display = 'none';
  });

  // Export
  const btnExport = document.getElementById('btnExport');
  if (btnExport) btnExport.addEventListener('click', exportCars);

  // Import
  const fileImport = document.getElementById('fileImport');
  if (fileImport) fileImport.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importCars(e.target.files[0]);
      e.target.value = '';
    }
  });

  // View toggle (grid / list)
  const carsGrid = document.getElementById('carsGrid');
  let viewMode = localStorage.getItem('carbuy_view') || 'grid';
  function applyViewMode() {
    carsGrid.classList.toggle('view-list', viewMode === 'list');
    document.getElementById('btnViewGrid').classList.toggle('btn-active', viewMode === 'grid');
    document.getElementById('btnViewList').classList.toggle('btn-active', viewMode === 'list');
  }
  document.getElementById('btnViewGrid').addEventListener('click', () => { viewMode = 'grid'; localStorage.setItem('carbuy_view', viewMode); applyViewMode(); });
  document.getElementById('btnViewList').addEventListener('click', () => { viewMode = 'list'; localStorage.setItem('carbuy_view', viewMode); applyViewMode(); });
  applyViewMode();

  // Theme toggle
  document.getElementById('btnTheme').addEventListener('click', toggleTheme);

  // Lightbox controls
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => {
    lightboxIdx = (lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightboxImg();
  });
  document.getElementById('lightboxNext').addEventListener('click', () => {
    lightboxIdx = (lightboxIdx + 1) % lightboxImages.length;
    updateLightboxImg();
  });
  document.getElementById('lightboxImg').addEventListener('click', () => {
    lightboxIdx = (lightboxIdx + 1) % lightboxImages.length;
    updateLightboxImg();
  });
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox').classList.contains('visible')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') { lightboxIdx = (lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length; updateLightboxImg(); }
    else if (e.key === 'ArrowRight') { lightboxIdx = (lightboxIdx + 1) % lightboxImages.length; updateLightboxImg(); }
  });

  // Lightbox swipe on mobile
  let lbTsX = 0;
  document.getElementById('lightbox').addEventListener('touchstart', (e) => {
    lbTsX = e.touches[0].clientX;
  }, { passive: true });
  document.getElementById('lightbox').addEventListener('touchend', (e) => {
    if (!lightboxImages.length) return;
    const dx = e.changedTouches[0].clientX - lbTsX;
    if (Math.abs(dx) > 40) {
      lightboxIdx = (lightboxIdx + (dx < 0 ? 1 : -1) + lightboxImages.length) % lightboxImages.length;
      updateLightboxImg();
    }
  }, { passive: true });

  // Rank info modal
  const rankInfoModal = document.getElementById('rankInfoModal');
  document.getElementById('btnRankInfo').addEventListener('click', () => {
    rankInfoModal.classList.add('visible');
  });
  document.getElementById('rankInfoClose').addEventListener('click', () => {
    rankInfoModal.classList.remove('visible');
  });
  rankInfoModal.addEventListener('click', (e) => {
    if (e.target === rankInfoModal) rankInfoModal.classList.remove('visible');
  });
  document.getElementById('btnTop5Expand').addEventListener('click', (e) => {
    e.preventDefault();
    const detail = document.getElementById('top5Detail');
    detail.classList.toggle('open');
    e.currentTarget.textContent = detail.classList.contains('open') ? 'bezár ▴' : 'mit néz? ▾';
  });

  // SortableJS
  initSortable();

  // ── Personal ranking modal ─────────────────────────────────
  let prmSortable = null;

  function openPrmModal(prefillName) {
    const modal = document.getElementById('prmModal');
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
    const nameInput = document.getElementById('prmNameInput');
    nameInput.value = prefillName || '';
    renderPrmExistingNames();
    renderPrmList(nameInput.value.trim());
    if (!prefillName) nameInput.focus();
  }

  function closePrmModal() {
    document.getElementById('prmModal').classList.remove('visible');
    document.body.style.overflow = '';
  }

  function renderPrmExistingNames() {
    const names = new Set();
    for (const car of cars) for (const r of (car.rankings || [])) if (r.name) names.add(r.name);
    const container = document.getElementById('prmExistingNames');
    container.innerHTML = '';
    for (const name of [...names].sort()) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'prm-name-chip';
      chip.textContent = name;
      chip.addEventListener('click', () => {
        document.getElementById('prmNameInput').value = name;
        renderPrmList(name);
      });
      container.appendChild(chip);
    }
  }

  function renderPrmList(name) {
    const list = document.getElementById('prmList');
    list.innerHTML = '';
    if (prmSortable) { prmSortable.destroy(); prmSortable = null; }
    const sorted = [...cars].sort((a, b) => {
      const rA = (a.rankings || []).find(r => r.name === name);
      const rB = (b.rankings || []).find(r => r.name === name);
      if (rA && rB) return rA.position - rB.position;
      if (rA) return -1;
      if (rB) return 1;
      return computeAutoScore(b) - computeAutoScore(a);
    });
    sorted.forEach((car, i) => {
      const li = document.createElement('li');
      li.className = 'prm-item';
      li.dataset.id = car.id;
      const thumb = car.images && car.images[0] ? escHtml(car.images[0]) : '';
      const price = car.price ? car.price.toLocaleString('hu-HU') + ' Ft' : '';
      const top5 = car.top5 || [];
      li.innerHTML =
        '<div class="prm-item-main">' +
        `<input class="prm-pos-input" type="number" value="${i + 1}" min="1" max="${sorted.length}" />` +
        (thumb ? `<img class="prm-thumb" src="${thumb}" loading="lazy" />` : '<div class="prm-thumb-empty"></div>') +
        `<span class="prm-car-name">${escHtml(car.name || 'Ismeretlen')}</span>` +
        (price ? `<span class="prm-car-price">${escHtml(price)}</span>` : '') +
        (top5.length ? '<button class="prm-highlights-btn" type="button">&#9660; kiemelések</button>' : '') +
        '<span class="prm-drag-handle">⠿⠿</span>' +
        '</div>' +
        (top5.length ? `<div class="prm-highlights">${top5.map(h => `<span class="prm-highlight-tag">${escHtml(h)}</span>`).join('')}</div>` : '');
      list.appendChild(li);

      const posInput = li.querySelector('.prm-pos-input');
      posInput.addEventListener('change', () => {
        const n = list.querySelectorAll('.prm-item').length;
        const targetPos = Math.max(1, Math.min(n, parseInt(posInput.value, 10) || 1));
        posInput.value = targetPos;
        const allItems = [...list.querySelectorAll('.prm-item')];
        const currentIdx = allItems.indexOf(li);
        const targetIdx = targetPos - 1;
        if (currentIdx !== targetIdx) {
          allItems.splice(currentIdx, 1);
          allItems.splice(targetIdx, 0, li);
          allItems.forEach(item => list.appendChild(item));
        }
        list.querySelectorAll('.prm-item').forEach((item, idx) => {
          item.querySelector('.prm-pos-input').value = idx + 1;
        });
      });

      const hlBtn = li.querySelector('.prm-highlights-btn');
      const hlDiv = li.querySelector('.prm-highlights');
      if (hlBtn && hlDiv) {
        hlBtn.addEventListener('click', () => {
          hlDiv.classList.toggle('open');
          hlBtn.textContent = hlDiv.classList.contains('open') ? '▲ kiemelések' : '▼ kiemelések';
        });
      }
    });
    prmSortable = Sortable.create(list, {
      animation: 150,
      handle: '.prm-drag-handle',
      onEnd: () => {
        list.querySelectorAll('.prm-item').forEach((item, i) => {
          item.querySelector('.prm-pos-input').value = i + 1;
        });
      },
    });
  }

  async function savePrmRanking() {
    const name = document.getElementById('prmNameInput').value.trim();
    if (!name) { document.getElementById('prmNameInput').focus(); return; }
    const items = [...document.getElementById('prmList').querySelectorAll('.prm-item')];
    const btn = document.getElementById('btnSavePrm');
    btn.disabled = true;
    btn.textContent = 'Mentés…';
    try {
      for (let i = 0; i < items.length; i++) {
        const id = items[i].dataset.id;
        const car = cars.find(c => String(c.id) === String(id));
        if (!car) continue;
        const rankings = (car.rankings || []).filter(r => r.name !== name);
        rankings.push({ name, position: i + 1 });
        await apiUpdateCar(car.id, { rankings });
        car.rankings = rankings;
      }
      closePrmModal();
      renderAll();
      renderFilterBar();
    } finally {
      btn.disabled = false;
      btn.textContent = 'Mentés';
    }
  }

  const btnOpenPrm = document.getElementById('btnOpenPrm');
  if (btnOpenPrm) btnOpenPrm.addEventListener('click', () => openPrmModal());
  const btnClosePrm = document.getElementById('btnClosePrm');
  if (btnClosePrm) btnClosePrm.addEventListener('click', closePrmModal);
  const btnCancelPrm = document.getElementById('btnCancelPrm');
  if (btnCancelPrm) btnCancelPrm.addEventListener('click', closePrmModal);
  const btnSavePrm = document.getElementById('btnSavePrm');
  if (btnSavePrm) btnSavePrm.addEventListener('click', savePrmRanking);
  const prmModal = document.getElementById('prmModal');
  if (prmModal) prmModal.addEventListener('click', e => { if (e.target === prmModal) closePrmModal(); });
  const prmNameInput = document.getElementById('prmNameInput');
  if (prmNameInput) prmNameInput.addEventListener('input', () => renderPrmList(prmNameInput.value.trim()));
}

// ============================================================
// Boot
// ============================================================
initTheme();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
