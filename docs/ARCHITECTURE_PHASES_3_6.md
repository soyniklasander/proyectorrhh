# 📋 ARQUITECTURA RRHHMod ERP - Fases 3-6

## 📁 ESTRUCTURA DE DIRECTORIOS

```
frontend/src/
├── views/
│   ├── payroll/                    # FASE 3: Nómina y Beneficios
│   │   ├── loans/index.vue         # Préstamos al personal
│   │   ├── discounts/index.vue     # Descuentos
│   │   ├── payslips/index.vue      # Boletas de pago
│   │   └── liquidations/index.vue  # Liquidaciones
│   │
│   ├── legal/                     # FASE 4: Configuración Legal
│   │   ├── regimens/index.vue      # Regímenes laborales
│   │   ├── concepts/index.vue      # Conceptos de nómina
│   │   ├── afp/index.vue          # AFP
│   │   └── essalud/index.vue      # ESSALUD
│   │
│   ├── admin/                     # FASE 5: Administración
│   │   ├── companies/index.vue     # Gestión de empresas
│   │   ├── users/index.vue         # Usuarios y roles
│   │   └── audit/index.vue         # Auditoría
│   │
│   └── tax/                       # FASE 6: Trámites Fiscales
│       ├── sunat/index.vue         # Declaraciones SUNAT
│       ├── afp/index.vue          # Reportes AFP
│       ├── essalud/index.vue       # ESSALUD
│       └── mintra/index.vue        # MINTRA (T-Registro, T-Libreta)
│
├── services/
│   ├── payroll.service.ts          # FASE 3
│   ├── legal.service.ts            # FASE 4
│   ├── admin.service.ts             # FASE 5
│   └── tax.service.ts              # FASE 6
│
└── components/
    ├── payroll/                    # Componentes compartidos FASE 3
    ├── legal/                      # Componentes compartidos FASE 4
    ├── admin/                      # Componentes compartidos FASE 5
    └── tax/                        # Componentes compartidos FASE 6
```

---

## 🗄️ MODELO DE DATOS (SQL)

### FASE 3: NÓMINA Y BENEFICIOS

| Tabla | Descripción | Claves Foráneas |
|-------|-------------|----------------|
| `payroll_loans` | Préstamos de empleados | empleado_id → employees |
| `payroll_loan_cuotas` | Cuotas de préstamos | loan_id → payroll_loans |
| `payroll_employee_discounts` | Descuentos por empleado | empleado_id → employees, tipo_descuento_id |
| `payroll_discount_types` | Catálogo de tipos de descuento | - |
| `payroll_payslips` | Boletas de pago generadas | empleado_id → employees, company_id |
| `payroll_liquidations` | Liquidaciones | empleado_id → employees, company_id |

### FASE 4: CONFIGURACIÓN LEGAL

| Tabla | Descripción | Claves Foráneas |
|-------|-------------|----------------|
| `legal_regimens` | Regímenes laborales (728, CAS, CPP) | company_id |
| `legal_concepts` | Conceptos de nómina | company_id |
| `legal_afp` | AFP y tasas | company_id |
| `legal_essalud` | Configuración ESSALUD | company_id |
| `legal_templates` | Plantillas legales | company_id |

### FASE 5: ADMINISTRACIÓN

| Tabla | Descripción | Claves Foráneas |
|-------|-------------|----------------|
| `admin_companies` | Empresas/Tenants | - |
| `admin_users` | Usuarios por empresa | company_id → admin_companies |
| `admin_audit_log` | Log de auditoría | company_id, user_id |

### FASE 6: TRÁMITES FISCALES

| Tabla | Descripción | Claves Foráneas |
|-------|-------------|----------------|
| `tax_sunat_declarations` | Declaraciones SUNAT (PLAME, PDT) | company_id |
| `tax_mintra_tregistro` | T-Registro MINTRA | company_id |
| `tax_mintra_tlibreta` | T-Libreta MINTRA | company_id, empleado_id → employees |
| `tax_certificates` | Certificados y constancias | company_id, empleado_id |

---

## 🔗 RELACIONES ENTRE MÓDULOS

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMPLEADO                                  │
│                              │                                    │
│              ┌───────────────┼───────────────┐                     │
│              │               │               │                     │
│              ▼               ▼               ▼                     │
│         ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│         │ NÓMINA  │    │ LEGAL   │    │  TAX    │             │
│         └────┬────┘    └────┬────┘    └────┬────┘             │
│              │               │               │                     │
│              ▼               │               ▼                     │
│    ┌─────────────────┐     │    ┌─────────────────┐           │
│    │ payroll_payslips│     │    │ tax_certificates│           │
│    │ payroll_loans   │     │    │ tax_mintra_*    │           │
│    │ payroll_liquidations│   │    │ tax_sunat_*    │           │
│    └─────────────────┘     │    └─────────────────┘           │
│                            │                                  │
│              ┌──────────────┴──────────────┐                   │
│              │                             │                    │
│              ▼                             ▼                    │
│    ┌─────────────────┐           ┌─────────────────┐         │
│    │ legal_concepts  │           │ admin_audit_log │         │
│    │ legal_regimens  │           │ admin_users     │         │
│    └─────────────────┘           └─────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API ENDPOINTS

### FASE 3: NÓMINA

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/v1/payroll/loans` | Lista préstamos | RRHH |
| POST | `/api/v1/payroll/loans` | Crear préstamo | RRHH |
| PUT | `/api/v1/payroll/loans/:id` | Actualizar | RRHH |
| DELETE | `/api/v1/payroll/loans/:id` | Eliminar | Admin |
| GET | `/api/v1/payroll/payslips` | Lista boletas | RRHH |
| POST | `/api/v1/payroll/payslips/generate` | Generar planilla | RRHH |
| POST | `/api/v1/payroll/payslips/export` | Exportar CSV | RRHH |
| GET | `/api/v1/payroll/liquidations` | Lista liquidaciones | RRHH |
| POST | `/api/v1/payroll/liquidations` | Crear liquidación | RRHH |
| POST | `/api/v1/payroll/liquidations/calculate` | Calcular monto | RRHH |

### FASE 4: LEGAL

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/v1/legal/regimens` | Lista regímenes | RRHH |
| POST | `/api/v1/legal/regimens` | Crear régimen | Admin |
| GET | `/api/v1/legal/concepts` | Lista conceptos | RRHH |
| POST | `/api/v1/legal/concepts` | Crear concepto | Admin |
| GET | `/api/v1/legal/afp` | Lista AFP | RRHH |
| PUT | `/api/v1/legal/afp/rates` | Actualizar tasas | Admin |
| GET | `/api/v1/legal/essalud` | Config ESSALUD | RRHH |
| PUT | `/api/v1/legal/essalud` | Actualizar ESSALUD | Admin |

### FASE 5: ADMIN

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/v1/admin/companies` | Lista empresas | Super Admin |
| POST | `/api/v1/admin/companies` | Crear empresa | Super Admin |
| PUT | `/api/v1/admin/companies/:id` | Actualizar | Super Admin |
| GET | `/api/v1/admin/users` | Lista usuarios | Admin |
| POST | `/api/v1/admin/users` | Crear usuario | Admin |
| PUT | `/api/v1/admin/users/:id/role` | Cambiar rol | Super Admin |
| GET | `/api/v1/admin/audit` | Log auditoría | Control Interno |
| POST | `/api/v1/admin/audit/export` | Exportar | Control Interno |

### FASE 6: TAX

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | `/api/v1/tax/sunat/declarations` | Declaraciones | RRHH |
| POST | `/api/v1/tax/sunat/declarations` | Nueva declaración | RRHH |
| POST | `/api/v1/tax/sunat/declarations/:id/export` | Exportar | RRHH |
| POST | `/api/v1/tax/mintra/tregistro/generate` | Generar T-Registro | RRHH |
| POST | `/api/v1/tax/mintra/tlibreta/generate` | Generar T-Libreta | RRHH |
| GET | `/api/v1/tax/mintra/certificates` | Certificados | RRHH |
| POST | `/api/v1/tax/mintra/certificates/generate` | Generar certificado | RRHH |

---

## 👥 ROLES Y PERMISOS

| Rol | FASE 3 | FASE 4 | FASE 5 | FASE 6 |
|-----|---------|---------|--------|--------|
| SUPER_ADMIN | - | Configurar | Todo | Todo |
| ADMIN | Crear/Editar | Configurar | Usuarios | Exportar |
| RRHH | Todo | Ver | - | Todo |
| GERENCIA | Ver | Ver | - | Ver |
| CONTROL_INTERNO | Ver | Ver | Auditoría | Ver |
| SUPERVISOR | Ver | Ver | - | - |

---

## 📊 FLUJOS DE TRABAJO

### FASE 3: Generar Nómina
```
1. Seleccionar período
2. Ver empleados activos
3. Revisar conceptos (legal_concepts)
4. Generar boletas (payroll_payslips)
5. Aprobar
6. Exportar a Payroll
7. Archivar en audit_log
```

### FASE 4: Configurar Régimen
```
1. Seleccionar régimen (legal_regimens)
2. Configurar tasas AFP (legal_afp)
3. Configurar ESSALUD (legal_essalud)
4. Definir conceptos (legal_concepts)
5. Crear plantillas (legal_templates)
```

### FASE 5: Crear Empresa
```
1. Crear empresa (admin_companies)
2. Crear usuario admin (admin_users)
3. Asignar rol
4. Configurar régimen (legal_regimens)
5. Auditoría (admin_audit_log)
```

### FASE 6: Declaración SUNAT
```
1. Generar T-Registro (tax_mintra_tregistro)
2. Generar T-Libreta (tax_mintra_tlibreta)
3. Generar PLAME (tax_sunat_declarations)
4. Exportar archivos
5. Presentar a SUNAT
6. Marcar como pagado
```

---

## 🔧 PRÓXIMOS PASOS DE IMPLEMENTACIÓN

### FASE 3 (Inmediato)
- [ ] Implementar LoansIndex.vue
- [ ] Implementar DiscountsIndex.vue
- [ ] Implementar PayslipsIndex.vue
- [ ] Implementar LiquidationsIndex.vue
- [ ] Crear endpoints API payroll

### FASE 4 (Corto plazo)
- [ ] Implementar RegimensIndex.vue
- [ ] Implementar ConceptsIndex.vue
- [ ] Implementar AFPIndex.vue
- [ ] Implementar ESSALUDIndex.vue
- [ ] Crear endpoints API legal

### FASE 5 (Mediano plazo)
- [ ] Implementar AdminUsers.vue
- [ ] Mejorar AdminAudit.vue
- [ ] Crear endpoints API admin

### FASE 6 (Largo plazo)
- [ ] Implementar TaxSUNAT.vue
- [ ] Implementar TaxMINTRA.vue
- [ ] Crear endpoints API tax
- [ ] Integración con servicios externos

---

## ✅ ESTADO ACTUAL

| Fase | Vistas | Backend | Schema |
|------|--------|---------|--------|
| FASE 1: Personal | ✅ Completas | ✅ | ✅ |
| FASE 2: Tiempo | ✅ Completas | ✅ | ✅ |
| FASE 3: Nómina | 🏗️ Estructura | 🏗️ Estructura | ✅ |
| FASE 4: Legal | 🏗️ Estructura | 🏗️ Estructura | ✅ |
| FASE 5: Admin | 🏗️ Estructura | 🏗️ Estructura | ✅ |
| FASE 6: Tax | 🏗️ Estructura | 🏗️ Estructura | ✅ |

---

**Generado:** Febrero 2026
**Versión:** 1.0.0
**Estado:** Arquitectura Completa - Listo para Implementación
