import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('@/views/employees/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: () => import('@/views/contracts/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contracts/new',
    name: 'Onboarding',
    component: () => import('@/views/contracts/Onboarding.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payroll',
    name: 'Payroll',
    component: () => import('@/views/payroll/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/overtime',
    name: 'Overtime',
    component: () => import('@/views/overtime/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/loans',
    name: 'Loans',
    component: () => import('@/views/loans/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leaves',
    name: 'Leaves',
    component: () => import('@/views/leaves/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/NotFound.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/companies',
    name: 'AdminCompanies',
    component: () => import('@/views/admin/Companies.vue'),
    meta: { requiresAuth: true, roles: ['SUPER_ADMIN'] }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Try to recover session if not present in memory but present in localstorage
  if (!authStore.isAuthenticated) {
    authStore.checkAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    if (authStore.isSuperAdmin) {
      next('/admin/companies')
    } else {
      next('/dashboard')
    }
  } else if (to.meta.roles && Array.isArray(to.meta.roles)) {
    // Check role access
    const requiredRoles = to.meta.roles as string[]
    if (authStore.user && requiredRoles.includes(authStore.user.role)) {
      next()
    } else {
      // Redirect unauthorized to dashboard or login
      next('/dashboard')
    }
  } else if ((to.path === '/dashboard' || to.path === '/') && authStore.isSuperAdmin) {
      // Redirect Super Admin away from tenant dashboard to their main view
      next('/admin/companies')
  } else {
    next()
  }
})

export default router
