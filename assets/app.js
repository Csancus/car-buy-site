/* ============================================================
   Car Buy Site — Vanilla JS
   Hasznaltauto.hu comparison app
   ============================================================ */

'use strict';

// ============================================================
// Constants
// ============================================================
const STORAGE_KEY = 'carbuy_cars';

// ============================================================
// State
// ============================================================
let cars = [];
let autoRanks = {};
let activePersonFilter = null;

// ============================================================
// Utils
// ============================================================
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
// Auto Ranking
// ============================================================
function computeAutoScore(car) {
  let score = 0;
  if (car.price) score += Math.max(0, 30 * (1 - car.price / 15_000_000));
  if (car.mileage != null) score += Math.max(0, 25 * (1 - car.mileage / 300_000));
  if (car.year) score += Math.max(0, Math.min(20, (car.year - 2010) / 16 * 20));
  score += Math.min(15, (car.top5 || []).length * 3);
  score += Math.min(10, Math.floor((car.equipment || []).length / 5));
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
  if (fuel.includes('hibrid') || fuel.includes('elektromos')) {
    add('🔌 Plugin Hibrid / Elektromos hajtás', 10);
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

  // Reorder and insert missing
  const fragment = document.createDocumentFragment();
  for (const car of cars) {
    let cardEl = grid.querySelector(`.car-card[data-id="${car.id}"]`);
    if (!cardEl) {
      cardEl = buildCard(car);
    } else {
      updateCard(cardEl, car);
    }
    fragment.appendChild(cardEl);
  }
  grid.appendChild(fragment);

  applyPersonFilter();
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
  if (btnListing) btnListing.href = car.url;

  // Auto rank badge
  const rankBadge = card.querySelector('.auto-rank-badge');
  if (rankBadge) {
    const rank = autoRanks[String(car.id)];
    if (rank && cars.length > 1) {
      rankBadge.textContent = `#${rank}`;
      rankBadge.style.display = 'inline';
      rankBadge.className = `auto-rank-badge rank-${rank <= 3 ? rank : 'other'}`;
    } else {
      rankBadge.style.display = 'none';
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
  setSum('.sum-condition', car.condition || '');

  // Condition label buttons
  card.querySelectorAll('.btn-cond-lbl').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === (car.carConditionLabel ?? 'used'));
  });

  // Detail slideshow
  const img = card.querySelector('.slideshow-img');
  const counter = card.querySelector('.slide-counter');
  const slidePrev = card.querySelector('.slide-prev');
  const slideNext = card.querySelector('.slide-next');
  const slideshowEl = card.querySelector('.card-slideshow');

  let currentIdx = parseInt(card.dataset.imgIdx || '0', 10);
  if (currentIdx >= (car.images || []).length) currentIdx = 0;
  card.dataset.imgIdx = currentIdx;

  if (car.images && car.images.length > 0) {
    img.src = car.images[currentIdx];
    img.alt = car.name;
    img.style.display = 'block';
    const ph = slideshowEl && slideshowEl.querySelector('.no-image-placeholder');
    if (ph) ph.remove();
    if (counter) counter.textContent = `${currentIdx + 1}/${car.images.length}`;
  } else {
    img.style.display = 'none';
    if (slideshowEl && !slideshowEl.querySelector('.no-image-placeholder')) {
      const ph = document.createElement('div');
      ph.className = 'no-image-placeholder';
      ph.textContent = '🚗';
      const si = slideshowEl.querySelector('.slideshow-images');
      if (si) si.appendChild(ph);
    }
    if (counter) counter.textContent = '0/0';
  }

  if (slidePrev) slidePrev.style.display = (car.images && car.images.length > 1) ? 'flex' : 'none';
  if (slideNext) slideNext.style.display = (car.images && car.images.length > 1) ? 'flex' : 'none';

  const link = card.querySelector('.card-link-badge');
  if (link) link.href = car.url;

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

  // Personal rankings
  renderRankings(card, car);

  // Comments
  renderComments(card, car);
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

  // Condition label toggle
  card.querySelectorAll('.btn-cond-lbl').forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = btn.dataset.val;
      const c = getCarById(carId);
      if (!c) return;
      c.carConditionLabel = val;
      saveToStorage();
      card.querySelectorAll('.btn-cond-lbl').forEach(b => b.classList.toggle('active', b.dataset.val === val));
      await apiUpdateCar(carId, { carConditionLabel: val });
    });
  });

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

  // Slideshow
  const img = card.querySelector('.slideshow-img');
  const counter = card.querySelector('.slide-counter');

  card.querySelector('.slide-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    const c = getCarById(carId);
    if (!c || !c.images.length) return;
    let idx = parseInt(card.dataset.imgIdx || '0', 10);
    idx = (idx - 1 + c.images.length) % c.images.length;
    card.dataset.imgIdx = idx;
    img.src = c.images[idx];
    counter.textContent = `${idx + 1}/${c.images.length}`;
  });

  card.querySelector('.slide-next').addEventListener('click', (e) => {
    e.stopPropagation();
    const c = getCarById(carId);
    if (!c || !c.images.length) return;
    let idx = parseInt(card.dataset.imgIdx || '0', 10);
    idx = (idx + 1) % c.images.length;
    card.dataset.imgIdx = idx;
    img.src = c.images[idx];
    counter.textContent = `${idx + 1}/${c.images.length}`;
  });

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

  // Order up
  card.querySelector('.btn-up').addEventListener('click', async () => {
    const c = getCarById(carId);
    if (!c) return;
    const idx = cars.findIndex(x => x.id === c.id);
    if (idx > 0) {
      cars[idx].order = idx - 1;
      cars[idx - 1].order = idx;
      cars.sort((a, b) => a.order - b.order);
      saveToStorage();
      await apiSaveOrder(cars.map(x => x.id));
      renderAll();
    }
  });

  // Order down
  card.querySelector('.btn-down').addEventListener('click', async () => {
    const c = getCarById(carId);
    if (!c) return;
    const idx = cars.findIndex(x => x.id === c.id);
    if (idx < cars.length - 1) {
      cars[idx].order = idx + 1;
      cars[idx + 1].order = idx;
      cars.sort((a, b) => a.order - b.order);
      saveToStorage();
      await apiSaveOrder(cars.map(x => x.id));
      renderAll();
    }
  });

  // Delete
  card.querySelector('.btn-delete').addEventListener('click', async () => {
    if (await showConfirm(`Biztosan törlöd ezt a hirdetést?\n${car.name}`)) {
      await apiDeleteCar(carId);
      cars = cars.filter(c => c.id !== carId);
      cars.forEach((c, i) => { c.order = i; });
      saveToStorage();
      renderAll();
      renderCompareTable();
    }
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
  const pillsContainer = document.getElementById('filterPills');
  if (!filterBar || !pillsContainer) return;

  const names = new Set();
  for (const car of cars) {
    for (const r of (car.rankings || [])) {
      if (r.name) names.add(r.name);
    }
  }

  filterBar.style.display = (cars.length > 0) ? '' : 'none';
  pillsContainer.innerHTML = '';

  for (const name of [...names].sort()) {
    const pill = document.createElement('button');
    pill.className = 'filter-pill' + (activePersonFilter === name ? ' active' : '');
    pill.innerHTML = escHtml(name) + (activePersonFilter === name ? ' <span class="pill-x">×</span>' : '');
    pill.addEventListener('click', () => {
      activePersonFilter = (activePersonFilter === name) ? null : name;
      applyPersonFilter();
      renderFilterBar();
    });
    pillsContainer.appendChild(pill);
  }
}

function applyPersonFilter() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;
  for (const cardEl of grid.querySelectorAll('.car-card')) {
    if (!activePersonFilter) {
      cardEl.style.display = '';
      continue;
    }
    const carId = cardEl.dataset.id;
    const car = cars.find(c => String(c.id) === String(carId));
    const hasFilter = car && (car.rankings || []).some(r => r.name === activePersonFilter);
    cardEl.style.display = hasFilter ? '' : 'none';
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

  const sorted = [...cars].sort((a, b) => a.order - b.order);

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
    filter: '.btn-order, .btn-delete, .slide-btn, .btn-toggle-equip, .comment-form, a',
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
  document.getElementById('btnExport').addEventListener('click', exportCars);

  // Import
  document.getElementById('fileImport').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importCars(e.target.files[0]);
      e.target.value = ''; // reset so same file can be re-imported
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

  // SortableJS
  initSortable();
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
