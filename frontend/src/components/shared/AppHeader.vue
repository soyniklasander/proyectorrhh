<template>
  <div class="app-header">
    <div class="header-left">
      <n-space align="center">
        <n-button
          text
          @click="$router.push('/')"
          class="logo-button"
        >
          <n-icon size="24" color="#3b82f6">
            <BusinessIcon />
          </n-icon>
          <span class="logo-text">RRHH Mod</span>
        </n-button>
      </n-space>
    </div>

    <div class="header-center">
      <n-menu
        mode="horizontal"
        :options="menuOptions"
        :value="currentRoute"
        @update:value="handleMenuSelect"
        responsive
      />
    </div>

    <div class="header-right">
      <n-space align="center">
        <!-- Botón para exportar nómina -->
        <n-button
          quaternary
          circle
          @click="exportPayroll"
          v-if="hasPermission('payroll.export')"
        >
          <template #icon>
            <n-icon><DownloadIcon /></n-icon>
          </template>
        </n-button>

        <!-- Botón para notificaciones -->
        <n-badge :value="notificationCount" :max="99" :show="notificationCount > 0">
          <n-button quaternary circle @click="showNotifications">
            <template #icon>
              <n-icon><NotificationsIcon /></n-icon>
            </template>
          </n-button>
        </n-badge>

        <!-- Toggle modo oscuro -->
        <n-button quaternary circle @click="toggleDarkMode">
          <template #icon>
            <n-icon>
              <component :is="isDarkMode ? SunnyIcon : MoonIcon" />
            </n-icon>
          </template>
        </n-button>

        <!-- Menú de usuario -->
        <n-dropdown
          :options="userMenuOptions"
          :show="showUserMenu"
          :on-clickoutside="() => showUserMenu = false"
          placement="bottom-end"
          trigger="click"
          @select="handleUserMenuSelect"
        >
          <n-button quaternary @click="showUserMenu = !showUserMenu">
            <n-space align="center">
              <n-avatar
                :size="32"
                :src="user?.avatar"
                round
              >
                {{ user?.name?.charAt(0).toUpperCase() }}
              </n-avatar>
              <span class="user-name">{{ user?.name }}</span>
              <n-icon>
                <ChevronDownIcon />
              </n-icon>
            </n-space>
          </n-button>
        </n-dropdown>
      </n-space>
    </div>

    <!-- Drawer de notificaciones -->
    <n-drawer
      v-model:show="showNotificationsDrawer"
      width="400"
      placement="right"
    >
      <n-drawer-content title="Notificaciones" closable>
        <notifications-panel @close="showNotificationsDrawer = false" />
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/store/auth'
import {
  BusinessIcon, HomeIcon, PeopleIcon, DocumentIcon, TimeIcon,
  MoneyIcon, CalendarIcon, CheckIcon, DownloadIcon,
  NotificationsIcon, MoonIcon, SunnyIcon, ChevronDownIcon,
  LogOutIcon, SettingsIcon, UserIcon
} from '@vicons/ionicons5'
import NotificationsPanel from '@/components/panels/NotificationsPanel.vue'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const authStore = useAuthStore()

// Reactive data
const showUserMenu = ref(false)
const showNotificationsDrawer = ref(false)
const notificationCount = ref(3) // Mock count

const user = computed(() => authStore.user)
const isDarkMode = computed(() => authStore.isDarkMode)

// Current route for menu
const currentRoute = computed(() => {
  const path = route.path
  if (path.startsWith('/empleados')) return 'employees'
  if (path.startsWith('/contratos')) return 'contracts'
  if (path.startsWith('/horas-extras')) return 'overtime'
  if (path.startsWith('/prestamos')) return 'loans'
  if (path.startsWith('/planilla')) return 'payroll'
  if (path.startsWith('/vacaciones')) return 'leaves'
  if (path.startsWith('/asistencia')) return 'attendance'
  return 'dashboard'
})

// Menu options
const menuOptions = [
  {
    label: 'Panel',
    key: 'dashboard',
    icon: () => h(HomeIcon)
  },
  {
    label: 'Empleados',
    key: 'employees',
    icon: () => h(PeopleIcon),
    children: [
      {
        label: 'Lista de Empleados',
        key: 'employees-list',
        icon: () => h(PeopleIcon)
      },
      {
        label: 'Nuevo Empleado',
        key: 'employees-new',
        icon: () => h(PeopleIcon)
      }
    ]
  },
  {
    label: 'Contratos',
    key: 'contracts',
    icon: () => h(DocumentIcon)
  },
  {
    label: 'Horas Extras',
    key: 'overtime',
    icon: () => h(TimeIcon)
  },
  {
    label: 'Préstamos',
    key: 'loans',
    icon: () => h(MoneyIcon)
  },
  {
    label: 'Planilla',
    key: 'payroll',
    icon: () => h(MoneyIcon)
  },
  {
    label: 'Vacaciones',
    key: 'leaves',
    icon: () => h(CalendarIcon)
  },
  {
    label: 'Asistencia',
    key: 'attendance',
    icon: () => h(CheckIcon)
  }
]

// User menu options
const userMenuOptions = [
  {
    label: 'Mi Perfil',
    key: 'profile',
    icon: () => h(UserIcon)
  },
  {
    label: 'Configuración',
    key: 'settings',
    icon: () => h(SettingsIcon)
  },
  {
    type: 'divider'
  },
  {
    label: 'Cerrar Sesión',
    key: 'logout',
    icon: () => h(LogOutIcon)
  }
]

// Methods
const hasPermission = (permission: string) => {
  // TODO: Implementar verificación de permisos real
  return true
}

const toggleDarkMode = () => {
  authStore.toggleDarkMode()
}

const handleMenuSelect = (key: string) => {
  switch (key) {
    case 'dashboard':
      router.push('/dashboard')
      break
    case 'employees-list':
      router.push('/empleados')
      break
    case 'employees-new':
      router.push('/empleados/nuevo')
      break
    case 'contracts':
      router.push('/contratos')
      break
    case 'overtime':
      router.push('/horas-extras')
      break
    case 'loans':
      router.push('/prestamos')
      break
    case 'payroll':
      router.push('/planilla')
      break
    case 'leaves':
      router.push('/vacaciones')
      break
    case 'attendance':
      router.push('/asistencia')
      break
    default:
      break
  }
}

const handleUserMenuSelect = (key: string) => {
  showUserMenu.value = false
  
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
    default:
      break
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
  message.success('Sesión cerrada correctamente')
}

const exportPayroll = async () => {
  try {
    // TODO: Implementar exportación real
    message.success('Exportando nómina...')
  } catch (error) {
    message.error('Error al exportar nómina')
  }
}

const showNotifications = () => {
  showNotificationsDrawer.value = true
}
</script>

<style scoped>
.app-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 800px;
}

.header-right {
  display: flex;
  align-items: center;
  min-width: 200px;
  justify-content: flex-end;
}

.logo-button {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  padding: 8px;
}

.logo-text {
  margin-left: 8px;
  font-weight: 700;
  color: #3b82f6;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-center {
    display: none;
  }
  
  .header-left {
    min-width: auto;
  }
  
  .header-right {
    min-width: auto;
  }
  
  .user-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
  
  :deep(.n-menu.n-menu--horizontal) {
    display: none;
  }
}
</style>