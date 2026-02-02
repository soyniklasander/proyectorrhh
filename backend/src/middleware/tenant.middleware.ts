import { createMiddleware } from 'hono/factory';
import { Env, Variables } from '../types';

export const tenantMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
  // Public paths exclusion
  const path = c.req.path || "";
  // Check specifically for admin routes to bypass tenant check for Super Admin
  if (path.includes('/auth/login') || path.includes('/health') || path.startsWith('/api/v1/admin/')) {
    await next();
    return;
  }

  const user = c.get('user');

  if (!user) {
    return c.json({ success: false, error: 'UNAUTHORIZED', message: 'User context not found' }, 401);
  }

  let tenantId = user.companyId;

  // Case for SUPER_ADMIN trying to access tenant resources
  if (user.role === 'SUPER_ADMIN') {
    // Allow SUPER_ADMIN to explicitly specify tenant via header (for debugging/admin dashboards)
    const explicitTenantId = c.req.header('X-Tenant-ID');
    if (explicitTenantId) {
      tenantId = explicitTenantId;
    } else {
      // If no tenant specified, SUPER_ADMIN cannot access tenant-isolated resources
      // Depending on the route, this might be valid (e.g. creating a company),
      // but for "Tenant Isolation" strictness on data routes, we might block or leave it null/undefined
      // and let the service fail if it expects a tenantId.
      // However, the directive says: "Inyecta el company_id en el contexto".
      // If we are here, we probably expect a tenant.
    }
  }

  if (!tenantId) {
    return c.json({
      success: false,
      error: 'TENANT_REQUIRED',
      message: 'Tenant context is required for this operation'
    }, 403);
  }

  c.set('tenantId', tenantId);
  await next();
});
