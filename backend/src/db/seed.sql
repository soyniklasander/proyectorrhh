-- Seed Data for ERPRick

-- 1. Tenants
INSERT INTO tenants (id, name, status, subscription_plan) VALUES
('tenant-rick-001', 'Grupo Gastronómico Rick', 'ACTIVE', 'ENTERPRISE');

-- 2. Users
-- Super Admin (No Tenant, or linked to system tenant if logic requires, but prompt says Nullable for SuperAdmin)
INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES
('user-super-001', 'super@erprick.com', '$2a$10$NyToHRkk72AXivvdjLeKJuZCnHst2uT//zgWZDHxFdR7kud.S1rEy', 'SUPER_ADMIN', NULL);

-- Client User
INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES
('user-client-001', 'gerente@lalucha.com', '$2a$10$BkYxvH0EQyhmFsxZPRsfweYlSIzL3Ua.oFBVgSA3ifh3ypdL6rds2', 'TENANT_ADMIN', 'tenant-rick-001');

-- 3. Legal Entities
INSERT INTO legal_entities (id, tenant_id, ruc, business_name, regime) VALUES
('le-001', 'tenant-rick-001', '20100123456', 'Rick Foods SAC', 'GENERAL_728'),
('le-002', 'tenant-rick-001', '20600987654', 'La Lucha Partners SAC', 'MYPE_PEQUENA');

-- 4. Venues (Sedes)
INSERT INTO venues (id, tenant_id, name, cost_center_code) VALUES
('venue-001', 'tenant-rick-001', 'Local Miraflores', 'CC-MIRA-01');

-- 5. Employees
INSERT INTO employees (id, tenant_id, current_venue_id, full_name, dni, basic_salary, has_children, pension_system) VALUES
('emp-001', 'tenant-rick-001', 'venue-001', 'Juan Perez', '45890123', 1500.00, 1, 'AFP_INTEGRA'),
('emp-002', 'tenant-rick-001', 'venue-001', 'Maria Rodriguez', '08991234', 2500.00, 0, 'ONP'),
('emp-003', 'tenant-rick-001', 'venue-001', 'Carlos Ruiz', '74829103', 1200.00, 0, 'AFP_INTEGRA');

-- 6. Logic Matrix
INSERT INTO logic_matrix (id, tenant_id, venue_id, shift, target_legal_entity_id) VALUES
('lm-001', 'tenant-rick-001', 'venue-001', 'MORNING', 'le-001'),
('lm-002', 'tenant-rick-001', 'venue-001', 'NIGHT', 'le-002');
