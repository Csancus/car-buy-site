'use strict';
const { loadCars, saveCars } = require('../../_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.query;
  const cars = await loadCars();
  const car = cars.find(c => String(c.id) === String(id));
  if (!car) return res.status(404).json({ error: 'Autó nem található.' });
  if (!car.comments) car.comments = [];
  car.comments.push({
    author: (req.body.author || 'Névtelen').trim(),
    text: (req.body.text || '').trim(),
    at: new Date().toISOString(),
  });
  await saveCars(cars);
  res.json(car);
};
