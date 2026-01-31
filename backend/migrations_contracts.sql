-- ============================================
-- TABLA DE PLANTILLAS DE CONTRATO
-- ============================================
CREATE TABLE IF NOT EXISTS "contract_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL UNIQUE,
    "regimenLaboral" TEXT NOT NULL,
    "tipoContrato" TEXT NOT NULL,
    "descripcion" TEXT,
    "esPlantilla" BOOLEAN NOT NULL DEFAULT true,
    "diasLaborales" INTEGER DEFAULT 6,
    "horasSemanales" INTEGER DEFAULT 48,
    "tieneCTS" BOOLEAN DEFAULT true,
    "tieneVacaciones" BOOLEAN DEFAULT true,
    "tieneGratificaciones" BOOLEAN DEFAULT true,
    "tieneUtilidades" BOOLEAN DEFAULT false,
    "tieneAsignacionFamiliar" BOOLEAN DEFAULT true,
    "essaludPorcentaje" REAL DEFAULT 9,
    "camposRequeridos" TEXT,
    "camposOpcionales" TEXT,
    "plantillaTexto" TEXT,
    "variables" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
    "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- INSERTAR PLANTILLAS DE CONTRATO (PERÚ)
-- ============================================

-- Régimen General (DL 728) - Plazo Indeterminado
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-001',
    'Régimen General - Plazo Indeterminado',
    'RG-INDETERMINADO',
    'GENERAL',
    'Indeterminado',
    'Contrato a plazo indeterminado bajo el Régimen General de la actividad privada (DL 728)',
    6, 48, true, true, true, true,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "cargo", "salarioBase", "fechaInicio", "direccion"]',
    '["banco", "tipoCuenta", "numeroCCI", "afp", "cuspp", "hijos", "estadoCivil"]',
    'ACTIVO'
);

-- Régimen General (DL 728) - Plazo Fijo
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-002',
    'Régimen General - Plazo Fijo',
    'RG-PLAZOFIJO',
    'GENERAL',
    'Plazo Fijo',
    'Contrato a plazo fijo bajo el Régimen General de la actividad privada (DL 728)',
    6, 48, true, true, true, true,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "cargo", "salarioBase", "fechaInicio", "fechaFin", "duracionMeses", "direccion"]',
    '["banco", "tipoCuenta", "numeroCCI", "afp", "cuspp", "hijos", "estadoCivil"]',
    'ACTIVO'
);

-- Microempresa (DL 1276)
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-003',
    'Microempresa',
    'MICROEMPRESA',
    'MICROEMPRESA',
    'Plazo Fijo',
    'Contrato bajo el régimen de Microempresa (DL 1276) - Beneficios reducidos',
    5, 48, false, true, false, false,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "cargo", "salarioBase", "fechaInicio", "fechaFin", "direccion"]',
    '["banco", "tipoCuenta", "afp", "hijos"]',
    'ACTIVO'
);

-- Pequeña Empresa (DL 1448)
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-004',
    'Pequeña Empresa',
    'PEQUENAEMPRESA',
    'PEQUENA_EMPRESA',
    'Plazo Fijo',
    'Contrato bajo el régimen de Pequeña Empresa (DL 1448) - CTS progresiva',
    6, 48, true, true, true, false,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "cargo", "salarioBase", "fechaInicio", "fechaFin", "direccion"]',
    '["banco", "tipoCuenta", "numeroCCI", "afp", "cuspp", "hijos", "estadoCivil"]',
    'ACTIVO'
);

-- CAS (Contrato Administrativo de Servicios)
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-005',
    'CAS - Contrato Administrativo de Servicios',
    'CAS',
    'CAS',
    'Plazo Fijo',
    'Contrato Administrativo de Servicios - Régimen especial para el sector público',
    5, 48, false, true, false, false,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "cargo", "remuneracion", "fechaInicio", "fechaFin", "area", "direccion"]',
    '["banco", "tipoCuenta", "afp", "nivelEducativo", "profesion"]',
    'ACTIVO'
);

-- Locación de Servicios
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-006',
    'Locación de Servicios',
    'LOCACION',
    'LOCACION_SERVICIOS',
    'Locación de Servicios',
    'Contrato de locación de servicios - Sin relación de dependencia',
    0, 0, false, false, false, false,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "servicio", "honorarios", "fechaInicio", "fechaFin", "direccion"]',
    '["banco", "tipoCuenta", "ruc", "nivelEducativo", "profesion"]',
    'ACTIVO'
);

-- Prácticas Pre-profesionales
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-007',
    'Prácticas Pre-profesionales',
    'PRE-PRACTICAS',
    'PRACTICAS',
    'Prácticas Pre-profesionales',
    'Contrato de prácticas pre-profesionales - Estudiantes universitarios',
    5, 24, false, false, false, false,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "carrera", "universidad", "fechaInicio", "fechaFin", "horario"]',
    '["banco", "tipoCuenta", "semestre", "ciclo"]',
    'ACTIVO'
);

-- Prácticas Profesionales
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-008',
    'Prácticas Profesionales',
    'PRACTICAS-PROFESIONALES',
    'PRACTICAS',
    'Prácticas Profesionales',
    'Contrato de prácticas profesionales - Egresados/bachilleres',
    5, 30, false, false, false, false,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "profesion", "universidad", "fechaInicio", "fechaFin", "horario"]',
    '["banco", "tipoCuenta", "tipoColegiatura", "numeroColegiatura"]',
    'ACTIVO'
);

-- Régimen Agrario (DL 1053)
INSERT INTO "contract_templates" ("id", "nombre", "codigo", "regimenLaboral", "tipoContrato", "descripcion", "diasLaborales", "horasSemanales", "tieneCTS", "tieneVacaciones", "tieneGratificaciones", "tieneUtilidades", "camposRequeridos", "camposOpcionales", "estado")
VALUES (
    'tmpl-009',
    'Régimen Agrario',
    'AGRARIO',
    'AGRARIO',
    'Plazo Fijo',
    'Contrato bajo el régimen agrario (DL 1053) - Para actividades agrícolas y pecuarias',
    6, 48, true, true, false, false,
    '["nombres", "apellidoPaterno", "apellidoMaterno", "numeroDocumento", "cargo", "salarioMinimo", "fechaInicio", "fechaFin", "ubicacionCampo"]',
    '["banco", "tipoCuenta", "afp", "hijos"]',
    'ACTIVO'
);
