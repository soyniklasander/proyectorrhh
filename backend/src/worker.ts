import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';
import { Env, Variables } from './types';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global Middleware
app.use('*', cors());

// Health Check (Public)
app.get('/api/v1/health', async (c) => {
  return c.json({ success: true, message: 'ERPRick API is running' });
});

// Auth Login (Public)
app.post('/api/v1/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ success: false, error: 'MISSING_CREDENTIALS' }, 400);

    const db = drizzle(c.env.DB, { schema });

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) return c.json({ success: false, error: 'INVALID_CREDENTIALS' }, 401);

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return c.json({ success: false, error: 'INVALID_CREDENTIALS' }, 401);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
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
        tenantId: user.tenant_id
      }
    });
  } catch (error: any) {
    console.error(error);
    return c.json({ success: false, error: 'AUTH_ERROR', message: String(error) }, 500);
  }
});

// Auth Middleware
const authMiddleware = async (c: any, next: any) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'UNAUTHORIZED' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');

    if (!payload) {
      return c.json({ success: false, error: 'INVALID_TOKEN' }, 401);
    }

    c.set('user', payload);
    c.set('tenantId', payload.tenantId);

    await next();
  } catch (e) {
    return c.json({ success: false, error: 'AUTH_ERROR' }, 401);
  }
};

// Protected Routes Group
const api = new Hono<{ Bindings: Env; Variables: Variables }>();
api.use('*', authMiddleware);

// Get User Profile
api.get('/auth/me', (c) => {
  const user = c.get('user');
  return c.json({ success: true, user });
});

// Example: Get Employees (Tenant Scoped)
api.get('/employees', async (c) => {
  const tenantId = c.get('tenantId');
  const db = drizzle(c.env.DB, { schema });

  if (!tenantId) {
    // If super admin wants to see all, logic goes here.
    // For now, strict tenant check.
    return c.json({ success: false, error: 'TENANT_REQUIRED' }, 400);
  }

  const employees = await db.query.employees.findMany({
    where: eq(schema.employees.tenant_id, tenantId as string),
    with: {
      venue: true
    }
  });

  return c.json({ success: true, data: employees });
});

app.route('/api/v1', api);

export default app;
