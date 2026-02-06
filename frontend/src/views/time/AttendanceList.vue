<template>
  <div class="attendance-list">
    <AppleCard>
      <div class="list-header">
        <div class="header-left">
          <AppleBadge type="info" :label="`${todayRecords} registros`" />
          <AppleBadge type="success" :label="`${onTimeCount} puntuales`" />
          <AppleBadge type="warning" :label="`${lateCount} tardanzas`" />
        </div>
        <div class="header-right">
          <AppleButton variant="primary" :icon="PlusIcon" @click="showModal = true">
            ➕ Registrar Asistencia
          </AppleButton>
          <AppleButton variant="secondary" :icon="RefreshIcon" @click="loadAttendance">
            🔄 Actualizar
          </AppleButton>
        </div>
      </div>

      <AppleTable
        :columns="columns"
        :data="filteredAttendance"
        :loading="loading"
        :bordered="false"
        :striped="true"
      />
    </AppleCard>

    <!-- Modal simplificado -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <AppleCard class="modal-card" title="Registrar Asistencia">
        <div class="form-grid">
          <div class="form-item">
            <label>Empleado</label>
            <select v-model="formData.empleadoId" class="form-select">
              <option :value="null">Seleccionar empleado</option>
              <option v-for="emp in employeeOptions" :key="emp.value" :value="emp.value">
                {{ emp.label }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>Fecha</label>
            <input type="date" v-model="formData.fechaString" class="form-input" />
          </div>
          <div class="form-item">
            <label>Hora Entrada</label>
            <input type="time" v-model="formData.horaEntrada" class="form-input" />
          </div>
          <div class="form-item">
            <label>Hora Salida</label>
            <input type="time" v-model="formData.horaSalida" class="form-input" />
          </div>
          <div class="form-item">
            <label>Estado</label>
            <select v-model="formData.estado" class="form-select">
              <option value="PUNTUAL">Puntual</option>
              <option value="TARDE">Tarde</option>
              <option value="FALTA">Falta</option>
              <option value="JUSTIFICADO">Justificado</option>
            </select>
          </div>
          <div class="form-item full-width">
            <label>Observaciones</label>
            <textarea v-model="formData.observaciones" class="form-textarea" placeholder="Observaciones"></textarea>
          </div>
        </div>
        <template #footer>
          <div class="modal-actions">
            <AppleButton variant="ghost" @click="showModal = false">Cancelar</AppleButton>
            <AppleButton variant="primary" @click="saveAttendance">Guardar</AppleButton>
          </div>
        </template>
      </AppleCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  AppleCard,
  AppleButton,
  AppleBadge,
  AppleTable,
  AppleAvatar,
  AppleTag
} from '@/components/apple'
import { Plus, RefreshCw } from 'lucide-vue-next'
import { api } from '@/services/api'

const PlusIcon = Plus
const RefreshIcon = RefreshCw

const loading = ref(false)
const showModal = ref(false)
const attendanceRecords = ref<any[]>([])
const employeeOptions = ref<any[]>([])

const formData = ref({
  empleadoId: null as string | null,
  fecha: new Date().toISOString().split('T')[0],
  fechaString: new Date().toISOString().split('T')[0],
  horaEntrada: '08:00',
  horaSalida: '17:00',
  estado: 'PUNTUAL',
  observaciones: ''
})

const todayRecords = computed(() => attendanceRecords.value.length)
const onTimeCount = computed(() => 
  attendanceRecords.value.filter((r: any) => r.estado === 'PUNTUAL').length
)
const lateCount = computed(() => 
  attendanceRecords.value.filter((r: any) => r.estado === 'TARDE').length
)

const getStatusType = (status: string | undefined | null): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'PUNTUAL': return 'success'
    case 'TARDE': return 'warning'
    case 'FALTA': return 'error'
    case 'JUSTIFICADO': return 'primary'
    default: return 'default'
  }
}

const loadEmployees = async () => {
  try {
    const response = await api.get('/employees')
    if (response.data.success) {
      employeeOptions.value = response.data.data.map((e: any) => ({
        label: e.nombreCompleto,
        value: e.id
      }))
    }
  } catch (error) {
    console.error('Error loading employees:', error)
  }
}

const columns = [
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'employee-cell' }, [
        h(AppleAvatar, {
          src: row.foto || '',
          size: 'sm',
          name: row.nombreCompleto || ''
        }),
        h('div', { style: 'margin-left: 10px;' }, [
          h('div', { style: 'font-weight: 500;' }, row.nombreCompleto || ''),
          h('div', { style: 'font-size: 12px; color: var(--color-text-secondary);' }, row.numeroDocumento || '')
        ])
      ])
    }
  },
  { title: 'Fecha', key: 'fecha', width: '120px' },
  {
    title: 'Entrada',
    key: 'horaEntrada',
    width: '100px',
    render(row: any) {
      const isLate = row.horaEntrada > '08:30'
      return h('span', { 
        style: isLate ? 'color: #f59e0b; font-weight: 600;' : 'color: #10b981; font-weight: 600;' 
      }, row.horaEntrada || '--:--')
    }
  },
  {
    title: 'Salida',
    key: 'horaSalida',
    width: '100px',
    render(row: any) {
      return h('span', {}, row.horaSalida || '--:--')
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: '120px',
    render(row: any) {
      return h(AppleTag, { 
        type: getStatusType(row.estado),
        label: row.estado || ''
      })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: '150px',
    render(row: any) {
      return h('div', { class: 'action-buttons' }, [
        h(AppleButton, { 
          variant: 'ghost',
          size: 'small',
          onClick: () => editRecord(row.id)
        }, () => 'Editar'),
        h(AppleButton, { 
          variant: 'ghost',
          size: 'small',
          onClick: () => justify(row.id)
        }, () => 'Justificar')
      ])
    }
  }
]

const filteredAttendance = computed(() => attendanceRecords.value || [])

const loadAttendance = async () => {
  loading.value = true
  try {
    const response = await api.get('/attendance')
    if (response.data.success) {
      attendanceRecords.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar asistencia')
  } finally {
    loading.value = false
  }
}

const saveAttendance = async () => {
  try {
    await api.post('/attendance', {
      empleadoId: formData.value.empleadoId,
      fecha: formData.value.fechaString,
      horaEntrada: formData.value.horaEntrada,
      horaSalida: formData.value.horaSalida,
      estado: formData.value.estado,
      observaciones: formData.value.observaciones
    })
    alert('Asistencia registrada correctamente')
    showModal.value = false
    loadAttendance()
    formData.value = {
      empleadoId: null,
      fecha: new Date().toISOString().split('T')[0],
      fechaString: new Date().toISOString().split('T')[0],
      horaEntrada: '08:00',
      horaSalida: '17:00',
      estado: 'PUNTUAL',
      observaciones: ''
    }
  } catch (error) {
    alert('Error al registrar asistencia')
  }
}

const editRecord = (id: string) => {
  console.log('Edit record:', id)
}

const justify = async (id: string) => {
  try {
    await api.put(`/attendance/${id}`, { estado: 'JUSTIFICADO' })
    const record = attendanceRecords.value.find((r: any) => r.id === id)
    if (record) record.estado = 'JUSTIFICADO'
    alert('Registro justificado')
    loadAttendance()
  } catch (error) {
    alert('Error al justificar')
  }
}

onMounted(() => {
  loadAttendance()
  loadEmployees()
})
</script>

<style scoped>
.attendance-list {
  padding: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  gap: 12px;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.employee-cell {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: 500px;
  max-width: 90vw;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item.full-width {
  grid-column: span 2;
}

.form-item label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-surface-primary);
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
