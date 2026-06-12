'use strict';
const { loadCars, saveCars } = require('../../_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const { id } = req.query;
  const cars = (await loadCars()).filter(c => String(c.id) !== String(id));
  cars.forEach((c, i) => { c.order = i; });
  await saveCars(cars);
  res.json({ ok: true });
};
