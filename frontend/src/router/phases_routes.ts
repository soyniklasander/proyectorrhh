// ============================================
// RRHHMod - Routes Configuration
// Fases 3-6: Complete Router Structure
// ============================================

import { RouteRecordRaw } from 'vue-router'

// Placeholder imports (to be implemented)
const PayrollIndex = () => import('@/views/payroll/index.vue')
const LoansIndex = () => import('@/views/payroll/loans/index.vue')
const DiscountsIndex = () => import('@/views/payroll/discounts/index.vue')
const PayslipsIndex = () => import('@/views/payroll/payslips/index.vue')
const LiquidationsIndex = () => import('@/views/payroll/liquidations/index.vue')

const LegalIndex = () => import('@/views/legal/index.vue')
const RegimensIndex = () => import('@/views/legal/regimens/index.vue')
const ConceptsIndex = () => import('@/views/legal/concepts/index.vue')
const AFPIndex = () => import('@/views/legal/afp/index.vue')
const ESSALUDIndex = () => import('@/views/legal/essalud/index.vue')

const AdminCompanies = () => import('@/views/admin/companies/index.vue')
const AdminUsers = () => import('@/views/admin/users/index.vue')
const AdminAudit = () => import('@/views/admin/audit/index.vue')

const TaxSUNAT = () => import('@/views/tax/sunat/index.vue')
const TaxAFP = () => import('@/views/tax/afp/index.vue')
const TaxESSALUD = () => import('@/views/tax/essalud/index.vue')
const TaxMINTRA = () => import('@/views/tax/mintra/index.vue')

export const phasesRoutes: RouteRecordRaw[] = [
  // ========================================
  // FASE 3: NÓMINA Y BENEFICIOS
  // ========================================
  {
    path: '/payroll',
    name: 'Payroll',
    component: PayrollIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/loans',
    name: 'PayrollLoans',
    component: LoansIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/discounts',
    name: 'PayrollDiscounts',
    component: DiscountsIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/payslips',
    name: 'PayrollPayslips',
    component: PayslipsIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll/liquidations',
    name: 'PayrollLiquidations',
    component: LiquidationsIndex,
    meta: { requiresAuth: true }
  },

  // ========================================
  // FASE 4: CONFIGURACIÓN LEGAL
  // ========================================
  {
    path: '/legal',
    name: 'Legal',
    component: LegalIndex,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  },
  {
    path: '/legal/regimens',
    name: 'LegalRegimens',
    component: RegimensIndex,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  },
  {
    path: '/legal/concepts',
    name: 'LegalConcepts',
    component: ConceptsIndex,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  },
  {
    path: '/legal/afp',
    name: 'LegalAFP',
    component: AFPIndex,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  },
  {
    path: '/legal/essalud',
    name: 'LegalESSALUD',
    component: ESSALUDIndex,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  },

  // ========================================
  // FASE 5: ADMINISTRACIÓN
  // ========================================
  {
    path: '/admin/companies',
    name: 'AdminCompanies',
    component: AdminCompanies,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN'] }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN'] }
  },
  {
    path: '/admin/audit',
    name: 'AdminAudit',
    component: AdminAudit,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'CONTROL_INTERNO'] }
  },

  // ========================================
  // FASE 6: TRÁMITES FISCALES
  // ========================================
  {
    path: '/tax/sunat',
    name: 'TaxSUNAT',
    component: TaxSUNAT,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  },
  {
    path: '/tax/afp',
    name: 'TaxAFP',
    component: TaxAFP,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  },
  {
    path: '/tax/essalud',
    name: 'TaxESSALUD',
    component: TaxESSALUD,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  },
  {
    path: '/tax/mintra',
    name: 'TaxMINTRA',
    component: TaxMINTRA,
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'RRHH'] }
  }
]

// ============================================
// API ENDPOINTS STRUCTURE
// ============================================
export const apiEndpoints = {
  // FASE 3: NÓMINA
  payroll: {
    loans: {
      GET: '/payroll/loans',
      POST: '/payroll/loans',
      PUT: '/payroll/loans/:id',
      DELETE: '/payroll/loans/:id',
      CUOTAS: '/payroll/loans/:id/cuotas'
    },
    discounts: {
      EMPLOYEE: '/payroll/discounts/employee',
      TYPES: '/payroll/discounts/types',
      CREATE_TYPE: '/payroll/discounts/types',
      UPDATE_TYPE: '/payroll/discounts/types/:id'
    },
    payslips: {
      GET: '/payroll/payslips',
      GET_BY_PERIOD: '/payroll/payslips?period=:period',
      GET_BY_EMPLOYEE: '/payroll/payslips?employeeId=:id',
      EXPORT: '/payroll/payslips/export',
      GENERATE: '/payroll/payslips/generate'
    },
    liquidations: {
      GET: '/payroll/liquidations',
      POST: '/payroll/liquidations',
      GET_BY_ID: '/payroll/liquidations/:id',
      CALCULATE: '/payroll/liquidations/calculate',
      EXPORT: '/payroll/liquidations/:id/export',
      APPROVE: '/payroll/liquidations/:id/approve'
    }
  },

  // FASE 4: LEGAL
  legal: {
    regimens: {
      GET: '/legal/regimens',
      POST: '/legal/regimens',
      PUT: '/legal/regimens/:id',
      DELETE: '/legal/regimens/:id'
    },
    concepts: {
      GET: '/legal/concepts',
      POST: '/legal/concepts',
      PUT: '/legal/concepts/:id',
      DELETE: '/legal/concepts/:id',
      BY_TYPE: '/legal/concepts?type=:type'
    },
    afp: {
      GET: '/legal/afp',
      POST: '/legal/afp',
      PUT: '/legal/afp/:id',
      RATES: '/legal/afp/rates',
      UPDATE_RATE: '/legal/afp/rates'
    },
    essalud: {
      GET: '/legal/essalud',
      PUT: '/legal/essalud',
      ENTITIES: '/legal/essalud/entities'
    },
    templates: {
      GET: '/legal/templates',
      POST: '/legal/templates',
      PUT: '/legal/templates/:id',
      DELETE: '/legal/templates/:id',
      PREVIEW: '/legal/templates/:id/preview'
    }
  },

  // FASE 5: ADMIN
  admin: {
    companies: {
      GET: '/admin/companies',
      POST: '/admin/companies',
      PUT: '/admin/companies/:id',
      DELETE: '/admin/companies/:id',
      USERS: '/admin/companies/:id/users',
      ACTIVATE: '/admin/companies/:id/activate',
      SUSPEND: '/admin/companies/:id/suspend'
    },
    users: {
      GET: '/admin/users',
      POST: '/admin/users',
      PUT: '/admin/users/:id',
      DELETE: '/admin/users/:id',
      RESET_PASSWORD: '/admin/users/:id/reset-password',
      CHANGE_ROL: '/admin/users/:id/role'
    },
    audit: {
      GET: '/admin/audit',
      GET_BY_USER: '/admin/audit?userId=:id',
      GET_BY_MODULE: '/admin/audit?module=:module',
      GET_BY_DATE: '/admin/audit?start=:start&end=:end',
      EXPORT: '/admin/audit/export'
    }
  },

  // FASE 6: TAX
  tax: {
    sunat: {
      DECLARATIONS: '/tax/sunat/declarations',
      GET_DECLARATION: '/tax/sunat/declarations/:id',
      CREATE_DECLARATION: '/tax/sunat/declarations',
      EXPORT_DECLARATION: '/tax/sunat/declarations/:id/export',
      MARK_PAID: '/tax/sunat/declarations/:id/paid'
    },
    mintra: {
      T_REGISTRO: '/tax/mintra/tregistro',
      T_LIBRETA: '/tax/mintra/tlibreta',
      GENERATE_T_REGISTRO: '/tax/mintra/tregistro/generate',
      GENERATE_T_LIBRETA: '/tax/mintra/tlibreta/generate',
      SEND_T_REGISTRO: '/tax/mintra/tregistro/:id/send',
      CERTIFICATES: '/tax/mintra/certificates',
      GENERATE_CERTIFICATE: '/tax/mintra/certificates/generate'
    }
  }
}
