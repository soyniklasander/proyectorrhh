import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('@/views/employees/index.vue')
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: () => import('@/views/contracts/index.vue')
  },
  {
    path: '/payroll',
    name: 'Payroll',
    component: () => import('@/views/payroll/index.vue')
  },
  {
    path: '/overtime',
    name: 'Overtime',
    component: () => import('@/views/overtime/index.vue')
  },
  {
    path: '/loans',
    name: 'Loans',
    component: () => import('@/views/loans/index.vue')
  },
  {
    path: '/leaves',
    name: 'Leaves',
    component: () => import('@/views/leaves/index.vue')
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/NotFound.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/NotFound.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

export default routes
