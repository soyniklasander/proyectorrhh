<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentPath = ref(router.currentRoute.value.path)

// Navigation items
interface NavItem {
  path?: string
  icon?: string
  label?: string
  divider?: boolean
}

const navItems = ref<NavItem[]>([
  { path: '/superadmin', icon: 'dashboard', label: 'Vista General' },
  { path: '/superadmin/tenants', icon: 'domain', label: 'Marcas / Tenants' },
  { path: '/superadmin/subscriptions', icon: 'payments', label: 'Suscripciones' },
  { path: '/superadmin/users', icon: 'people', label: 'Usuarios Globales' },
  { divider: true },
  { path: '/superadmin/settings', icon: 'settings', label: 'Configuración' },
  { path: '/superadmin/audit', icon: 'security', label: 'Logs de Auditoría' }
])

const isActive = (path: string) => {
  return currentPath.value === path
}

const navigateTo = (path: string) => {
  currentPath.value = path
  router.push(path)
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700/50 flex-shrink-0 flex flex-col h-screen fixed md:relative z-30 transition-all duration-300">
      <!-- Logo Area -->
      <div class="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
            N
          </div>
          <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">NexaCorp</span>
        </div>
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <template v-for="item in navItems" :key="item.path || item.label">
          <div v-if="item.divider" class="px-3 mt-8 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sistema</div>
          <button
            v-else-if="item.path"
            @click="navigateTo(item.path!)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group text-left"
            :class="isActive(item.path!) 
              ? 'bg-primary/10 text-primary dark:text-blue-400 font-medium' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            <span class="material-icons text-xl" :class="!isActive(item.path!) ? 'group-hover:text-primary dark:group-hover:text-blue-400 transition-colors' : ''">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </template>
      </nav>
      
      <!-- User Profile -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-700/50">
        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
          <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative border-2 border-slate-100 dark:border-slate-600">
            <img 
              alt="Admin Profile" 
              class="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuClRIpG0HAtoXr9qaUMrKN5pspUw08e4sOWMfcsVer2_0FhOUdDdcOOtmZRh8CkYtqtpHeFFj9_FVHqTjf4Qm5LqjZvx1kYewQa4fd4tEfi4I7xL2jYWhiIDpNScU-44BWMCFWRNo6f1zdz0Lth5xiVrTcF-Pu38ze2xIcoQ72WX9VJQY4liVL5vcuzs1Ro8SHIzbTi_9HfKG2LA1MSCjkG73gsBx37d6mKJiZMvjVddj8nDyyw6d-Wvn57eg8izt-_7vw95ebpjxn9" 
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 dark:text-white truncate">Carlos R.</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">Super Admin</p>
          </div>
          <span class="material-icons text-slate-400 text-lg">more_vert</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark relative">
      <!-- Header Top Bar -->
      <header class="h-16 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-6 z-20 shadow-sm">
        <div class="flex items-center gap-4">
          <button class="md:hidden text-slate-500 hover:text-primary">
            <span class="material-icons">menu</span>
          </button>
          <div class="hidden md:flex flex-col">
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Panel de Control</h1>
            <div class="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-2">
              <span>Inicio</span>
              <span class="material-icons text-[10px]">chevron_right</span>
              <span class="text-primary dark:text-blue-400 font-medium">Dashboard</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <!-- Search -->
          <div class="relative hidden md:block w-64">
            <span class="material-icons absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
            <input 
              class="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400" 
              placeholder="Buscar tenant, usuario..." 
              type="text"
            />
          </div>
          <!-- Notification Bell -->
          <button class="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
            <span class="material-icons">notifications</span>
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-surface-dark"></span>
          </button>
          <!-- Create Button -->
          <button class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <span class="material-icons text-lg">add</span>
            <span class="hidden sm:inline">Nueva Marca</span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <slot />
    </main>
  </div>
</template>
