import { createMiddleware } from 'hono/factory';
import { Env, Variables } from '../types';

export const tenantMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
  const path = c.req.path || "";
  const user = c.get('user');
  
  // Public paths exclusion
  if (
    path.includes('/auth/login') || 
    path.includes('/health') ||
    path.startsWith('/api/v1/admin/')
  ) {
    await next();
    return;
  }

  if (!user) {
    return c.json({ success: false, error: 'UNAUTHORIZED', message: 'User context not found' }, 401);
  }

  // Super Admin can specify tenant via X-Tenant-ID header
  if (user.role === 'SUPER_ADMIN') {
    const explicitTenantId = c.req.header('X-Tenant-ID');
    if (explicitTenantId) {
      c.set('tenantId', explicitTenantId);
      await next();
      return;
    }
    // Super Admin without X-Tenant-ID on non-admin routes needs tenant
    if (user.companyId) {
      c.set('tenantId', user.companyId);
      await next();
      return;
    }
    // Super Admin without tenant trying to access tenant routes
    // Allow access - the endpoint will handle the response
    await next();
    return;
  }

  // Regular users need tenant
  const tenantId = user.companyId;
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
