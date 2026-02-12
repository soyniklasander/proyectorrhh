import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import * as schema from './db/schema';
import { Env, Variables } from './types';
import { nanoid } from 'nanoid';
import { sql } from 'drizzle-orm';

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

// ============================================
// LEGAL ENTITIES ENDPOINTS (GET/POST)
// ============================================
api.get('/legal-entities', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const db = drizzle(c.env.DB, { schema });
  
  const entities = await db.query.legalEntities.findMany({
    where: eq(schema.legalEntities.tenant_id, tenantId),
  });
  
  return c.json({ success: true, data: entities });
});

api.post('/legal-entities', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const { ruc, business_name, regime } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  
  const [entity] = await db.insert(schema.legalEntities).values({
    id: nanoid(),
    tenant_id: tenantId,
    ruc,
    business_name,
    regime,
  }).returning();
  
  return c.json({ success: true, data: entity });
});

// ============================================
// VENUES ENDPOINTS (GET/POST)
// ============================================
api.get('/venues', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const db = drizzle(c.env.DB, { schema });
  
  const venues = await db.query.venues.findMany({
    where: eq(schema.venues.tenant_id, tenantId),
  });
  
  return c.json({ success: true, data: venues });
});

api.post('/venues', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const { name, cost_center_code } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  
  const [venue] = await db.insert(schema.venues).values({
    id: nanoid(),
    tenant_id: tenantId,
    name,
    cost_center_code,
  }).returning();
  
  return c.json({ success: true, data: venue });
});

// ============================================
// EMPLOYEES ENDPOINTS (GET/POST)
// ============================================
api.get('/employees', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const db = drizzle(c.env.DB, { schema });
  
  const employees = await db.query.employees.findMany({
    where: eq(schema.employees.tenant_id, tenantId),
    with: {
      venue: true
    }
  });
  
  return c.json({ success: true, data: employees });
});

api.post('/employees', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const { full_name, dni, current_venue_id, basic_salary, has_children, pension_system } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  
  const [employee] = await db.insert(schema.employees).values({
    id: nanoid(),
    tenant_id: tenantId,
    full_name,
    dni,
    current_venue_id,
    basic_salary,
    has_children,
    pension_system,
  }).returning();
  
  return c.json({ success: true, data: employee });
});

// ============================================
// LOGIC MATRIX ENDPOINTS (GET/POST)
// ============================================
api.get('/config/matrix', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const db = drizzle(c.env.DB, { schema });
  
  const matrix = await db.query.logicMatrix.findMany({
    where: eq(schema.logicMatrix.tenant_id, tenantId),
    with: {
      venue: true,
      targetLegalEntity: true,
    }
  });
  
  return c.json({ success: true, data: matrix });
});

api.post('/config/matrix', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const { venue_id, shift, target_legal_entity_id } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  
  const [matrixEntry] = await db.insert(schema.logicMatrix).values({
    id: nanoid(),
    tenant_id: tenantId,
    venue_id,
    shift,
    target_legal_entity_id,
  }).returning();
  
  return c.json({ success: true, data: matrixEntry });
});

api.delete('/config/matrix/:id', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const id = c.req.param('id');
  const db = drizzle(c.env.DB, { schema });
  
  await db.delete(schema.logicMatrix).where(
    and(
      eq(schema.logicMatrix.id, id),
      eq(schema.logicMatrix.tenant_id, tenantId)
    )
  );
  
  return c.json({ success: true });
});

// ============================================
// FINANCIAL INCIDENTS ENDPOINTS (GET/POST)
// ============================================
api.get('/financials', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const db = drizzle(c.env.DB, { schema });
  
  const financials = await db.query.financialIncidents.findMany({
    where: eq(schema.financialIncidents.tenant_id, tenantId),
    with: {
      employee: true,
    }
  });
  
  return c.json({ success: true, data: financials });
});

api.post('/financials', async (c) => {
  const tenantId = c.get('tenantId') as string;
  const { employee_id, type, description, amount, installments_total, start_date } = await c.req.json();
  const db = drizzle(c.env.DB, { schema });
  
  const [incident] = await db.insert(schema.financialIncidents).values({
    id: nanoid(),
    tenant_id: tenantId,
    employee_id,
    type,
    description,
    amount,
    installments_total,
    installments_paid: 0,
    status: 'ACTIVE',
    start_date: new Date(start_date),
  }).returning();
  
  return c.json({ success: true, data: incident });
});

export default app;
