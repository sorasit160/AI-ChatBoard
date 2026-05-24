import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { optionalAuth } from '../middleware/auth';
import { activityLogger } from '../middleware/logger';

const router = Router();

async function callGeminiAI(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    await new Promise((r) => setTimeout(r, 700));
    return getMockResponse(messages[messages.length - 1]?.content || '');
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are a helpful AI assistant. You can respond in both Thai and English.
If the user writes in Thai, respond in Thai. If they write in English, respond in English.
Be friendly, informative, and concise. Format responses with markdown when appropriate.`;

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history, systemInstruction: systemPrompt });
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่\n\nSorry, AI connection failed. Please try again.';
  }
}

function getMockResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('สวัสดี') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return '👋 **สวัสดีครับ!** ยินดีต้อนรับสู่ AI Assistant\n\n**Hello!** Welcome to AI Assistant. How can I help you today?';
  }
  if (lowerMsg.includes('คุณคือใคร') || lowerMsg.includes('who are you')) {
    return '🤖 ผมคือ **AI Assistant** พัฒนาด้วย Google Gemini\n\nI am an **AI Assistant** powered by Google Gemini. I can:\n- 💬 Answer questions in Thai & English\n- 💻 Help with coding & debugging\n- ✍️ Assist with writing & analysis';
  }
  if (lowerMsg.includes('ช่วย') || lowerMsg.includes('help')) {
    return '🎯 **ผมช่วยคุณได้ในเรื่อง:**\n\n- **การเขียนโค้ด** — debug, review, อธิบาย\n- **การเขียน** — ร่างข้อความ, สรุป, แปล\n- **คำถามทั่วไป** — ข้อมูล, ความรู้\n- **วิเคราะห์** — ข้อมูล, แนะนำแนวทาง\n\nถามอะไรก็ได้เลยครับ! 😊';
  }
  const responses = [
    `ได้รับข้อความของคุณครับ: **"${message}"**\n\n> ⚠️ **โหมด Mock AI** — เพิ่ม \`GEMINI_API_KEY\` ใน \`backend/.env\` เพื่อใช้งาน AI จริง\n\nได้จาก: https://aistudio.google.com/`,
    `**Mock Response**: "${message}"\n\nTo enable real AI responses:\n1. Visit [Google AI Studio](https://aistudio.google.com/)\n2. Create a free API key\n3. Add to \`backend/.env\`:\n\`\`\`\nGEMINI_API_KEY=your-key-here\n\`\`\``,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// POST /api/chat/message
router.post('/message', optionalAuth, activityLogger('chat_message'), async (req: Request, res: Response): Promise<void> => {
  const { message, sessionId } = req.body;
  if (!message?.trim()) { res.status(400).json({ error: 'Message is required' }); return; }

  const trimmedMessage = message.trim().slice(0, 4000);
  let currentSessionId = sessionId;

  try {
    const db = await getDb();

    if (!currentSessionId) {
      currentSessionId = uuidv4();
      db.run('INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)', [currentSessionId, req.user?.userId || null]);
    } else {
      const session = db.get('SELECT id FROM chat_sessions WHERE id = ?', [currentSessionId]);
      if (!session) {
        currentSessionId = uuidv4();
        db.run('INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)', [currentSessionId, req.user?.userId || null]);
      }
    }

    db.run('INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [uuidv4(), currentSessionId, 'user', trimmedMessage]);

    const history = db.all<{ role: string; content: string }>(
      'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 20',
      [currentSessionId]
    );

    const aiResponse = await callGeminiAI(history);
    const aiMessageId = uuidv4();

    db.run('INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [aiMessageId, currentSessionId, 'assistant', aiResponse]);

    res.json({
      sessionId: currentSessionId,
      message: { id: aiMessageId, role: 'assistant', content: aiResponse, created_at: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const db = await getDb();
  const messages = db.all('SELECT id, role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', [sessionId]);
  res.json({ sessionId, messages });
});

export default router;
