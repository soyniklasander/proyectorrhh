-- ============================================
-- SEED DATA FOR MULTI-TENANT TESTING (EXTENDED)
-- ============================================

-- 1. Companies
INSERT INTO companies (id, ruc, razon_social, direccion_fiscal, representante_legal_nombre, representante_legal_dni, config) VALUES
('comp-a', '20100000001', 'RickCorp S.A.C.', '{"direccion": "Av. Siempreviva 123", "distrito": "Miraflores", "provincia": "Lima", "departamento": "Lima"}', 'Rick Sanchez', '08765432', '{"logo": "https://example.com/rick.png"}'),
('comp-b', '20200000002', 'Morty Imports S.R.L.', '{"direccion": "Jr. Citadel 456", "distrito": "San Isidro", "provincia": "Lima", "departamento": "Lima"}', 'Morty Smith', '12345678', '{"logo": "https://example.com/morty.png"}');

-- 2. Users (Password: password123)
-- Hash: $2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi
INSERT INTO users (id, company_id, email, password_hash, nombres, role) VALUES
('user-super', NULL, 'super@rickerp.com', '$2b$10$.GbIz.a8KO5gPWvZCDV0FepIne1zTyLi/OCmYSRjxw0X.siZ8aCYe', 'Super Admin', 'SUPER_ADMIN'),
('user-admin-a', 'comp-a', 'admin@rickcorp.com', '$2b$10$.GbIz.a8KO5gPWvZCDV0FepIne1zTyLi/OCmYSRjxw0X.siZ8aCYe', 'Rick Admin', 'TENANT_ADMIN'),
('user-hr-a', 'comp-a', 'hr@rickcorp.com', '$2b$10$.GbIz.a8KO5gPWvZCDV0FepIne1zTyLi/OCmYSRjxw0X.siZ8aCYe', 'Birdperson HR', 'OPERATOR'),
('user-admin-b', 'comp-b', 'admin@morty.com', '$2b$10$.GbIz.a8KO5gPWvZCDV0FepIne1zTyLi/OCmYSRjxw0X.siZ8aCYe', 'Morty Admin', 'TENANT_ADMIN');

-- 3. Contract Templates (Basic)
INSERT INTO contract_templates (id, company_id, nombre, codigo, regimenLaboral, plantillaTexto, estado) VALUES
('tmpl-001', NULL, 'Contrato Plazo Indeterminado (General)', 'INDETERMINADO', 'GENERAL', 'CONTRATO DE TRABAJO A PLAZO INDETERMINADO\n\nConste por el presente documento, el contrato de trabajo que celebran de una parte {{NOMBRE_EMPRESA}}, con RUC N° {{RUC_EMPRESA}}, con domicilio en {{DIRECCION_EMPRESA}}, debidamente representada por su Gerente General {{NOMBRE_GERENTE}}, identificado con DNI N° {{DNI_GERENTE}}, a quien en adelante se le denominará EL EMPLEADOR; y de la otra parte {{NOMBRE_COMPLETO}}, identificado con {{TIPO_DOCUMENTO}} N° {{NUMERO_DOCUMENTO}}, con domicilio en {{DIRECCION}}, a quien en adelante se le denominará EL TRABAJADOR.\n\nPRIMERA: EL EMPLEADOR es una empresa dedicada a actividades comerciales.\n\nSEGUNDA: EL TRABAJADOR desempeñará el cargo de {{CARGO}}, realizando las siguientes funciones...\n\nTERCERA: La remuneración será de S/ {{SALARIO_BASE}} mensuales.\n\nFirma: {{NOMBRE_COMPLETO}} - DNI: {{NUMERO_DOCUMENTO}}', 'ACTIVO'),
('tmpl-002', NULL, 'Contrato Plazo Fijo (Microempresa)', 'MICRO', 'MICROEMPRESA', 'CONTRATO DE TRABAJO SUJETO A MODALIDAD\n\n(Régimen Especial de la Microempresa)\n\nConste por el presente...\n\nCLÁUSULA DE BENEFICIOS: El presente contrato se rige por el D.L. 1086, Ley MYPE.\n\nFirma: {{NOMBRE_COMPLETO}}', 'ACTIVO');

-- 4. Employees
INSERT INTO employees (id, company_id, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto, tipoDocumento, numeroDocumento, fechaNacimiento, estado, fechaIngreso, email) VALUES
-- RickCorp (5)
('emp-a-1', 'comp-a', 'Summer', 'Smith', 'Sanchez', 'Summer Smith Sanchez', 'DNI', '44444444', '1998-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'summer@rickcorp.com'),
('emp-a-2', 'comp-a', 'Beth', 'Smith', 'Sanchez', 'Beth Smith Sanchez', 'DNI', '44444445', '1985-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'beth@rickcorp.com'),
('emp-a-3', 'comp-a', 'Bird', 'Person', 'Phoenix', 'Bird Person', 'CE', '00000001', '1980-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'bp@rickcorp.com'),
('emp-a-4', 'comp-a', 'Squanchy', 'Cat', 'Alien', 'Squanchy Cat', 'DNI', '44444446', '1990-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'squanchy@rickcorp.com'),
('emp-a-5', 'comp-a', 'Mr.', 'Poopybutthole', 'Oowee', 'Mr. Poopybutthole', 'DNI', '44444447', '1995-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z', 'poopy@rickcorp.com'),

-- Morty Imports (5)
('emp-b-1', 'comp-b', 'Jerry', 'Smith', 'Doe', 'Jerry Smith Doe', 'DNI', '55555555', '1980-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'jerry@morty.com'),
('emp-b-2', 'comp-b', 'Jessica', 'W.', 'Redhead', 'Jessica W.', 'DNI', '55555556', '1998-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'jessica@morty.com'),
('emp-b-3', 'comp-b', 'Brad', 'Kickoff', 'Jock', 'Brad Kickoff', 'DNI', '55555557', '1998-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'brad@morty.com'),
('emp-b-4', 'comp-b', 'Ethan', 'Ex', 'Boyfriend', 'Ethan Ex', 'DNI', '55555558', '1998-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'ethan@morty.com'),
('emp-b-5', 'comp-b', 'Tammy', 'Gueterman', 'Spy', 'Tammy Gueterman', 'DNI', '55555559', '1995-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z', 'tammy@morty.com');

-- 5. Contracts
INSERT INTO contracts (id, company_id, empleadoId, tipoContrato, regimenLaboral, cargo, salarioBase, fechaInicio, estado) VALUES
('cont-a-1', 'comp-a', 'emp-a-1', 'PLAZO_FIJO', 'GENERAL', 'Asistente de Laboratorio', 2500.00, '2023-01-01T00:00:00Z', 'VIGENTE'),
('cont-a-2', 'comp-a', 'emp-a-2', 'INDETERMINADO', 'GENERAL', 'Veterinaria de Caballos', 5000.00, '2023-01-01T00:00:00Z', 'VIGENTE'),
('cont-b-1', 'comp-b', 'emp-b-1', 'INDETERMINADO', 'GENERAL', 'Gerente de Nada', 1025.00, '2023-02-01T00:00:00Z', 'VIGENTE');
