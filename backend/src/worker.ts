import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import { Env, Variables } from './types';
import { authMiddleware } from './middleware/auth.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { ContractService, OnboardingSchema } from './services/contract.service';
import { NotificationService } from './services/notification.service';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global Middleware
app.use('*', cors());

// Health Check (Public)
app.get('/api/v1/health', async (c) => {
  try {
    if (c.env.DB) {
      await c.env.DB.prepare('SELECT 1').all();
      return c.json({ success: true, message: 'RRHHMod API is running', database: 'Connected' });
    }
    return c.json({ success: false, message: 'DB Binding missing' }, 503);
  } catch (e) {
    return c.json({ success: false, message: 'Database error', error: String(e) }, 503);
  }
});

// Auth Login (Public)
app.post('/api/v1/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ success: false, error: 'MISSING_CREDENTIALS' }, 400);

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user) return c.json({ success: false, error: 'INVALID_CREDENTIALS' }, 401);

    const isValid = await bcrypt.compare(password, user.password_hash as string);
    if (!isValid) return c.json({ success: false, error: 'INVALID_CREDENTIALS' }, 401);

    const payload = {
      userId: user.id,
      companyId: user.company_id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24h
    };

    const token = await sign(payload, c.env.JWT_SECRET, 'HS256');

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company_id
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'AUTH_ERROR', message: String(error) }, 500);
  }
});

// Protected Routes Group
const protectedRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
protectedRoutes.use('*', authMiddleware);
protectedRoutes.use('*', tenantMiddleware);

// Onboarding & Contracts Endpoint
protectedRoutes.post('/contracts/onboarding', async (c) => {
  try {
    const body = await c.req.json();
    const tenantId = c.get('tenantId');

    // Validate Body using Zod directly here or inside Service (Service handles logic)
    // We can do a quick check here or let Service throw
    const validation = OnboardingSchema.safeParse(body);
    if (validation.success === false) {
      return c.json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: validation.error.flatten()
      }, 400);
    }

    const service = new ContractService(c.env, tenantId);
    const result = await service.createOnboarding(validation.data);

    return c.json(result, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message
    }, 500);
  }
});

// Example: List Employees (Tenant Isolated)
protectedRoutes.get('/employees', async (c) => {
  const tenantId = c.get('tenantId');
  const result = await c.env.DB.prepare(
    'SELECT * FROM employees WHERE company_id = ? ORDER BY createdAt DESC'
  ).bind(tenantId).all();

  return c.json({ success: true, data: result.results });
});

// Notifications
protectedRoutes.get('/notifications', async (c) => {
  const user = c.get('user');
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 20;

  const service = new NotificationService(c.env);
  const result = await service.findAll(user.userId, page, limit);

  return c.json({ success: true, ...result });
});

protectedRoutes.put('/notifications/read-all', async (c) => {
  const user = c.get('user');
  const service = new NotificationService(c.env);
  await service.markAllAsRead(user.userId);
  return c.json({ success: true });
});

protectedRoutes.put('/notifications/:id/read', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const service = new NotificationService(c.env);
  await service.markAsRead(id, user.userId);
  return c.json({ success: true });
});

protectedRoutes.delete('/notifications/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const service = new NotificationService(c.env);
  await service.delete(id, user.userId);
  return c.json({ success: true });
});

// Mount Protected Routes
app.route('/api/v1', protectedRoutes);

export default app;
