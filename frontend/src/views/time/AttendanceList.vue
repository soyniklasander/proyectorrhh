<template>
  <div class="attendance-list">
    <div class="list-header">
      <div class="header-left">
        <n-tag type="info">{{ todayRecords }} registros</n-tag>
        <n-tag type="success">{{ onTimeCount }} puntuales</n-tag>
        <n-tag type="warning">{{ lateCount }} tardanzas</n-tag>
      </div>
      <div class="header-right">
        <n-button type="primary" @click="showModal = true">
          ➕ Registrar Asistencia
        </n-button>
        <n-button type="primary" @click="loadAttendance">
          🔄 Actualizar
        </n-button>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredAttendance"
      :loading="loading"
      :bordered="false"
      :striped="true"
    />

    <n-modal v-model:show="showModal" preset="card" title="Registrar Asistencia" style="width: 500px">
      <n-form :model="formData" label-placement="left" label-width="120px">
        <n-form-item label="Empleado">
          <n-select
            v-model:value="formData.empleadoId"
            :options="employeeOptions"
            placeholder="Seleccionar empleado"
          />
        </n-form-item>
        <n-form-item label="Fecha">
          <n-date-picker v-model:value="formData.fecha" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Hora Entrada">
          <n-time-picker v-model:value="formData.horaEntrada" format="HH:mm" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Hora Salida">
          <n-time-picker v-model:value="formData.horaSalida" format="HH:mm" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Estado">
          <n-select
            v-model:value="formData.estado"
            :options="statusOptions"
            placeholder="Seleccionar estado"
          />
        </n-form-item>
        <n-form-item label="Observaciones">
          <n-input v-model:value="formData.observaciones" type="textarea" placeholder="Observaciones" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">Cancelar</n-button>
          <n-button type="primary" @click="saveAttendance">Guardar</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NAvatar, NDatePicker, NSelect, NDataTable, NModal, NForm, NFormItem, NTimePicker, NSpace, NInput } from 'naive-ui'
import { api } from '@/services/api'

const message = useMessage()

const loading = ref(false)
const showModal = ref(false)
const selectedDate = ref(Date.now())
const filterArea = ref(null)
const attendanceRecords = ref<any[]>([])
const employeeOptions = ref<any[]>([])
const formData = ref({
  empleadoId: null,
  fecha: Date.now(),
  horaEntrada: Date.now(),
  horaSalida: Date.now(),
  estado: 'PUNTUAL',
  observaciones: ''
})

const areaOptions = [
  { label: 'Todas las áreas', value: null },
  { label: 'Administración', value: 'ADMIN' },
  { label: 'Ventas', value: 'VENTAS' },
  { label: 'Producción', value: 'PRODUCCION' },
  { label: 'RRHH', value: 'RRHH' }
]

const statusOptions = [
  { label: 'Puntual', value: 'PUNTUAL' },
  { label: 'Tarde', value: 'TARDE' },
  { label: 'Falta', value: 'FALTA' },
  { label: 'Justificado', value: 'JUSTIFICADO' }
]

const todayRecords = computed(() => attendanceRecords.value.length)
const onTimeCount = computed(() => 
  attendanceRecords.value.filter((r: any) => r.estado === 'PUNTUAL').length
)
const lateCount = computed(() => 
  attendanceRecords.value.filter((r: any) => r.estado === 'TARDE').length
)

const getStatusType = (status: string | undefined | null) => {
  if (!status) return 'default'
  switch (status) {
    case 'PUNTUAL': return 'success'
    case 'TARDE': return 'warning'
    case 'FALTA': return 'error'
    case 'JUSTIFICADO': return 'info'
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

const createColumns = () => [
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'employee-cell' }, [
        h(NAvatar, {
          size: 'medium',
          round: true,
          src: row.foto || ''
        }, () => row.nombreCompleto?.slice(0, 2)?.toUpperCase() || ''),
        h('div', { style: 'margin-left: 12px;' }, [
          h('div', { style: 'font-weight: 600;' }, row.nombreCompleto || ''),
          h('div', { style: 'font-size: 12px; color: #6b7280;' }, row.numeroDocumento || '')
        ])
      ])
    }
  },
  {
    title: 'Fecha',
    key: 'fecha',
    width: 120
  },
  {
    title: 'Entrada',
    key: 'horaEntrada',
    width: 100,
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
    width: 100,
    render(row: any) {
      return h('span', {}, row.horaSalida || '--:--')
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 120,
    render(row: any) {
      return h(NTag, { 
        type: getStatusType(row.estado), 
        round: true,
        size: 'small'
      }, () => row.estado || '')
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 150,
    render(row: any) {
      return h(NSpace, {}, () => [
        h(NButton, { 
          size: 'small', 
          type: 'info',
          onClick: () => editRecord(row.id)
        }, () => 'Editar'),
        h(NButton, { 
          size: 'small', 
          type: 'warning',
          onClick: () => justify(row.id)
        }, () => 'Justificar')
      ])
    }
  }
]

const columns = createColumns()

const filteredAttendance = computed(() => {
  let data = attendanceRecords.value || []
  
  if (filterArea.value) {
    data = (data || []).filter((r: any) => r.areaTrabajo === filterArea.value)
  }
  
  return data || []
})

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const loadAttendance = async () => {
  loading.value = true
  try {
    const response = await api.get('/attendance')
    if (response.data.success) {
      attendanceRecords.value = response.data.data
    }
  } catch (error) {
    message.error('Error al cargar asistencia')
  } finally {
    loading.value = false
  }
}

const saveAttendance = async () => {
  try {
    await api.post('/attendance', {
      empleadoId: formData.value.empleadoId,
      fecha: new Date(formData.value.fecha).toISOString().split('T')[0],
      horaEntrada: formatTime(formData.value.horaEntrada),
      horaSalida: formatTime(formData.value.horaSalida),
      estado: formData.value.estado,
      observaciones: formData.value.observaciones
    })
    message.success('Asistencia registrada correctamente')
    showModal.value = false
    loadAttendance()
    formData.value = {
      empleadoId: null,
      fecha: Date.now(),
      horaEntrada: Date.now(),
      horaSalida: Date.now(),
      estado: 'PUNTUAL',
      observaciones: ''
    }
  } catch (error) {
    message.error('Error al registrar asistencia')
  }
}

const editRecord = async (id: string) => {
  message.info('Función de edición: ' + id)
}

const justify = async (id: string) => {
  try {
    await api.put(`/attendance/${id}`, { estado: 'JUSTIFICADO' })
    const record = attendanceRecords.value.find((r: any) => r.id === id)
    if (record) record.estado = 'JUSTIFICADO'
    message.success('Registro justificado')
    loadAttendance()
  } catch (error) {
    message.error('Error al justificar')
  }
}

onMounted(() => {
  loadAttendance()
  loadEmployees()
})
</script>

<style scoped>
.attendance-list {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
</style>
