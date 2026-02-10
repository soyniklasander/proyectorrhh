-- Schema básico para RRHHMod - Nuevo inicio
-- Cloudflare D1 Database

-- Tabla de usuarios (para autenticación)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'TENANT_ADMIN',
    company_id TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- Tabla de empresas/tenants
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    razonSocial TEXT NOT NULL,
    ruc TEXT UNIQUE NOT NULL,
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    plan TEXT DEFAULT 'FREE',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
);

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    numeroDocumento TEXT NOT NULL,
    tipoDocumento TEXT DEFAULT 'DNI',
    nombreCompleto TEXT NOT NULL,
    email TEXT,
    celular TEXT,
    cargo TEXT,
    area TEXT,
    fechaIngreso TEXT NOT NULL,
    fechaCese TEXT,
    estado TEXT DEFAULT 'ACTIVO',
    modalidad TEXT DEFAULT 'PRESENCIAL',
    regimenLaboral TEXT DEFAULT 'GENERAL',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Tabla de contratos
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    empleadoId TEXT NOT NULL,
    tipoContrato TEXT NOT NULL,
    regimenLaboral TEXT DEFAULT 'GENERAL',
    cargo TEXT NOT NULL,
    salarioBase REAL NOT NULL,
    fechaInicio TEXT NOT NULL,
    fechaFin TEXT,
    estado TEXT DEFAULT 'VIGENTE',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (empleadoId) REFERENCES employees(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_company ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_empleado ON contracts(empleadoId);
