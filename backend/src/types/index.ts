export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface BoardPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  views: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // joined fields
  username?: string;
  reply_count?: number;
}

export interface BoardReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // joined fields
  username?: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  resource?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
