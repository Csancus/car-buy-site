'use strict';
const { kv } = require('@vercel/kv');

const CONFIG_KEY = 'carbuy_score_config';

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const data = await kv.get(CONFIG_KEY);
      return res.status(200).json(data || {});
    }
    if (req.method === 'POST') {
      const { scoreConfig } = req.body || {};
      if (!Array.isArray(scoreConfig)) return res.status(400).json({ error: 'scoreConfig tömb megadása kötelező' });
      await kv.set(CONFIG_KEY, { scoreConfig });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Szerverhiba' });
  }
};
