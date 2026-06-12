'use strict';
const { loadCars, saveCars } = require('../_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
  const cars = await loadCars();
  ids.forEach((id, i) => {
    const car = cars.find(c => String(c.id) === String(id));
    if (car) car.order = i;
  });
  cars.sort((a, b) => a.order - b.order);
  await saveCars(cars);
  res.json({ ok: true });
};
