'use strict';
const { loadCars, saveCars } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, items } = req.body || {};
    if (!name || !Array.isArray(items)) return res.status(400).json({ error: 'name és items megadása kötelező' });

    const cars = await loadCars();
    for (const { id, position } of items) {
      const car = cars.find(c => String(c.id) === String(id));
      if (!car) continue;
      const rankings = (car.rankings || []).filter(r => r.name !== name);
      rankings.push({ name, position });
      car.rankings = rankings;
    }
    await saveCars(cars);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Szerverhiba' });
  }
};
