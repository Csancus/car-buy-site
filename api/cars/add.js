'use strict';
const { loadCars, saveCars, fetchUrl, parseCarPage, extractIdFromUrl } = require('../_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { url: targetUrl } = req.body;
  if (!targetUrl || !targetUrl.includes('hasznaltauto.hu')) {
    return res.status(400).json({ error: 'Érvénytelen URL. Csak hasznaltauto.hu URL-t fogad el.' });
  }
  try {
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
    res.json(car);
  } catch (e) {
    res.status(500).json({ error: `Letöltési hiba: ${e.message}` });
  }
};
