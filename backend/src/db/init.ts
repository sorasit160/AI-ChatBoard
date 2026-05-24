import { getDb } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function initializeDatabase(): Promise<void> {
  const db = await getDb();

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar_url TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Chat sessions
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT (datetime('now'))
    );

    -- Chat messages
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    -- Board posts
    CREATE TABLE IF NOT EXISTS board_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Board replies
    CREATE TABLE IF NOT EXISTS board_replies (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES board_posts(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    -- Activity log for dashboard
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      action TEXT NOT NULL,
      resource TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_board_posts_created ON board_posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_board_replies_post ON board_replies(post_id);
    CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);
  `);

  // Seed default admin user
  const existingAdmin = db.get('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash('123456', 12);
    const adminId = uuidv4();
    db.run('INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [adminId, 'admin', 'admin@example.com', adminPassword, 'admin']);
    console.log('✅ Default admin user created (admin@example.com / 123456)');
  }

  console.log('✅ Database initialized successfully');
}
