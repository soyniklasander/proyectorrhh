<template>
  <n-config-provider :theme="theme">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>

            <n-layout has-sider class="app-layout" v-if="!isFullScreen">
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
                class="sidebar"
              >
                <div class="logo" v-if="!collapsed">
                  <n-icon size="24" color="#ffffff">
                    <PeopleOutline />
                  </n-icon>
                  <span class="logo-text">RickERP</span>
                </div>
                <div class="logo" v-else>
                  <n-icon size="24" color="#ffffff">
                    <PeopleOutline />
                  </n-icon>
                </div>
                
                <n-menu
                  v-model:value="activeKey"
                  :collapsed="collapsed"
                  :collapsed-width="64"
                  :collapsed-icon-size="22"
                  :options="menuOptions"
                  @update:value="handleMenuClick"
                />
              </n-layout-sider>
              
              <n-layout>
                <n-layout-header bordered class="header">
                  <div class="header-left">
                    <n-breadcrumb>
                      <n-breadcrumb-item>
                        <n-icon><HomeOutline /></n-icon>
                      </n-breadcrumb-item>
                      <n-breadcrumb-item>{{ currentPageTitle }}</n-breadcrumb-item>
                    </n-breadcrumb>
                  </div>
                  <div class="header-right">
                    <n-tag type="success" size="small" round>En Línea</n-tag>
                    <n-button quaternary circle @click="toggleTheme">
                      <template #icon>
                        <n-icon><component :is="isDark ? SunnyOutline : MoonOutline" /></n-icon>
                      </template>
                    </n-button>
                  </div>
                </n-layout-header>
                
                <n-layout-content class="content">
                  <router-view />
                </n-layout-content>
              </n-layout>
            </n-layout>

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
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NConfigProvider, darkTheme, NLayout, NLayoutSider, NLayoutHeader, NLayoutContent,
  NLoadingBarProvider, NDialogProvider, NNotificationProvider, NMessageProvider,
  NMenu, NIcon, NButton, NBreadcrumb, NBreadcrumbItem, NTag
} from 'naive-ui'
import {
  PeopleOutline, DocumentTextOutline, WalletOutline, TimeOutline,
  CardOutline, AirplaneOutline, BarChartOutline, SettingsOutline,
  HomeOutline, SunnyOutline, MoonOutline, BusinessOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)
const isDark = ref(false)
const activeKey = ref('dashboard')

const isFullScreen = computed(() => {
  return route.name === 'Login' || route.path === '/login' || route.meta?.guest
})

const theme = computed(() => isDark.value ? darkTheme : null)

const toggleTheme = () => {
  isDark.value = !isDark.value
}

const menuOptions = computed(() => {
  if (authStore.isSuperAdmin) {
    return [
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
      // Super admin might still want to see settings or other global stats
      {
        label: 'Configuración',
        key: 'settings',
        icon: () => h(NIcon, null, { default: () => h(SettingsOutline) })
      }
    ]
  }

  // Tenant / Regular User Menu
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
      icon: () => h(NIcon, null, { default: () => h(WalletOutline) })
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
    overtime: 'Control de Horas Extras',
    loans: 'Préstamos al Personal',
    leaves: 'Vacaciones y Permisos',
    reports: 'Reportes y Estadísticas',
    settings: 'Configuración del Sistema'
  }
  return titles[activeKey.value] || 'RRHHMod'
})

const handleMenuClick = (key: string) => {
  activeKey.value = key
  // Handle special cases or default routing
  if (key === 'dashboard') {
    router.push('/')
  } else {
    router.push(`/${key}`)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-layout {
  height: 100vh;
}

.sidebar {
  background: #fff;
}

.sidebar .n-layout-sider-scroll-container {
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

.header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content {
  padding: 24px;
  background: #f5f7fa;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
}

.stat-card.employees { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
.stat-card.contracts { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.stat-card.payroll { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.stat-card.overtime { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.stat-card.active { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.stat-card.expiring { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.stat-card.expired { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tr:hover {
  background: #f8fafc;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-active { background: #dcfce7; color: #166534; }
.status-inactive { background: #fee2e2; color: #991b1b; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-approved { background: #dbeafe; color: #1e40af; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-state-subtext {
  font-size: 14px;
  opacity: 0.7;
}
</style>
