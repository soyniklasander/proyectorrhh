import { Env } from '../types';

export interface Notification {
  id: string;
  company_id: string | null;
  user_id: string | null;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actions?: any[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export class NotificationService {
  constructor(private env: Env) {}

  async findAll(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const results = await this.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `)
    .bind(userId, limit, offset)
    .all<Notification>();

    const notifications = results.results.map(n => ({
      ...n,
      read: Boolean(n.read),
      actions: n.actions ? JSON.parse(n.actions as unknown as string) : undefined,
      metadata: n.metadata ? JSON.parse(n.metadata as unknown as string) : undefined
    }));

    const countResult = await this.env.DB.prepare(`
      SELECT COUNT(*) as total FROM notifications WHERE user_id = ?
    `)
    .bind(userId)
    .first<{ total: number }>();

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limit)
      }
    };
  }

  async markAsRead(id: string, userId: string) {
    const result = await this.env.DB.prepare(`
      UPDATE notifications SET read = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?
    `)
    .bind(id, userId)
    .run();

    return result.success;
  }

  async markAllAsRead(userId: string) {
    const result = await this.env.DB.prepare(`
      UPDATE notifications SET read = 1, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ? AND read = 0
    `)
    .bind(userId)
    .run();

    return result.success;
  }

  async delete(id: string, userId: string) {
    const result = await this.env.DB.prepare(`
      DELETE FROM notifications WHERE id = ? AND user_id = ?
    `)
    .bind(id, userId)
    .run();

    return result.success;
  }

  // Method to create notification (useful for other services or seeding)
  async create(data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'read' | 'timestamp'>) {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await this.env.DB.prepare(`
      INSERT INTO notifications (id, company_id, user_id, type, title, description, timestamp, read, actions, metadata, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
    `)
    .bind(
      id,
      data.company_id,
      data.user_id,
      data.type,
      data.title,
      data.description,
      timestamp,
      data.actions ? JSON.stringify(data.actions) : null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      timestamp,
      timestamp
    )
    .run();

    return { id, ...data, timestamp, read: false };
  }
}
