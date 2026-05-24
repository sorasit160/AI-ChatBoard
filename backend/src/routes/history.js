// backend/src/routes/history.js
const express = require('express');
const router = express.Router();

// Simple in‑memory store (replace with DB if desired)
let drafts = [];

router.get('/', (req, res) => {
  res.json(drafts);
});

router.post('/', (req, res) => {
  const { prompt, keyword, text } = req.body;
  if (!prompt || !keyword || !text) {
    return res.status(400).json({ error: 'prompt, keyword and text required' });
  }
  const entry = { id: Date.now(), prompt, keyword, text };
  drafts.unshift(entry);
  res.status(201).json(entry);
});

module.exports = router;
