import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export function activityLogger(action: string, resource?: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb();
      const userId = req.user?.userId || null;
      const ipAddress = req.ip || null;
      const userAgent = req.headers['user-agent'] || null;

      db.run(
        'INSERT INTO activity_log (id, user_id, action, resource, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), userId, action, resource || req.path, ipAddress, userAgent]
      );
    } catch (error) {
      console.error('Activity log error:', error);
    }
    next();
  };
}
