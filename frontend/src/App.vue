<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>

            <n-layout has-sider class="app-layout" v-if="!isFullScreen">
              <!-- Sidebar Apple Style -->
              <n-layout-sider
                bordered
                collapse-mode="width"
                :collapsed-width="64"
                :width="240"
                :collapsed="collapsed"
                show-trigger
                @collapse="collapsed = true"
                @expand="collapsed = false"
                :native-scrollbar="false"
                class="apple-sidebar"
              >
                <!-- Logo -->
                <div class="apple-sidebar-logo" :class="{ 'collapsed': collapsed }">
                  <div class="apple-sidebar-logo-icon">
                    <n-icon size="18"><PeopleOutline /></n-icon>
                  </div>
                  <span v-if="!collapsed" class="apple-sidebar-logo-text">RickERP</span>
                </div>
                
                <!-- Navigation -->
                <n-menu
                  v-model:value="activeKey"
                  :collapsed="collapsed"
                  :collapsed-width="64"
                  :collapsed-icon-size="22"
                  :options="menuOptions"
                  @update:value="handleMenuClick"
                  class="apple-nav"
                />
              </n-layout-sider>
              
              <!-- Main Content -->
              <n-layout class="main-layout">
                <!-- Header -->
                <n-layout-header bordered class="apple-header">
                  <div class="header-left">
                    <n-breadcrumb>
                      <n-breadcrumb-item>
                        <n-icon><HomeOutline /></n-icon>
                      </n-breadcrumb-item>
                      <n-breadcrumb-item>{{ currentPageTitle }}</n-breadcrumb-item>
                    </n-breadcrumb>
                  </div>
                  <div class="header-right">
                    <!-- Company Selector for Super Admin -->
                    <n-select
                      v-if="authStore.isSuperAdmin"
                      v-model:value="selectedCompany"
                      :options="companyOptions"
                      size="small"
                      style="width: 180px"
                      placeholder="Seleccionar empresa"
                      @update:value="handleCompanyChange"
                    />
                    
                    <n-tag type="success" size="small" round class="apple-badge-success">
                      <template #icon>
                        <n-icon><CheckmarkCircleOutline /></n-icon>
                      </template>
                      En Línea
                    </n-tag>
                    
                    <n-button quaternary circle @click="toggleTheme" class="apple-btn-ghost">
                      <template #icon>
                        <n-icon><component :is="isDark ? SunnyOutline : MoonOutline" /></n-icon>
                      </template>
                    </n-button>
                  </div>
                </n-layout-header>
                
                <!-- Content -->
                <n-layout-content class="apple-content">
                  <router-view />
                </n-layout-content>
              </n-layout>
            </n-layout>

            <!-- Fullscreen Layout (Login) -->
            <div v-else class="fullscreen-layout">
               <router-view />
            </div>

          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, h, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NConfigProvider, darkTheme, NLayout, NLayoutSider, NLayoutHeader, NLayoutContent,
  NLoadingBarProvider, NDialogProvider, NNotificationProvider, NMessageProvider,
  NMenu, NIcon, NButton, NBreadcrumb, NBreadcrumbItem, NTag, NSelect
} from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
  PeopleOutline, DocumentTextOutline, WalletOutline, TimeOutline,
  CardOutline, BarChartOutline, SettingsOutline, HomeOutline,
  SunnyOutline, MoonOutline, BusinessOutline, CheckmarkCircleOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)
const isDark = ref(false)
const activeKey = ref('dashboard')
const selectedCompany = ref<string | null>(null)

const isFullScreen = computed(() => {
  return route.name === 'Login' || route.path === '/login' || route.meta?.guest
})

// Apple-inspired theme overrides
const themeOverrides = computed(() => ({
  common: {
    primaryColor: '#007AFF',
    primaryColorHover: '#0051D5',
    primaryColorPressed: '#0043B0',
    borderRadius: '10px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  },
  Button: {
    borderRadiusMedium: '10px',
    borderRadiusSmall: '8px',
  },
  Card: {
    borderRadius: '16px',
  },
  Input: {
    borderRadius: '10px',
  },
  Select: {
    borderRadius: '10px',
  },
  Tag: {
    borderRadius: '6px',
  },
}))

const theme = computed(() => isDark.value ? darkTheme : null)

const toggleTheme = () => {
  isDark.value = !isDark.value
}

// Company options for Super Admin
const companyOptions = ref([
  { label: 'Empresa A', value: 'comp-a' },
  { label: 'Empresa B', value: 'comp-b' },
])

const handleCompanyChange = (value: string) => {
  // Set X-Tenant-ID header for subsequent requests
  localStorage.setItem('x-tenant-id', value)
  window.location.reload()
}

const menuOptions = computed((): MenuOption[] => {
  if (authStore.isSuperAdmin) {
    return [
      {
        label: 'Dashboard',
        key: 'dashboard',
        icon: () => h(NIcon, null, { default: () => h(HomeOutline) })
      },
      {
        label: 'Personal',
        key: 'personal',
        icon: () => h(NIcon, null, { default: () => h(PeopleOutline) })
      },
      {
        label: 'Empresas',
        key: 'admin/companies',
        icon: () => h(NIcon, null, { default: () => h(BusinessOutline) })
      },
      {
        label: 'Configuración',
        key: 'settings',
        icon: () => h(NIcon, null, { default: () => h(SettingsOutline) })
      }
    ]
  }

  return [
    {
      label: 'Dashboard',
      key: 'dashboard',
      icon: () => h(NIcon, null, { default: () => h(HomeOutline) })
    },
    {
      label: 'Personal',
      key: 'personal',
      icon: () => h(NIcon, null, { default: () => h(PeopleOutline) })
    },
    {
      label: 'Contratos',
      key: 'contracts',
      icon: () => h(NIcon, null, { default: () => h(DocumentTextOutline) })
    },
    {
      label: 'Nómina',
      key: 'payroll',
      icon: () => h(NIcon, null, { default: () => h(WalletOutline) }),
      children: [
        { label: 'Planilla', key: 'payroll' },
        { label: 'Préstamos', key: 'payroll/loans' },
        { label: 'Descuentos', key: 'payroll/discounts' },
        { label: 'Boletas', key: 'payroll/payslips' },
        { label: 'Liquidaciones', key: 'payroll/liquidations' }
      ]
    },
    {
      label: 'Tiempo',
      key: 'time',
      icon: () => h(NIcon, null, { default: () => h(TimeOutline) })
    },
    {
      label: 'Configuración',
      key: 'settings',
      icon: () => h(NIcon, null, { default: () => h(SettingsOutline) })
    }
  ]
})

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: 'Panel Principal',
    personal: 'Gestión de Personal',
    employees: 'Gestión de Personal',
    contracts: 'Contratos Laborales',
    payroll: 'Planilla y Nómina',
    time: 'Tiempo y Asistencia',
    settings: 'Configuración del Sistema'
  }
  return titles[activeKey.value] || 'RickERP'
})

const handleMenuClick = async (key: string) => {
  activeKey.value = key
  await nextTick()
  if (key === 'dashboard') {
    router.push('/')
  } else {
    router.push(`/${key}`)
  }
}

// Sync menu state with route
watch(
  () => route.path,
  (path) => {
    if (path === '/' || path === '/dashboard') {
      activeKey.value = 'dashboard'
    } else {
      const parts = path.split('/').filter(Boolean)
      if (parts.length > 0) {
        // Try to match exact path or first segment for nested routes
        const mainSection = parts[0]
        // Check if full path exists in menu keys (simplified logic)
        // For production app, recursive search in menuOptions is better
        activeKey.value = path.substring(1) // remove leading slash
        
        // Fix for specific known prefix matches if needed
        if (mainSection === 'personal') activeKey.value = 'personal'
        if (mainSection === 'employees') activeKey.value = 'personal' // Map employees to personal
        if (path.startsWith('/contracts')) activeKey.value = 'contracts'
      }
    }
  },
  { immediate: true }
)
</script>

<style>
@import './assets/styles/apple-design.css';

/* App Layout */
.app-layout {
  height: 100vh;
  background: #F5F5F7;
}

.main-layout {
  background: #F5F5F7;
}

/* Apple Sidebar */
.apple-sidebar {
  background: #FFFFFF !important;
  border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.apple-sidebar .n-scrollbar-content {
  display: flex;
  flex-direction: column;
}

.apple-sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #FFFFFF;
}

.apple-sidebar-logo.collapsed {
  justify-content: center;
  padding: 0;
}

.apple-sidebar-logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.apple-sidebar-logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #1D1D1F;
}

/* Apple Navigation */
.apple-nav .n-menu-item {
  margin: 4px 12px !important;
  border-radius: 10px !important;
}

.apple-nav .n-menu-item-content {
  border-radius: 10px !important;
  padding: 10px 16px !important;
}

.apple-nav .n-menu-item-content--selected {
  background: #007AFF !important;
  color: white !important;
  border-radius: 10px !important;
}

.apple-nav .n-menu-item-content--selected .n-icon {
  color: white !important;
}

.apple-nav .n-menu-item:hover .n-menu-item-content:not(.n-menu-item-content--selected) {
  background: #F5F5F7 !important;
}

/* Apple Header */
.apple-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Apple Content */
.apple-content {
  padding: 24px;
  background: #F5F5F7;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

/* Override Naive UI to match Apple Design */
.n-button:not(.n-button--text) {
  border-radius: 10px !important;
}

.n-input {
  border-radius: 10px !important;
}

.n-select .n-base-selection {
  border-radius: 10px !important;
}

.n-card {
  border-radius: 16px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.n-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

.n-tag {
  border-radius: 6px !important;
}

.n-tag.n-tag--round {
  border-radius: 9999px !important;
}

.n-data-table .n-data-table-th {
  font-weight: 600 !important;
  font-size: 13px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
  color: #86868B !important;
  background: #F5F5F7 !important;
}

.n-data-table .n-data-table-td {
  color: #1D1D1F !important;
}

/* Fullscreen Layout */
.fullscreen-layout {
  height: 100vh;
  width: 100vw;
}

/* Responsive */
@media (max-width: 768px) {
  .apple-header {
    padding: 0 16px;
  }
  
  .apple-content {
    padding: 16px;
  }
  
  .header-right .n-select {
    display: none;
  }
}
</style>
