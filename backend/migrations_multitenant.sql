-- ============================================
-- MIGRACIÓN MULTI-TENANT & RBAC
-- ============================================

-- 1. Crear tabla de Empresas (Tenants)
CREATE TABLE IF NOT EXISTS "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruc" TEXT NOT NULL UNIQUE,
    "razon_social" TEXT NOT NULL,
    "direccion_fiscal" TEXT NOT NULL, -- JSON
    "representante_legal_nombre" TEXT NOT NULL,
    "representante_legal_dni" TEXT NOT NULL,
    "config" TEXT, -- JSON para logo, firma, etc.
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla de Usuarios con Roles
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT, -- NULL para Super Admin
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "role" TEXT NOT NULL, -- 'SUPER_ADMIN', 'TENANT_ADMIN', 'OPERATOR'
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "last_login" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE CASCADE
);

-- 3. Modificar tablas existentes para agregar company_id
-- Nota: En SQLite/D1 agregar FK en ALTER TABLE es limitado, pero agregamos la columna.
-- La validación estricta se hará vía Middleware y App Logic, y FK si D1 lo permite en el futuro rebuild.

-- Employees
ALTER TABLE "employees" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_employees_company" ON "employees"("company_id", "id");

-- Contracts
ALTER TABLE "contracts" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_contracts_company" ON "contracts"("company_id", "id");

-- Attendance Control
ALTER TABLE "attendance_control" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_attendance_company" ON "attendance_control"("company_id", "id");

-- Employee Loans
ALTER TABLE "employee_loans" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_loans_company" ON "employee_loans"("company_id", "id");

-- Overtime Hours
ALTER TABLE "overtime_hours" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_overtime_company" ON "overtime_hours"("company_id", "id");

-- Deductions
ALTER TABLE "deductions" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_deductions_company" ON "deductions"("company_id", "id");

-- Payroll
ALTER TABLE "payroll" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_payroll_company" ON "payroll"("company_id", "id");

-- Leaves Permissions
ALTER TABLE "leaves_permissions" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_leaves_company" ON "leaves_permissions"("company_id", "id");

-- Withholdings
ALTER TABLE "withholdings" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_withholdings_company" ON "withholdings"("company_id", "id");

-- Contract Templates (Optional: si cada empresa tiene sus plantillas, o hay globales)
-- Por ahora asumimos plantillas globales (company_id NULL) o privadas.
ALTER TABLE "contract_templates" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_templates_company" ON "contract_templates"("company_id", "id");

-- Custom Templates
ALTER TABLE "custom_templates" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_custom_templates_company" ON "custom_templates"("company_id", "id");

-- Loan Installments
ALTER TABLE "loan_installments" ADD COLUMN "company_id" TEXT;
CREATE INDEX "idx_loan_installments_company" ON "loan_installments"("company_id", "id");
