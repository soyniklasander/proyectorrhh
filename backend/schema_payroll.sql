-- Schema RRHHMod - Payroll Module
-- Generated for D1 Database

-- ============================================
-- PAYROLL CONCEPTS (Benefits and Deductions)
-- ============================================
CREATE TABLE IF NOT EXISTS payroll_concepts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('BENEFICIO', 'DESCUENTO')),
  description TEXT,
  amount REAL DEFAULT 0,
  amountType TEXT DEFAULT 'FIJO' CHECK(amountType IN ('FIJO', 'PORCENTAJE')),
  frequency TEXT DEFAULT 'MENSUAL' CHECK(frequency IN ('MENSUAL', 'QUINCENAL', 'SEMANAL', 'UNICA')),
  active INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT,
  UNIQUE(company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_payroll_concepts_company ON payroll_concepts(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_concepts_type ON payroll_concepts(type);

-- ============================================
-- EMPLOYEE CONCEPTS (Assignments)
-- ============================================
CREATE TABLE IF NOT EXISTS payroll_employee_concepts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  empleadoId TEXT NOT NULL,
  conceptoId TEXT NOT NULL,
  monto REAL,
  fechaInicio TEXT,
  fechaFin TEXT,
  observation TEXT,
  active INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_employee_concepts_company ON payroll_employee_concepts(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_concepts_employee ON payroll_employee_concepts(empleadoId);
CREATE INDEX IF NOT EXISTS idx_employee_concepts_concept ON payroll_employee_concepts(conceptoId);

-- ============================================
-- ENHANCED PAYROLL TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS payroll (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  empleadoId TEXT NOT NULL,
  contratoId TEXT NOT NULL,
  periodo TEXT NOT NULL,
  salarioBase REAL DEFAULT 0,
  asignacionFamiliar REAL DEFAULT 0,
  horasExtras REAL DEFAULT 0,
  horasExtrasCount INTEGER DEFAULT 0,
  bonificaciones REAL DEFAULT 0,
  comisiones REAL DEFAULT 0,
  totalIngresos REAL DEFAULT 0,
  afp REAL DEFAULT 0,
  afpName TEXT,
  adelantos REAL DEFAULT 0,
  prestamos REAL DEFAULT 0,
  otrosDescuentos REAL DEFAULT 0,
  totalDescuentos REAL DEFAULT 0,
  essalud REAL DEFAULT 0,
  senati REAL DEFAULT 0,
  totalAportaciones REAL DEFAULT 0,
  netoPagar REAL DEFAULT 0,
  estado TEXT DEFAULT 'GENERADO' CHECK(estado IN ('GENERADO', 'PENDIENTE', 'CERRADA', 'PAGADA')),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT,
  UNIQUE(company_id, empleadoId, periodo)
);

CREATE INDEX IF NOT EXISTS idx_payroll_company ON payroll(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll(periodo);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(empleadoId);

-- ============================================
-- SEED SAMPLE CONCEPTS
-- ============================================
INSERT OR IGNORE INTO payroll_concepts (id, company_id, code, name, type, description, amount, amountType, frequency)
VALUES
  ('concept-001', 'comp-default', 'BONO-ALIMENT', 'Bono de Alimentación', 'BENEFICIO', 'Bono mensual de alimentación', 200, 'FIJO', 'MENSUAL'),
  ('concept-002', 'comp-default', 'BONO-TRANS', 'Bono de Transporte', 'BENEFICIO', 'Bono mensual de transporte', 150, 'FIJO', 'MENSUAL'),
  ('concept-003', 'comp-default', 'BONO-PERF', 'Bono por Desempeño', 'BENEFICIO', 'Bono trimestral por cumplimiento de metas', 300, 'FIJO', 'TRIMESTRAL'),
  ('concept-004', 'comp-default', 'SEG-MED', 'Seguro Médico', 'BENEFICIO', 'Cobertura de seguro médico', 100, 'FIJO', 'MENSUAL'),
  ('concept-005', 'comp-default', 'AFP-ONP', 'Sistema de Pensiones', 'DESCUENTO', 'Aportación al sistema de pensiones', 13, 'PORCENTAJE', 'MENSUAL'),
  ('concept-006', 'comp-default', 'ADV-SAL', 'Adelanto de Sueldo', 'DESCUENTO', 'Adelanto de sueldo solicitado', 0, 'FIJO', 'UNICA'),
  ('concept-007', 'comp-default', 'PREST-AM', 'Préstamo Amortización', 'DESCUENTO', 'Amortización de préstamo', 150, 'FIJO', 'MENSUAL'),
  ('concept-008', 'comp-default', 'FALT-DISC', 'Descuento por Faltas', 'DESCUENTO', 'Descuento por inasistencias', 0, 'FIJO', 'MENSUAL');
