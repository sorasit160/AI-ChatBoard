import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import { authenticateToken } from '../middleware/auth';
import { activityLogger } from '../middleware/logger';
import { BoardPost, BoardReply } from '../types';

const router = Router();
router.use(authenticateToken);

// GET /api/board/posts
router.get('/posts', activityLogger('view_board'), async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = (req.query.search as string) || '';
  const offset = (page - 1) * limit;
  const db = await getDb();

  let sql = `SELECT p.id, p.title, p.content, p.views, p.is_pinned, p.created_at, p.updated_at,
      u.username,
      (SELECT COUNT(*) FROM board_replies r WHERE r.post_id = p.id) as reply_count
    FROM board_posts p JOIN users u ON u.id = p.user_id`;

  const params: (string | number | null)[] = [];
  if (search) { sql += ' WHERE p.title LIKE ? OR p.content LIKE ?'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const posts = db.all<BoardPost>(sql, params);
  const countRow = db.get<{ count: number }>(
    search ? 'SELECT COUNT(*) as count FROM board_posts WHERE title LIKE ? OR content LIKE ?' : 'SELECT COUNT(*) as count FROM board_posts',
    search ? [`%${search}%`, `%${search}%`] : []
  );
  const count = countRow?.count || 0;

  res.json({ posts, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
});

// GET /api/board/posts/:id
router.get('/posts/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();
  db.run('UPDATE board_posts SET views = views + 1 WHERE id = ?', [id]);

  const post = db.get<BoardPost>(`SELECT p.id, p.title, p.content, p.views, p.is_pinned,
      p.created_at, p.updated_at, u.username, u.id as user_id
    FROM board_posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`, [id]);

  if (!post) { res.status(404).json({ error: 'Post not found' }); return; }

  const replies = db.all<BoardReply>(`SELECT r.id, r.content, r.created_at, r.updated_at,
      u.username, u.id as user_id
    FROM board_replies r JOIN users u ON u.id = r.user_id
    WHERE r.post_id = ? ORDER BY r.created_at ASC`, [id]);

  res.json({ post, replies });
});

// POST /api/board/posts
router.post('/posts', activityLogger('create_post'),
  [body('title').trim().isLength({ min: 3, max: 200 }), body('content').trim().isLength({ min: 10 })],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { title, content } = req.body;
    const userId = req.user!.userId;
    const postId = uuidv4();
    const db = await getDb();

    db.run('INSERT INTO board_posts (id, user_id, title, content) VALUES (?, ?, ?, ?)', [postId, userId, title, content]);

    const post = db.get<BoardPost>(`SELECT p.*, u.username FROM board_posts p
      JOIN users u ON u.id = p.user_id WHERE p.id = ?`, [postId]);

    res.status(201).json({ post });
  }
);

// POST /api/board/posts/:id/reply
router.post('/posts/:id/reply', activityLogger('create_reply'),
  [body('content').trim().isLength({ min: 2 })],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { id: postId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;
    const db = await getDb();

    const post = db.get('SELECT id FROM board_posts WHERE id = ?', [postId]);
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }

    const replyId = uuidv4();
    db.run('INSERT INTO board_replies (id, post_id, user_id, content) VALUES (?, ?, ?, ?)', [replyId, postId, userId, content]);

    const reply = db.get<BoardReply>(`SELECT r.*, u.username FROM board_replies r
      JOIN users u ON u.id = r.user_id WHERE r.id = ?`, [replyId]);

    res.status(201).json({ reply });
  }
);

// DELETE /api/board/posts/:id
router.delete('/posts/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();
  const post = db.get<{ user_id: string }>('SELECT user_id FROM board_posts WHERE id = ?', [id]);
  if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
  if (post.user_id !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Not authorized' }); return;
  }
  db.run('DELETE FROM board_posts WHERE id = ?', [id]);
  res.json({ message: 'Post deleted' });
});

export default router;
