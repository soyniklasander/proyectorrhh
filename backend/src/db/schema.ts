import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

// Tablas Globales (System)

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  subscription_plan: text('subscription_plan'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role', { enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'EMPLOYEE'] }).notNull(),
  tenant_id: text('tenant_id').references(() => tenants.id),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  tenantIdIdx: index('users_tenant_id_idx').on(table.tenant_id),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenant_id],
    references: [tenants.id],
  }),
}));

// Tablas del Tenant (Tenant Scoped Data)

export const legalEntities = sqliteTable('legal_entities', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  ruc: text('ruc', { length: 11 }).notNull(),
  business_name: text('business_name').notNull(),
  regime: text('regime', { enum: ['GENERAL_728', 'MYPE_PEQUENA'] }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  tenantIdIdx: index('legal_entities_tenant_id_idx').on(table.tenant_id),
}));

export const venues = sqliteTable('venues', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  cost_center_code: text('cost_center_code'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  tenantIdIdx: index('venues_tenant_id_idx').on(table.tenant_id),
}));

export const employees = sqliteTable('employees', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  current_venue_id: text('current_venue_id').references(() => venues.id),
  full_name: text('full_name').notNull(),
  dni: text('dni').notNull(),
  basic_salary: integer('basic_salary').notNull(),
  has_children: integer('has_children', { mode: 'boolean' }).notNull().default(false),
  pension_system: text('pension_system', { enum: ['AFP_INTEGRA', 'ONP'] }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  tenantIdIdx: index('employees_tenant_id_idx').on(table.tenant_id),
  venueIdIdx: index('employees_venue_id_idx').on(table.current_venue_id),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
  venue: one(venues, {
    fields: [employees.current_venue_id],
    references: [venues.id],
  }),
}));

export const logicMatrix = sqliteTable('logic_matrix', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  venue_id: text('venue_id').notNull().references(() => venues.id),
  shift: text('shift', { enum: ['MORNING', 'NIGHT'] }).notNull(),
  target_legal_entity_id: text('target_legal_entity_id').notNull().references(() => legalEntities.id),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  tenantIdIdx: index('logic_matrix_tenant_id_idx').on(table.tenant_id),
  venueIdIdx: index('logic_matrix_venue_id_idx').on(table.venue_id),
  targetLegalEntityIdIdx: index('logic_matrix_target_legal_entity_id_idx').on(table.target_legal_entity_id),
}));

// Tabla para manejar "Otros Descuentos" y "Retenciones Judiciales"
export const financialIncidents = sqliteTable('financial_incidents', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  employee_id: text('employee_id').notNull().references(() => employees.id),
  type: text('type', { enum: ['LOAN', 'JUDICIAL', 'ADVANCE'] }).notNull(),
  description: text('description'),
  amount: integer('amount').notNull(), // Amount in cents
  installments_total: integer('installments_total').notNull().default(1),
  installments_paid: integer('installments_paid').notNull().default(0),
  status: text('status', { enum: ['ACTIVE', 'PAID', 'CANCELLED'] }).notNull().default('ACTIVE'),
  start_date: integer('start_date', { mode: 'timestamp' }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  tenantIdIdx: index('financial_incidents_tenant_id_idx').on(table.tenant_id),
  employeeIdIdx: index('financial_incidents_employee_id_idx').on(table.employee_id),
}));

export const financialIncidentsRelations = relations(financialIncidents, ({ one }) => ({
  employee: one(employees, {
    fields: [financialIncidents.employee_id],
    references: [employees.id],
  }),
}));
