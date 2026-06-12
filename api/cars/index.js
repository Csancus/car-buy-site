'use strict';
const { loadCars } = require('../_lib');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const cars = await loadCars();
    return res.status(200).json(cars);
  } catch (e) {
    console.error('[GET /api/cars]', e);
    return res.status(500).json({ error: e.message });
  }
};
