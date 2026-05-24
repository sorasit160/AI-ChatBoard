import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  const db = await getDb();
  const totalUsers = (db.get<{ count: number }>('SELECT COUNT(*) as count FROM users') || { count: 0 }).count;
  const totalChatSessions = (db.get<{ count: number }>('SELECT COUNT(*) as count FROM chat_sessions') || { count: 0 }).count;
  const totalMessages = (db.get<{ count: number }>('SELECT COUNT(*) as count FROM chat_messages') || { count: 0 }).count;
  const totalPosts = (db.get<{ count: number }>('SELECT COUNT(*) as count FROM board_posts') || { count: 0 }).count;
  const totalReplies = (db.get<{ count: number }>('SELECT COUNT(*) as count FROM board_replies') || { count: 0 }).count;
  const todayMessages = (db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM chat_messages WHERE role = 'user' AND date(created_at) = date('now')`
  ) || { count: 0 }).count;

  res.json({ totalUsers, totalChatSessions, totalMessages, totalPosts, totalReplies, todayMessages });
});

// GET /api/dashboard/activity?days=7
router.get('/activity', async (req: Request, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 7;
  const db = await getDb();

  const chatActivity = db.all<{ date: string; chat_messages: number }>(`
    SELECT date(created_at) as date, COUNT(*) as chat_messages
    FROM chat_messages WHERE role = 'user' AND created_at >= datetime('now', '-${days} days')
    GROUP BY date(created_at) ORDER BY date ASC`);

  const postActivity = db.all<{ date: string; posts: number }>(`
    SELECT date(created_at) as date, COUNT(*) as posts
    FROM board_posts WHERE created_at >= datetime('now', '-${days} days')
    GROUP BY date(created_at) ORDER BY date ASC`);

  const userActivity = db.all<{ date: string; active_users: number }>(`
    SELECT date(created_at) as date, COUNT(DISTINCT user_id) as active_users
    FROM activity_log WHERE user_id IS NOT NULL AND created_at >= datetime('now', '-${days} days')
    GROUP BY date(created_at) ORDER BY date ASC`);

  const dateMap: Record<string, { date: string; chat_messages: number; posts: number; active_users: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateMap[dateStr] = { date: dateStr, chat_messages: 0, posts: 0, active_users: 0 };
  }

  chatActivity.forEach((r) => { if (dateMap[r.date]) dateMap[r.date].chat_messages = r.chat_messages; });
  postActivity.forEach((r) => { if (dateMap[r.date]) dateMap[r.date].posts = r.posts; });
  userActivity.forEach((r) => { if (dateMap[r.date]) dateMap[r.date].active_users = r.active_users; });

  res.json({ days, activity: Object.values(dateMap) });
});

// GET /api/dashboard/top-users
router.get('/top-users', async (_req: Request, res: Response): Promise<void> => {
  const db = await getDb();
  const topUsers = db.all(`
    SELECT u.id, u.username, u.created_at,
      COUNT(DISTINCT cm.id) as chat_count,
      COUNT(DISTINCT bp.id) as post_count,
      COUNT(DISTINCT br.id) as reply_count,
      (COUNT(DISTINCT cm.id) + COUNT(DISTINCT bp.id) * 2 + COUNT(DISTINCT br.id)) as score
    FROM users u
    LEFT JOIN chat_sessions cs ON cs.user_id = u.id
    LEFT JOIN chat_messages cm ON cm.session_id = cs.id AND cm.role = 'user'
    LEFT JOIN board_posts bp ON bp.user_id = u.id
    LEFT JOIN board_replies br ON br.user_id = u.id
    GROUP BY u.id ORDER BY score DESC LIMIT 10`);
  res.json({ topUsers });
});

// GET /api/dashboard/recent-activity
router.get('/recent-activity', async (_req: Request, res: Response): Promise<void> => {
  const db = await getDb();
  const recent = db.all(`
    SELECT al.id, al.action, al.resource, al.created_at, u.username
    FROM activity_log al LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC LIMIT 20`);
  res.json({ recent });
});

export default router;
