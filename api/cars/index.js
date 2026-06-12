'use strict';
const { loadCars } = require('../_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const cars = await loadCars();
    res.json(cars);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
