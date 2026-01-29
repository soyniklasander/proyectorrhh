import { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      requiresAuth: false,
      title: 'Iniciar Sesión'
    }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: 'Panel Principal'
    }
  },
  {
    path: '/empleados',
    name: 'Employees',
    component: () => import('@/views/employees/EmployeesList.vue'),
    meta: {
      requiresAuth: true,
      title: 'Empleados'
    }
  },
  {
    path: '/empleados/nuevo',
    name: 'NewEmployee',
    component: () => import('@/views/employees/EmployeeForm.vue'),
    meta: {
      requiresAuth: true,
      title: 'Nuevo Empleado'
    }
  },
  {
    path: '/empleados/:id',
    name: 'EmployeeDetail',
    component: () => import('@/views/employees/EmployeeDetail.vue'),
    meta: {
      requiresAuth: true,
      title: 'Detalle de Empleado'
    }
  },
  {
    path: '/contratos',
    name: 'Contracts',
    component: () => import('@/views/contracts/ContractsList.vue'),
    meta: {
      requiresAuth: true,
      title: 'Contratos'
    }
  },
  {
    path: '/horas-extras',
    name: 'Overtime',
    component: () => import('@/views/overtime/OvertimeList.vue'),
    meta: {
      requiresAuth: true,
      title: 'Horas Extras'
    }
  },
  {
    path: '/prestamos',
    name: 'Loans',
    component: () => import('@/views/loans/LoansList.vue'),
    meta: {
      requiresAuth: true,
      title: 'Préstamos'
    }
  },
  {
    path: '/planilla',
    name: 'Payroll',
    component: () => import('@/views/payroll/PayrollList.vue'),
    meta: {
      requiresAuth: true,
      title: 'Planilla'
    }
  },
  {
    path: '/vacaciones',
    name: 'Leaves',
    component: () => import('@/views/leaves/LeavesList.vue'),
    meta: {
      requiresAuth: true,
      title: 'Vacaciones y Permisos'
    }
  },
  {
    path: '/asistencia',
    name: 'Attendance',
    component: () => import('@/views/attendance/AttendanceList.vue'),
    meta: {
      requiresAuth: true,
      title: 'Control de Asistencia'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      requiresAuth: false,
      title: 'Página no encontrada'
    }
  }
]

export default routes