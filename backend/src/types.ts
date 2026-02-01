import { Context } from 'hono';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ENVIRONMENT: string;
}

export interface Variables {
  tenantId: string;
  user: {
    userId: string;
    companyId: string | null;
    role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OPERATOR';
  };
}

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;
