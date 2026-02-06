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
  }
}
