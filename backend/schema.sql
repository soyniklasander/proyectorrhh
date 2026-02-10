-- Schema para RRHHMod - Cloudflare D1 Database
-- Actualizado para coincidir con drizzle-orm schema.ts

-- Tabla de tenants (empresas/clientes)
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    subscription_plan TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Tabla de usuarios (para autenticación)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'TENANT_ADMIN', 'EMPLOYEE')),
    tenant_id TEXT REFERENCES tenants(id),
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Tabla de entidades legales (ruc)
CREATE TABLE IF NOT EXISTS legal_entities (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    ruc TEXT NOT NULL,
    business_name TEXT NOT NULL,
    regime TEXT NOT NULL CHECK(regime IN ('GENERAL_728', 'MYPE_PEQUENA')),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Tabla de venues/sedes
CREATE TABLE IF NOT EXISTS venues (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    cost_center_code TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    current_venue_id TEXT REFERENCES venues(id),
    full_name TEXT NOT NULL,
    dni TEXT NOT NULL,
    basic_salary INTEGER NOT NULL,
    has_children INTEGER NOT NULL DEFAULT 0 CHECK(has_children IN (0, 1)),
    pension_system TEXT NOT NULL CHECK(pension_system IN ('AFP_INTEGRA', 'ONP')),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Tabla de logic_matrix (asignación de turnos a entidades)
CREATE TABLE IF NOT EXISTS logic_matrix (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES tenants(id),
    venue_id TEXT NOT NULL REFERENCES venues(id),
    shift TEXT NOT NULL CHECK(shift IN ('MORNING', 'NIGHT')),
    target_legal_entity_id TEXT NOT NULL REFERENCES legal_entities(id),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_legal_entities_tenant ON legal_entities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_venues_tenant ON venues(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_venue ON employees(current_venue_id);
CREATE INDEX IF NOT EXISTS idx_logic_matrix_tenant ON logic_matrix(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logic_matrix_venue ON logic_matrix(venue_id);
CREATE INDEX IF NOT EXISTS idx_logic_matrix_target ON logic_matrix(target_legal_entity_id);

-- Seed data inicial (tenant de prueba)
INSERT INTO tenants (id, name, status, subscription_plan) 
VALUES ('tenant_default', 'Empresa Demo', 'ACTIVE', 'FREE');

-- Usuario demo (password: demo123)
INSERT INTO users (id, email, password_hash, role, tenant_id) 
VALUES (
    'user_demo',
    'demo@rrhhmod.com',
    '$2a$10$X7/H6Gq5Q5Q5Q5Q5Q5Q5QOXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'TENANT_ADMIN',
    'tenant_default'
);

-- Entidad legal demo
INSERT INTO legal_entities (id, tenant_id, ruc, business_name, regime) 
VALUES ('legal_default', 'tenant_default', '20123456789', 'Empresa Demo S.A.C.', 'GENERAL_728');

-- Venue demo
INSERT INTO venues (id, tenant_id, name, cost_center_code) 
VALUES ('venue_default', 'tenant_default', 'Sede Principal', 'CC001');

-- Empleado demo
INSERT INTO employees (id, tenant_id, current_venue_id, full_name, dni, basic_salary, has_children, pension_system) 
VALUES (
    'emp_demo',
    'tenant_default',
    'venue_default',
    'Juan Pérez García',
    '12345678',
    1500,
    0,
    'AFP_INTEGRA'
);
