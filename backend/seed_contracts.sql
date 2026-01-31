-- ============================================
-- SEED DATA: CONTRACTS
-- ============================================

-- Contrato 1: Juan Pérez - Régimen General Indeterminado (Vigente)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-001', 'emp-001', 'Indeterminado', 'GENERAL', 'PRESENCIAL',
    '2024-01-15', 'Desarrollador Full Stack', 'Tecnología', 'Desarrollo',
    6, 48, 5500.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    93.00, 'AFP', 'Habitat', '123456789012', 'Renta',
    true, true, true, true,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 2: María López - Régimen General Indeterminado (Vigente)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-002', 'emp-002', 'Indeterminado', 'GENERAL', 'PRESENCIAL',
    '2023-06-01', 'Gerente de Administración', 'Administración', 'RRHH',
    6, 48, 8500.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    93.00, 'AFP', 'Integra', '234567890123', 'Renta',
    true, true, true, true,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 3: Carlos Rodríguez - Plazo Fijo (Por Vencer - 2025-02-28)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, fechaFin, duracionMeses, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-003', 'emp-003', 'Plazo Fijo', 'GENERAL', 'PRESENCIAL',
    '2024-07-01', '2025-02-28', 8, 'Analista Contable', 'Finanzas', 'Contabilidad',
    6, 48, 4200.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    0.00, 'AFP', 'Prima', '345678901234', 'Renta',
    true, true, true, true,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 4: Ana Sofía García - Régimen General (Vigente)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-004', 'emp-004', 'Indeterminado', 'GENERAL', 'PRESENCIAL',
    '2024-03-01', 'Abogada Legal', 'Legal', 'Asesoría Jurídica',
    6, 48, 6500.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    0.00, 'AFP', 'Profuturo', '456789012345', 'Renta',
    true, true, true, true,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 5: Pedro Fernández - Régimen General (Vigente)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-005', 'emp-005', 'Indeterminado', 'GENERAL', 'PRESENCIAL',
    '2024-01-01', 'Ingeniero de Proyectos', 'Operaciones', 'Proyectos',
    6, 48, 7200.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    93.00, 'AFP', 'Habitat', '567890123456', 'Renta',
    true, true, true, true,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 6: Lucía Díaz - Microempresa (Vigente)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-006', 'emp-006', 'Plazo Fijo', 'MICROEMPRESA', 'PRESENCIAL',
    '2024-08-01', 'Asistente de Marketing', 'Comercial', 'Marketing',
    5, 48, 2800.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    0.00, 'AFP', 'Integra', '678901234567', 'Renta',
    false, true, false, false,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 7: Roberto Quispe - Régimen Agrario (Vigente)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-007', 'emp-007', 'Plazo Fijo', 'AGRARIO', 'PRESENCIAL',
    '2023-11-15', 'Operario Agrícola', 'Producción', 'Campo',
    6, 48, 1500.00, 'PEN', 'QUINCENAL', 'DEPOSITO',
    93.00, 'AFP', 'Prima', '789012345678', 'Renta',
    true, true, false, false,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 8: Claudia Rojas - Régimen General (Por Vencer - 2025-03-15)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, fechaFin, duracionMeses, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-008', 'emp-008', 'Plazo Fijo', 'GENERAL', 'PRESENCIAL',
    '2024-05-15', '2025-03-15', 10, 'Diseñadora Gráfica', 'Comercial', 'Creatividad',
    6, 48, 4800.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    0.00, 'AFP', 'Profuturo', '890123456789', 'Renta',
    true, true, true, true,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 9: Miguel Vega - Régimen General (Vigente)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-009', 'emp-009', 'Plazo Fijo', 'GENERAL', 'REMOTO',
    '2024-09-01', 'Practicante de Ingeniería', 'Tecnología', 'Desarrollo',
    5, 30, 1500.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    0.00, NULL, NULL, NULL, NULL,
    false, false, false, false,
    'VIGENTE', datetime('now'), datetime('now')
);

-- Contrato 10: Elizabeth Ramírez - Régimen General (Vencido)
INSERT INTO contracts (
    id, empleadoId, tipoContrato, regimenLaboral, modalidadContrato,
    fechaInicio, fechaFin, cargo, departamentoTrabajo, areaTrabajo,
    diasTrabajo, horasSemanales, salarioBase, tipoMoneda, formaPago, medioPago,
    asignacionFamiliar, afp, nombreAFP, cuspp, tipoSeguro,
    tieneCTS, tieneVacaciones, tieneGratificaciones, tieneUtilidades,
    estado, createdAt, updatedAt
) VALUES (
    'cont-010', 'emp-010', 'Indeterminado', 'GENERAL', 'PRESENCIAL',
    '2022-04-01', '2024-12-31', 'Contadora', 'Finanzas', 'Contabilidad',
    6, 48, 7500.00, 'PEN', 'MENSUAL', 'DEPOSITO',
    93.00, 'AFP', 'Habitat', '901234567890', 'Renta',
    true, true, true, true,
    'VENCIDO', datetime('now'), datetime('now')
);
