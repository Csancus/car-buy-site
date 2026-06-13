'use strict';
const { loadCars, saveCars } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });

    const cars = await loadCars();
    const ordered = [];
    for (let i = 0; i < ids.length; i++) {
      const car = cars.find(c => String(c.id) === String(ids[i]));
      if (car) { car.order = i; ordered.push(car); }
    }
    for (const car of cars) {
      if (!ordered.includes(car)) { car.order = ordered.length; ordered.push(car); }
    }
    await saveCars(ordered);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Szerverhiba' });
  }
};
