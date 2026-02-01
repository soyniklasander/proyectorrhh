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

// Seed Endpoint (Public but secured with secret)
app.post('/api/v1/system/seed', async (c) => {
  const secret = c.req.query('secret');
  if (secret !== 'setup_demo') {
    return c.json({ success: false, error: 'UNAUTHORIZED' }, 401);
  }

  try {
    const statements = [
      `INSERT INTO companies (id, ruc, razon_social, direccion_fiscal, representante_legal_nombre, representante_legal_dni, config) VALUES
      ('comp-a', '20100000001', 'RickCorp S.A.C.', '{"direccion": "Av. Siempreviva 123", "distrito": "Miraflores", "provincia": "Lima", "departamento": "Lima"}', 'Rick Sanchez', '08765432', '{"logo": "https://example.com/rick.png"}'),
      ('comp-b', '20200000002', 'Morty Imports S.R.L.', '{"direccion": "Jr. Citadel 456", "distrito": "San Isidro", "provincia": "Lima", "departamento": "Lima"}', 'Morty Smith', '12345678', '{"logo": "https://example.com/morty.png"}')
      ON CONFLICT(id) DO UPDATE SET razon_social=excluded.razon_social;`,

      `INSERT INTO users (id, company_id, email, password_hash, nombres, role) VALUES
      ('user-super', NULL, 'super@rickerp.com', '$2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi', 'Super Admin', 'SUPER_ADMIN'),
      ('user-admin-a', 'comp-a', 'admin@rickcorp.com', '$2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi', 'Rick Admin', 'TENANT_ADMIN'),
      ('user-hr-a', 'comp-a', 'hr@rickcorp.com', '$2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi', 'Birdperson HR', 'OPERATOR'),
      ('user-admin-b', 'comp-b', 'admin@morty.com', '$2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi', 'Morty Admin', 'TENANT_ADMIN')
      ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash;`,

      `INSERT INTO employees (id, company_id, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto, tipoDocumento, numeroDocumento, fechaNacimiento, estado, fechaIngreso, email) VALUES
      ('emp-a-1', 'comp-a', 'Summer', 'Smith', 'Sanchez', 'Summer Smith Sanchez', 'DNI', '44444444', '1998-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'summer@rickcorp.com'),
      ('emp-a-2', 'comp-a', 'Beth', 'Smith', 'Sanchez', 'Beth Smith Sanchez', 'DNI', '44444445', '1985-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'beth@rickcorp.com'),
      ('emp-a-3', 'comp-a', 'Bird', 'Person', 'Phoenix', 'Bird Person', 'CE', '00000001', '1980-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'bp@rickcorp.com'),
      ('emp-a-4', 'comp-a', 'Squanchy', 'Cat', 'Alien', 'Squanchy Cat', 'DNI', '44444446', '1990-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'squanchy@rickcorp.com'),
      ('emp-a-5', 'comp-a', 'Mr.', 'Poopybutthole', 'Oowee', 'Mr. Poopybutthole', 'DNI', '44444447', '1995-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'poopy@rickcorp.com'),
      ('emp-b-1', 'comp-b', 'Jerry', 'Smith', 'Doe', 'Jerry Smith Doe', 'DNI', '55555555', '1980-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'jerry@morty.com'),
      ('emp-b-2', 'comp-b', 'Jessica', 'W.', 'Redhead', 'Jessica W.', 'DNI', '55555556', '1998-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'jessica@morty.com'),
      ('emp-b-3', 'comp-b', 'Brad', 'Kickoff', 'Jock', 'Brad Kickoff', 'DNI', '55555557', '1998-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'brad@morty.com'),
      ('emp-b-4', 'comp-b', 'Ethan', 'Ex', 'Boyfriend', 'Ethan Ex', 'DNI', '55555558', '1998-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'ethan@morty.com'),
      ('emp-b-5', 'comp-b', 'Tammy', 'Gueterman', 'Spy', 'Tammy Gueterman', 'DNI', '55555559', '1995-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'tammy@morty.com')
      ON CONFLICT(id) DO NOTHING;`,

      `INSERT INTO contracts (id, company_id, empleadoId, tipoContrato, regimenLaboral, cargo, salarioBase, fechaInicio, estado) VALUES
      ('cont-a-1', 'comp-a', 'emp-a-1', 'PLAZO_FIJO', 'GENERAL', 'Asistente de Laboratorio', 2500.00, '2023-01-01T00:00:00Z', 'VIGENTE'),
      ('cont-a-2', 'comp-a', 'emp-a-2', 'INDETERMINADO', 'GENERAL', 'Veterinaria de Caballos', 5000.00, '2023-01-01T00:00:00Z', 'VIGENTE'),
      ('cont-b-1', 'comp-b', 'emp-b-1', 'INDETERMINADO', 'GENERAL', 'Gerente de Nada', 1025.00, '2023-02-01T00:00:00Z', 'VIGENTE')
      ON CONFLICT(id) DO NOTHING;`
    ];

    const batch = statements.map(sql => c.env.DB.prepare(sql));
    await c.env.DB.batch(batch);

    return c.json({ success: true, message: 'Seed data executed successfully' });
  } catch (error) {
    return c.json({ success: false, error: 'DB_ERROR', message: String(error) }, 500);
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
  const result = await c.env.DB.prepare(
    'SELECT * FROM employees WHERE company_id = ? ORDER BY createdAt DESC'
  ).bind(tenantId).all();

  return c.json({ success: true, data: result.results });
});

// Mount Protected Routes
app.route('/api/v1', protectedRoutes);

export default app;
