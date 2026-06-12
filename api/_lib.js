'use strict';
const { kv } = require('@vercel/kv');
const https = require('https');
const http = require('http');
const zlib = require('zlib');

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

// ── HTTP fetch ────────────────────────────────────────────────────
function fetchUrl(targetUrl, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    const lib = targetUrl.startsWith('https') ? https : http;
    const req = lib.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, targetUrl).href;
        res.resume();
        return fetchUrl(loc, redirectCount + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const enc = (res.headers['content-encoding'] || '').toLowerCase();
        if (enc === 'br') {
          zlib.brotliDecompress(buf, (err, out) => err ? reject(err) : resolve(out.toString('utf8')));
        } else if (enc === 'gzip') {
          zlib.gunzip(buf, (err, out) => err ? reject(err) : resolve(out.toString('utf8')));
        } else if (enc === 'deflate') {
          zlib.inflate(buf, (err, out) => err ? reject(err) : resolve(out.toString('utf8')));
        } else {
          resolve(buf.toString('utf8'));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
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
    price: ld?.offers?.price ?? dl?.price ?? null,
    mileage: dl?.mileage || null,
    fuel: dl?.fuel_type || '',
    transmission: dl?.transmission_type || '',
    condition: dl?.condition_type || '',
    bodyType: dl?.car_body_type || '',
    color: ld?.color || '',
    seller: ld?.offers?.seller?.name || '',
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
