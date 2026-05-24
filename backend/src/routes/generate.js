// backend/src/routes/generate.js
const express = require('express');
const router = express.Router();
// backend/src/routes/generate.js
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { prompt, keyword } = req.body;
  if (!prompt || !keyword) {
    return res.status(400).json({ error: 'prompt and keyword required' });
  }
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o', // change if needed
      messages: [
        { role: 'system', content: 'You are a content generator. Produce a concise blog post or social‑media copy based on the given prompt and keyword.' },
        { role: 'user', content: `Prompt: ${prompt}\nKeyword: ${keyword}` }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    const text = completion.data.choices[0].message.content.trim();
    res.json({ copy: text });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

module.exports = router;
