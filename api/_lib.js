'use strict';
const { kv } = require('@vercel/kv');
const { execFile } = require('child_process');

const CARS_KEY = 'carbuy_cars';

// ── KV storage ────────────────────────────────────────────────────
async function loadCars() {
  const data = await kv.get(CARS_KEY);
  if (!data) return [];
  return Array.isArray(data) ? data : [];
}

async function saveCars(cars) {
  await kv.set(CARS_KEY, cars);
}

// ── HTTP fetch via curl (bypasses Cloudflare TLS fingerprinting) ──
const COOKIE_JAR = '/tmp/hasznaltauto_cookies.jar';

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const BASE_HEADERS = [
  '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  '-H', 'Accept-Language: hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7',
  '-H', 'Cache-Control: max-age=0',
  '-H', 'sec-ch-ua: "Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  '-H', 'sec-ch-ua-mobile: ?0',
  '-H', 'sec-ch-ua-platform: "Windows"',
  '-H', 'Sec-Fetch-Dest: document',
  '-H', 'Sec-Fetch-Mode: navigate',
  '-H', 'Sec-Fetch-Site: none',
  '-H', 'Sec-Fetch-User: ?1',
  '-H', 'Upgrade-Insecure-Requests: 1',
];

function curlGet(url, extraArgs = []) {
  return new Promise((resolve, reject) => {
    execFile('curl', [
      '-s', '-L', '--compressed', '--http2',
      '--max-time', '20',
      '-c', COOKIE_JAR, '-b', COOKIE_JAR,
      '-A', CHROME_UA,
      ...BASE_HEADERS,
      ...extraArgs,
      '-w', '\n__CURL_STATUS__%{http_code}',
      url,
    ], { maxBuffer: 12 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(new Error(err.message));
      const marker = '\n__CURL_STATUS__';
      const idx = stdout.lastIndexOf(marker);
      const status = idx !== -1 ? parseInt(stdout.slice(idx + marker.length), 10) : 200;
      const body = idx !== -1 ? stdout.slice(0, idx) : stdout;
      if (status !== 200) return reject(new Error(`HTTP ${status}`));
      resolve(body);
    });
  });
}

// Warm up Cloudflare session via homepage first
let lastWarm = 0;
async function warmSession() {
  if (Date.now() - lastWarm < 60_000) return; // skip if warmed within 1 min
  await new Promise(resolve => {
    execFile('curl', [
      '-s', '-L', '--compressed', '--http2',
      '--max-time', '15',
      '-c', COOKIE_JAR, '-b', COOKIE_JAR,
      '-o', '/dev/null',
      '-A', CHROME_UA,
      ...BASE_HEADERS,
      '-H', 'Referer: https://www.google.com/',
      'https://www.hasznaltauto.hu/',
    ], { maxBuffer: 1024 * 1024 }, () => resolve());
  });
  lastWarm = Date.now();
}

async function fetchUrl(targetUrl) {
  await warmSession();
  return curlGet(targetUrl, [
    '-H', 'Referer: https://www.hasznaltauto.hu/',
    '-H', 'Sec-Fetch-Site: same-origin',
  ]);
}

// ── Parsing ───────────────────────────────────────────────────────
function parseDataLayer(html) {
  const marker = 'dataLayer.push(';
  let pos = 0;
  while (true) {
    const start = html.indexOf(marker, pos);
    if (start === -1) break;
    pos = start + marker.length;
    let i = pos;
    while (i < html.length && /\s/.test(html[i])) i++;
    if (html[i] !== '{') continue;
    let depth = 0, inStr = false, strCh = '', esc = false, j = i;
    for (; j < html.length; j++) {
      const ch = html[j];
      if (esc) { esc = false; continue; }
      if (ch === '\\' && inStr) { esc = true; continue; }
      if (inStr) { if (ch === strCh) inStr = false; continue; }
      if (ch === '"' || ch === "'") { inStr = true; strCh = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { j++; break; } }
    }
    try {
      const obj = JSON.parse(html.slice(i, j));
      if (obj && typeof obj.listing_id === 'number') return obj;
    } catch { }
  }
  return null;
}

function parseJsonLd(html) {
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const d = JSON.parse(m[1]);
      if (d && d['@type'] === 'Product') return d;
    } catch { }
  }
  return null;
}

function parseHighlightedInfo(html) {
  const info = {};
  const ids = ['manufacture-date', 'mileage', 'fuel', 'performance', 'condition'];
  for (const tid of ids) {
    const re = new RegExp(
      `data-testid="highlighted-info-${tid}"[^>]*>[\\s\\S]{0,400}?` +
      `<div[^>]*class="[^"]*small[^"]*"[^>]*>[^<]*<\\/div>\\s*<div[^>]*>([^<]*)<\\/div>`,
      'i'
    );
    const m = html.match(re);
    if (m) info[tid] = m[1].trim();
  }
  const trunkM = html.match(/Csomagtart[oó]<\/div>\s*<div[^>]*>([^<]+)<\/div>/i);
  if (trunkM) info.trunk = trunkM[1].trim();
  return info;
}

function parseSellerInfo(html) {
  const locM = html.match(/data-testid="seller-location"[^>]*>([^<]+)/i);
  const phoneM = html.match(/data-contact-value="([^"]+)"/i);
  const companyM = html.match(/data-testid="seller-company-name"[^>]*>([^<]+)/i);
  return {
    location: locM ? locM[1].trim() : '',
    phone: phoneM ? phoneM[1] : '',
    name: companyM ? companyM[1].trim() : '',
  };
}

function parseEquipment(html) {
  const items = new Set();
  const ulRe = /<ul[^>]*class="[^"]*\bgrid\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/gi;
  let ulM;
  while ((ulM = ulRe.exec(html)) !== null) {
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liM;
    while ((liM = liRe.exec(ulM[1])) !== null) {
      const text = liM[1].replace(/<[^>]+>/g, '').trim();
      if (text) items.add(text);
    }
  }
  return [...items];
}

function extractIdFromUrl(url) {
  const m = url.match(/-(\d+)(?:\?.*)?$/);
  return m ? parseInt(m[1], 10) : null;
}

function computeTop5(car) {
  const eq = (car.equipment || []).map(s => s.toLowerCase());
  const fuel = (car.fuel || '').toLowerCase();
  const cond = (car.condition || '').toLowerCase();
  const results = [];

  if (fuel.includes('hibrid') || fuel.includes('elektromos'))
    results.push({ label: '🔌 Plugin Hibrid / Elektromos hajtás', score: 10 });
  if (car.mileage && car.mileage < 30000)
    results.push({ label: `📉 Alacsony km-óraállás (${car.mileage.toLocaleString('hu-HU')} km)`, score: 9 });
  if (car.year && car.year >= 2024)
    results.push({ label: `✨ Szinte új autó (${car.year})`, score: 9 });
  if (cond.includes('sérülésmentes') || cond.includes('újszer'))
    results.push({ label: '✅ Sérülésmentes / Újszerű állapot', score: 8 });

  const rules = [
    { kws: ['navigáci', 'gps navigáci'], label: '🗺️ GPS Navigáció', score: 9 },
    { kws: ['360'], label: '📷 360° körülnézet', score: 9 },
    { kws: ['panoráma', 'üvegtető'], label: '☀️ Panorámatető', score: 9 },
    { kws: ['head-up', 'hud'], label: '📊 Head-up kijelző', score: 9 },
    { kws: ['napfénytető'], label: '🌤️ Napfénytető', score: 8 },
    { kws: ['adaptív tempomat', 'távolságtartó tempomat'], label: '🚦 Adaptív tempomat', score: 8 },
    { kws: ['kulcsnélküli', 'kulcs nélk'], label: '🔑 Kulcs nélküli kezelés', score: 8 },
    { kws: ['tolatókamera', 'tolató kamera'], label: '📸 Tolatókamera', score: 8 },
    { kws: ['4wd', 'awd', '4x4', 'összkerék'], label: '🏔️ Összkerékhajtás 4WD', score: 8 },
    { kws: ['bőrülés', 'bőr ülés', 'valódi bőr', 'nappa'], label: '🪑 Valódi bőrülések', score: 8 },
    { kws: ['fűthet', 'fűtött'], label: '🔥 Fűtött ülések', score: 7 },
    { kws: ['apple carplay', 'android auto'], label: '📱 CarPlay / Android Auto', score: 7 },
    { kws: ['vezeték nélküli töltés', 'indukciós töltés'], label: '⚡ Vezeték nélküli töltő', score: 7 },
    { kws: ['holttér'], label: '👁️ Holttér-figyelő', score: 7 },
    { kws: ['led fényszóró'], label: '💡 LED fényszórók', score: 7 },
    { kws: ['garanciális', 'garancia'], label: '🛡️ Garanciális', score: 8 },
    { kws: ['első tulajdonos'], label: '👤 Első tulajdonostól', score: 7 },
    { kws: ['sávtartó'], label: '🛣️ Sávtartó rendszer', score: 6 },
  ];
  for (const rule of rules) {
    if (rule.kws.some(kw => eq.some(e => e.includes(kw)))) {
      if (!results.some(r => r.label === rule.label))
        results.push({ label: rule.label, score: rule.score });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return [...new Set(results.map(r => r.label))].slice(0, 5);
}

function parseCarPage(html, targetUrl) {
  const dl = parseDataLayer(html);
  const ld = parseJsonLd(html);
  const equipment = parseEquipment(html);
  const info = parseHighlightedInfo(html);
  const seller = parseSellerInfo(html);
  const images = ld?.image
    ? ld.image.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
    : [];
  const car = {
    id: dl?.listing_id || extractIdFromUrl(targetUrl),
    url: targetUrl,
    name: ld?.name || (dl ? `${dl.brand || ''} ${dl.model || ''}`.trim() : 'Ismeretlen'),
    brand: dl?.brand || '',
    model: dl?.model || '',
    year: dl?.year || null,
    manufactureDate: info['manufacture-date'] || (dl?.year ? String(dl.year) : null),
    price: ld?.offers?.price ?? dl?.price ?? null,
    mileage: dl?.mileage || null,
    fuel: dl?.fuel_type || '',
    transmission: dl?.transmission_type || '',
    condition: dl?.condition_type || '',
    bodyType: dl?.car_body_type || '',
    color: ld?.color || '',
    performance: info['performance'] || '',
    trunkVolume: info['trunk'] || '',
    sellerType: dl?.seller || '',
    sellerName: seller.name || ld?.offers?.seller?.name || '',
    sellerLocation: seller.location,
    sellerPhone: seller.phone,
    description: ld?.description || '',
    images,
    equipment,
    top5: [],
    comments: [],
    order: 0,
    addedAt: new Date().toISOString(),
  };
  car.top5 = computeTop5(car);
  return car;
}

module.exports = { loadCars, saveCars, fetchUrl, parseCarPage, extractIdFromUrl };
