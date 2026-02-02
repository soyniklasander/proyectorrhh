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
        v-else-if="!loading"
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
      <div class="load-more" v-if="hasMore || loading">
        <n-button
          block
          quaternary
          :loading="loading"
          @click="loadMore"
          v-if="hasMore"
        >
          Cargar más notificaciones
        </n-button>
        <div v-else-if="loading" style="text-align: center; padding: 10px;">
           <n-spin size="small" />
        </div>
      </div>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  NotificationsOutline as NotificationsIcon, PersonOutline as PersonIcon, DocumentTextOutline as DocumentIcon, TimeOutline as TimeIcon,
  CashOutline as MoneyIcon, CalendarOutline as CalendarIcon, CheckmarkOutline as CheckIcon, WarningOutline as WarningIcon, CloseOutline as CloseIcon
} from '@vicons/ionicons5'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import relativeTime from 'dayjs/plugin/relativeTime'
import { notificationService } from '@/services/notificationService'
import type { Notification, NotificationAction } from '@/types/notification.types'

dayjs.extend(relativeTime)
dayjs.locale('es')

const emit = defineEmits(['close'])
const message = useMessage()

// Reactive data
const loading = ref(false)
const hasMore = ref(false)
const notifications = ref<Notification[]>([])
const page = ref(1)
const limit = 10
const white = '#ffffff'

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

const fetchNotifications = async (currentPage: number, append = false) => {
  loading.value = true
  try {
    const response = await notificationService.getAll(currentPage, limit)
    const { data, meta } = response.data

    if (append) {
      notifications.value.push(...data)
    } else {
      notifications.value = data
    }

    hasMore.value = currentPage < meta.totalPages
  } catch (error) {
    message.error('Error al cargar notificaciones')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const markAllAsRead = async () => {
  try {
    await notificationService.markAllAsRead()
    notifications.value.forEach(notification => {
      notification.read = true
    })
    message.success('Todas las notificaciones marcadas como leídas')
  } catch (error) {
    message.error('Error al marcar notificaciones como leídas')
  }
}

const removeNotification = async (id: string) => {
  try {
    await notificationService.delete(id)
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      message.success('Notificación eliminada')
    }
  } catch (error) {
    message.error('Error al eliminar la notificación')
  }
}

const handleAction = async (action: NotificationAction, notification: Notification) => {
  switch (action.key) {
    case 'view':
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
  
  // Marcar como leída si no lo está
  if (!notification.read) {
    try {
        await notificationService.markAsRead(notification.id)
        notification.read = true
    } catch (e) {
        // Ignorar error de red si falla el marcado
    }
  }
}

const loadMore = async () => {
  if (loading.value) return
  page.value++
  await fetchNotifications(page.value, true)
}

onMounted(() => {
  fetchNotifications(page.value)
})
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
