-- ============================================
-- Migraciones adicionales para RRHHMOD Perú
-- Tablas para cálculos legales y configuraciones
-- ============================================

-- Tabla de Feriados Peruanos
CREATE TABLE IF NOT EXISTS feriados (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    fecha DATE NOT NULL,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'FIJO', 'MOVIL', 'NO_LABORABLE'
    descripcion TEXT,
    es_no_laborable INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Insertar feriados peruanos 2024-2025
INSERT OR IGNORE INTO feriados (id, fecha, nombre, tipo, es_no_laborable) VALUES
-- 2024
('fer-2024-01-01', '2024-01-01', 'Año Nuevo', 'FIJO', 1),
('fer-2024-03-28', '2024-03-28', 'Jueves Santo', 'MOVIL', 1),
('fer-2024-03-29', '2024-03-29', 'Viernes Santo', 'MOVIL', 1),
('fer-2024-05-01', '2024-05-01', 'Día del Trabajo', 'FIJO', 1),
('fer-2024-06-07', '2024-06-07', 'Batalla de Arica', 'FIJO', 1),
('fer-2024-06-29', '2024-06-29', 'San Pedro y San Pablo', 'FIJO', 1),
('fer-2024-07-28', '2024-07-28', 'Fiestas Patrias', 'FIJO', 1),
('fer-2024-07-29', '2024-07-29', 'Día de la Independencia', 'FIJO', 1),
('fer-2024-08-30', '2024-08-30', 'Santa Rosa de Lima', 'FIJO', 1),
('fer-2024-10-08', '2024-10-08', 'Combate de Angamos', 'FIJO', 1),
('fer-2024-11-01', '2024-11-01', 'Día de Todos los Santos', 'FIJO', 1),
('fer-2024-12-08', '2024-12-08', 'Inmaculada Concepción', 'FIJO', 1),
('fer-2024-12-09', '2024-12-09', 'Batalla de Ayacucho', 'FIJO', 1),
('fer-2024-12-25', '2024-12-25', 'Navidad', 'FIJO', 1),
-- 2025
('fer-2025-01-01', '2025-01-01', 'Año Nuevo', 'FIJO', 1),
('fer-2025-04-17', '2025-04-17', 'Jueves Santo', 'MOVIL', 1),
('fer-2025-04-18', '2025-04-18', 'Viernes Santo', 'MOVIL', 1),
('fer-2025-05-01', '2025-05-01', 'Día del Trabajo', 'FIJO', 1),
('fer-2025-06-07', '2025-06-07', 'Batalla de Arica', 'FIJO', 1),
('fer-2025-06-29', '2025-06-29', 'San Pedro y San Pablo', 'FIJO', 1),
('fer-2025-07-28', '2025-07-28', 'Fiestas Patrias', 'FIJO', 1),
('fer-2025-07-29', '2025-07-29', 'Día de la Independencia', 'FIJO', 1),
('fer-2025-08-30', '2025-08-30', 'Santa Rosa de Lima', 'FIJO', 1),
('fer-2025-10-08', '2025-10-08', 'Combate de Angamos', 'FIJO', 1),
('fer-2025-11-01', '2025-11-01', 'Día de Todos los Santos', 'FIJO', 1),
('fer-2025-12-08', '2025-12-08', 'Inmaculada Concepción', 'FIJO', 1),
('fer-2025-12-09', '2025-12-09', 'Batalla de Ayacucho', 'FIJO', 1),
('fer-2025-12-25', '2025-12-25', 'Navidad', 'FIJO', 1);

-- Tabla de Configuración por Empresa
CREATE TABLE IF NOT EXISTS configuracion_empresa (
    id TEXT PRIMARY KEY,
    company_id TEXT UNIQUE NOT NULL,
    
    -- Configuración general
    razon_social TEXT,
    ruc TEXT,
    direccion TEXT,
    representante_legal TEXT,
    dni_representante TEXT,
    
    -- Configuración de planilla
    rmv_actual REAL DEFAULT 1025.00,
    uit_actual REAL DEFAULT 5150.00,
    porcentaje_essalud REAL DEFAULT 0.09,
    dia_pago TEXT DEFAULT '30',
    
    -- Configuración AFP por defecto
    afp_default TEXT DEFAULT 'HABITAT',
    
    -- Configuración de beneficios
    asignacion_familiar_por_hijo REAL DEFAULT 93.00,
    max_hijos_asignacion INTEGER DEFAULT 5,
    
    -- Configuración de horario
    horas_semanales INTEGER DEFAULT 48,
    dias_semana_laborable INTEGER DEFAULT 6,
    hora_entrada TEXT DEFAULT '09:00',
    hora_salida TEXT DEFAULT '18:00',
    
    -- Configuración de bancos
    banco_principal TEXT,
    cuenta_sueldos TEXT,
    cci_sueldos TEXT,
    
    -- Configuración de email
    email_rrhh TEXT,
    email_envio_boletas TEXT,
    
    -- Configuración de integraciones
    resend_api_key TEXT,
    cloudflare_account_id TEXT,
    
    -- JSON para configuraciones adicionales
    configuraciones_json TEXT,
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Tabla de Historia Laboral (para cálculos históricos)
CREATE TABLE IF NOT EXISTS historia_laboral (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    empleado_id TEXT NOT NULL,
    
    -- Periodo
    periodo TEXT NOT NULL, -- YYYY-MM
    anio INTEGER,
    mes INTEGER,
    
    -- Remuneraciones
    salario_base REAL,
    asignacion_familiar REAL,
    horas_extras_25 REAL,
    horas_extras_35 REAL,
    horas_extras_100 REAL,
    bonificaciones REAL,
    comisiones REAL,
    reintegros REAL,
    total_ingresos REAL,
    
    -- Descuentos
    afp_aporte_obligatorio REAL,
    afp_comision_flujo REAL,
    afp_prima_seguro REAL,
    afp_total REAL,
    onp_aporte REAL,
    quinta_categoria REAL,
    adelantos REAL,
    prestamos REAL,
    faltas REAL,
    tardanzas REAL,
    total_descuentos REAL,
    
    -- Aportes empleador
    essalud REAL,
    senati REAL,
    sctr_pension REAL,
    sctr_salud REAL,
    total_aportes_empleador REAL,
    
    -- Beneficios sociales (si aplica)
    gratificacion REAL,
    cts REAL,
    vacaciones_truncas REAL,
    
    -- Neto y estado
    neto_pagar REAL,
    estado TEXT DEFAULT 'PROCESADO', -- 'PROCESADO', 'ANULADO', 'PENDIENTE'
    
    -- Control
    fecha_proceso DATETIME,
    procesado_por TEXT,
    observaciones TEXT,
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (empleado_id) REFERENCES employees(id),
    UNIQUE(company_id, empleado_id, periodo)
);

-- Índices para historia_laboral
CREATE INDEX IF NOT EXISTS idx_historia_empleado ON historia_laboral(empleado_id);
CREATE INDEX IF NOT EXISTS idx_historia_periodo ON historia_laboral(periodo);
CREATE INDEX IF NOT EXISTS idx_historia_company ON historia_laboral(company_id);

-- Tabla de Retenciones Quinta Categoría Acumuladas
CREATE TABLE IF NOT EXISTS quinta_categoria_acumulado (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    empleado_id TEXT NOT NULL,
    anio INTEGER NOT NULL,
    
    -- Rentas proyectadas
    renta_bruta_proyectada REAL,
    renta_neta_proyectada REAL,
    
    -- Retenciones
    impuesto_anual_calculado REAL,
    retencion_mensual REAL,
    retenciones_acumuladas REAL,
    retenciones_pendientes REAL,
    
    -- Meses
    meses_proyectados INTEGER DEFAULT 12,
    meses_restantes INTEGER,
    
    -- Historial por mes (JSON)
    detalle_mensual TEXT, -- JSON array
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (empleado_id) REFERENCES employees(id),
    UNIQUE(company_id, empleado_id, anio)
);

-- Tabla de Depósitos CTS
CREATE TABLE IF NOT EXISTS cts_depositos (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    empleado_id TEXT NOT NULL,
    
    periodo TEXT NOT NULL, -- 'MAYO-2024', 'NOVIEMBRE-2024'
    tipo_periodo TEXT NOT NULL, -- 'MAYO', 'NOVIEMBRE'
    anio INTEGER,
    
    -- Cálculo
    salario_base REAL,
    asignacion_familiar REAL,
    promedio_horas_extras REAL,
    promedio_bonificaciones REAL,
    base_calculo REAL,
    
    -- Montos
    monto_semestre REAL,
    dias_calculados INTEGER,
    meses_calculados INTEGER,
    monto_total REAL,
    
    -- Depósito
    fecha_deposito DATE,
    banco_deposito TEXT,
    numero_operacion TEXT,
    
    -- Estado
    estado TEXT DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'DEPOSITADO', 'RETENIDO'
    
    -- Control
    observaciones TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (empleado_id) REFERENCES employees(id)
);

-- Tabla de Gratificaciones
CREATE TABLE IF NOT EXISTS gratificaciones (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    empleado_id TEXT NOT NULL,
    
    periodo TEXT NOT NULL, -- 'JULIO-2024', 'DICIEMBRE-2024'
    tipo_periodo TEXT NOT NULL, -- 'JULIO', 'DICIEMBRE'
    anio INTEGER,
    
    -- Cálculo
    salario_base REAL,
    asignacion_familiar REAL,
    promedio_variable REAL,
    base_calculo REAL,
    
    -- Montos
    meses_trabajados INTEGER,
    gratificacion_proporcional REAL,
    gratificacion_total REAL,
    
    -- Essalud 9%
    essalud_9 REAL,
    total_pagar REAL,
    
    -- Pago
    fecha_pago DATE,
    
    -- Estado
    estado TEXT DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'PAGADO'
    
    -- Control
    observaciones TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (empleado_id) REFERENCES employees(id)
);

-- Tabla de Vacaciones (detalle)
CREATE TABLE IF NOT EXISTS vacaciones_detalle (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    empleado_id TEXT NOT NULL,
    
    -- Periodo vacacional
    periodo_inicio DATE,
    periodo_fin DATE,
    dias_generados INTEGER,
    dias_pendientes INTEGER,
    dias_gozados INTEGER,
    dias_vendidos INTEGER,
    dias_truncos INTEGER,
    
    -- Montos
    monto_vacaciones REAL,
    monto_vendido REAL,
    compensacion_trunca REAL,
    
    -- Fechas de goce
    fecha_inicio_goces DATE,
    fecha_fin_goces DATE,
    
    -- Estado
    estado TEXT DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'GOZANDO', 'VENDIDA', 'COMPENSADA', 'VENCIDA'
    
    -- Control
    observaciones TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (empleado_id) REFERENCES employees(id)
);

-- Tabla de Plantillas de Documentos Legales
CREATE TABLE IF NOT EXISTS plantillas_documentos (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    
    codigo TEXT NOT NULL,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'CONTRATO', 'ADDENDUM', 'CARTA', 'MEMORANDO', 'SOLICITUD'
    subtipo TEXT, -- 'INDEFINIDO', 'PLAZO_FIJO', 'CAS', 'LOCACION', etc.
    
    -- Contenido
    asunto TEXT,
    contenido TEXT, -- Plantilla con variables {{variable}}
    variables TEXT, -- JSON con lista de variables
    
    -- Configuración
    es_default INTEGER DEFAULT 0,
    es_sistema INTEGER DEFAULT 0, -- No se puede eliminar
    
    -- Control
    creado_por TEXT,
    activo INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Insertar plantillas por defecto del sistema
INSERT OR IGNORE INTO plantillas_documentos (id, codigo, nombre, tipo, subtipo, asunto, contenido, variables, es_sistema) VALUES
('tpl-contrato-indef', 'CONTRATO_INDEFINIDO', 'Contrato a Plazo Indeterminado', 'CONTRATO', 'INDEFINIDO', 
'CONTRATO DE TRABAJO A PLAZO INDETERMINADO',
'CONTRATO DE TRABAJO A PLAZO INDETERMINADO

En la ciudad de {{CIUDAD}}, a los {{DIA}} días del mes de {{MES}} de {{ANIO}}, entre:

{{EMPRESA_RAZON_SOCIAL}}, con RUC {{EMPRESA_RUC}}, con domicilio en {{EMPRESA_DIRECCION}}, debidamente representada por {{REPRESENTANTE}}, identificado con DNI {{DNI_REPRESENTANTE}}, a quien en adelante se le denominará "EL EMPLEADOR";

Y de la otra parte:

{{TRABAJADOR_NOMBRES}} {{TRABAJADOR_APELLIDOS}}, identificado con DNI N° {{TRABAJADOR_DNI}}, con domicilio en {{TRABAJADOR_DIRECCION}}, a quien en adelante se le denominará "EL TRABAJADOR";

Las partes acuerdan celebrar el presente contrato de trabajo sujeto a las siguientes cláusulas:

PRIMERA: ANTECEDENTES
EL EMPLEADOR es una empresa dedicada a {{GIRO_EMPRESA}}.

SEGUNDA: OBJETO DEL CONTRATO
EL EMPLEADOR contrata los servicios personales de EL TRABAJADOR para que desempeñe el cargo de {{CARGO}}, en el área de {{AREA}}.

TERCERA: LUGAR DE PRESTACIÓN DEL SERVICIO
EL TRABAJADOR prestará sus servicios en {{LUGAR_TRABAJO}}, pudiendo EL EMPLEADOR trasladarlo a otro local, oficina o establecimiento por razones de necesidad empresarial.

CUARTA: DURACIÓN DEL CONTRATO
El presente contrato se celebra por tiempo indeterminado, conforme al Decreto Legislativo 728, Ley de Productividad y Competitividad Laboral.

QUINTA: JORNADA DE TRABAJO
La jornada de trabajo será de {{HORAS_SEMANALES}} horas semanales, de acuerdo al horario establecido por EL EMPLEADOR.

SEXTA: REMUNERACIÓN
EL EMPLEADOR se obliga a pagar a EL TRABAJADOR una remuneración mensual de S/ {{REMUNERACION}} ({{REMUNERACION_LETRAS}}), con el descuento correspondiente a la AFP {{AFP}}, en la cuenta bancaria que EL TRABAJADOR designe para tal efecto.

SÉPTIMA: OBLIGACIONES DEL TRABAJADOR
Son obligaciones de EL TRABAJADOR:
a) Cumplir con las labores propias de su cargo y las que le sean asignadas.
b) Observar las normas internas de EL EMPLEADOR.
c) Guardar estricta confidencialidad.

OCTAVA: BENEFICIOS SOCIALES
EL TRABAJADOR tiene derecho a los beneficios sociales establecidos en la Ley: Vacaciones, Gratificaciones, CTS, según corresponda.

NOVENA: SOLUCIÓN DE CONTROVERSIAS
Las partes se someten a la jurisdicción de los jueces y tribunales de la ciudad de {{CIUDAD_JURISDICCION}}.

En señal de conformidad, las partes firman el presente contrato en dos ejemplares del mismo tenor y valor, en la ciudad de {{CIUDAD}} a los {{DIA}} días del mes de {{MES}} de {{ANIO}}.

______________________                    ______________________
EL EMPLEADOR                              EL TRABAJADOR
{{REPRESENTANTE}}                         {{TRABAJADOR_NOMBRES}} {{TRABAJADOR_APELLIDOS}}
DNI: {{DNI_REPRESENTANTE}}                DNI: {{TRABAJADOR_DNI}}',
'["EMPRESA_RAZON_SOCIAL", "EMPRESA_RUC", "EMPRESA_DIRECCION", "REPRESENTANTE", "DNI_REPRESENTANTE", "TRABAJADOR_NOMBRES", "TRABAJADOR_APELLIDOS", "TRABAJADOR_DNI", "TRABAJADOR_DIRECCION", "CIUDAD", "DIA", "MES", "ANIO", "GIRO_EMPRESA", "CARGO", "AREA", "LUGAR_TRABAJO", "HORAS_SEMANALES", "REMUNERACION", "REMUNERACION_LETRAS", "AFP", "CIUDAD_JURISDICCION"]',
1),

('tpl-cas', 'CONTRATO_CAS', 'Contrato Administrativo de Servicios (CAS)', 'CONTRATO', 'CAS',
'CONTRATO ADMINISTRATIVO DE SERVICIOS',
'CONTRATO ADMINISTRATIVO DE SERVICIOS N° {{NUMERO_CONTRATO}}-{{ANIO}}

En la ciudad de {{CIUDAD}}, a los {{DIA}} días del mes de {{MES}} de {{ANIO}}, entre:

{{EMPRESA_RAZON_SOCIAL}}, con RUC {{EMPRESA_RUC}}, representada por {{REPRESENTANTE}}, a quien se le denominará "LA ENTIDAD";

Y:

{{TRABAJADOR_NOMBRES}} {{TRABAJADOR_APELLIDOS}}, identificado con DNI N° {{TRABAJADOR_DNI}}, a quien se le denominará "EL SERVIDOR";

Las partes suscriben el presente contrato conforme al Decreto Legislativo N° 1057 y su reglamento:

CLÁUSULA PRIMERA: OBJETO
EL SERVIDOR se obliga a prestar servicios de {{SERVICIO_DESCRIPCION}} para {{OBJETIVO_CONTRATO}}.

CLÁUSULA SEGUNDA: PLAZO
El plazo del presente contrato es de {{PLAZO_MESES}} meses, iniciándose el {{FECHA_INICIO}} y culminando el {{FECHA_FIN}}.

CLÁUSULA TERCERA: RETRIBUCIÓN
La Entidad pagará al Servidor una retribución mensual de S/ {{MONTO}} ({{MONTO_LETRAS}}).

CLÁUSULA CUARTA: HORARIO
El horario de prestación de servicios será de {{HORARIO}}.

CLÁUSULA QUINTA: OBLIGACIONES
Son obligaciones del Servidor:
a) Prestar los servicios con eficiencia y puntualidad.
b) Acatar las normas internas de la Entidad.
c) No prestar servicios simultáneos para otra entidad pública.

Las partes firman el presente contrato en dos ejemplares a los {{DIA}} días del mes de {{MES}} de {{ANIO}}.

______________________                    ______________________
LA ENTIDAD                                EL SERVIDOR
',
'["NUMERO_CONTRATO", "ANIO", "CIUDAD", "DIA", "MES", "EMPRESA_RAZON_SOCIAL", "EMPRESA_RUC", "REPRESENTANTE", "TRABAJADOR_NOMBRES", "TRABAJADOR_APELLIDOS", "TRABAJADOR_DNI", "SERVICIO_DESCRIPCION", "OBJETIVO_CONTRATO", "PLAZO_MESES", "FECHA_INICIO", "FECHA_FIN", "MONTO", "MONTO_LETRAS", "HORARIO"]',
1);

-- Tabla de Logs de Envío de Boletas
CREATE TABLE IF NOT EXISTS email_boletas_log (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    empleado_id TEXT NOT NULL,
    payslip_id TEXT NOT NULL,
    
    email_destino TEXT,
    asunto TEXT,
    estado TEXT, -- 'ENVIADO', 'ERROR', 'PENDIENTE'
    error_mensaje TEXT,
    message_id TEXT,
    
    fecha_envio DATETIME,
    intentos INTEGER DEFAULT 0,
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (empleado_id) REFERENCES employees(id)
);

-- Crear índices adicionales
CREATE INDEX IF NOT EXISTS idx_feriados_fecha ON feriados(fecha);
CREATE INDEX IF NOT EXISTS idx_feriados_company ON feriados(company_id);
CREATE INDEX IF NOT EXISTS idx_historia_empleado_periodo ON historia_laboral(empleado_id, periodo);
CREATE INDEX IF NOT EXISTS idx_cts_empleado ON cts_depositos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_gratificaciones_empleado ON gratificaciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_vacaciones_empleado ON vacaciones_detalle(empleado_id);
