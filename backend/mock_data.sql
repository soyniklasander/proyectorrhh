-- Insert mock data for attendance
INSERT INTO attendance (id, company_id, empleadoId, fecha, horaEntrada, horaSalida, estado, observaciones) VALUES
('att-001', 'comp-default', 'emp-001', '2024-02-04', '07:55', '18:10', 'PUNTUAL', '');
INSERT INTO attendance (id, company_id, empleadoId, fecha, horaEntrada, horaSalida, estado, observaciones) VALUES
('att-002', 'comp-default', 'emp-002', '2024-02-04', '08:45', '18:30', 'TARDE', 'Trafico');
INSERT INTO attendance (id, company_id, empleadoId, fecha, horaEntrada, horaSalida, estado, observaciones) VALUES
('att-003', 'comp-default', 'emp-003', '2024-02-04', '07:50', '18:00', 'PUNTUAL', '');
INSERT INTO attendance (id, company_id, empleadoId, fecha, horaEntrada, horaSalida, estado, observaciones) VALUES
('att-004', 'comp-default', 'emp-004', '2024-02-04', '08:00', '17:45', 'PUNTUAL', '');
INSERT INTO attendance (id, company_id, empleadoId, fecha, horaEntrada, horaSalida, estado, observaciones) VALUES
('att-005', 'comp-default', 'emp-005', '2024-02-04', '09:15', NULL, 'FALTA', 'No justificado');

-- Insert mock data for overtime
INSERT INTO overtime (id, company_id, empleadoId, fecha, horas, tipo, monto, motivo, estado) VALUES
('ot-001', 'comp-default', 'emp-001', '2024-02-03', 2, 'ORDINARIA', 50.00, 'Entrega de proyecto', 'APROBADA');
INSERT INTO overtime (id, company_id, empleadoId, fecha, horas, tipo, monto, motivo, estado) VALUES
('ot-002', 'comp-default', 'emp-002', '2024-02-02', 3, 'FERIADO', 150.00, 'Trabajo en feriado', 'PENDIENTE');
INSERT INTO overtime (id, company_id, empleadoId, fecha, horas, tipo, monto, motivo, estado) VALUES
('ot-003', 'comp-default', 'emp-003', '2024-02-01', 1, 'NOCTURNA', 30.00, 'Mantenimiento', 'APROBADA');
INSERT INTO overtime (id, company_id, empleadoId, fecha, horas, tipo, monto, motivo, estado) VALUES
('ot-004', 'comp-default', 'emp-004', '2024-02-03', 4, 'ORDINARIA', 100.00, 'Cierre mensual', 'PENDIENTE');

-- Insert mock data for vacations
INSERT INTO vacations (id, company_id, empleadoId, tipo, fechaInicio, fechaFin, dias, motivo, estado) VALUES
('vac-001', 'comp-default', 'emp-001', 'VACACIONES', '2024-02-15', '2024-02-24', 10, 'Vacaciones familiares', 'PENDIENTE');
INSERT INTO vacations (id, company_id, empleadoId, tipo, fechaInicio, fechaFin, dias, motivo, estado) VALUES
('vac-002', 'comp-default', 'emp-002', 'MEDICO', '2024-01-20', '2024-01-22', 3, 'Atencion medica', 'APROBADO');
INSERT INTO vacations (id, company_id, empleadoId, tipo, fechaInicio, fechaFin, dias, motivo, estado) VALUES
('vac-003', 'comp-default', 'emp-003', 'VACACIONES', '2024-03-01', '2024-03-10', 10, 'Viaje de descanso', 'PENDIENTE');
INSERT INTO vacations (id, company_id, empleadoId, tipo, fechaInicio, fechaFin, dias, motivo, estado) VALUES
('vac-004', 'comp-default', 'emp-004', 'PERSONAL', '2024-02-05', '2024-02-05', 1, 'Tramites personales', 'APROBADO');

-- Insert mock data for permits
INSERT INTO permits (id, company_id, empleadoId, tipo, fecha, horaInicio, horaFin, duracion, motivo, estado) VALUES
('perm-001', 'comp-default', 'emp-001', 'PERSONAL', '2024-02-06', '09:00', '11:00', '2h', 'Cita medica', 'PENDIENTE');
INSERT INTO permits (id, company_id, empleadoId, tipo, fecha, horaInicio, horaFin, duracion, motivo, estado) VALUES
('perm-002', 'comp-default', 'emp-002', 'COMISION', '2024-02-07', '08:00', '18:00', '10h', 'Reunion con cliente', 'APROBADO');
INSERT INTO permits (id, company_id, empleadoId, tipo, fecha, horaInicio, horaFin, duracion, motivo, estado) VALUES
('perm-003', 'comp-default', 'emp-003', 'CAPACITACION', '2024-02-08', '09:00', '13:00', '4h', 'Curso de Excel', 'APROBADO');
INSERT INTO permits (id, company_id, empleadoId, tipo, fecha, horaInicio, horaFin, duracion, motivo, estado) VALUES
('perm-004', 'comp-default', 'emp-004', 'MEDICO', '2024-02-05', '14:00', '17:00', '3h', 'Control medico', 'PENDIENTE');
