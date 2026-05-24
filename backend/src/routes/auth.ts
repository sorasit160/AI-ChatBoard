import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { User } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 20 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { username, email, password } = req.body;
    try {
      const db = await getDb();
      const existing = db.get<User>('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existing) { res.status(409).json({ error: 'Username or email already taken' }); return; }

      const password_hash = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      db.run('INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [userId, username, email, password_hash, 'user']);

      const token = jwt.sign({ userId, username, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
      res.status(201).json({ message: 'Registration successful', token, user: { id: userId, username, email, role: 'user' } });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { email, password } = req.body;
    try {
      const db = await getDb();
      const user = db.get<User>('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) { res.status(401).json({ error: 'Invalid email or password' }); return; }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) { res.status(401).json({ error: 'Invalid email or password' }); return; }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      );
      res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'No token' }); return; }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string; role: string };
    const db = await getDb();
    const user = db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [decoded.userId]);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user });
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
