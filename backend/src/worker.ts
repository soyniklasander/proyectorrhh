import { Hono } from 'hono';
import { cors } from 'hono/cors';
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
