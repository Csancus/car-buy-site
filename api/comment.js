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
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ error: 'ID megadása kötelező' });

    const { author, text } = req.body || {};
    if (!author || !text) return res.status(400).json({ error: 'author és text kötelező' });

    const cars = await loadCars();
    const car = cars.find(c => String(c.id) === String(id));
    if (!car) return res.status(404).json({ error: 'Hirdetés nem található' });

    if (!car.comments) car.comments = [];
    car.comments.push({ author, text, at: new Date().toISOString() });
    await saveCars(cars);
    return res.status(200).json({ comments: car.comments });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Szerverhiba' });
  }
};
