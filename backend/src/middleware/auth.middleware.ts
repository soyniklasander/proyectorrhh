import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { Env, Variables } from '../types';

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
  // Public paths exclusion
  const path = c.req.path;
  if (path.includes('/auth/login') || path.includes('/health')) {
    await next();
    return;
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');

    // Validate payload structure
    if (!payload.userId || !payload.role) { // companyId might be null for SUPER_ADMIN
       throw new Error('Invalid token payload');
    }

    c.set('user', {
      userId: payload.userId as string,
      companyId: (payload.companyId as string) || null,
      role: payload.role as 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OPERATOR'
    });

    await next();
  } catch (error) {
    return c.json({ success: false, error: 'UNAUTHORIZED', message: 'Invalid or expired token' }, 401);
  }
});
