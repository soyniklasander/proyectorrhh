<template>
  <div v-if="alerts.length > 0" class="overtime-alerts">
    <div class="alerts-header">
      <n-icon size="18" color="#f59e0b">
        <WarningOutline />
      </n-icon>
      <span class="alerts-title">ALERTAS DE HORAS EXTRAS</span>
    </div>
    <div class="alerts-content">
      <div
        v-for="(alert, index) in alerts"
        :key="index"
        class="alert-item"
        :class="alert.tipo.toLowerCase()"
      >
        <div class="alert-icon">
          <n-icon v-if="alert.tipo === 'ROJO'" size="16" color="#ef4444">
            <CloseCircleOutline />
          </n-icon>
          <n-icon v-else-if="alert.tipo === 'NARANJA'" size="16" color="#f97316">
            <AlertCircleOutline />
          </n-icon>
          <n-icon v-else size="16" color="#eab308">
            <InformationCircleOutline />
          </n-icon>
        </div>
        <div class="alert-info">
          <span class="alert-dept">{{ alert.departamento }}</span>
          <span class="alert-hours">{{ alert.total_horas }}h</span>
          <n-tag
            :type="getTagType(alert.tipo)"
            size="small"
            round
          >
            +{{ alert.porcentaje }}%
          </n-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NIcon, NTag } from 'naive-ui'
import {
  WarningOutline, CloseCircleOutline, AlertCircleOutline, InformationCircleOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'

interface Alert {
  tipo: 'ROJO' | 'NARANJA' | 'AMARILLO'
  departamento: string
  total_horas: number
  registros: number
  porcentaje: number
  mensaje: string
}

const alerts = ref<Alert[]>([])

const getTagType = (tipo: string) => {
  switch (tipo) {
    case 'ROJO': return 'error'
    case 'NARANJA': return 'warning'
    default: return 'default'
  }
}

const loadAlerts = async () => {
  try {
    const { data } = await api.get('/overtime/alerts')
    if (data.success && data.data) {
      alerts.value = data.data.alerts || []
    }
  } catch (error) {
    console.error('Error loading overtime alerts:', error)
  }
}

onMounted(() => {
  loadAlerts()
  setInterval(loadAlerts, 300000)
})
</script>

<style scoped>
.overtime-alerts {
  background: linear-gradient(90deg, #fef3c7 0%, #fef9c3 100%);
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.alerts-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.alerts-title {
  font-weight: 700;
  font-size: 13px;
  color: #92400e;
  letter-spacing: 0.5px;
}

.alerts-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
}

.alert-item.rojo {
  border-left: 3px solid #ef4444;
}

.alert-item.naranja {
  border-left: 3px solid #f97316;
}

.alert-item.amarillo {
  border-left: 3px solid #eab308;
}

.alert-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-dept {
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
}

.alert-hours {
  font-weight: 700;
  font-size: 14px;
  color: #374151;
}
</style>
