-- ============================================
-- RRHHMod ERP - Seed Data for FASE 3 (Nómina)
-- Datos de prueba para Préstamos, Descuentos, Boletas y Liquidaciones
-- ============================================

-- Usar company_id: comp-default (el tenant por defecto)

-- ============================================
-- 1. TIPOS DE DESCUENTO (Configuración base)
-- ============================================
INSERT INTO payroll_discount_types (id, company_id, codigo, nombre, naturaleza, porcentaje, orden, activo, createdAt) VALUES
('dt-afp-001', 'comp-default', 'AFP', 'AFP - Prima', 'LEGAL', 12.94, 1, 1, datetime('now')),
('dt-afp-002', 'comp-default', 'AFP_HAB', 'AFP - Habitat', 'LEGAL', 12.66, 2, 1, datetime('now')),
('dt-afp-003', 'comp-default', 'AFP_INT', 'AFP - Integra', 'LEGAL', 12.66, 3, 1, datetime('now')),
('dt-afp-004', 'comp-default', 'AFP_PRO', 'AFP - Profuturo', 'LEGAL', 12.71, 4, 1, datetime('now')),
('dt-onp-001', 'comp-default', 'ONP', 'ONP', 'LEGAL', 13.00, 5, 1, datetime('now')),
('dt-ess-001', 'comp-default', 'ESSALUD', 'ESSALUD', 'LEGAL', 9.00, 6, 1, datetime('now')),
('dt-jud-001', 'comp-default', 'JUD_1', 'Embargo Judicial', 'JUDICIAL', NULL, 7, 1, datetime('now')),
('dt-jud-002', 'comp-default', 'JUD_2', 'Pensión Alimenticia', 'JUDICIAL', NULL, 8, 1, datetime('now')),
('dt-vol-001', 'comp-default', 'PREST', 'Préstamo Empresa', 'VOLUNTARIO', NULL, 9, 1, datetime('now')),
('dt-vol-002', 'comp-default', 'ADEL', 'Adelanto Sueldo', 'VOLUNTARIO', NULL, 10, 1, datetime('now'));

-- ============================================
-- 2. PRÉSTAMOS (4 préstamos de ejemplo)
-- ============================================
INSERT INTO payroll_loans (id, company_id, empleado_id, empleado_codigo, empleado_nombre, tipo_prestamo, monto_total, cuota_mensual, cuotas_totales, cuotas_pagadas, saldo_pendiente, tasa_interes, interes_total, fecha_inicio, fecha_fin, estado, observacion, createdAt) VALUES
('loan-001', 'comp-default', 'emp-001', 'EMP001', 'Juan Pérez García', 'PERSONAL', 5000.00, 500.00, 10, 3, 3500.00, 12.0, 600.00, '2024-01-15', '2024-11-15', 'ACTIVO', 'Préstamo para gastos médicos', datetime('now')),
('loan-002', 'comp-default', 'emp-002', 'EMP002', 'María López Torres', 'VIVIENDA', 15000.00, 625.00, 24, 12, 7500.00, 10.5, 1575.00, '2023-06-01', '2025-06-01', 'ACTIVO', 'Préstamo para vivienda', datetime('now')),
('loan-003', 'comp-default', 'emp-003', 'EMP003', 'Carlos Rodríguez Silva', 'PERSONAL', 3000.00, 600.00, 5, 5, 0.00, 8.0, 240.00, '2023-09-10', '2024-02-10', 'PAGADO', 'Préstamo pagado completamente', datetime('now')),
('loan-004', 'comp-default', 'emp-004', 'EMP004', 'Ana Martínez Castro', 'PERSONAL', 8000.00, 800.00, 10, 0, 8000.00, 12.0, 960.00, '2024-11-01', '2025-09-01', 'ACTIVO', 'Préstamo reciente', datetime('now'));

-- ============================================
-- 3. CUOTAS DE PRÉSTAMOS (Cronogramas)
-- ============================================
-- Cuotas para préstamo 001 (Juan Pérez)
INSERT INTO payroll_loan_cuotas (id, loan_id, company_id, numero_cuota, fecha_vencimiento, fecha_pago, monto_cuota, interes, capital, saldo_restante, estado, createdAt) VALUES
('cuota-001-01', 'loan-001', 'comp-default', 1, '2024-02-15', '2024-02-10', 500.00, 50.00, 450.00, 4550.00, 'PAGADA', datetime('now')),
('cuota-001-02', 'loan-001', 'comp-default', 2, '2024-03-15', '2024-03-12', 500.00, 45.50, 454.50, 4095.50, 'PAGADA', datetime('now')),
('cuota-001-03', 'loan-001', 'comp-default', 3, '2024-04-15', '2024-04-15', 500.00, 40.96, 459.04, 3636.46, 'PAGADA', datetime('now')),
('cuota-001-04', 'loan-001', 'comp-default', 4, '2024-05-15', NULL, 500.00, 36.36, 463.64, 3172.82, 'PENDIENTE', datetime('now')),
('cuota-001-05', 'loan-001', 'comp-default', 5, '2024-06-15', NULL, 500.00, 31.73, 468.27, 2704.55, 'PENDIENTE', datetime('now')),
('cuota-001-06', 'loan-001', 'comp-default', 6, '2024-07-15', NULL, 500.00, 27.05, 472.95, 2231.60, 'PENDIENTE', datetime('now')),
('cuota-001-07', 'loan-001', 'comp-default', 7, '2024-08-15', NULL, 500.00, 22.32, 477.68, 1753.92, 'PENDIENTE', datetime('now')),
('cuota-001-08', 'loan-001', 'comp-default', 8, '2024-09-15', NULL, 500.00, 17.54, 482.46, 1271.46, 'PENDIENTE', datetime('now')),
('cuota-001-09', 'loan-001', 'comp-default', 9, '2024-10-15', NULL, 500.00, 12.71, 487.29, 784.17, 'PENDIENTE', datetime('now')),
('cuota-001-10', 'loan-001', 'comp-default', 10, '2024-11-15', NULL, 500.00, 7.84, 492.16, 0.00, 'PENDIENTE', datetime('now'));

-- ============================================
-- 4. DESCUENTOS POR EMPLEADO
-- ============================================
INSERT INTO payroll_employee_discounts (id, company_id, empleado_id, tipo_descuento_id, concepto, monto, porcentaje, aplicar_a, periodo_deduccion, fecha_inicio, fecha_fin, estado, createdAt) VALUES
('desc-001', 'comp-default', 'emp-001', 'dt-afp-001', 'AFP Prima - Aporte', 194.10, 12.94, 'SUELDO_BRUTO', 'QUINCENAL', '2024-01-01', NULL, 'ACTIVO', datetime('now')),
('desc-002', 'comp-default', 'emp-002', 'dt-afp-002', 'AFP Habitat - Aporte', 189.90, 12.66, 'SUELDO_BRUTO', 'QUINCENAL', '2024-01-01', NULL, 'ACTIVO', datetime('now')),
('desc-003', 'comp-default', 'emp-003', 'dt-onp-001', 'ONP - Aporte', 195.00, 13.00, 'SUELDO_BRUTO', 'QUINCENAL', '2024-01-01', NULL, 'ACTIVO', datetime('now')),
('desc-004', 'comp-default', 'emp-004', 'dt-afp-003', 'AFP Integra - Aporte', 189.90, 12.66, 'SUELDO_BRUTO', 'QUINCENAL', '2024-01-01', NULL, 'ACTIVO', datetime('now')),
('desc-005', 'comp-default', 'emp-001', 'dt-vol-001', 'Préstamo Empresa - Cuota 4/10', 500.00, NULL, 'SUELDO_NETO', 'MENSUAL', '2024-01-01', '2024-11-01', 'ACTIVO', datetime('now')),
('desc-006', 'comp-default', 'emp-002', 'dt-vol-001', 'Préstamo Empresa - Cuota 13/24', 625.00, NULL, 'SUELDO_NETO', 'MENSUAL', '2023-06-01', '2025-06-01', 'ACTIVO', datetime('now')),
('desc-007', 'comp-default', 'emp-005', 'dt-jud-001', 'Embargo Judicial - Expediente 2023-456', 300.00, NULL, 'SUELDO_NETO', 'MENSUAL', '2024-01-01', '2024-12-31', 'ACTIVO', datetime('now'));

-- ============================================
-- 5. BOLETAS DE PAGO (Período 2024-11)
-- ============================================
INSERT INTO payroll_payslips (id, company_id, empleado_id, empleado_codigo, periodo, anio, mes, dias_trabajados, horas_trabajadas, salario_base, asignacion_familiar, horas_extras, bonificaciones, comisiones, otros_ingresos, total_ingresos, afp_descuento, adelantos, prestamos, descuentos_judiciales, otros_descuentos, total_descuentos, essalud, neto_pagar, estado, fecha_pago, observations, createdAt) VALUES
('payslip-001', 'comp-default', 'emp-001', 'EMP001', '2024-11', 2024, 11, 30, 240, 1500.00, 102.50, 150.00, 0.00, 0.00, 0.00, 1752.50, 194.10, 0.00, 500.00, 0.00, 0.00, 694.10, 157.73, 1058.40, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-002', 'comp-default', 'emp-002', 'EMP002', '2024-11', 2024, 11, 30, 240, 1800.00, 102.50, 200.00, 100.00, 0.00, 0.00, 2202.50, 189.90, 0.00, 625.00, 0.00, 0.00, 814.90, 198.23, 1387.60, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-003', 'comp-default', 'emp-003', 'EMP003', '2024-11', 2024, 11, 30, 240, 2000.00, 102.50, 0.00, 0.00, 500.00, 0.00, 2602.50, 0.00, 0.00, 0.00, 0.00, 50.00, 245.00, 234.23, 2357.50, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-004', 'comp-default', 'emp-004', 'EMP004', '2024-11', 2024, 11, 30, 240, 1650.00, 102.50, 120.00, 0.00, 0.00, 0.00, 1872.50, 189.90, 0.00, 0.00, 0.00, 0.00, 189.90, 168.53, 1682.60, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-005', 'comp-default', 'emp-005', 'EMP005', '2024-11', 2024, 11, 25, 200, 1200.00, 102.50, 0.00, 0.00, 0.00, 0.00, 1302.50, 155.20, 0.00, 0.00, 300.00, 0.00, 455.20, 117.23, 847.30, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-006', 'comp-default', 'emp-006', 'EMP006', '2024-11', 2024, 11, 30, 240, 2500.00, 102.50, 350.00, 200.00, 0.00, 100.00, 3252.50, 263.46, 500.00, 0.00, 0.00, 0.00, 763.46, 292.73, 2489.04, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-007', 'comp-default', 'emp-007', 'EMP007', '2024-11', 2024, 11, 30, 240, 1750.00, 102.50, 0.00, 0.00, 0.00, 0.00, 1852.50, 0.00, 0.00, 0.00, 0.00, 0.00, 227.50, 166.73, 1625.00, 'GENERADO', NULL, 'ONP 13%', datetime('now')),
('payslip-008', 'comp-default', 'emp-008', 'EMP008', '2024-11', 2024, 11, 30, 240, 1400.00, 102.50, 80.00, 0.00, 0.00, 0.00, 1582.50, 138.32, 200.00, 0.00, 0.00, 0.00, 338.32, 142.43, 1244.18, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now'));

-- ============================================
-- 6. LIQUIDACIONES (3 ejemplos)
-- ============================================
INSERT INTO payroll_liquidations (id, company_id, empleado_id, tipo_liquidacion, fecha_ingreso, fecha_liquidacion, dias_trabajados, meses_trabajados, remuneracion_mensual, gratificacion_proporcional, vacaciones_proporcional, cts_proporcional, participacion_utilidades, beneficios_adicionales, total_bruto, adelantos_pendientes, prestamos_pendientes, impuesto_renta, otros_descuentos, total_descuentos, total_neto, estado, observaciones, autorizado_por, fecha_autorizacion, createdAt) VALUES
('liq-001', 'comp-default', 'emp-009', 'RENUNCIA', '2020-03-15', '2024-10-31', 1675, 55.83, 2850.00, 1425.00, 1187.50, 3562.50, 0.00, 0.00, 9025.00, 0.00, 0.00, 0.00, 100.00, 100.00, 8925.00, 'PAGADO', 'Liquidación pagada por banco', 'user-001', '2024-11-05', datetime('now')),
('liq-002', 'comp-default', 'emp-010', 'DESPIDO', '2019-06-01', '2024-10-15', 1965, 65.50, 3200.00, 1600.00, 1333.33, 4000.00, 0.00, 0.00, 10133.33, 0.00, 1200.00, 500.00, 200.00, 1900.00, 8233.33, 'CALCULADO', 'En proceso de pago indemnización', NULL, NULL, datetime('now')),
('liq-003', 'comp-default', 'emp-011', 'CONCLUSION_CONTRATO', '2022-01-10', '2024-11-30', 1050, 35.00, 2200.00, 1100.00, 916.67, 2750.00, 0.00, 0.00, 6966.67, 0.00, 500.00, 0.00, 0.00, 500.00, 6466.67, 'PENDIENTE', 'Pendiente de cálculo', NULL, NULL, datetime('now'));

-- ============================================
-- Datos insertados exitosamente
-- ============================================
SELECT 'Seed data FASE 3 insertado correctamente' as resultado;
