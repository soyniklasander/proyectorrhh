-- ============================================
-- RRHHMod ERP - Complete Schema
-- Fases 3-6: Nómina, Legal, Admin, Fiscal
-- ============================================

-- ============================================
-- FASE 3: NÓMINA Y BENEFICIOS
-- ============================================

-- Préstamos
CREATE TABLE IF NOT EXISTS payroll_loans (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  empleado_id TEXT NOT NULL,
  empleado_codigo TEXT NOT NULL,
  empleado_nombre TEXT NOT NULL,
  tipo_prestamo TEXT NOT NULL,
  monto_total REAL NOT NULL,
  cuota_mensual REAL NOT NULL,
  cuotas_totales INTEGER DEFAULT 12,
  cuotas_pagadas INTEGER DEFAULT 0,
  saldo_pendiente REAL NOT NULL,
  tasa_interes REAL DEFAULT 0,
  interes_total REAL DEFAULT 0,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT,
  estado TEXT DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'PAGADO', 'ANULADO')),
  observacion TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- Cuotas de préstamos
CREATE TABLE IF NOT EXISTS payroll_loan_cuotas (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  numero_cuota INTEGER NOT NULL,
  fecha_vencimiento TEXT NOT NULL,
  fecha_pago TEXT,
  monto_cuota REAL NOT NULL,
  interes REAL DEFAULT 0,
  capital REAL NOT NULL,
  saldo_restante REAL NOT NULL,
  estado TEXT DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA')),
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Descuentos por empleado
CREATE TABLE IF NOT EXISTS payroll_employee_discounts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  empleado_id TEXT NOT NULL,
  tipo_descuento_id TEXT NOT NULL,
  concepto TEXT NOT NULL,
  monto REAL NOT NULL,
  porcentaje REAL,
  aplicar_a TEXT NOT NULL,  -- SUELDO_NETO, SUELDO_BRUTO
  periodo_deduccion TEXT,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT,
  estado TEXT DEFAULT 'ACTIVO',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- Tipos de descuento
CREATE TABLE IF NOT EXISTS payroll_discount_types (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  naturaleza TEXT NOT NULL,  -- JUDICIAL, VOLUNTARIO, LEGAL
  porcentaje REAL,
  afecto_gratificacion BOOLEAN DEFAULT FALSE,
  afecto_cts BOOLEAN DEFAULT FALSE,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Boletas de pago
CREATE TABLE IF NOT EXISTS payroll_payslips (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  empleado_id TEXT NOT NULL,
  empleado_codigo TEXT NOT NULL,
  periodo TEXT NOT NULL,
  anio INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  dias_trabajados INTEGER DEFAULT 30,
  horas_trabajadas REAL DEFAULT 240,

  -- Ingresos
  salario_base REAL DEFAULT 0,
  asignacion_familiar REAL DEFAULT 0,
  horas_extras REAL DEFAULT 0,
  bonificaciones REAL DEFAULT 0,
  comisiones REAL DEFAULT 0,
  otros_ingresos REAL DEFAULT 0,
  total_ingresos REAL DEFAULT 0,

  -- Descuentos
  afp_descuento REAL DEFAULT 0,
  adelantos REAL DEFAULT 0,
  prestamos REAL DEFAULT 0,
  descuentos_judiciales REAL DEFAULT 0,
  otros_descuentos REAL DEFAULT 0,
  total_descuentos REAL DEFAULT 0,

  -- Aportaciones empleador
  essalud REAL DEFAULT 0,
  senati REAL DEFAULT 0,
  scrt REAL DEFAULT 0,
  eps REAL DEFAULT 0,
  total_aportaciones REAL DEFAULT 0,

  -- Neto
  neto_pagar REAL DEFAULT 0,

  -- Metadatos
  estado TEXT DEFAULT 'GENERADO' CHECK(estado IN ('GENERADO', 'APROBADO', 'PAGADO', 'ANULADO')),
  fecha_pago TEXT,
  aprobado_por TEXT,
  observations TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT,
  UNIQUE(company_id, empleado_id, periodo)
);

-- Liquidaciones
CREATE TABLE IF NOT EXISTS payroll_liquidations (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  empleado_id TEXT NOT NULL,
  tipo_liquidacion TEXT NOT NULL,  -- RENUNCIA, DESPIDO, CONCLUSION_CONTRATO, OTROS
  fecha_ingreso TEXT NOT NULL,
  fecha_liquidacion TEXT NOT NULL,
  dias_trabajados INTEGER DEFAULT 0,
  meses_trabajados REAL DEFAULT 0,

  -- Cálculos
  remuneracion_mensual REAL DEFAULT 0,
  gratificacion_proporcional REAL DEFAULT 0,
  vacaciones_proporcional REAL DEFAULT 0,
  cts_proporcional REAL DEFAULT 0,
  participacion_utilidades REAL DEFAULT 0,
  beneficios_adicionales REAL DEFAULT 0,
  total_bruto REAL DEFAULT 0,

  -- Descuentos
  adelantos_pendientes REAL DEFAULT 0,
  prestamos_pendientes REAL DEFAULT 0,
  impuesto_renta REAL DEFAULT 0,
  otros_descuentos REAL DEFAULT 0,
  total_descuentos REAL DEFAULT 0,

  -- Neto
  total_neto REAL DEFAULT 0,

  -- Estado
  estado TEXT DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'CALCULADO', 'APROBADO', 'PAGADO', 'ENTREGADO')),
  fecha_pago TEXT,
  autorizado_por TEXT,
  fecha_autorizacion TEXT,
  observaciones TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- ============================================
-- FASE 4: CONFIGURACIÓN LEGAL
-- ============================================

-- Regímenes laborales
CREATE TABLE IF NOT EXISTS legal_regimens (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo_contrato TEXT,  -- PLAZO_FIJO, INDETERMINADO
  regimen TEXT NOT NULL,  -- 728, CAS, CPP, MICROEMPRESA, AGRARIO
  essalud_porcentaje REAL DEFAULT 9,
  senati_porcentaje REAL DEFAULT 0.75,
  eps_porcentaje REAL DEFAULT 0,
  scrt_porcentaje REAL DEFAULT 0,
  seguro_vida_porcentaje REAL DEFAULT 0,
  vacaciones_dias INTEGER DEFAULT 15,
  dias_por_ano INTEGER DEFAULT 30,
  gratificaciones INTEGER DEFAULT 2,
  cts_activo BOOLEAN DEFAULT TRUE,
  activo BOOLEAN DEFAULT TRUE,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- Conceptos de nómina
CREATE TABLE IF NOT EXISTS legal_concepts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,  -- INGRESO, DEDUCCION, APORTACION
  naturaleza TEXT NOT NULL,  -- REMUNERATIVO, NO_REMUNERATIVO, DESCUENTO
  afecta TEXT NOT NULL,  -- BRUTO, NETO, NINGUNO
  concepto_impuesto TEXT,  -- RENTA_5TA, GRATI, CTS, OTRO
  fijo BOOLEAN DEFAULT FALSE,
  porcentaje REAL,
  monto REAL DEFAULT 0,
  orden_impresion INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- AFP
CREATE TABLE IF NOT EXISTS legal_afp (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  sigla TEXT NOT NULL,
 保险公司 TEXT NOT NULL,
  tipo TEXT NOT NULL,  -- AFP, ONP
  pension_id TEXT,
  comision_porcentaje REAL DEFAULT 1.47,
  seguro_porcentaje DEFAULT 0,
  aporte_porcentaje REAL DEFAULT 10,
  total_porcentaje REAL DEFAULT 0,
  activa BOOLEAN DEFAULT TRUE,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- ESSALUD y salud
CREATE TABLE IF NOT EXISTS legal_essalud (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  essalud_porcentaje REAL DEFAULT 9,
  essalud_vida_porcentaje REAL DEFAULT 0.53,
  eps_activo BOOLEAN DEFAULT FALSE,
  eps_porcentaje REAL DEFAULT 0,
  sps_activo BOOLEAN DEFAULT FALSE,
  sps_porcentaje REAL DEFAULT 0,
  actualizado_por TEXT,
  updatedAt TEXT
);

-- Plantillas legales
CREATE TABLE IF NOT EXISTS legal_templates (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,  -- CONTRATO, CARTA, ACTA, CONSTANCIA, BOLETA, LIQUIDACION
  contenido TEXT NOT NULL,
  variables TEXT,  -- JSON con variables disponibles
  activo BOOLEAN DEFAULT TRUE,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- ============================================
-- FASE 5: ADMINISTRACIÓN
-- ============================================

-- Empresas/Tenants
CREATE TABLE IF NOT EXISTS admin_companies (
  id TEXT PRIMARY KEY,
  razon_social TEXT NOT NULL,
  nombre_comercial TEXT,
  ruc TEXT NOT NULL UNIQUE,
  direccion TEXT,
  distrito TEXT,
  provincia TEXT,
  departamento TEXT,
  telefono TEXT,
  email TEXT,
  web TEXT,
  logo TEXT,
  estado TEXT DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
  plan TEXT DEFAULT 'BASICO',  -- BASICO, PROFESIONAL, EMPRESA
  regimen_tributario TEXT DEFAULT 'GENERAL',
  ruc_representante TEXT,
  nombre_representante TEXT,
  dni_representante TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- Usuarios
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT,
  dni TEXT,
  telefono TEXT,
  rol TEXT NOT NULL DEFAULT 'USER' CHECK(rol IN ('SUPER_ADMIN', 'ADMIN', 'RRHH', 'GERENCIA', 'CONTROL_INTERNO', 'SUPERVISOR', 'USER')),
  estado TEXT DEFAULT 'ACTIVO' CHECK(estado IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')),
  ultimo_login TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT,
  UNIQUE(company_id, email)
);

-- Auditoría
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_rol TEXT NOT NULL,
  modulo TEXT NOT NULL,
  accion TEXT NOT NULL,  -- CREAR, LEER, ACTUALIZAR, ELIMINAR, LOGIN, LOGOUT, EXPORTAR
  entidad TEXT NOT NULL,
  entidad_id TEXT,
  datos_anteriores TEXT,
  datos_nuevos TEXT,
  ip_address TEXT,
  user_agent TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- FASE 6: TRÁMITES FISCALES
-- ============================================

-- Declaraciones SUNAT
CREATE TABLE IF NOT EXISTS tax_sunat_declarations (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  tipo_declaracion TEXT NOT NULL,  -- PLAME, PDT_621, 4TA_CATEGORIA, RENTA_5TA, OTROS
  periodo TEXT NOT NULL,
  anio INTEGER NOT NULL,
  mes INTEGER,
  fecha_vencimiento TEXT,
  fecha_presentacion TEXT,
  monto_declarado REAL DEFAULT 0,
  monto_pagado REAL DEFAULT 0,
  numero_operacion TEXT,
  estado TEXT DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'PRESENTADO', 'PAGADO', 'OBSERVADO', 'ANULADO')),
  archivo_pdf TEXT,
  archivo_txt TEXT,
  submitted_by TEXT,
  observations TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- MINTRA - T Registro
CREATE TABLE IF NOT EXISTS tax_mintra_tregistro (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  periodo TEXT NOT NULL,
  anio INTEGER NOT NULL,
  total_trabajadores INTEGER DEFAULT 0,
  fecha_generacion TEXT,
  archivo_generado TEXT,
  estado_envio TEXT DEFAULT 'PENDIENTE',
  fecha_envio TEXT,
  respuesta_mintra TEXT,
  submitted_by TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- MINTRA - T Libreta
CREATE TABLE IF NOT EXISTS tax_mintra_tlibreta (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  empleado_id TEXT NOT NULL,
  periodo TEXT NOT NULL,
  dias_trabajados INTEGER DEFAULT 0,
  horas_trabajadas REAL DEFAULT 0,
  salario REAL DEFAULT 0,
  total_cargado REAL DEFAULT 0,
  essalud_cargado REAL DEFAULT 0,
  observaciones TEXT,
  estado TEXT DEFAULT 'PENDIENTE',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT
);

-- Constancias y certificados
CREATE TABLE IF NOT EXISTS tax_certificates (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  tipo_certificado TEXT NOT NULL,  -- LABORAL, REMUNERACIONES, VACACIONES, CTS, GRATI
  empleado_id TEXT NOT NULL,
  periodo TEXT NOT NULL,
  fecha_emision TEXT NOT NULL,
  vigente_desde TEXT,
  vigente_hasta TEXT,
  contenido TEXT,
  archivo_generado TEXT,
  issued_by TEXT,
  issued_at TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_loans_company ON payroll_loans(company_id);
CREATE INDEX IF NOT EXISTS idx_loans_empleado ON payroll_loans(empleado_id);
CREATE INDEX IF NOT EXISTS idx_payslips_company ON payroll_payslips(company_id);
CREATE INDEX IF NOT EXISTS idx_payslips_periodo ON payroll_payslips(periodo);
CREATE INDEX IF NOT EXISTS idx_liquidations_company ON payroll_liquidations(company_id);
CREATE INDEX IF NOT EXISTS idx_liquidations_empleado ON payroll_liquidations(empleado_id);
CREATE INDEX IF NOT EXISTS idx_audit_company ON admin_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_fecha ON admin_audit_log(createdAt);
CREATE INDEX IF NOT EXISTS idx_sunat_company ON tax_sunat_declarations(company_id);
CREATE INDEX IF NOT EXISTS idx_sunat_periodo ON tax_sunat_declarations(periodo);
CREATE INDEX IF NOT EXISTS idx_mintra_company ON tax_mintra_tregistro(company_id);
