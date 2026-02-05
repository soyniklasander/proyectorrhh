-- ============================================
-- Seed Data: Contratos para empleados existentes
-- ============================================

INSERT INTO contracts (id, company_id, empleadoId, tipoContrato, regimenLaboral, cargo, salarioBase, fechaInicio, fechaFin, estado, createdAt, updatedAt) VALUES
('contract-001', 'comp-default', 'emp-001', 'INDETERMINADO', 'GENERAL', 'Analista de Sistemas', 3500.00, '2020-03-15', NULL, 'VIGENTE', datetime('now'), datetime('now')),
('contract-002', 'comp-default', 'emp-002', 'INDETERMINADO', 'GENERAL', 'Gerente de Ventas', 5500.00, '2019-06-01', NULL, 'VIGENTE', datetime('now'), datetime('now')),
('contract-003', 'comp-default', 'emp-003', 'A_PLAZO_FIJO', 'CONSTRUCCION', 'Capataz', 2800.00, '2022-01-10', '2024-12-31', 'VIGENTE', datetime('now'), datetime('now')),
('contract-004', 'comp-default', 'emp-004', 'INDETERMINADO', 'GENERAL', 'Contadora', 4200.00, '2021-08-20', NULL, 'VIGENTE', datetime('now'), datetime('now')),
('contract-005', 'comp-default', 'emp-005', 'INDETERMINADO', 'GENERAL', 'Asistente Administrativo', 2200.00, '2023-02-01', NULL, 'VIGENTE', datetime('now'), datetime('now')),
('contract-006', 'comp-default', 'emp-006', 'INDETERMINADO', 'GENERAL', 'Jefe de Recursos Humanos', 6000.00, '2018-11-15', NULL, 'VIGENTE', datetime('now'), datetime('now')),
('contract-007', 'comp-default', 'emp-007', 'A_PLAZO_FIJO', 'AGRARIO', 'Supervisor de Campo', 2600.00, '2023-05-01', '2025-04-30', 'VIGENTE', datetime('now'), datetime('now')),
('contract-008', 'comp-default', 'emp-008', 'INDETERMINADO', 'GENERAL', 'Diseñadora Gráfica', 2900.00, '2022-09-10', NULL, 'VIGENTE', datetime('now'), datetime('now'));

SELECT 'Contratos creados exitosamente' as resultado;
