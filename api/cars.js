'use strict';
const { loadCars, saveCars, fetchUrl, parseCarPage, extractIdFromUrl } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const cars = await loadCars();
      return res.status(200).json(cars);
    }

    if (req.method === 'POST') {
      const { url } = req.body || {};
      if (!url) return res.status(400).json({ error: 'URL megadása kötelező' });

      let parsedUrl;
      try { parsedUrl = new URL(url); } catch { return res.status(400).json({ error: 'Érvénytelen URL' }); }
      if (!parsedUrl.hostname.includes('hasznaltauto.hu')) {
        return res.status(400).json({ error: 'Csak hasznaltauto.hu URL-eket lehet hozzáadni' });
      }

      const cars = await loadCars();
      const existingId = extractIdFromUrl(url);
      if (existingId && cars.some(c => c.id === existingId)) {
        return res.status(409).json({ error: 'Ez a hirdetés már hozzá van adva' });
      }

      const html = await fetchUrl(url);
      const car = parseCarPage(html, url);
      car.order = cars.length;
      cars.push(car);
      await saveCars(cars);
      return res.status(200).json(car);
    }

    if (req.method === 'DELETE') {
      const id = req.query && req.query.id;
      if (!id) return res.status(400).json({ error: 'ID megadása kötelező' });

      let cars = await loadCars();
      cars = cars.filter(c => String(c.id) !== String(id));
      cars.forEach((c, i) => { c.order = i; });
      await saveCars(cars);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Szerverhiba' });
  }
};
