-- ============================================
-- SEED DATA FOR MULTI-TENANT TESTING
-- ============================================

-- 1. Companies
INSERT INTO companies (id, ruc, razon_social, direccion_fiscal, representante_legal_nombre, representante_legal_dni, config) VALUES
('comp-a', '20100000001', 'RickCorp S.A.C.', '{"direccion": "Av. Siempreviva 123", "distrito": "Miraflores", "provincia": "Lima", "departamento": "Lima"}', 'Rick Sanchez', '08765432', '{"logo": "https://example.com/rick.png"}'),
('comp-b', '20200000002', 'Morty Imports S.R.L.', '{"direccion": "Jr. Citadel 456", "distrito": "San Isidro", "provincia": "Lima", "departamento": "Lima"}', 'Morty Smith', '12345678', '{"logo": "https://example.com/morty.png"}');

-- 2. Users (Password: password123)
INSERT INTO users (id, company_id, email, password_hash, nombres, role) VALUES
('user-super', NULL, 'super@rickerp.com', '$2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi', 'Super Admin', 'SUPER_ADMIN'),
('user-admin-a', 'comp-a', 'admin@rickcorp.com', '$2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi', 'Rick Admin', 'TENANT_ADMIN'),
('user-hr-a', 'comp-a', 'hr@rickcorp.com', '$2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi', 'Birdperson HR', 'OPERATOR'),
('user-admin-b', 'comp-b', 'admin@morty.com', '$2a$10$1z0BIE41nAkJJ1m9H6yKcueUMkZ0fr11f4bxXLf46tYD5OoF1Ecpi', 'Morty Admin', 'TENANT_ADMIN');

-- 3. Employees
INSERT INTO employees (id, company_id, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto, tipoDocumento, numeroDocumento, fechaNacimiento, estado, fechaIngreso) VALUES
('emp-a-1', 'comp-a', 'Summer', 'Smith', 'Sanchez', 'Summer Smith Sanchez', 'DNI', '44444444', '1998-01-01T00:00:00Z', 'ACTIVO', '2023-01-01T00:00:00Z'),
('emp-b-1', 'comp-b', 'Jerry', 'Smith', 'Doe', 'Jerry Smith Doe', 'DNI', '55555555', '1980-05-05T00:00:00Z', 'ACTIVO', '2023-02-01T00:00:00Z');
