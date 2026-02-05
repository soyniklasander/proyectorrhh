<template>
  <div class="vacations-list">
    <div class="list-header">
      <div class="header-left">
        <n-tag type="info">{{ pendingCount }} pendientes</n-tag>
        <n-tag type="success">{{ approvedCount }} aprobados</n-tag>
        <n-tag type="warning">{{ daysAvailable }} días disponibles</n-tag>
      </div>
      <div class="header-right">
        <n-input
          v-model:value="search"
          placeholder="Buscar empleado..."
          class="search-input"
          clearable
        />
        <n-select
          v-model:value="filterStatus"
          placeholder="Todos los estados"
          :options="statusOptions"
          style="width: 150px"
        />
        <n-button type="primary" @click="showModal = true">
          ➕ Solicitar Vacaciones
        </n-button>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredVacations"
      :loading="loading"
      :bordered="false"
      :striped="true"
    />

    <n-modal v-model:show="showModal" preset="card" title="Solicitar Vacaciones" style="width: 500px">
      <n-form :model="formData" label-placement="left" label-width="120px">
        <n-form-item label="Empleado">
          <n-select
            v-model:value="formData.empleadoId"
            :options="employeeOptions"
            placeholder="Seleccionar empleado"
          />
        </n-form-item>
        <n-form-item label="Tipo">
          <n-select
            v-model:value="formData.tipo"
            :options="typeOptions"
            placeholder="Tipo de permiso"
          />
        </n-form-item>
        <n-form-item label="Fecha Inicio">
          <n-date-picker v-model:value="formData.fechaInicio" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Fecha Fin">
          <n-date-picker v-model:value="formData.fechaFin" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Días Solicitados">
          <n-input-number :value="calculateDays" :readonly="true" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Motivo">
          <n-input v-model:value="formData.motivo" type="textarea" placeholder="Motivo de la solicitud" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">Cancelar</n-button>
          <n-button type="primary" @click="saveVacation">Enviar Solicitud</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NAvatar, NInput, NSelect, NDataTable, NModal, NForm, NFormItem, NInputNumber, NDatePicker, NSpace } from 'naive-ui'
import { api } from '@/services/api'

const message = useMessage()

const loading = ref(false)
const search = ref('')
const filterStatus = ref('todos')
const showModal = ref(false)
const vacationRecords = ref<any[]>([])
const formData = ref({
  empleadoId: null,
  tipo: 'VACACIONES',
  fechaInicio: Date.now(),
  fechaFin: Date.now() + 86400000 * 7,
  motivo: ''
})

const statusOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobados', value: 'APROBADO' },
  { label: 'Rechazados', value: 'RECHAZADO' }
]

const typeOptions = [
  { label: 'Vacaciones', value: 'VACACIONES' },
  { label: 'Permiso Médico', value: 'MEDICO' },
  { label: 'Permiso Personal', value: 'PERSONAL' },
  { label: 'Licencia por Matrimonio', value: 'MATRIMONIO' },
  { label: 'Licencia por Fallecimiento', value: 'FALLECIMIENTO' }
]

const employeeOptions = [
  { label: 'Juan Pérez', value: 'emp-001' },
  { label: 'María López', value: 'emp-002' },
  { label: 'Carlos Rodríguez', value: 'emp-003' }
]

const pendingCount = computed(() => 
  vacationRecords.value.filter((r: any) => r.estado === 'PENDIENTE').length
)
const approvedCount = computed(() => 
  vacationRecords.value.filter((r: any) => r.estado === 'APROBADO').length
)
const daysAvailable = computed(() => 15)

const calculateDays = computed(() => {
  const diff = formData.value.fechaFin - formData.value.fechaInicio
  return Math.ceil(diff / (86400000 * 1000)) + 1 || 7
})

const getStatusType = (status: string | undefined | null) => {
  if (!status) return 'default'
  switch (status) {
    case 'APROBADO': return 'success'
    case 'PENDIENTE': return 'warning'
    case 'RECHAZADO': return 'error'
    case 'TOMADO': return 'info'
    default: return 'default'
  }
}

const getTypeColor = (type: string | undefined | null) => {
  if (!type) return 'default'
  switch (type) {
    case 'VACACIONES': return 'success'
    case 'MEDICO': return 'error'
    case 'PERSONAL': return 'info'
    case 'MATRIMONIO': return 'warning'
    case 'FALLECIMIENTO': return 'default'
    default: return 'default'
  }
}

const createColumns = () => [
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'employee-cell' }, [
        h(NAvatar, { size: 'small', round: true }, () => row.nombreCompleto?.slice(0, 2)?.toUpperCase() || ''),
        h('span', { style: 'margin-left: 8px;' }, row.nombreCompleto || '')
      ])
    }
  },
  {
    title: 'Tipo',
    key: 'tipo',
    width: 140,
    render(row: any) {
      return h(NTag, { type: getTypeColor(row.tipo), size: 'small' }, () => row.tipo || '')
    }
  },
  {
    title: 'Fecha Inicio',
    key: 'fechaInicio',
    width: 120
  },
  {
    title: 'Fecha Fin',
    key: 'fechaFin',
    width: 120
  },
  {
    title: 'Días',
    key: 'dias',
    width: 70,
    render(row: any) {
      return h('strong', {}, row.dias || 0)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 120,
    render(row: any) {
      return h(NTag, { type: getStatusType(row.estado), round: true, size: 'small' }, () => row.estado || '')
    }
  },
  {
    title: 'Motivo',
    key: 'motivo'
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 180,
    render(row: any) {
      if (row.estado !== 'PENDIENTE') {
        return h('span', { style: 'color: #9ca3af; font-size: 12px;' }, 'Completado')
      }
      return h(NSpace, {}, () => [
        h(NButton, { size: 'small', type: 'success', onClick: () => approve(row.id) }, () => 'Aprobar'),
        h(NButton, { size: 'small', type: 'error', onClick: () => reject(row.id) }, () => 'Rechazar')
      ])
    }
  }
]

const columns = createColumns()

const filteredVacations = computed(() => {
  let data = vacationRecords.value || []
  
  if (search.value) {
    const s = search.value.toLowerCase()
    data = (data || []).filter((r: any) => r.nombreCompleto?.toLowerCase().includes(s))
  }
  
  if (filterStatus.value !== 'todos') {
    data = (data || []).filter((r: any) => r.estado === filterStatus.value)
  }
  
  return data || []
})

const loadVacations = async () => {
  loading.value = true
  try {
    const response = await api.get('/vacations')
    if (response.data.success) {
      vacationRecords.value = response.data.data
    }
  } catch (error) {
    vacationRecords.value = generateMockData()
  } finally {
    loading.value = false
  }
}

const generateMockData = () => [
  { id: 'vac-001', nombreCompleto: 'Juan Pérez', tipo: 'VACACIONES', fechaInicio: '2024-02-01', fechaFin: '2024-02-10', dias: 10, estado: 'PENDIENTE', motivo: 'Vacaciones familiares' },
  { id: 'vac-002', nombreCompleto: 'María López', tipo: 'MEDICO', fechaInicio: '2024-01-20', fechaFin: '2024-01-22', dias: 3, estado: 'APROBADO', motivo: 'Atención médica' },
  { id: 'vac-003', nombreCompleto: 'Carlos Rodríguez', tipo: 'VACACIONES', fechaInicio: '2024-02-15', fechaFin: '2024-02-24', dias: 10, estado: 'PENDIENTE', motivo: 'Viaje de descanso' },
  { id: 'vac-004', nombreCompleto: 'Ana García', tipo: 'PERSONAL', fechaInicio: '2024-01-25', fechaFin: '2024-01-25', dias: 1, estado: 'APROBADO', motivo: 'Trámites personales' }
]

const approve = async (id: string) => {
  try {
    await api.put(`/vacations/${id}/status`, { estado: 'APROBADO' })
    const record = vacationRecords.value.find((r: any) => r.id === id)
    if (record) record.estado = 'APROBADO'
    message.success('Solicitud aprobada')
    loadVacations()
  } catch (error) {
    message.error('Error al aprobar solicitud')
  }
}

const reject = async (id: string) => {
  try {
    await api.put(`/vacations/${id}/status`, { estado: 'RECHAZADO' })
    const record = vacationRecords.value.find((r: any) => r.id === id)
    if (record) record.estado = 'RECHAZADO'
    message.warning('Solicitud rechazada')
    loadVacations()
  } catch (error) {
    message.error('Error al rechazar solicitud')
  }
}

const saveVacation = async () => {
  try {
    await api.post('/vacations', {
      empleadoId: formData.value.empleadoId,
      tipo: formData.value.tipo,
      fechaInicio: new Date(formData.value.fechaInicio).toISOString().split('T')[0],
      fechaFin: new Date(formData.value.fechaFin).toISOString().split('T')[0],
      dias: calculateDays.value,
      motivo: formData.value.motivo
    })
    message.success('Solicitud de vacaciones enviada correctamente')
    showModal.value = false
    loadVacations()
    formData.value = {
      empleadoId: null,
      tipo: 'VACACIONES',
      fechaInicio: Date.now(),
      fechaFin: Date.now() + 86400000 * 7,
      motivo: ''
    }
  } catch (error) {
    message.error('Error al enviar solicitud')
  }
}

onMounted(() => {
  loadVacations()
})
</script>

<style scoped>
.vacations-list {
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

.search-input {
  max-width: 200px;
}

.employee-cell {
  display: flex;
  align-items: center;
}
</style>
