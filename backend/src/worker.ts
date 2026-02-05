import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';
import { Env, Variables } from './types';
import { authMiddleware } from './middleware/auth.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { ContractService, OnboardingSchema } from './services/contract.service';
import {
  calcularPlanillaPeru,
  calcularCTS,
  calcularGratificacion,
  calcularVacaciones,
  calcularQuintaCategoria,
  calcularEssalud,
  calcularAFP,
  esMesCTS,
  esMesGratificacion,
  validarDNI,
  validarRUC,
  getFeriadosPeru,
  CONSTANTS_PERU,
  AFP_RATES_2024,
} from './services/calculos-peru.service';
import {
  generarPLAME,
  exportarPLAME_CSV,
  generarArchivoBancario,
  calcularDashboardMetrics,
  calcularReporteCostos,
} from './services/reportes.service';
import {
  generarHTMLBoleta,
  generarHTMLBoletaSimplificada,
} from './services/pdf.service';
import {
  generarEmailBoletaTemplate,
  enviarBoletaPorEmail,
} from './services/email.service';

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

// ==================== PAYROLL PERIODS ====================
protectedRoutes.get('/payroll/periods', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    let result;

    if (user?.role === 'SUPER_ADMIN') {
      const explicitTenant = c.req.header('X-Tenant-ID');
      const targetTenant = explicitTenant || tenantId;
      if (!targetTenant) {
        return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
      }

      result = await db.prepare(`
        SELECT DISTINCT periodo, MAX(createdAt) as generatedAt, COUNT(*) as employeeCount,
          SUM(totalIngresos) as totalIngresos, SUM(totalDescuentos) as totalDeducciones,
          SUM(totalAFP_ONP) as totalAportaciones, SUM(netoPagar) as totalNeto, 'PENDIENTE' as status
        FROM payroll
        WHERE company_id = ?
        GROUP BY periodo
        ORDER BY periodo DESC
      `).bind(targetTenant).all();

      return c.json({ success: true, data: result.results, tenant: targetTenant });
    }

    if (!tenantId) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    result = await db.prepare(`
      SELECT DISTINCT periodo, MAX(createdAt) as generatedAt, COUNT(*) as employeeCount,
        SUM(totalIngresos) as totalIngresos, SUM(totalDescuentos) as totalDeducciones,
        SUM(totalAFP_ONP) as totalAportaciones, SUM(netoPagar) as totalNeto, 'PENDIENTE' as status
      FROM payroll
      WHERE company_id = ?
      GROUP BY periodo
      ORDER BY periodo DESC
    `).bind(tenantId).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.get('/payroll/preview', async (c) => {
  const tenantId = c.get('tenantId');
  const period = c.req.query('period');
  const type = c.req.query('type') || 'MENSUAL';

  if (!period) return c.json({ success: false, error: 'MISSING_PERIOD' }, 400);

  try {
    const contracts = await c.env.DB.prepare(`
      SELECT e.id as employeeId, e.nombreCompleto, e.numeroDocumento as dni,
        c.salarioBase, c.id as contractId, c.afpSistema
      FROM contracts c
      JOIN employees e ON c.empleadoId = e.id
      WHERE c.company_id = ? AND c.estado = 'VIGENTE'
      ORDER BY e.nombreCompleto
    `).bind(tenantId).all();

    const preview = contracts.results.map((ct: any) => {
      const basico = ct.salarioBase;
      const afpRate = 0.13;
      const afp = basico * afpRate;
      const neto = basico - afp;

      return {
        employeeId: ct.employeeId,
        employeeName: ct.nombreCompleto,
        dni: ct.dni,
        basico,
        asignacionFamiliar: 0,
        horasExtras: 0,
        bonificaciones: 0,
        totalIngresos: basico,
        afp,
        otrosDescuentos: 0,
        totalDescuentos: afp,
        neto
      };
    });

    return c.json({ success: true, data: preview, count: preview.length });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/regenerate', async (c) => {
  const tenantId = c.get('tenantId');
  const { period } = await c.req.json();

  if (!period) return c.json({ success: false, error: 'MISSING_PERIOD' }, 400);

  try {
    await c.env.DB.prepare('DELETE FROM payroll WHERE company_id = ? AND periodo = ?')
      .bind(tenantId, period).run();

    const contracts = await c.env.DB.prepare(`
      SELECT c.id, c.empleadoId, c.salarioBase
      FROM contracts c
      WHERE c.company_id = ? AND c.estado = 'VIGENTE'
    `).bind(tenantId).all();

    if (contracts.results.length === 0) {
      return c.json({ success: false, message: 'No active contracts found' }, 400);
    }

    const batch = contracts.results.map((ct: any) => {
      const basico = ct.salarioBase;
      const descuento = basico * 0.13;
      const neto = basico - descuento;

      return c.env.DB.prepare(`
        INSERT INTO payroll (id, company_id, empleadoId, contratoId, periodo, salarioBase, totalIngresos, totalDescuentos, netoPagar, totalAFP_ONP, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GENERADO')
      `).bind(
        crypto.randomUUID(), tenantId, ct.empleadoId, ct.id, period,
        basico, basico, descuento, neto, descuento
      );
    });

    if (batch.length > 0) {
      await c.env.DB.batch(batch);
    }

    return c.json({ success: true, count: batch.length, period });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PAYROLL CONCEPTS ====================
protectedRoutes.get('/payroll/concepts', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');

  try {
    if (user?.role === 'SUPER_ADMIN' && !tenantId) {
      const explicitTenant = c.req.header('X-Tenant-ID');
      if (explicitTenant) {
        const result = await c.env.DB.prepare(
          'SELECT * FROM payroll_concepts WHERE company_id = ? ORDER BY type, name'
        ).bind(explicitTenant).all();
        return c.json({ success: true, data: result.results, tenant: explicitTenant });
      }
    }

    if (!tenantId) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const result = await c.env.DB.prepare(
      'SELECT * FROM payroll_concepts WHERE company_id = ? ORDER BY type, name'
    ).bind(tenantId).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/concepts', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const body = await c.req.json();

  try {
    const targetTenant = (user?.role === 'SUPER_ADMIN' && body.company_id) ? body.company_id : tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO payroll_concepts (id, company_id, code, name, type, description, amount, amountType, frequency, active, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      id, targetTenant, body.code, body.name, body.type, body.description || '',
      body.amount || 0, body.amountType || 'FIJO', body.frequency || 'MENSUAL', body.active !== false
    ).run();

    return c.json({ success: true, id, message: 'Concept created' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.put('/payroll/concepts/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  const body = await c.req.json();

  try {
    await c.env.DB.prepare(`
      UPDATE payroll_concepts
      SET code = ?, name = ?, type = ?, description = ?, amount = ?, amountType = ?, frequency = ?, active = ?, updatedAt = datetime('now')
      WHERE id = ? AND company_id = ?
    `).bind(
      body.code, body.name, body.type, body.description || '', body.amount || 0,
      body.amountType || 'FIJO', body.frequency || 'MENSUAL', body.active !== false, id, tenantId
    ).run();

    return c.json({ success: true, message: 'Concept updated' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== EMPLOYEE CONCEPTS ====================
protectedRoutes.get('/payroll/employee-concepts', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const employeeId = c.req.query('employeeId');

  try {
    let query = `
      SELECT ec.*, e.nombreCompleto as employeeName, pc.name as conceptName, pc.type as conceptType, pc.amount
      FROM payroll_employee_concepts ec
      JOIN employees e ON ec.empleadoId = e.id
      JOIN payroll_concepts pc ON ec.conceptoId = pc.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user?.role === 'SUPER_ADMIN') {
      const explicitTenant = c.req.header('X-Tenant-ID');
      if (explicitTenant) {
        query += ' AND ec.company_id = ?';
        params.push(explicitTenant);
      }
    } else {
      if (!tenantId) {
        return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
      }
      query += ' AND ec.company_id = ?';
      params.push(tenantId);
    }

    if (employeeId) {
      query += ' AND ec.empleadoId = ?';
      params.push(employeeId);
    }

    query += ' ORDER BY e.nombreCompleto, pc.name';

    const result = await c.env.DB.prepare(query).bind(...params).all();

    const concepts = result.results.map((r: any) => ({
      ...r,
      status: r.fechaFin && new Date(r.fechaFin) < new Date() ? 'VENCIDO' : (r.active !== false ? 'ACTIVO' : 'INACTIVO')
    }));

    return c.json({ success: true, data: concepts });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/employee-concepts', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const body = await c.req.json();

  try {
    const targetTenant = (user?.role === 'SUPER_ADMIN' && body.company_id) ? body.company_id : tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO payroll_employee_concepts (id, company_id, empleadoId, conceptoId, monto, fechaInicio, fechaFin, observation, active, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      id, targetTenant, body.empleadoId, body.conceptId,
      body.customAmount || null,
      body.startDate ? new Date(body.startDate).toISOString().split('T')[0] : null,
      body.endDate ? new Date(body.endDate).toISOString().split('T')[0] : null,
      body.observation || '', body.active !== false
    ).run();

    return c.json({ success: true, id, message: 'Concept assigned to employee' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== ATTENDANCE ENDPOINTS ====================
protectedRoutes.get('/attendance', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const date = c.req.query('date');

  try {
    let result;

    if (user?.role === 'SUPER_ADMIN') {
      const explicitTenant = c.req.header('X-Tenant-ID');
      const targetTenant = explicitTenant || tenantId;
      if (!targetTenant) {
        return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
      }
      
      const query = date 
        ? `SELECT a.*, e.nombreCompleto, e.numeroDocumento, e.areaTrabajo
           FROM attendance a 
           JOIN employees e ON a.empleadoId = e.id 
           WHERE e.company_id = ? AND a.fecha = ?
           ORDER BY a.horaEntrada DESC`
        : `SELECT a.*, e.nombreCompleto, e.numeroDocumento, e.areaTrabajo
           FROM attendance a 
           JOIN employees e ON a.empleadoId = e.id 
           WHERE e.company_id = ?
           ORDER BY a.fecha DESC, a.horaEntrada DESC LIMIT 200`;
      
      result = date 
        ? await db.prepare(query).bind(targetTenant, date).all()
        : await db.prepare(query).bind(targetTenant).all();
        
      return c.json({ success: true, data: result.results, tenant: targetTenant });
    }

    if (!tenantId) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const query = date 
      ? `SELECT a.*, e.nombreCompleto, e.numeroDocumento, e.areaTrabajo
         FROM attendance a 
         JOIN employees e ON a.empleadoId = e.id 
         WHERE e.company_id = ? AND a.fecha = ?
         ORDER BY a.horaEntrada DESC`
      : `SELECT a.*, e.nombreCompleto, e.numeroDocumento, e.areaTrabajo
         FROM attendance a 
         JOIN employees e ON a.empleadoId = e.id 
         WHERE e.company_id = ?
         ORDER BY a.fecha DESC, a.horaEntrada DESC LIMIT 200`;

    result = date 
      ? await db.prepare(query).bind(tenantId, date).all()
      : await db.prepare(query).bind(tenantId).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/attendance', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  
  try {
    const body = await c.req.json();
    
    const targetTenant = (user?.role === 'SUPER_ADMIN' && body.company_id) 
      ? body.company_id 
      : tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO attendance (id, company_id, empleadoId, fecha, horaEntrada, horaSalida, estado, observaciones, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      id, targetTenant, body.empleadoId, body.fecha, body.horaEntrada, 
      body.horaSalida || null, body.estado || 'PUNTUAL', body.observaciones || ''
    ).run();

    return c.json({ success: true, id, message: 'Attendance record created' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.put('/attendance/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    
    await c.env.DB.prepare(
      `UPDATE attendance SET horaEntrada = ?, horaSalida = ?, estado = ?, observaciones = ?, updatedAt = datetime('now')
       WHERE id = ? AND company_id = ?`
    ).bind(
      body.horaEntrada, body.horaSalida || null, body.estado, body.observaciones || '', id, tenantId
    ).run();

    return c.json({ success: true, message: 'Attendance updated' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== OVERTIME ENDPOINTS ====================
protectedRoutes.get('/overtime', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const status = c.req.query('status');

  try {
    let result;

    if (user?.role === 'SUPER_ADMIN') {
      const explicitTenant = c.req.header('X-Tenant-ID');
      const targetTenant = explicitTenant || tenantId;
      if (!targetTenant) {
        return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
      }
      
      let query = `SELECT o.*, e.nombreCompleto, e.numeroDocumento 
                   FROM overtime o 
                   JOIN employees e ON o.empleadoId = e.id 
                   WHERE e.company_id = ?`;
      if (status) query += ` AND o.estado = '${status}'`;
      query += ' ORDER BY o.fecha DESC, o.createdAt DESC LIMIT 200';
      
      result = await db.prepare(query).bind(targetTenant).all();
      return c.json({ success: true, data: result.results, tenant: targetTenant });
    }

    if (!tenantId) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    let query = `SELECT o.*, e.nombreCompleto, e.numeroDocumento 
                 FROM overtime o 
                 JOIN employees e ON o.empleadoId = e.id 
                 WHERE e.company_id = ?`;
    if (status) query += ` AND o.estado = '${status}'`;
    query += ' ORDER BY o.fecha DESC, o.createdAt DESC LIMIT 200';

    result = await db.prepare(query).bind(tenantId).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/overtime', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  
  try {
    const body = await c.req.json();
    
    const targetTenant = (user?.role === 'SUPER_ADMIN' && body.company_id) 
      ? body.company_id 
      : tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const id = crypto.randomUUID();
    const DEFAULT_SALARY = 1500; // Sueldo base por defecto
    const hourlyRate = (body.salarioBase || DEFAULT_SALARY) / 240;
    const multiplier = body.tipo === 'FERIADO' ? 2 : (body.tipo === 'NOCTURNA' ? 1.35 : 1.25);
    const monto = (body.horas || 0) * hourlyRate * multiplier;

    await c.env.DB.prepare(
      `INSERT INTO overtime (id, company_id, empleadoId, fecha, horas, tipo, monto, motivo, estado, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', datetime('now'))`
    ).bind(
      id, targetTenant, body.empleadoId, body.fecha, body.horas || 0, 
      body.tipo || 'ORDINARIA', monto.toFixed(2), body.motivo || ''
    ).run();

    return c.json({ success: true, id, message: 'Overtime record created', monto: monto.toFixed(2) });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.put('/overtime/:id/status', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    
    await c.env.DB.prepare(
      `UPDATE overtime SET estado = ?, updatedAt = datetime('now') WHERE id = ? AND company_id = ?`
    ).bind(body.estado, id, tenantId).run();

    return c.json({ success: true, message: `Overtime ${body.estado.toLowerCase()}` });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VACATIONS ENDPOINTS ====================
protectedRoutes.get('/vacations', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const status = c.req.query('status');

  try {
    let result;

    if (user?.role === 'SUPER_ADMIN') {
      const explicitTenant = c.req.header('X-Tenant-ID');
      const targetTenant = explicitTenant || tenantId;
      if (!targetTenant) {
        return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
      }
      
      let query = `SELECT v.*, e.nombreCompleto, e.numeroDocumento 
                   FROM vacations v 
                   JOIN employees e ON v.empleadoId = e.id 
                   WHERE e.company_id = ?`;
      if (status) query += ` AND v.estado = '${status}'`;
      query += ' ORDER BY v.createdAt DESC LIMIT 200';
      
      result = await db.prepare(query).bind(targetTenant).all();
      return c.json({ success: true, data: result.results, tenant: targetTenant });
    }

    if (!tenantId) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    let query = `SELECT v.*, e.nombreCompleto, e.numeroDocumento 
                 FROM vacations v 
                 JOIN employees e ON v.empleadoId = e.id 
                 WHERE e.company_id = ?`;
    if (status) query += ` AND v.estado = '${status}'`;
    query += ' ORDER BY v.createdAt DESC LIMIT 200';

    result = await db.prepare(query).bind(tenantId).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/vacations', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  
  try {
    const body = await c.req.json();
    
    const targetTenant = (user?.role === 'SUPER_ADMIN' && body.company_id) 
      ? body.company_id 
      : tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const id = crypto.randomUUID();
    const dias = Math.ceil((body.fechaFin - body.fechaInicio) / (1000 * 60 * 60 * 24)) + 1;

    await c.env.DB.prepare(
      `INSERT INTO vacations (id, company_id, empleadoId, tipo, fechaInicio, fechaFin, dias, motivo, estado, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', datetime('now'))`
    ).bind(
      id, targetTenant, body.empleadoId, body.tipo || 'VACACIONES',
      body.fechaInicio, body.fechaFin, dias, body.motivo || ''
    ).run();

    return c.json({ success: true, id, message: 'Vacation request created', dias });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.put('/vacations/:id/status', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    
    await c.env.DB.prepare(
      `UPDATE vacations SET estado = ?, updatedAt = datetime('now') WHERE id = ? AND company_id = ?`
    ).bind(body.estado, id, tenantId).run();

    return c.json({ success: true, message: `Vacation ${body.estado.toLowerCase()}` });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PERMITS ENDPOINTS ====================
protectedRoutes.get('/permits', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const status = c.req.query('status');

  try {
    let result;

    if (user?.role === 'SUPER_ADMIN') {
      const explicitTenant = c.req.header('X-Tenant-ID');
      const targetTenant = explicitTenant || tenantId;
      if (!targetTenant) {
        return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
      }
      
      let query = `SELECT p.*, e.nombreCompleto, e.numeroDocumento 
                   FROM permits p 
                   JOIN employees e ON p.empleadoId = e.id 
                   WHERE e.company_id = ?`;
      if (status) query += ` AND p.estado = '${status}'`;
      query += ' ORDER BY p.createdAt DESC LIMIT 200';
      
      result = await db.prepare(query).bind(targetTenant).all();
      return c.json({ success: true, data: result.results, tenant: targetTenant });
    }

    if (!tenantId) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    let query = `SELECT p.*, e.nombreCompleto, e.numeroDocumento 
                 FROM permits p 
                 JOIN employees e ON p.empleadoId = e.id 
                 WHERE e.company_id = ?`;
    if (status) query += ` AND p.estado = '${status}'`;
    query += ' ORDER BY p.createdAt DESC LIMIT 200';

    result = await db.prepare(query).bind(tenantId).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/permits', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  
  try {
    const body = await c.req.json();
    
    const targetTenant = (user?.role === 'SUPER_ADMIN' && body.company_id) 
      ? body.company_id 
      : tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const id = crypto.randomUUID();
    
    const parseTimeToHours = (timeStr: string | number) => {
      if (typeof timeStr === 'number') {
        const date = new Date(timeStr);
        return date.getHours() + date.getMinutes() / 60;
      }
      if (typeof timeStr === 'string' && timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + (minutes || 0) / 60;
      }
      return 0;
    };
    
    const startHours = parseTimeToHours(body.horaInicio);
    const endHours = parseTimeToHours(body.horaFin);
    const duracionHoras = Math.max(0, endHours - startHours);
    const duracionStr = duracionHoras > 0 ? `${duracionHoras.toFixed(1).replace('.0', '')}h` : '0h';

    await c.env.DB.prepare(
      `INSERT INTO permits (id, company_id, empleadoId, tipo, fecha, horaInicio, horaFin, duracion, motivo, estado, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', datetime('now'))`
    ).bind(
      id, targetTenant, body.empleadoId, body.tipo || 'PERSONAL',
      body.fecha, String(body.horaInicio), String(body.horaFin), duracionStr, body.motivo || ''
    ).run();

    return c.json({ success: true, id, message: 'Permit request created' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

 protectedRoutes.put('/permits/:id/status', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  try {
    const body = await c.req.json();

    await c.env.DB.prepare(
      `UPDATE permits SET estado = ?, updatedAt = datetime('now') WHERE id = ? AND company_id = ?`
    ).bind(body.estado, id, tenantId).run();

    return c.json({ success: true, message: `Permit ${body.estado.toLowerCase()}` });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 // ==================== OVERTIME V2 ENDPOINTS ====================

 // Overtime Rules
 protectedRoutes.get('/overtime/rules', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    let result;
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    result = await db.prepare(
      'SELECT * FROM overtime_rules WHERE company_id = ?'
    ).bind(targetTenant).first();

    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.put('/overtime/rules', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    await db.prepare(`
      INSERT OR REPLACE INTO overtime_rules (id, company_id, promedio_referencia, alerta_amarilla, alerta_naranja, alerta_roja, limite_legal, requiere_aprobacion_ci, ver_proyectos_en_reporte, actualizado_por, updatedAt)
      VALUES ((SELECT id FROM overtime_rules WHERE company_id = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      targetTenant, targetTenant,
      body.promedio_referencia || 20,
      body.alerta_amarilla || 10,
      body.alerta_naranja || 20,
      body.alerta_roja || 30,
      body.limite_legal || 50,
      body.requiere_aprobacion_ci !== false,
      body.ver_proyectos_en_reporte || false,
      user?.email
    ).run();

    return c.json({ success: true, message: 'Rules updated' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 // Overtime Types
 protectedRoutes.get('/overtime/tipos', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const result = await db.prepare(
      'SELECT * FROM overtime_tipos WHERE company_id = ? AND activo = 1 ORDER BY orden'
    ).bind(targetTenant).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.post('/overtime/tipos', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const id = `ott-${crypto.randomUUID().slice(0, 8)}`;
    await db.prepare(`
      INSERT INTO overtime_tipos (id, company_id, nombre, multiplicador, orden)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, targetTenant, body.nombre, body.multiplicador || 1.0, body.orden || 0).run();

    return c.json({ success: true, id, message: 'Overtime type created' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.delete('/overtime/tipos/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;
  const id = c.req.param('id');

  try {
    await db.prepare(
      'UPDATE overtime_tipos SET activo = 0, updatedAt = datetime("now") WHERE id = ? AND company_id = ?'
    ).bind(id, tenantId).run();

    return c.json({ success: true, message: 'Overtime type deactivated' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 // Projects
 protectedRoutes.get('/overtime/projects', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const result = await db.prepare(
      'SELECT * FROM overtime_projects WHERE company_id = ? AND activo = 1 ORDER BY nombre'
    ).bind(targetTenant).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.post('/overtime/projects', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 5; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const id = `prj-${crypto.randomUUID().slice(0, 8)}`;
    await db.prepare(`
      INSERT INTO overtime_projects (id, company_id, codigo, nombre)
      VALUES (?, ?, ?, ?)
    `).bind(id, targetTenant, codigo, body.nombre).run();

    return c.json({ success: true, id, codigo, message: 'Project created' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 // Imports
 protectedRoutes.get('/overtime/imports', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const result = await db.prepare(`
      SELECT i.*, u.name as uploaded_by_name
      FROM overtime_imports i
      LEFT JOIN users u ON i.uploaded_by = u.id
      WHERE i.company_id = ?
      ORDER BY i.createdAt DESC
    `).bind(targetTenant).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.post('/overtime/import', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const importId = `imp-${crypto.randomUUID().slice(0, 8)}`;
    await db.prepare(`
      INSERT INTO overtime_imports (id, company_id, filename, uploaded_by, status, total_records)
      VALUES (?, ?, ?, ?, 'PENDIENTE', ?)
    `).bind(importId, targetTenant, body.filename, user?.id, body.records?.length || 0).run();

    return c.json({ success: true, id: importId, message: 'Import created', recordsCount: body.records?.length || 0 });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.get('/overtime/import/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const importId = c.req.param('id');

  try {
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    const importResult = await db.prepare(
      'SELECT * FROM overtime_imports WHERE id = ? AND company_id = ?'
    ).bind(importId, targetTenant).first();

    if (!importResult) {
      return c.json({ success: false, error: 'Import not found' }, 404);
    }

    const recordsResult = await db.prepare(
      'SELECT * FROM overtime_records WHERE import_id = ? ORDER BY createdAt'
    ).bind(importId).all();

    return c.json({ success: true, data: { ...importResult, records: recordsResult.results } });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.post('/overtime/import/:id/process', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const importId = c.req.param('id');

  try {
    const body = await c.req.json();
    const records = body.records || [];

    const batch = records.map((r: any) => {
      const id = `otr-${crypto.randomUUID().slice(0, 12)}`;
      return db.prepare(`
        INSERT INTO overtime_records (id, import_id, company_id, empleado_codigo, empleado_dni, empleado_nombre, fecha, horas, tipo, motivo, proyecto_codigo, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')
      `).bind(
        id, importId, tenantId,
        r.empleado_codigo || r.codigo,
        r.empleado_dni || r.dni,
        r.empleado_nombre || r.nombre || '未知',
        r.fecha,
        r.horas,
        r.tipo || 'ORDINARIA',
        r.motivo || '',
        r.proyecto_codigo || null
      );
    });

    if (batch.length > 0) {
      await db.batch(batch);
    }

    await db.prepare(`
      UPDATE overtime_imports SET status = 'REVISION', processed_records = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).bind(batch.length, importId).run();

    return c.json({ success: true, message: `${batch.length} records processed` });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 // Records
 protectedRoutes.get('/overtime/records', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const status = c.req.query('status');
  const importId = c.req.query('importId');

  try {
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    let query = 'SELECT * FROM overtime_records WHERE company_id = ?';
    const params: any[] = [targetTenant];

    if (status) {
      query += ' AND estado = ?';
      params.push(status);
    }
    if (importId) {
      query += ' AND import_id = ?';
      params.push(importId);
    }

    query += ' ORDER BY fecha DESC, createdAt DESC LIMIT 500';

    const result = await db.prepare(query).bind(...params).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.put('/overtime/records/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();

    await db.prepare(`
      UPDATE overtime_records
      SET horas = ?, tipo = ?, motivo = ?, proyecto_codigo = ?, observaciones = ?, updatedAt = datetime('now')
      WHERE id = ? AND company_id = ?
    `).bind(
      body.horas, body.tipo, body.motivo, body.proyecto_codigo, body.observaciones, id, tenantId
    ).run();

    return c.json({ success: true, message: 'Record updated' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.put('/overtime/records/batch/aprove-rrhh', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const ids = body.ids || [];

    if (ids.length === 0) {
      return c.json({ success: false, error: 'No IDs provided' }, 400);
    }

    const placeholders = ids.map(() => '?').join(',');
    const logBatch = ids.map((id: string) => {
      return db.prepare(`
        INSERT INTO overtime_approval_log (id, record_id, company_id, action, performed_by, new_state, createdAt)
        VALUES (?, ?, ?, 'APROBADO_RRHH', ?, 'APROBADO_RRHH', datetime('now'))
      `).bind(`log-${crypto.randomUUID().slice(0, 12)}`, id, tenantId, user?.email);
    });

    await db.batch(logBatch);

    await db.prepare(`
      UPDATE overtime_records
      SET estado = 'APROBADO_RRHH', aprobado_por = ?, fecha_aprobacion = datetime('now'), updatedAt = datetime('now')
      WHERE id IN (${placeholders}) AND company_id = ? AND estado = 'PENDIENTE'
    `).bind(user?.email, ...ids, tenantId).run();

    return c.json({ success: true, message: `${ids.length} records approved by RRHH` });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.put('/overtime/records/batch/aprove-ci', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const ids = body.ids || [];

    if (ids.length === 0) {
      return c.json({ success: false, error: 'No IDs provided' }, 400);
    }

    const placeholders = ids.map(() => '?').join(',');
    const logBatch = ids.map((id: string) => {
      return db.prepare(`
        INSERT INTO overtime_approval_log (id, record_id, company_id, action, performed_by, new_state, createdAt)
        VALUES (?, ?, ?, 'APROBADO_CI', ?, 'APROBADO_CI', datetime('now'))
      `).bind(`log-${crypto.randomUUID().slice(0, 12)}`, id, tenantId, user?.email);
    });

    await db.batch(logBatch);

    await db.prepare(`
      UPDATE overtime_records
      SET estado = 'APROBADO_CI', aprobado_por = ?, fecha_aprobacion = datetime('now'), updatedAt = datetime('now')
      WHERE id IN (${placeholders}) AND company_id = ? AND estado = 'APROBADO_RRHH'
    `).bind(user?.email, ...ids, tenantId).run();

    return c.json({ success: true, message: `${ids.length} records approved by Control Interno` });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 protectedRoutes.put('/overtime/records/batch/reject', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const ids = body.ids || [];
    const comentarios = body.comentarios || '';

    if (ids.length === 0) {
      return c.json({ success: false, error: 'No IDs provided' }, 400);
    }

    const placeholders = ids.map(() => '?').join(',');
    const logBatch = ids.map((id: string) => {
      return db.prepare(`
        INSERT INTO overtime_approval_log (id, record_id, company_id, action, performed_by, comments, new_state, createdAt)
        VALUES (?, ?, ?, 'RECHAZADO', ?, ?, 'RECHAZADO', datetime('now'))
      `).bind(`log-${crypto.randomUUID().slice(0, 12)}`, id, tenantId, user?.email, comentarios);
    });

    await db.batch(logBatch);

    await db.prepare(`
      UPDATE overtime_records
      SET estado = 'RECHAZADO', observaciones = ?, updatedAt = datetime('now')
      WHERE id IN (${placeholders}) AND company_id = ?
    `).bind(comentarios, ...ids, tenantId).run();

    return c.json({ success: true, message: `${ids.length} records rejected` });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 // Alerts
 protectedRoutes.get('/overtime/alerts', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const rulesResult = await db.prepare(
      'SELECT * FROM overtime_rules WHERE company_id = ?'
    ).bind(targetTenant).first();

    const rules = rulesResult || { promedio_referencia: 20, alerta_amarilla: 10, alerta_naranja: 20, alerta_roja: 30, limite_legal: 50 };

    const alertsResult = await db.prepare(`
      SELECT e.areaTrabajo as departamento, SUM(r.horas) as total_horas, COUNT(*) as registros
      FROM overtime_records r
      JOIN employees e ON r.empleado_codigo = e.id
      WHERE r.company_id = ? AND r.estado IN ('PENDIENTE', 'APROBADO_RRHH')
      AND strftime('%Y-%m', r.fecha) = strftime('%Y-%m', 'now')
      GROUP BY e.areaTrabajo
    `).bind(targetTenant).all();

    const alerts: any[] = [];
    const avg = rules.promedio_referencia || 20;

    for (const dept of alertsResult.results || []) {
      const total = dept.total_horas || 0;
      const pct = ((total - avg) / avg * 100).toFixed(1);
      const pctNum = parseFloat(pct);

      if (pctNum >= (rules.alerta_roja || 30)) {
        alerts.push({ tipo: 'ROJO', nivel: 3, departamento: dept.departamento, total_horas: total, registros: dept.registros, porcentaje: pctNum, mensaje: `${dept.departamento} (${total}h) supera ${pctNum}% del promedio` });
      } else if (pctNum >= (rules.alerta_naranja || 20)) {
        alerts.push({ tipo: 'NARANJA', nivel: 2, departamento: dept.departamento, total_horas: total, registros: dept.registros, porcentaje: pctNum, mensaje: `${dept.departamento} (${total}h) supera ${pctNum}% del promedio` });
      } else if (pctNum >= (rules.alerta_amarilla || 10)) {
        alerts.push({ tipo: 'AMARILLO', nivel: 1, departamento: dept.departamento, total_horas: total, registros: dept.registros, porcentaje: pctNum, mensaje: `${dept.departamento} (${total}h) supera ${pctNum}% del promedio` });
      }
    }

    return c.json({ success: true, data: { alerts, promedio: avg, reglas: rules } });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 // Reports Summary
 protectedRoutes.get('/overtime/reports/summary', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const mes = c.req.query('mes') || new Date().toISOString().slice(0, 7);

  try {
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const rulesResult = await db.prepare(
      'SELECT ver_proyectos_en_reporte FROM overtime_rules WHERE company_id = ?'
    ).bind(targetTenant).first();

    const showProjects = rulesResult?.ver_proyectos_en_reporte || false;

    const summaryResult = await db.prepare(`
      SELECT
        COUNT(*) as total_registros,
        SUM(horas) as total_horas,
        SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN estado = 'APROBADO_RRHH' THEN 1 ELSE 0 END) as approved_rrhh,
        SUM(CASE WHEN estado = 'APROBADO_CI' THEN 1 ELSE 0 END) as approved_ci,
        SUM(CASE WHEN estado = 'RECHAZADO' THEN 1 ELSE 0 END) as rejected
      FROM overtime_records
      WHERE company_id = ? AND strftime('%Y-%m', fecha) = ?
    `).bind(targetTenant, mes).first();

    const byDeptResult = await db.prepare(`
      SELECT e.areaTrabajo as departamento, SUM(r.horas) as horas, COUNT(*) as registros
      FROM overtime_records r
      JOIN employees e ON r.empleado_codigo = e.id
      WHERE r.company_id = ? AND strftime('%Y-%m', r.fecha) = ?
      GROUP BY e.areaTrabajo
      ORDER BY horas DESC
    `).bind(targetTenant, mes).all();

    const byTypeResult = await db.prepare(`
      SELECT tipo, SUM(horas) as horas, COUNT(*) as registros
      FROM overtime_records
      WHERE company_id = ? AND strftime('%Y-%m', fecha) = ?
      GROUP BY tipo
      ORDER BY horas DESC
    `).bind(targetTenant, mes).all();

    return c.json({
      success: true,
      data: {
        mes,
        total: summaryResult,
        por_departamento: byDeptResult.results,
        por_tipo: byTypeResult.results,
        mostrar_proyectos: showProjects
      }
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

 // Export to Payroll
 protectedRoutes.post('/overtime/export', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const mes = body.mes || new Date().toISOString().slice(0, 7);

    const result = await db.prepare(`
      SELECT
        r.empleado_codigo,
        r.empleado_dni,
        r.empleado_nombre,
        r.fecha,
        r.horas,
        r.tipo,
        r.motivo,
        r.proyecto_codigo,
        r.estado,
        t.multiplicador,
        (r.horas * COALESCE(t.multiplicador, 1.0)) as horas_con_multiplicador
      FROM overtime_records r
      LEFT JOIN overtime_tipos t ON r.tipo = t.nombre AND t.company_id = r.company_id
      WHERE r.company_id = ? AND r.estado = 'APROBADO_CI' AND strftime('%Y-%m', r.fecha) = ?
      ORDER BY r.empleado_nombre, r.fecha
    `).bind(tenantId, mes).all();

    const csvHeader = 'empleado_codigo,empleado_dni,empleado_nombre,fecha,horas,tipo,motivo,proyecto_codigo,multiplicador,horas_con_multiplicador,estado\n';
    const csvRows = result.results.map((r: any) =>
      `${r.empleado_codigo},${r.empleado_dni || ''},"${r.empleado_nombre || ''}",${r.fecha},${r.horas},${r.tipo},"${r.motivo || ''}",${r.proyecto_codigo || ''},${r.multiplicador || 1},${r.horas_con_multiplicador},${r.estado}`
    ).join('\n');

    return c.text(csvHeader + csvRows, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="horas_extras_${mes}.csv"`,
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
 });

// ============================================
// FASE 3: NÓMINA Y BENEFICIOS
// ============================================

// ========== PRÉSTAMOS ==========
protectedRoutes.get('/payroll/loans', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;
  const status = c.req.query('status');
  const employeeId = c.req.query('employeeId');

  try {
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    let query = `
      SELECT l.*, e.nombreCompleto as empleado_nombre, e.numeroDocumento as empleado_dni
      FROM payroll_loans l
      JOIN employees e ON l.empleado_id = e.id
      WHERE l.company_id = ?
    `;
    const params: any[] = [targetTenant];

    if (status) {
      query += ' AND l.estado = ?';
      params.push(status);
    }
    if (employeeId) {
      query += ' AND l.empleado_id = ?';
      params.push(employeeId);
    }

    query += ' ORDER BY l.createdAt DESC LIMIT 200';

    const result = await db.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/loans', async (c) => {
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const explicitTenant = (user?.role === 'SUPER_ADMIN') ? c.req.header('X-Tenant-ID') : null;
    const targetTenant = explicitTenant || tenantId;

    if (!targetTenant) {
      return c.json({ success: false, error: 'TENANT_REQUIRED' }, 403);
    }

    const id = crypto.randomUUID();
    const cuotaMensual = body.monto_total / (body.cuotas_totales || 12);
    const saldoPendiente = body.monto_total;

    await db.prepare(`
      INSERT INTO payroll_loans (id, company_id, empleado_id, empleado_codigo, empleado_nombre, tipo_prestamo, monto_total, cuota_mensual, cuotas_totales, saldo_pendiente, tasa_interes, fecha_inicio, estado, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO', datetime('now'))
    `).bind(
      id, targetTenant, body.empleado_id, body.empleado_codigo, body.empleado_nombre,
      body.tipo_prestamo, body.monto_total, cuotaMensual, body.cuotas_totales || 12,
      saldoPendiente, body.tasa_interes || 0, body.fecha_inicio
    ).run();

    return c.json({ success: true, id, message: 'Prestamo creado' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.put('/payroll/loans/:id', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  try {
    const body = await c.req.json();

    await db.prepare(`
      UPDATE payroll_loans
      SET tipo_prestamo = ?, monto_total = ?, cuota_mensual = ?, cuotas_totales = ?, saldo_pendiente = ?, estado = ?, updatedAt = datetime('now')
      WHERE id = ? AND company_id = ?
    `).bind(
      body.tipo_prestamo, body.monto_total, body.cuota_mensual, body.cuotas_totales,
      body.saldo_pendiente, body.estado, id, tenantId
    ).run();

    return c.json({ success: true, message: 'Prestamo actualizado' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.delete('/payroll/loans/:id', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  try {
    await db.prepare('UPDATE payroll_loans SET estado = ? WHERE id = ? AND company_id = ?')
      .bind('ANULADO', id, tenantId).run();

    return c.json({ success: true, message: 'Prestamo anulado' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.get('/payroll/loans/:id/cuotas', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const loanId = c.req.param('id');

  try {
    const result = await db.prepare(`
      SELECT * FROM payroll_loan_cuotas
      WHERE loan_id = ? AND company_id = ?
      ORDER BY numero_cuota
    `).bind(loanId, tenantId).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== DESCUENTOS ==========
protectedRoutes.get('/payroll/discounts/employee', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const employeeId = c.req.query('employeeId');

  try {
    let query = `
      SELECT d.*, dt.nombre as tipo_nombre, dt.naturaleza
      FROM payroll_employee_discounts d
      LEFT JOIN payroll_discount_types dt ON d.tipo_descuento_id = dt.id
      WHERE d.company_id = ? AND d.estado = 'ACTIVO'
    `;
    const params: any[] = [tenantId];

    if (employeeId) {
      query += ' AND d.empleado_id = ?';
      params.push(employeeId);
    }

    const result = await db.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/discounts/employee', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');

  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO payroll_employee_discounts (id, company_id, empleado_id, tipo_descuento_id, concepto, monto, porcentaje, aplicar_a, fecha_inicio, fecha_fin, estado, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO', datetime('now'))
    `).bind(
      id, tenantId, body.empleado_id, body.tipo_descuento_id, body.concepto,
      body.monto, body.porcentaje || null, body.aplicar_a, body.fecha_inicio,
      body.fecha_inicio || null, body.estado || 'ACTIVO'
    ).run();

    return c.json({ success: true, id, message: 'Descuento creado' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.delete('/payroll/discounts/employee/:id', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  try {
    await db.prepare('UPDATE payroll_employee_discounts SET estado = ? WHERE id = ? AND company_id = ?')
      .bind('INACTIVO', id, tenantId).run();

    return c.json({ success: true, message: 'Descuento desactivado' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.get('/payroll/discounts/types', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');

  try {
    const result = await db.prepare(
      'SELECT * FROM payroll_discount_types WHERE company_id = ? AND activo = 1 ORDER BY nombre'
    ).bind(tenantId).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/discounts/types', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');

  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO payroll_discount_types (id, company_id, codigo, nombre, naturaleza, porcentaje, orden, activo, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
    `).bind(id, tenantId, body.codigo, body.nombre, body.naturaleza, body.porcentaje || null, body.orden || 0).run();

    return c.json({ success: true, id, message: 'Tipo de descuento creado' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== BOLETAS DE PAGO ==========
protectedRoutes.get('/payroll/payslips', async (c) => {
  const tenantId = c.get('tenantId');
  const period = c.req.query('period');
  const employeeId = c.req.query('employeeId');

  try {
    let query = 'SELECT * FROM payroll_payslips WHERE company_id = ?';
    const params: any[] = [tenantId];

    if (period) {
      query += ' AND periodo = ?';
      params.push(period);
    }
    if (employeeId) {
      query += ' AND empleado_id = ?';
      params.push(employeeId);
    }

    query += ' ORDER BY periodo DESC, empleado_codigo LIMIT 500';

    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/payslips/generate', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');

  try {
    const body = await c.req.json();
    const periodo = body.periodo || new Date().toISOString().slice(0, 7);

    const employees = await db.prepare(`
      SELECT e.id, e.nombreCompleto, e.numeroDocumento, c.salarioBase, c.asignacionFamiliar
      FROM employees e
      JOIN contracts c ON e.id = c.empleadoId
      WHERE e.company_id = ? AND e.estado = 'ACTIVO' AND c.estado = 'VIGENTE'
    `).bind(tenantId).all();

    let generated = 0;
    for (const emp of employees.results || []) {
      const id = crypto.randomUUID();
      const basicSalary = emp.salarioBase || 1500;
      const familyAllowance = emp.asignacionFamiliar || 0;
      const totalIncome = basicSalary + familyAllowance;

      await db.prepare(`
        INSERT OR REPLACE INTO payroll_payslips
        (id, company_id, empleado_id, empleado_codigo, periodo, anio, mes, salario_base, asignacion_familiar, total_ingresos, neto_pagar, estado, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GENERADO', datetime('now'))
      `).bind(
        id, tenantId, emp.id, emp.numeroDocumento, periodo,
        parseInt(periodo.slice(0, 4)),
        parseInt(periodo.slice(5, 7)),
        basicSalary, familyAllowance, totalIncome, totalIncome, 'GENERADO'
      ).run();
      generated++;
    }

    return c.json({ success: true, message: `${generated} boletas generadas`, count: generated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/payslips/export', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const period = c.req.query('period') || new Date().toISOString().slice(0, 7);

  try {
    const result = await db.prepare(`
      SELECT * FROM payroll_payslips
      WHERE company_id = ? AND periodo = ?
      ORDER BY empleado_codigo
    `).bind(tenantId, period).all();

    const header = 'empleado_codigo,dni,periodo,basico,asignacion,ingresos,descuentos,neto,estado\n';
    const rows = result.results.map((r: any) =>
      `${r.empleado_codigo},${r.numeroDocumento || ''},${r.periodo},${r.salario_base},${r.asignacion_familiar},${r.total_ingresos},${r.total_descuentos},${r.neto_pagar},${r.estado}`
    ).join('\n');

    return c.text(header + rows, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="boletas_${period}.csv"`,
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== LIQUIDACIONES ==========
protectedRoutes.get('/payroll/liquidations', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const status = c.req.query('status');

  try {
    let query = 'SELECT * FROM payroll_liquidations WHERE company_id = ?';
    const params: any[] = [tenantId];

    if (status) {
      query += ' AND estado = ?';
      params.push(status);
    }

    query += ' ORDER BY createdAt DESC LIMIT 200';

    const result = await db.prepare(query).bind(...params).all();
    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/liquidations', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');

  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO payroll_liquidations
      (id, company_id, empleado_id, tipo_liquidacion, fecha_ingreso, fecha_liquidacion, dias_trabajados, meses_trabajados, estado, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', datetime('now'))
    `).bind(
      id, tenantId, body.empleado_id, body.tipo_liquidacion, body.fecha_ingreso,
      body.fecha_liquidacion, body.dias_trabajados || 0, body.meses_trabajados || 0
    ).run();

    return c.json({ success: true, id, message: 'Liquidacion creada' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.post('/payroll/liquidations/calculate/:id', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  try {
    const liquidation = await db.prepare(
      'SELECT l.*, c.salarioBase FROM payroll_liquidations l JOIN contracts c ON l.empleado_id = c.empleadoId WHERE l.id = ? AND l.company_id = ?'
    ).bind(id, tenantId).first();

    if (!liquidation) {
      return c.json({ success: false, error: 'Liquidacion no encontrada' }, 404);
    }

    const basicSalary = liquidation.salarioBase || 1500;
    const dailySalary = basicSalary / 30;
    const gratification = (basicSalary / 6);
    const vacationProportion = (basicSalary / 12) * ((liquidation.dias_trabajados || 0) / 360);
    const ctsProportion = (basicSalary / 12) * ((liquidation.dias_trabajados || 0) / 360);
    const totalGross = basicSalary + gratification + vacationProportion + ctsProportion;

    await db.prepare(`
      UPDATE payroll_liquidations
      SET remuneracion_mensual = ?, gratificacion_proporcional = ?, vacaciones_proporcional = ?, cts_proporcional = ?, total_bruto = ?, total_neto = ?, estado = 'CALCULADO', updatedAt = datetime('now')
      WHERE id = ? AND company_id = ?
    `).bind(basicSalary, gratification, vacationProportion, ctsProportion, totalGross, totalGross, id, tenantId).run();

    return c.json({ success: true, message: 'Liquidacion calculada', total_bruto: totalGross });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

protectedRoutes.put('/payroll/liquidations/:id/approve', async (c) => {
  const db = c.env.DB;
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const id = c.req.param('id');

  try {
    await db.prepare(`
      UPDATE payroll_liquidations
      SET estado = 'APROBADO', autorizado_por = ?, fecha_autorizacion = datetime('now'), updatedAt = datetime('now')
      WHERE id = ? AND company_id = ? AND estado = 'CALCULADO'
    `).bind(user?.email, id, tenantId).run();

    return c.json({ success: true, message: 'Liquidacion aprovada' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRIORIDAD 1: CÁLCULOS LEGALES PERUANOS
// ============================================

// Calcular planilla completa con fórmulas peruanas
protectedRoutes.post('/payroll/calculate-peru', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const { empleadoId, periodo, horasExtras = {} } = body;

    // Obtener datos del empleado y contrato
    const empleado = await db.prepare(`
      SELECT e.id, e.nombreCompleto, e.numeroDocumento, c.salarioBase, 
             c.asignacionFamiliar, c.nombreAFP as afpSistema, e.fechaIngreso,
             e.hijos, (c.asignacionFamiliar > 0) as tieneAsignacionFamiliar
      FROM employees e
      JOIN contracts c ON e.id = c.empleadoId
      WHERE e.id = ? AND e.company_id = ? AND c.estado = 'VIGENTE'
    `).bind(empleadoId, tenantId).first();

    if (!empleado) {
      return c.json({ success: false, error: 'EMPLEADO_NOT_FOUND' }, 404);
    }

    // Realizar cálculo completo
    const resultado = calcularPlanillaPeru({
      empleado: {
        id: empleado.id as string,
        salarioBase: empleado.salarioBase as number,
        fechaIngreso: empleado.fechaIngreso as string,
        afpSistema: (empleado.afpSistema as any) || 'HABITAT',
        tieneAsignacionFamiliar: empleado.tieneAsignacionFamiliar as boolean,
        hijos: empleado.hijos as number,
      },
      periodo,
      horasExtras25: horasExtras.horas25 || 0,
      horasExtras35: horasExtras.horas35 || 0,
      horasExtras100: horasExtras.horas100 || 0,
      bonificaciones: horasExtras.bonificaciones || 0,
      comisiones: horasExtras.comisiones || 0,
    });

    return c.json({ success: true, data: resultado });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Calcular CTS
protectedRoutes.post('/calculos/cts', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const { empleadoId, periodo } = body;

    const empleado = await db.prepare(`
      SELECT e.fechaIngreso, c.salarioBase, c.asignacionFamiliar
      FROM employees e
      JOIN contracts c ON e.id = c.empleadoId
      WHERE e.id = ? AND e.company_id = ?
    `).bind(empleadoId, tenantId).first();

    if (!empleado) {
      return c.json({ success: false, error: 'EMPLEADO_NOT_FOUND' }, 404);
    }

    const resultado = calcularCTS(
      empleado.salarioBase as number,
      (empleado.asignacionFamiliar as number) || 0,
      empleado.fechaIngreso as string,
      periodo
    );

    return c.json({ success: true, data: resultado });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Calcular Gratificación
protectedRoutes.post('/calculos/gratificacion', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const { empleadoId, periodo } = body;

    const empleado = await db.prepare(`
      SELECT e.fechaIngreso, c.salarioBase, c.asignacionFamiliar
      FROM employees e
      JOIN contracts c ON e.id = c.empleadoId
      WHERE e.id = ? AND e.company_id = ?
    `).bind(empleadoId, tenantId).first();

    if (!empleado) {
      return c.json({ success: false, error: 'EMPLEADO_NOT_FOUND' }, 404);
    }

    const resultado = calcularGratificacion(
      empleado.salarioBase as number,
      (empleado.asignacionFamiliar as number) || 0,
      empleado.fechaIngreso as string,
      periodo
    );

    return c.json({ success: true, data: resultado });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Calcular Vacaciones
protectedRoutes.post('/calculos/vacaciones', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const { empleadoId } = body;

    const empleado = await db.prepare(`
      SELECT e.fechaIngreso, c.salarioBase
      FROM employees e
      JOIN contracts c ON e.id = c.empleadoId
      WHERE e.id = ? AND e.company_id = ?
    `).bind(empleadoId, tenantId).first();

    if (!empleado) {
      return c.json({ success: false, error: 'EMPLEADO_NOT_FOUND' }, 404);
    }

    const resultado = calcularVacaciones(
      empleado.salarioBase as number,
      empleado.fechaIngreso as string
    );

    return c.json({ success: true, data: resultado });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Calcular Quinta Categoría
protectedRoutes.post('/calculos/quinta-categoria', async (c) => {
  try {
    const body = await c.req.json();
    const { salarioMensual, bonificaciones = 0, mesesRestantes = 12, retencionesAnteriores = 0 } = body;

    const resultado = calcularQuintaCategoria(salarioMensual, bonificaciones, mesesRestantes, retencionesAnteriores);

    return c.json({ success: true, data: resultado });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Obtener tasas AFP
protectedRoutes.get('/calculos/afp-rates', async (c) => {
  return c.json({ success: true, data: AFP_RATES_2024 });
});

// Obtener constantes Perú
protectedRoutes.get('/calculos/constants', async (c) => {
  return c.json({ success: true, data: CONSTANTS_PERU });
});

// Verificar si es mes de CTS
protectedRoutes.get('/calculos/es-mes-cts', async (c) => {
  return c.json({ success: true, data: esMesCTS() });
});

// Verificar si es mes de gratificación
protectedRoutes.get('/calculos/es-mes-gratificacion', async (c) => {
  return c.json({ success: true, data: esMesGratificacion() });
});

// ============================================
// PRIORIDAD 2: MÓDULO DE REPORTES
// ============================================

// Dashboard de métricas
protectedRoutes.get('/reports/dashboard', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;

  try {
    // Empleados activos
    const empleadosResult = await db.prepare(`
      SELECT id, areaTrabajo as departamento, fechaIngreso, estado
      FROM employees
      WHERE company_id = ?
    `).bind(tenantId).all();

    const empleados = empleadosResult.results || [];
    const activos = empleados.filter((e: any) => e.estado === 'ACTIVO');

    // Asistencias del mes actual
    const mesActual = new Date().toISOString().slice(0, 7);
    const asistenciasResult = await db.prepare(`
      SELECT a.*, e.estado
      FROM attendance a
      JOIN employees e ON a.empleadoId = e.id
      WHERE e.company_id = ? AND strftime('%Y-%m', a.fecha) = ?
    `).bind(tenantId, mesActual).all();

    // Salarios
    const salariosResult = await db.prepare(`
      SELECT c.salarioBase as salario
      FROM contracts c
      JOIN employees e ON c.empleadoId = e.id
      WHERE e.company_id = ? AND c.estado = 'VIGENTE'
    `).bind(tenantId).all();

    // Calcular métricas
    const totalEmpleados = activos.length;
    const totalSalarios = (salariosResult.results || []).reduce((sum: number, s: any) => sum + (s.salario || 0), 0);
    
    // Rotación (empleados que se dieron de baja este mes)
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const rotacionResult = await db.prepare(`
      SELECT COUNT(*) as total FROM employees 
      WHERE company_id = ? AND estado = 'INACTIVO' AND fechaCese >= ?
    `).bind(tenantId, inicioMes.toISOString().split('T')[0]).first();

    // Ausentismo
    const asistencias = asistenciasResult.results || [];
    const faltas = asistencias.filter((a: any) => a.estado === 'FALTA').length;
    const ausentismo = asistencias.length > 0 ? (faltas / asistencias.length) * 100 : 0;

    // Distribución por departamento
    const depts: any = {};
    activos.forEach((e: any) => {
      const depto = e.departamento || 'Sin Departamento';
      depts[depto] = (depts[depto] || 0) + 1;
    });

    return c.json({
      success: true,
      data: {
        empleadosActivos: totalEmpleados,
        empleadosNuevosMes: 0,
        empleadosRetiradosMes: (rotacionResult as any)?.total || 0,
        rotacion: totalEmpleados > 0 ? (((rotacionResult as any)?.total || 0) / totalEmpleados) * 100 : 0,
        ausentismo,
        costoTotalMensual: totalSalarios,
        costoPromedioPorEmpleado: totalEmpleados > 0 ? totalSalarios / totalEmpleados : 0,
        distribucionPorDepartamento: Object.entries(depts).map(([dept, total]) => ({
          departamento: dept,
          total,
          porcentaje: totalEmpleados > 0 ? ((total as number) / totalEmpleados) * 100 : 0,
        })),
      }
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reporte PLAME para SUNAT
protectedRoutes.get('/reports/plame', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;
  const periodo = c.req.query('period') || new Date().toISOString().slice(0, 7);

  try {
    // Obtener datos de la empresa
    const empresa = await db.prepare('SELECT * FROM companies WHERE id = ?').bind(tenantId).first();

    // Obtener empleados activos del período
    const empleadosResult = await db.prepare(`
      SELECT e.id, e.numeroDocumento as dni, e.nombres, e.apellidoPaterno, e.apellidoMaterno,
             e.fechaIngreso, c.salarioBase, c.nombreAFP as afpSistema, c.cuspp, c.afp as sistemaPension
      FROM employees e
      JOIN contracts c ON e.id = c.empleadoId
      WHERE e.company_id = ? AND e.estado = 'ACTIVO' AND c.estado = 'VIGENTE'
    `).bind(tenantId).all();

    const reporte = generarPLAME(
      periodo,
      (empresa as any)?.ruc || '20123456789',
      (empresa as any)?.name || 'EMPRESA S.A.C.',
      (empleadosResult.results || []).map((e: any) => ({
        dni: e.dni,
        nombres: e.nombres,
        apellidos: `${e.apellidoPaterno} ${e.apellidoMaterno}`,
        fechaIngreso: e.fechaIngreso,
        sueldoBase: e.salarioBase,
        sistemaPension: e.sistemaPension === 'ONP' ? 'ONP' : 'AFP',
        cuspp: e.cuspp,
        afpSistema: e.afpSistema,
      })),
      {},
      {}
    );

    return c.json({ success: true, data: reporte });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Exportar PLAME a CSV
protectedRoutes.get('/reports/plame/export', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;
  const periodo = c.req.query('period') || new Date().toISOString().slice(0, 7);

  try {
    const empresa = await db.prepare('SELECT * FROM companies WHERE id = ?').bind(tenantId).first();
    const empleadosResult = await db.prepare(`
      SELECT e.id, e.numeroDocumento as dni, e.nombres, e.apellidoPaterno, e.apellidoMaterno,
             e.fechaIngreso, c.salarioBase, c.nombreAFP as afpSistema, c.cuspp, c.afp as sistemaPension
      FROM employees e
      JOIN contracts c ON e.id = c.empleadoId
      WHERE e.company_id = ? AND e.estado = 'ACTIVO' AND c.estado = 'VIGENTE'
    `).bind(tenantId).all();

    const reporte = generarPLAME(
      periodo,
      (empresa as any)?.ruc || '20123456789',
      (empresa as any)?.name || 'EMPRESA S.A.C.',
      (empleadosResult.results || []).map((e: any) => ({
        dni: e.dni,
        nombres: e.nombres,
        apellidos: `${e.apellidoPaterno} ${e.apellidoMaterno}`,
        fechaIngreso: e.fechaIngreso,
        sueldoBase: e.salarioBase,
        sistemaPension: e.sistemaPension === 'ONP' ? 'ONP' : 'AFP',
        cuspp: e.cuspp,
        afpSistema: e.afpSistema,
      })),
      {},
      {}
    );

    const csv = exportarPLAME_CSV(reporte);

    return c.text(csv, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="PLAME_${periodo}.csv"`,
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Reporte de costos por centro de costo/departamento
protectedRoutes.get('/reports/costs', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;

  try {
    const empleadosResult = await db.prepare(`
      SELECT e.areaTrabajo as departamento, c.centroCostos as centroCosto, 
             c.salarioBase, c.asignacionFamiliar
      FROM employees e
      JOIN contracts c ON e.id = c.empleadoId
      WHERE e.company_id = ? AND e.estado = 'ACTIVO' AND c.estado = 'VIGENTE'
    `).bind(tenantId).all();

    const empleados = (empleadosResult.results || []).map((e: any) => ({
      departamento: e.departamento || 'Sin Departamento',
      centroCosto: e.centroCosto || 'Sin Centro de Costo',
      salario: e.salarioBase || 0,
      beneficios: (e.salarioBase * 0.09) + (e.asignacionFamiliar || 0),
    }));

    const periodo = new Date().toISOString().slice(0, 7);
    const reporte = calcularReporteCostos(empleados, periodo);

    return c.json({ success: true, data: reporte });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Tendencias de asistencia
protectedRoutes.get('/reports/attendance-trends', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;
  const meses = parseInt(c.req.query('months') || '6');

  try {
    const result = await db.prepare(`
      SELECT 
        strftime('%Y-%m', fecha) as mes,
        COUNT(*) as total_registros,
        SUM(CASE WHEN estado = 'PUNTUAL' THEN 1 ELSE 0 END) as puntuales,
        SUM(CASE WHEN estado = 'TARDANZA' THEN 1 ELSE 0 END) as tardanzas,
        SUM(CASE WHEN estado = 'FALTA' THEN 1 ELSE 0 END) as faltas
      FROM attendance a
      JOIN employees e ON a.empleadoId = e.id
      WHERE e.company_id = ? 
        AND fecha >= date('now', '-${meses} months')
      GROUP BY strftime('%Y-%m', fecha)
      ORDER BY mes DESC
    `).bind(tenantId).all();

    return c.json({ success: true, data: result.results });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRIORIDAD 3: INTEGRACIONES
// ============================================

// Generar boleta PDF (HTML para conversión)
protectedRoutes.get('/payroll/payslip/:id/pdf', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;
  const payslipId = c.req.param('id');

  try {
    const boleta = await db.prepare(`
      SELECT p.*, e.nombreCompleto, e.numeroDocumento as dni, e.fechaIngreso,
             c.cargo, c.nombreAFP as afpSistema, c.salarioBase, c.asignacionFamiliar,
             emp.ruc as empresaRUC, emp.name as empresaNombre, emp.address as empresaDireccion
      FROM payroll_payslips p
      JOIN employees e ON p.empleado_id = e.id
      JOIN contracts c ON e.id = c.empleadoId
      JOIN companies emp ON p.company_id = emp.id
      WHERE p.id = ? AND p.company_id = ?
    `).bind(payslipId, tenantId).first();

    if (!boleta) {
      return c.json({ success: false, error: 'BOLETA_NOT_FOUND' }, 404);
    }

    const data = boleta as any;
    const html = generarHTMLBoleta({
      empresaRUC: data.empresaRUC || '20123456789',
      empresaNombre: data.empresaNombre || 'EMPRESA S.A.C.',
      empresaDireccion: data.empresaDireccion || 'Lima, Perú',
      empleadoNombre: data.nombreCompleto,
      empleadoDNI: data.dni,
      empleadoCargo: data.cargo || 'Empleado',
      empleadoRegimen: data.afpSistema || 'AFP',
      periodo: data.periodo,
      fechaIngreso: data.fechaIngreso,
      diasTrabajados: 30,
      salarioBase: data.salario_base,
      asignacionFamiliar: data.asignacion_familiar || 0,
      horasExtras25: 0,
      horasExtras35: 0,
      horasExtras100: 0,
      bonificaciones: 0,
      comisiones: 0,
      reintegros: 0,
      totalIngresos: data.total_ingresos,
      aporteObligatorio: data.salario_base * 0.10,
      comisionFlujo: data.salario_base * 0.0147,
      primaSeguro: data.salario_base * 0.0174,
      totalAFP: data.salario_base * 0.1321,
      quintaCategoria: 0,
      adelantos: 0,
      prestamos: 0,
      faltas: 0,
      tardanzas: 0,
      totalDescuentos: data.total_descuentos || (data.salario_base * 0.1321),
      essalud: data.total_ingresos * 0.09,
      netoPagar: data.neto_pagar,
      banco: '',
      cuentaBancaria: '',
      fechaEmision: new Date().toISOString(),
    });

    return c.html(html);
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Generar archivo bancario
protectedRoutes.post('/payroll/export-bank-file', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const { banco, fechaPago, periodo } = body;

    // Obtener datos de la empresa
    const empresa = await db.prepare('SELECT ruc, name FROM companies WHERE id = ?').bind(tenantId).first();

    // Obtener empleados con sus datos bancarios y boletas
    const empleadosResult = await db.prepare(`
      SELECT e.numeroDocumento as dni, e.nombreCompleto as nombre, 
             e.numeroCuenta as cuenta, e.numeroCCI as cci,
             p.neto_pagar as monto
      FROM payroll_payslips p
      JOIN employees e ON p.empleado_id = e.id
      WHERE p.company_id = ? AND p.periodo = ? AND p.estado = 'GENERADO'
    `).bind(tenantId, periodo).all();

    const empleados = (empleadosResult.results || []).map((e: any) => ({
      dni: e.dni,
      nombre: e.nombre,
      cuentaAbono: e.cuenta || '',
      cci: e.cci || '',
      monto: e.monto || 0,
    }));

    const archivo = generarArchivoBancario(
      banco,
      (empresa as any)?.ruc || '20123456789',
      (empresa as any)?.name || 'EMPRESA S.A.C.',
      '000-0000000-0-00',
      fechaPago,
      empleados
    );

    return c.text(archivo, 200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="pago_${banco}_${periodo}.txt"`,
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Enviar boleta por email
protectedRoutes.post('/payroll/payslip/:id/send-email', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;
  const payslipId = c.req.param('id');

  try {
    const boleta = await db.prepare(`
      SELECT p.*, e.nombreCompleto, e.email, e.emailCorporativo,
             emp.name as empresaNombre
      FROM payroll_payslips p
      JOIN employees e ON p.empleado_id = e.id
      JOIN companies emp ON p.company_id = emp.id
      WHERE p.id = ? AND p.company_id = ?
    `).bind(payslipId, tenantId).first();

    if (!boleta) {
      return c.json({ success: false, error: 'BOLETA_NOT_FOUND' }, 404);
    }

    const data = boleta as any;
    const emailDestino = data.emailCorporativo || data.email;

    if (!emailDestino) {
      return c.json({ success: false, error: 'EMPLEADO_SIN_EMAIL' }, 400);
    }

    // Generar HTML simplificado para el email
    const htmlSimplificado = generarHTMLBoletaSimplificada({
      empresaRUC: '',
      empresaNombre: data.empresaNombre || 'EMPRESA S.A.C.',
      empresaDireccion: '',
      empleadoNombre: data.nombreCompleto,
      empleadoDNI: '',
      empleadoCargo: '',
      empleadoRegimen: '',
      periodo: data.periodo,
      fechaIngreso: '',
      diasTrabajados: 30,
      salarioBase: data.salario_base,
      asignacionFamiliar: data.asignacion_familiar || 0,
      horasExtras25: 0,
      horasExtras35: 0,
      horasExtras100: 0,
      bonificaciones: 0,
      comisiones: 0,
      reintegros: 0,
      totalIngresos: data.total_ingresos,
      aporteObligatorio: 0,
      comisionFlujo: 0,
      primaSeguro: 0,
      totalAFP: data.total_descuentos || 0,
      quintaCategoria: 0,
      adelantos: 0,
      prestamos: 0,
      faltas: 0,
      tardanzas: 0,
      totalDescuentos: data.total_descuentos || 0,
      essalud: 0,
      netoPagar: data.neto_pagar,
      banco: '',
      cuentaBancaria: '',
      fechaEmision: new Date().toISOString(),
    });

    // Enviar email (simulado - en producción usar Resend o Cloudflare Email)
    // const resultado = await enviarBoletaPorEmail({...});

    return c.json({
      success: true,
      message: 'Boleta preparada para envío',
      emailDestino,
      preview: htmlSimplificado.slice(0, 500) + '...',
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRIORIDAD 4: UX PERÚ-SPECIFIC
// ============================================

// Obtener feriados peruanos
protectedRoutes.get('/peru/feriados', async (c) => {
  const año = parseInt(c.req.query('year') || new Date().getFullYear().toString());
  const feriados = getFeriadosPeru(año);
  return c.json({ success: true, data: feriados });
});

// Validar DNI peruano
protectedRoutes.post('/peru/validar-dni', async (c) => {
  try {
    const body = await c.req.json();
    const { dni } = body;
    const valido = validarDNI(dni);
    return c.json({ success: true, valido, dni });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Validar RUC peruano
protectedRoutes.post('/peru/validar-ruc', async (c) => {
  try {
    const body = await c.req.json();
    const { ruc } = body;
    const valido = validarRUC(ruc);
    return c.json({ success: true, valido, ruc });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Obtener plantillas de contratos según ley peruana
protectedRoutes.get('/peru/contratos/templates', async (c) => {
  const templates = [
    {
      id: 'indefinido',
      nombre: 'Contrato Indeterminado - Ley 728',
      descripcion: 'Contrato a plazo indeterminado según Decreto Legislativo 728',
      regimen: 'GENERAL',
    },
    {
      id: 'plazo_fijo',
      nombre: 'Contrato a Plazo Fijo - Ley 728',
      descripcion: 'Contrato temporal por servicio específico o incremento actividad',
      regimen: 'GENERAL',
      maxDuracion: '5 años acumulado',
    },
    {
      id: 'cas',
      nombre: 'Contrato Administrativo de Servicios (CAS)',
      descripcion: 'Régimen especial del Decreto Legislativo 1057',
      regimen: 'CAS',
    },
    {
      id: 'locacion',
      nombre: 'Contrato de Locación de Servicios',
      descripcion: 'Para servicios específicos no laborales',
      regimen: 'LOCACION',
    },
    {
      id: 'practicas',
      nombre: 'Convenio de Prácticas Profesionales',
      descripcion: 'Según Ley 28518 y Decreto Supremo 007-2005-TR',
      regimen: 'PRACTICAS',
    },
    {
      id: 'microempresa',
      nombre: 'Contrato - Microempresa',
      descripcion: 'Régimen laboral especial para microempresas (Ley 30056)',
      regimen: 'MICROEMPRESA',
    },
    {
      id: 'pequena_empresa',
      nombre: 'Contrato - Pequeña Empresa',
      descripcion: 'Régimen laboral especial para pequeñas empresas (Ley 30056)',
      regimen: 'PEQUENA_EMPRESA',
    },
  ];

  return c.json({ success: true, data: templates });
});

// Mount Protected Routes
app.route('/api/v1', protectedRoutes);

export default app;
