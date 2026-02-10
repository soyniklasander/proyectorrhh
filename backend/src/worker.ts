import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import { Env, Variables } from './types';

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
  } catch (error: any) {
    console.error(error);
    return c.json({ success: false, error: 'AUTH_ERROR', message: String(error) }, 500);
  }
});

// Auth Register (Public)
app.post('/api/v1/auth/register', async (c) => {
  try {
    const { email, password, companyName, ruc } = await c.req.json();
    if (!email || !password || !companyName) {
      return c.json({ success: false, error: 'MISSING_FIELDS' }, 400);
    }

    // Check if email exists
    const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existingUser) {
      return c.json({ success: false, error: 'EMAIL_EXISTS' }, 400);
    }

    // Check if RUC exists in companies
    if (ruc) {
      const existingCompany = await c.env.DB.prepare('SELECT id FROM companies WHERE ruc = ?').bind(ruc).first();
      if (existingCompany) {
        return c.json({ success: false, error: 'RUC_EXISTS' }, 400);
      }
    }

    const companyId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // Create company
    await c.env.DB.prepare(
      'INSERT INTO companies (id, razonSocial, ruc) VALUES (?, ?, ?)'
    ).bind(companyId, companyName, ruc || null).run();

    // Create user
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, role, company_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, email, passwordHash, 'TENANT_ADMIN', companyId).run();

    const token = await sign({
      userId,
      companyId,
      role: 'TENANT_ADMIN',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    }, c.env.JWT_SECRET, 'HS256');

    return c.json({
      success: true,
      token,
      user: { id: userId, email, role: 'TENANT_ADMIN', companyId }
    });
  } catch (error: any) {
    console.error(error);
    return c.json({ success: false, error: 'REGISTER_ERROR', message: String(error) }, 500);
  }
});

// Protected Routes Group
const protectedRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Simple auth middleware (extract user from JWT)
protectedRoutes.use('*', async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'UNAUTHORIZED' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await c.env.JWT_SECRET ? 
      // In production, verify with actual secret
      JSON.parse(atob(token.split('.')[1])) : 
      null;

    if (!payload) {
      return c.json({ success: false, error: 'INVALID_TOKEN' }, 401);
    }

    c.set('user', {
      userId: payload.userId,
      companyId: payload.companyId,
      email: '',
      role: payload.role || 'TENANT_ADMIN'
    });

    c.set('tenantId', payload.companyId);
    await next();
  } catch (e) {
    return c.json({ success: false, error: 'AUTH_ERROR' }, 401);
  }
});

// Dashboard Summary
protectedRoutes.get('/dashboard/summary', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');

  try {
    // Super Admin: return all data
    if (user?.role === 'SUPER_ADMIN') {
      const [totalEmployees, activeContracts, companies] = await c.env.DB.batch([
        c.env.DB.prepare('SELECT COUNT(*) as count FROM employees WHERE estado = "ACTIVO"'),
        c.env.DB.prepare('SELECT COUNT(*) as count FROM contracts WHERE estado = "VIGENTE"'),
        c.env.DB.prepare('SELECT COUNT(*) as count FROM companies')
      ]);

      return c.json({
        success: true,
        data: {
          stats: {
            totalEmployees: (totalEmployees.results as any[])?.[0]?.count || 0,
            activeContracts: (activeContracts.results as any[])?.[0]?.count || 0,
            totalCompanies: (companies.results as any[])?.[0]?.count || 0
          }
        }
      });
    }

    // Regular tenant
    const [totalEmployees, activeContracts] = await c.env.DB.batch([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND estado = "ACTIVO"').bind(tenantId),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM contracts WHERE company_id = ? AND estado = "VIGENTE"').bind(tenantId)
    ]);

    return c.json({
      success: true,
      data: {
        stats: {
          totalEmployees: (totalEmployees.results as any[])?.[0]?.count || 0,
          activeContracts: (activeContracts.results as any[])?.[0]?.count || 0
        }
      }
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Employees CRUD
protectedRoutes.get('/employees', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');

  try {
    let result;
    if (user?.role === 'SUPER_ADMIN') {
      result = await c.env.DB.prepare(
        'SELECT * FROM employees ORDER BY createdAt DESC LIMIT 100'
      ).all();
    } else {
      result = await c.env.DB.prepare(
        'SELECT * FROM employees WHERE company_id = ? ORDER BY createdAt DESC'
      ).bind(tenantId).all();
    }
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/employees', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');

  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const companyId = user?.role === 'SUPER_ADMIN' ? body.company_id : tenantId;

    if (!companyId) {
      return c.json({ success: false, error: 'COMPANY_REQUIRED' }, 400);
    }

    await c.env.DB.prepare(
      `INSERT INTO employees (id, company_id, numeroDocumento, tipoDocumento, nombreCompleto, email, celular, cargo, area, fechaIngreso, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, companyId, body.numeroDocumento, body.tipoDocumento || 'DNI',
      body.nombreCompleto, body.email, body.celular, body.cargo, body.area,
      body.fechaIngreso, body.estado || 'ACTIVO'
    ).run();

    return c.json({ success: true, id });
  } catch (error: any) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Contracts CRUD
protectedRoutes.get('/contracts', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');

  try {
    let result;
    if (user?.role === 'SUPER_ADMIN') {
      result = await c.env.DB.prepare(
        'SELECT c.*, e.nombreCompleto FROM contracts c JOIN employees e ON c.empleadoId = e.id ORDER BY c.createdAt DESC LIMIT 100'
      ).all();
    } else {
      result = await c.env.DB.prepare(
        'SELECT c.*, e.nombreCompleto FROM contracts c JOIN employees e ON c.empleadoId = e.id WHERE c.company_id = ? ORDER BY c.createdAt DESC'
      ).bind(tenantId).all();
    }
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/contracts', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');

  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const companyId = user?.role === 'SUPER_ADMIN' ? body.company_id : tenantId;

    if (!companyId) {
      return c.json({ success: false, error: 'COMPANY_REQUIRED' }, 400);
    }

    await c.env.DB.prepare(
      `INSERT INTO contracts (id, company_id, empleadoId, tipoContrato, regimenLaboral, cargo, salarioBase, fechaInicio, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, companyId, body.empleadoId, body.tipoContrato,
      body.regimenLaboral || 'GENERAL', body.cargo, body.salarioBase,
      body.fechaInicio, body.estado || 'VIGENTE'
    ).run();

    return c.json({ success: true, id });
  } catch (error: any) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Mount protected routes
app.route('/', protectedRoutes);

export default app;
