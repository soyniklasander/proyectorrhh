-- Schema RRHHMod - Overtime Management v2.0
-- Generated for D1 Database

-- ============================================
-- OVERTIME RULES CONFIGURATION
-- ============================================
CREATE TABLE IF NOT EXISTS overtime_rules (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  promedio_referencia REAL DEFAULT 20,
  alerta_amarilla REAL DEFAULT 10,
  alerta_naranja REAL DEFAULT 20,
  alerta_roja REAL DEFAULT 30,
  limite_legal REAL DEFAULT 50,
  requiere_aprobacion_ci BOOLEAN DEFAULT TRUE,
  ver_proyectos_en_reporte BOOLEAN DEFAULT FALSE,
  creado_por TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT,
  UNIQUE(company_id)
);

-- ============================================
-- OVERTIME TYPES (Configurables)
-- ============================================
CREATE TABLE IF NOT EXISTS overtime_tipos (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  multiplicador REAL DEFAULT 1.0,
  activo BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT,
  UNIQUE(company_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_overtime_tipos_company ON overtime_tipos(company_id);

-- ============================================
-- PROJECTS (Optional for Cost Allocation)
-- ============================================
CREATE TABLE IF NOT EXISTS overtime_projects (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  createdAt TEXT DEFAULT (datetime('now')),
  UNIQUE(company_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_overtime_projects_company ON overtime_projects(company_id);
CREATE INDEX IF NOT EXISTS idx_overtime_projects_codigo ON overtime_projects(codigo);

-- ============================================
-- OVERTIME IMPORTS (Excel Uploads)
-- ============================================
CREATE TABLE IF NOT EXISTS overtime_imports (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  status TEXT DEFAULT 'PENDIENTE' CHECK(status IN ('PENDIENTE', 'REVISION', 'PROCESADO', 'RECHAZADO')),
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  errors TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_overtime_imports_company ON overtime_imports(company_id);

-- ============================================
-- OVERTIME RECORDS (Detailed Records)
-- ============================================
CREATE TABLE IF NOT EXISTS overtime_records (
  id TEXT PRIMARY KEY,
  import_id TEXT,
  company_id TEXT NOT NULL,
  empleado_codigo TEXT NOT NULL,
  empleado_dni TEXT,
  empleado_nombre TEXT NOT NULL,
  fecha TEXT NOT NULL,
  horas REAL NOT NULL,
  tipo TEXT NOT NULL,
  motivo TEXT,
  proyecto_codigo TEXT,
  proyecto_nombre TEXT,
  estado TEXT DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'APROBADO_RRHH', 'APROBADO_CI', 'RECHAZADO')),
  aprobado_por TEXT,
  fecha_aprobacion TEXT,
  observaciones TEXT,
  sync_with_sensor BOOLEAN DEFAULT FALSE,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_overtime_records_company ON overtime_records(company_id);
CREATE INDEX IF NOT EXISTS idx_overtime_records_empleado ON overtime_records(empleado_codigo);
CREATE INDEX IF NOT EXISTS idx_overtime_records_fecha ON overtime_records(fecha);
CREATE INDEX IF NOT EXISTS idx_overtime_records_estado ON overtime_records(estado);
CREATE INDEX IF NOT EXISTS idx_overtime_records_import ON overtime_records(import_id);

-- ============================================
-- OVERTIME APPROVAL LOG (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS overtime_approval_log (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('CREADO', 'EDITADO', 'APROBADO_RRHH', 'APROBADO_CI', 'RECHAZADO', 'RECHAZADO_CI')),
  performed_by TEXT NOT NULL,
  comments TEXT,
  previous_state TEXT,
  new_state TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_overtime_log_record ON overtime_approval_log(record_id);

-- ============================================
-- SEED DEFAULT OVERTIME TYPES
-- ============================================
INSERT OR IGNORE INTO overtime_tipos (id, company_id, nombre, multiplicador, orden)
VALUES
  ('ott-001', 'comp-default', 'ORDINARIA', 1.25, 1),
  ('ott-002', 'comp-default', 'NOCTURNA', 1.50, 2),
  ('ott-003', 'comp-default', 'FERIADOS', 2.00, 3),
  ('ott-004', 'comp-default', 'DOMINGOS', 1.50, 4);

-- ============================================
-- SEED DEFAULT RULES
-- ============================================
INSERT OR IGNORE INTO overtime_rules (id, company_id, promedio_referencia, limite_legal, ver_proyectos_en_reporte)
VALUES
  ('otr-001', 'comp-default', 20, 50, FALSE);
