'use strict';
const { loadCars, saveCars, fetchUrl, parseCarPage } = require('./_lib');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const segments = [].concat(req.query.path || []);
  const route = segments.join('/');
  const { method } = req;

  try {
    // GET /api/cars
    if (route === 'cars' && method === 'GET') {
      return res.status(200).json(await loadCars());
    }

    // POST /api/cars/add
    if (route === 'cars/add' && method === 'POST') {
      const { url: targetUrl } = req.body || {};
      if (!targetUrl || !targetUrl.includes('hasznaltauto.hu')) {
        return res.status(400).json({ error: 'Érvénytelen URL. Csak hasznaltauto.hu URL-t fogad el.' });
      }
      const html = await fetchUrl(targetUrl);
      const car = parseCarPage(html, targetUrl);
      if (!car.id) return res.status(400).json({ error: 'Nem sikerült kinyerni az autó adatait.' });
      const cars = await loadCars();
      if (cars.find(c => c.id === car.id)) {
        return res.status(409).json({ error: 'Ez a hirdetés már hozzá van adva!' });
      }
      car.order = cars.length;
      cars.push(car);
      await saveCars(cars);
      return res.status(200).json(car);
    }

    // PUT /api/cars/order
    if (route === 'cars/order' && method === 'PUT') {
      const { ids } = req.body || {};
      if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
      const cars = await loadCars();
      ids.forEach((id, i) => {
        const car = cars.find(c => String(c.id) === String(id));
        if (car) car.order = i;
      });
      cars.sort((a, b) => a.order - b.order);
      await saveCars(cars);
      return res.status(200).json({ ok: true });
    }

    // DELETE /api/cars/:id
    if (segments[0] === 'cars' && segments.length === 2 && method === 'DELETE') {
      const id = segments[1];
      const cars = (await loadCars()).filter(c => String(c.id) !== String(id));
      cars.forEach((c, i) => { c.order = i; });
      await saveCars(cars);
      return res.status(200).json({ ok: true });
    }

    // POST /api/cars/:id/comment
    if (segments[0] === 'cars' && segments[2] === 'comment' && method === 'POST') {
      const id = segments[1];
      const cars = await loadCars();
      const car = cars.find(c => String(c.id) === String(id));
      if (!car) return res.status(404).json({ error: 'Autó nem található.' });
      if (!car.comments) car.comments = [];
      car.comments.push({
        author: (req.body?.author || 'Névtelen').trim(),
        text: (req.body?.text || '').trim(),
        at: new Date().toISOString(),
      });
      await saveCars(cars);
      return res.status(200).json(car);
    }

    return res.status(404).json({ error: `Route not found: ${method} /api/${route}` });
  } catch (e) {
    console.error(`[${method} /api/${route}]`, e);
    return res.status(500).json({ error: e.message });
  }
};
