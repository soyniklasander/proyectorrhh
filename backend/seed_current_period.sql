-- ============================================
-- Seed Data: Boletas para período actual (2026-02)
-- ============================================

-- Insertar boletas para febrero 2026 (mes actual)
INSERT INTO payroll_payslips (id, company_id, empleado_id, empleado_codigo, periodo, anio, mes, dias_trabajados, horas_trabajadas, salario_base, asignacion_familiar, horas_extras, bonificaciones, comisiones, otros_ingresos, total_ingresos, afp_descuento, adelantos, prestamos, descuentos_judiciales, otros_descuentos, total_descuentos, essalud, neto_pagar, estado, fecha_pago, observations, createdAt) VALUES
('payslip-2026-001', 'comp-default', 'emp-001', 'EMP001', '2026-02', 2026, 2, 30, 240, 1500.00, 102.50, 150.00, 0.00, 0.00, 0.00, 1752.50, 194.10, 0.00, 500.00, 0.00, 0.00, 694.10, 157.73, 1058.40, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-2026-002', 'comp-default', 'emp-002', 'EMP002', '2026-02', 2026, 2, 30, 240, 1800.00, 102.50, 200.00, 100.00, 0.00, 0.00, 2202.50, 189.90, 0.00, 625.00, 0.00, 0.00, 814.90, 198.23, 1387.60, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-2026-003', 'comp-default', 'emp-003', 'EMP003', '2026-02', 2026, 2, 30, 240, 2000.00, 102.50, 0.00, 0.00, 500.00, 0.00, 2602.50, 0.00, 0.00, 0.00, 0.00, 50.00, 245.00, 234.23, 2357.50, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-2026-004', 'comp-default', 'emp-004', 'EMP004', '2026-02', 2026, 2, 30, 240, 1650.00, 102.50, 120.00, 0.00, 0.00, 0.00, 1872.50, 189.90, 0.00, 0.00, 0.00, 0.00, 189.90, 168.53, 1682.60, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-2026-005', 'comp-default', 'emp-005', 'EMP005', '2026-02', 2026, 2, 25, 200, 1200.00, 102.50, 0.00, 0.00, 0.00, 0.00, 1302.50, 155.20, 0.00, 0.00, 300.00, 0.00, 455.20, 117.23, 847.30, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-2026-006', 'comp-default', 'emp-006', 'EMP006', '2026-02', 2026, 2, 30, 240, 2500.00, 102.50, 350.00, 200.00, 0.00, 100.00, 3252.50, 263.46, 500.00, 0.00, 0.00, 0.00, 763.46, 292.73, 2489.04, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now')),
('payslip-2026-007', 'comp-default', 'emp-007', 'EMP007', '2026-02', 2026, 2, 30, 240, 1750.00, 102.50, 0.00, 0.00, 0.00, 0.00, 1852.50, 0.00, 0.00, 0.00, 0.00, 0.00, 227.50, 166.73, 1625.00, 'GENERADO', NULL, 'ONP 13%', datetime('now')),
('payslip-2026-008', 'comp-default', 'emp-008', 'EMP008', '2026-02', 2026, 2, 30, 240, 1400.00, 102.50, 80.00, 0.00, 0.00, 0.00, 1582.50, 138.32, 200.00, 0.00, 0.00, 0.00, 338.32, 142.43, 1244.18, 'GENERADO', NULL, 'Boleta generada automáticamente', datetime('now'));

SELECT 'Boletas para 2026-02 insertadas correctamente' as resultado;
