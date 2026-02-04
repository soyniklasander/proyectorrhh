import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import { Env, Variables } from './types';
import { authMiddleware } from './middleware/auth.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { ContractService, OnboardingSchema } from './services/contract.service';

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

    // console.log('User found:', user.email);
    // console.log('Hash:', user.password_hash);

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
    return c.json({ success: false, error: 'AUTH_ERROR', message: String(error), stack: error.stack }, 500);
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
    if (!validation.success) {
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
  const user = c.get('user');
  
  // Super Admin can see all employees or filter by X-Tenant-ID
  if (user?.role === 'SUPER_ADMIN') {
    const explicitTenant = c.req.header('X-Tenant-ID');
    if (explicitTenant) {
      const result = await c.env.DB.prepare(
        'SELECT * FROM employees WHERE company_id = ? ORDER BY createdAt DESC'
      ).bind(explicitTenant).all();
      return c.json({ success: true, data: result.results, tenant: explicitTenant });
    }
    // No tenant specified - list all or return message
    const result = await c.env.DB.prepare(
      'SELECT * FROM employees ORDER BY createdAt DESC LIMIT 100'
    ).all();
    return c.json({ success: true, data: result.results, message: 'Showing all employees. Use X-Tenant-ID header to filter.' });
  }
  
  // Regular users need tenant
  if (!tenantId) {
    return c.json({ success: false, error: 'TENANT_REQUIRED', message: 'Tenant required' }, 403);
  }
  
  const result = await c.env.DB.prepare(
    'SELECT * FROM employees WHERE company_id = ? ORDER BY createdAt DESC'
  ).bind(tenantId).all();

  return c.json({ success: true, data: result.results });
});

// Dashboard Summary
protectedRoutes.get('/dashboard/summary', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  // Super Admin handling
  if (user?.role === 'SUPER_ADMIN') {
    const explicitTenant = c.req.header('X-Tenant-ID');
    if (explicitTenant) {
      try {
        const [totalEmployees, activeContracts, payrollSum, recentEmployees] = await db.batch([
          db.prepare('SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND estado = "ACTIVO"').bind(explicitTenant),
          db.prepare('SELECT COUNT(*) as count FROM contracts WHERE company_id = ? AND estado = "VIGENTE"').bind(explicitTenant),
          db.prepare('SELECT SUM(salarioBase) as total FROM contracts WHERE company_id = ? AND estado = "VIGENTE"').bind(explicitTenant),
          db.prepare('SELECT id, nombreCompleto, numeroDocumento, fechaIngreso, estado FROM employees WHERE company_id = ? ORDER BY createdAt DESC LIMIT 5').bind(explicitTenant)
        ]);
        return c.json({ success: true, data: { stats: { totalEmployees: totalEmployees.results[0]?.count || 0, activeContracts: activeContracts.results[0]?.count || 0, monthlyPayroll: payrollSum.results[0]?.total || 0, pendingOvertime: 0 }, recentEmployees: recentEmployees.results }, tenant: explicitTenant });
      } catch (error) {
        return c.json({ success: false, error: String(error) }, 500);
      }
    }
    // No tenant specified - return summary for all
    try {
      const [totalEmployees, activeContracts, payrollSum] = await db.batch([
        db.prepare('SELECT COUNT(*) as count FROM employees WHERE estado = "ACTIVO"'),
        db.prepare('SELECT COUNT(*) as count FROM contracts WHERE estado = "VIGENTE"'),
        db.prepare('SELECT SUM(salarioBase) as total FROM contracts WHERE estado = "VIGENTE"')
      ]);
      return c.json({ success: true, data: { stats: { totalEmployees: totalEmployees.results[0]?.count || 0, activeContracts: activeContracts.results[0]?.count || 0, monthlyPayroll: payrollSum.results[0]?.total || 0, pendingOvertime: 0 }, message: 'Showing all data. Use X-Tenant-ID header to filter by company.' } });
    } catch (error) {
      return c.json({ success: false, error: String(error) }, 500);
    }
  }

  // Regular users need tenant
  if (!tenantId) {
    return c.json({ success: false, error: 'TENANT_REQUIRED', message: 'Tenant required' }, 403);
  }

  try {
    const [totalEmployees, activeContracts, payrollSum, recentEmployees] = await db.batch([
      db.prepare('SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND estado = "ACTIVO"').bind(tenantId),
      db.prepare('SELECT COUNT(*) as count FROM contracts WHERE company_id = ? AND estado = "VIGENTE"').bind(tenantId),
      db.prepare('SELECT SUM(salarioBase) as total FROM contracts WHERE company_id = ? AND estado = "VIGENTE"').bind(tenantId),
      db.prepare('SELECT id, nombreCompleto, numeroDocumento, fechaIngreso, estado FROM employees WHERE company_id = ? ORDER BY createdAt DESC LIMIT 5').bind(tenantId)
    ]);

    return c.json({
      success: true,
      data: {
        stats: {
          totalEmployees: totalEmployees.results[0]?.count || 0,
          activeContracts: activeContracts.results[0]?.count || 0,
          monthlyPayroll: payrollSum.results[0]?.total || 0,
          pendingOvertime: 0
        },
        recentEmployees: recentEmployees.results
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'DB_ERROR', message: String(error) }, 500);
  }
});

// Admin Endpoints
protectedRoutes.get('/admin/companies', async (c) => {
  // TODO: Add strict Role Check here if middleware doesn't
  try {
     // Return dummy data or fetch from 'companies' table if it existed in schema (it does in some contexts, but let's be safe)
     return c.json({ success: true, data: [] });
  } catch (e) {
     return c.json({ success: false, error: String(e) }, 500);
  }
});

protectedRoutes.post('/admin/companies', async (c) => {
  return c.json({ success: true, message: 'Company created (mock)' });
});

// Admin Settings - Global settings (Super Admin only)
protectedRoutes.get('/admin/settings', async (c) => {
  const user = c.get('user');
  if (user?.role !== 'SUPER_ADMIN') {
    return c.json({ success: false, error: 'FORBIDDEN', message: 'Super Admin only' }, 403);
  }
  return c.json({ 
    success: true, 
    data: { 
      globalTheme: 'system',
      maintenanceMode: false,
      allowSelfRegistration: false,
      defaultCurrency: 'PEN'
    } 
  });
});

protectedRoutes.post('/admin/settings', async (c) => {
  const user = c.get('user');
  if (user?.role !== 'SUPER_ADMIN') {
    return c.json({ success: false, error: 'FORBIDDEN', message: 'Super Admin only' }, 403);
  }
  return c.json({ success: true, message: 'Global settings updated' });
});

// Settings - Tenant-specific (works with X-Tenant-ID header for Super Admin)
protectedRoutes.get('/settings', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  
  // If Super Admin with explicit tenant via header
  const explicitTenant = c.req.header('X-Tenant-ID');
  const targetTenant = explicitTenant || tenantId;
  
  if (!targetTenant) {
    // Super Admin without tenant - return message
    if (user?.role === 'SUPER_ADMIN') {
      return c.json({ 
        success: true, 
        data: { 
          message: 'Select a company to view settings',
          availableCompanies: ['comp-a', 'comp-b']
        }
      });
    }
    return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
  }
  
  return c.json({ success: true, data: { theme: 'light', notifications: true, companyId: targetTenant } });
});

protectedRoutes.post('/settings', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const explicitTenant = c.req.header('X-Tenant-ID');
  const targetTenant = explicitTenant || tenantId;
  
  if (!targetTenant && user?.role !== 'SUPER_ADMIN') {
    return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
  }
  
  return c.json({ success: true, message: 'Settings saved for: ' + (targetTenant || 'global') });
});

// Contracts Endpoints
protectedRoutes.get('/contracts', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  
  try {
    let result;
    
    if (user?.role === 'SUPER_ADMIN') {
      const explicitTenant = c.req.header('X-Tenant-ID');
      if (explicitTenant) {
        result = await c.env.DB.prepare(
          'SELECT c.*, e.nombreCompleto, e.numeroDocumento FROM contracts c JOIN employees e ON c.empleadoId = e.id WHERE c.company_id = ? ORDER BY c.createdAt DESC'
        ).bind(explicitTenant).all();
        return c.json({ success: true, data: result.results, tenant: explicitTenant });
      }
      result = await c.env.DB.prepare(
        'SELECT c.*, e.nombreCompleto, e.numeroDocumento FROM contracts c JOIN employees e ON c.empleadoId = e.id ORDER BY c.createdAt DESC LIMIT 100'
      ).all();
      return c.json({ success: true, data: result.results, message: 'Showing all contracts' });
    }
    
    if (!tenantId) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }
    
    result = await c.env.DB.prepare(
      'SELECT c.*, e.nombreCompleto, e.numeroDocumento FROM contracts c JOIN employees e ON c.empleadoId = e.id WHERE c.company_id = ? ORDER BY c.createdAt DESC'
    ).bind(tenantId).all();
    
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
    
    if (user?.role === 'SUPER_ADMIN' && !tenantId) {
      const explicitTenant = c.req.header('X-Tenant-ID');
      if (explicitTenant) {
        body.company_id = explicitTenant;
      }
    }
    
    if (!tenantId && !body.company_id) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }
    
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO contracts (id, company_id, empleadoId, tipoContrato, regimenLaboral, cargo, salarioBase, fechaInicio, estado, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      id, body.company_id || tenantId, body.empleadoId, body.tipoContrato || 'PLAZO_FIJO',
      body.regimenLaboral || 'GENERAL', body.cargo, body.salarioBase, body.fechaInicio, body.estado || 'VIGENTE'
    ).run();
    
    return c.json({ success: true, id, message: 'Contract created' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Payroll Endpoints
protectedRoutes.get('/payroll', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const period = c.req.query('period');

  if (!period) return c.json({ success: false, error: 'MISSING_PERIOD' }, 400);

  try {
    let result;
    
    if (user?.role === 'SUPER_ADMIN') {
      const explicitTenant = c.req.header('X-Tenant-ID');
      if (explicitTenant) {
        result = await c.env.DB.prepare(
          `SELECT p.*, e.nombreCompleto as employeeName, e.numeroDocumento as dni
           FROM payroll p
           JOIN employees e ON p.empleadoId = e.id
           WHERE p.company_id = ? AND p.periodo = ?`
        ).bind(explicitTenant, period).all();
        return c.json({ success: true, data: result.results, tenant: explicitTenant });
      }
      result = await c.env.DB.prepare(
        `SELECT p.*, e.nombreCompleto as employeeName, e.numeroDocumento as dni
         FROM payroll p
         JOIN employees e ON p.empleadoId = e.id
         WHERE p.periodo = ?`
      ).bind(period).all();
      return c.json({ success: true, data: result.results, message: 'Showing all payroll' });
    }
    
    if (!tenantId) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }
    
    result = await c.env.DB.prepare(
      `SELECT p.*, e.nombreCompleto as employeeName, e.numeroDocumento as dni
       FROM payroll p
       JOIN employees e ON p.empleadoId = e.id
       WHERE p.company_id = ? AND p.periodo = ?`
    ).bind(tenantId, period).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/generate', async (c) => {
   const tenantId = c.get('tenantId');
   const { period } = await c.req.json();

   if (!period) return c.json({ success: false, error: 'MISSING_PERIOD' }, 400);

   try {
     const contracts = await c.env.DB.prepare('SELECT id, empleadoId, salarioBase FROM contracts WHERE company_id = ? AND estado = "VIGENTE"').bind(tenantId).all();

     if (contracts.results.length === 0) {
        return c.json({ success: false, message: 'No active contracts found' }, 400);
     }

     const batch = contracts.results.map((ct: any) => {
         const basico = ct.salarioBase;
         const descuento = basico * 0.13; // Approx 13%
         const neto = basico - descuento;

         return c.env.DB.prepare(`
          INSERT INTO payroll (id, company_id, empleadoId, contratoId, periodo, salarioBase, totalIngresos, totalDescuentos, netoPagar, totalAFP_ONP, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GENERADO')
        `).bind(
           crypto.randomUUID(),
           tenantId,
           ct.empleadoId,
           ct.id,
           period,
           basico,
           basico,
           descuento,
           neto,
           descuento
        );
     });

     await c.env.DB.prepare('DELETE FROM payroll WHERE company_id = ? AND periodo = ?').bind(tenantId, period).run();

     if (batch.length > 0) {
       await c.env.DB.batch(batch);
     }

     return c.json({ success: true, count: batch.length });

   } catch (e) {
      return c.json({ success: false, error: String(e) }, 500);
   }
});

protectedRoutes.get('/payroll/export', async (c) => {
  const tenantId = c.get('tenantId');
  const period = c.req.query('period');

  if (!period) return c.text('Missing period', 400);

  try {
    const result = await c.env.DB.prepare(
      `SELECT p.*, e.nombreCompleto as employeeName, e.numeroDocumento as dni
       FROM payroll p
       JOIN employees e ON p.empleadoId = e.id
       WHERE p.company_id = ? AND p.periodo = ?`
    ).bind(tenantId, period).all();

    const header = "DNI,Nombre,Basico,Neto\n";
    const rows = result.results.map((r: any) => `${r.dni},"${r.employeeName}",${r.salarioBase},${r.netoPagar}`).join("\n");

    return c.text(header + rows, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payroll-${period}.csv"`,
    });
  } catch (error) {
    return c.text(String(error), 500);
  }
});

// Mount Protected Routes
app.route('/api/v1', protectedRoutes);

export default app;
