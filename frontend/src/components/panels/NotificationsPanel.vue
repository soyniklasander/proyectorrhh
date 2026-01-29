<template>
  <div class="notifications-panel">
    <n-space vertical size="large">
      <!-- Header con acciones -->
      <n-space justify="space-between" align="center">
        <n-text strong>Notificaciones</n-text>
        <n-button text size="small" @click="markAllAsRead">
          Marcar todo como leído
        </n-button>
      </n-space>

      <!-- Lista de notificaciones -->
      <n-list v-if="notifications.length > 0">
        <n-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ 'unread': !notification.read }"
        >
          <n-space align="start" :size="12">
            <n-avatar
              :size="40"
              :style="{ backgroundColor: getNotificationColor(notification.type) }"
              round
            >
              <n-icon :color="white">
                <component :is="getNotificationIcon(notification.type)" />
              </n-icon>
            </n-avatar>
            
            <div class="notification-content">
              <div class="notification-header">
                <n-text strong>{{ notification.title }}</n-text>
                <n-text depth="3" style="font-size: 12px">
                  {{ formatRelativeTime(notification.timestamp) }}
                </n-text>
              </div>
              
              <n-text depth="2" style="font-size: 14px">
                {{ notification.description }}
              </n-text>
              
              <div class="notification-actions" v-if="notification.actions">
                <n-space size="small">
                  <n-button
                    v-for="action in notification.actions"
                    :key="action.key"
                    :type="action.type || 'default'"
                    size="small"
                    @click="handleAction(action, notification)"
                  >
                    {{ action.label }}
                  </n-button>
                </n-space>
              </div>
            </div>
            
            <n-button
              text
              size="small"
              @click="removeNotification(notification.id)"
            >
              <template #icon>
                <n-icon><CloseIcon /></n-icon>
              </template>
            </n-button>
          </n-space>
        </n-list-item>
      </n-list>

      <!-- Estado vacío -->
      <n-empty
        v-else
        description="No tienes notificaciones nuevas"
        size="large"
      >
        <template #icon>
          <n-icon size="48" color="#94a3b8">
            <NotificationsIcon />
          </n-icon>
        </template>
      </n-empty>

      <!-- Botón cargar más -->
      <div class="load-more" v-if="hasMore">
        <n-button
          block
          quaternary
          :loading="loading"
          @click="loadMore"
        >
          Cargar más notificaciones
        </n-button>
      </div>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import {
  NotificationsIcon, PersonIcon, DocumentIcon, TimeIcon,
  MoneyIcon, CalendarIcon, CheckIcon, WarningIcon, CloseIcon
} from '@vicons/ionicons5'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('es')

const emit = defineEmits(['close'])
const message = useMessage()

// Reactive data
const loading = ref(false)
const hasMore = ref(false)

// Mock notifications (reemplazar con API real)
const notifications = ref([
  {
    id: '1',
    type: 'employee',
    title: 'Nuevo empleado registrado',
    description: 'Juan Pérez García ha sido agregado al sistema',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    actions: [
      { key: 'view', label: 'Ver', type: 'primary' }
    ]
  },
  {
    id: '2',
    type: 'contract',
    title: 'Contrato por vencer',
    description: 'El contrato de María López Martínez vence en 7 días',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    actions: [
      { key: 'view', label: 'Ver Contrato', type: 'primary' },
      { key: 'renew', label: 'Renovar', type: 'default' }
    ]
  },
  {
    id: '3',
    type: 'payroll',
    title: 'Planilla generada',
    description: 'La planilla de Enero 2024 ha sido generada exitosamente',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    actions: [
      { key: 'view', label: 'Ver', type: 'primary' },
      { key: 'export', label: 'Exportar', type: 'default' }
    ]
  },
  {
    id: '4',
    type: 'overtime',
    title: 'Horas extras aprobadas',
    description: 'Se han aprobado 8 horas extras para Carlos Rodríguez',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
    actions: [
      { key: 'view', label: 'Ver Detalles', type: 'primary' }
    ]
  },
  {
    id: '5',
    type: 'warning',
    title: 'Límite de préstamos alcanzado',
    description: 'Ana Martínez ha alcanzado el límite de préstamos permitidos',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: true,
    actions: [
      { key: 'view', label: 'Ver', type: 'primary' }
    ]
  }
])

// Methods
const getNotificationIcon = (type: string) => {
  const icons: Record<string, any> = {
    employee: PersonIcon,
    contract: DocumentIcon,
    payroll: MoneyIcon,
    overtime: TimeIcon,
    leave: CalendarIcon,
    attendance: CheckIcon,
    warning: WarningIcon
  }
  return icons[type] || NotificationsIcon
}

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    employee: '#3b82f6',
    contract: '#8b5cf6',
    payroll: '#10b981',
    overtime: '#f59e0b',
    leave: '#06b6d4',
    attendance: '#22c55e',
    warning: '#ef4444'
  }
  return colors[type] || '#64748b'
}

const formatRelativeTime = (timestamp: string) => {
  return dayjs(timestamp).fromNow()
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  message.success('Todas las notificaciones marcadas como leídas')
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
    message.success('Notificación eliminada')
  }
}

const handleAction = (action: any, notification: any) => {
  switch (action.key) {
    case 'view':
      // TODO: Implementar navegación según el tipo
      message.info(`Viendo ${notification.title.toLowerCase()}`)
      break
    case 'renew':
      message.info('Abriendo formulario de renovación')
      break
    case 'export':
      message.info('Exportando archivo...')
      break
    default:
      break
  }
  
  // Marcar como leída
  notification.read = true
}

const loadMore = async () => {
  loading.value = true
  
  try {
    // TODO: Implementar carga de más notificaciones
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock de más notificaciones
    const moreNotifications = [
      {
        id: '6',
        type: 'employee',
        title: 'Empleado actualizado',
        description: 'Los datos de Roberto Sánchez han sido actualizados',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        read: true
      }
    ]
    
    notifications.value.push(...moreNotifications)
    
  } catch (error) {
    message.error('Error al cargar más notificaciones')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.notifications-panel {
  height: 100%;
  overflow-y: auto;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-actions {
  margin-top: 8px;
}

.unread {
  background-color: var(--n-hover-color);
  border-radius: 8px;
  padding: 8px;
  margin: -8px;
}

.unread .notification-header .n-text:first-child {
  font-weight: 700;
}

.load-more {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--n-border-color);
}

:deep(.n-list-item) {
  padding: 12px 0;
  border-bottom: 1px solid var(--n-border-color);
}

:deep(.n-list-item:last-child) {
  border-bottom: none;
}

:deep(.n-avatar) {
  flex-shrink: 0;
}
</style>