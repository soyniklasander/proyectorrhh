<template>
  <div class="permits-list">
    <div class="list-header">
      <div class="header-left">
        <n-tag type="info">{{ permits.length }} permisos</n-tag>
        <n-tag type="warning">{{ pendingPermits }} pendientes</n-tag>
        <n-tag type="success">{{ approvedPermits }} aprobados</n-tag>
      </div>
      <div class="header-right">
        <n-input
          v-model:value="search"
          placeholder="Buscar empleado..."
          class="search-input"
          clearable
        />
        <n-select
          v-model:value="filterType"
          placeholder="Todos los tipos"
          :options="typeOptions"
          style="width: 180px"
          clearable
        />
        <n-button type="primary" @click="showModal = true">
          ➕ Nuevo Permiso
        </n-button>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredPermits"
      :loading="loading"
      :bordered="false"
      :striped="true"
    />

    <n-modal v-model:show="showModal" preset="card" title="Registrar Permiso" style="width: 500px">
      <n-form :model="formData" label-placement="left" label-width="120px">
        <n-form-item label="Empleado">
          <n-select
            v-model:value="formData.empleadoId"
            :options="employeeOptions"
            placeholder="Seleccionar empleado"
          />
        </n-form-item>
        <n-form-item label="Tipo de Permiso">
          <n-select
            v-model:value="formData.tipo"
            :options="permitTypeOptions"
            placeholder="Tipo de permiso"
          />
        </n-form-item>
        <n-form-item label="Fecha">
          <n-date-picker v-model:value="formData.fecha" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Hora Inicio">
          <n-time-picker v-model:value="formData.horaInicio" format="HH:mm" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Hora Fin">
          <n-time-picker v-model:value="formData.horaFin" format="HH:mm" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Motivo">
          <n-input v-model:value="formData.motivo" type="textarea" placeholder="Describe el motivo del permiso" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">Cancelar</n-button>
          <n-button type="primary" @click="savePermit">Guardar</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NAvatar, NInput, NSelect, NDataTable, NModal, NForm, NFormItem, NTimePicker, NSpace } from 'naive-ui'
import { api } from '@/services/api'

const message = useMessage()

const loading = ref(false)
const search = ref('')
const filterType = ref(null)
const showModal = ref(false)
const permits = ref<any[]>([])
const formData = ref({
  empleadoId: null,
  tipo: 'PERSONAL',
  fecha: Date.now(),
  horaInicio: Date.now(),
  horaFin: Date.now() + 3600000,
  motivo: ''
})

const typeOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobados', value: 'APROBADO' },
  { label: 'Rechazados', value: 'RECHAZADO' }
]

const permitTypeOptions = [
  { label: 'Permiso Personal', value: 'PERSONAL' },
  { label: 'Permiso Médico', value: 'MEDICO' },
  { label: 'Permiso por Comisiones', value: 'COMISION' },
  { label: 'Permiso por Capacitación', value: 'CAPACITACION' },
  { label: 'Otros', value: 'OTROS' }
]

const employeeOptions = [
  { label: 'Juan Pérez', value: 'emp-001' },
  { label: 'María López', value: 'emp-002' },
  { label: 'Carlos Rodríguez', value: 'emp-003' },
  { label: 'Ana García', value: 'emp-004' }
]

const pendingPermits = computed(() => 
  permits.value.filter((p: any) => p.estado === 'PENDIENTE').length
)
const approvedPermits = computed(() => 
  permits.value.filter((p: any) => p.estado === 'APROBADO').length
)

const getStatusType = (status: string | undefined | null) => {
  if (!status) return 'default'
  switch (status) {
    case 'APROBADO': return 'success'
    case 'PENDIENTE': return 'warning'
    case 'RECHAZADO': return 'error'
    default: return 'default'
  }
}

const getTypeColor = (type: string | undefined | null) => {
  if (!type) return 'default'
  switch (type) {
    case 'PERSONAL': return 'info'
    case 'MEDICO': return 'error'
    case 'COMISION': return 'success'
    case 'CAPACITACION': return 'warning'
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
    width: 130,
    render(row: any) {
      return h(NTag, { type: getTypeColor(row.tipo), size: 'small' }, () => row.tipo || '')
    }
  },
  {
    title: 'Fecha',
    key: 'fecha',
    width: 110
  },
  {
    title: 'Hora Inicio',
    key: 'horaInicio',
    width: 100
  },
  {
    title: 'Hora Fin',
    key: 'horaFin',
    width: 100
  },
  {
    title: 'Duración',
    key: 'duracion',
    width: 80,
    render(row: any) {
      return h('span', { style: 'font-size: 12px;' }, row.duracion || '-')
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 110,
    render(row: any) {
      return h(NTag, { type: getStatusType(row.estado), round: true, size: 'small' }, () => row.estado || '')
    }
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

const filteredPermits = computed(() => {
  let data = permits.value || []
  
  if (search.value) {
    const s = search.value.toLowerCase()
    data = (data || []).filter((p: any) => p.nombreCompleto?.toLowerCase().includes(s))
  }
  
  if (filterType.value) {
    data = (data || []).filter((p: any) => p.estado === filterType.value)
  }
  
  return data || []
})

const loadPermits = async () => {
  loading.value = true
  try {
    const response = await api.get('/permits')
    if (response.data.success) {
      permits.value = response.data.data
    }
  } catch (error) {
    permits.value = generateMockData()
  } finally {
    loading.value = false
  }
}

const generateMockData = () => [
  { id: 'perm-001', nombreCompleto: 'Juan Pérez', tipo: 'PERSONAL', fecha: '2024-01-16', horaInicio: '09:00', horaFin: '11:00', duracion: '2h', estado: 'PENDIENTE' },
  { id: 'perm-002', nombreCompleto: 'María López', tipo: 'MEDICO', fecha: '2024-01-15', horaInicio: '14:00', horaFin: '17:00', duracion: '3h', estado: 'APROBADO' },
  { id: 'perm-003', nombreCompleto: 'Carlos Rodríguez', tipo: 'COMISION', fecha: '2024-01-17', horaInicio: '08:00', horaFin: '18:00', duracion: '10h', estado: 'PENDIENTE' },
  { id: 'perm-004', nombreCompleto: 'Ana García', tipo: 'CAPACITACION', fecha: '2024-01-18', horaInicio: '09:00', horaFin: '13:00', duracion: '4h', estado: 'APROBADO' },
  { id: 'perm-005', nombreCompleto: 'Pedro Fernández', tipo: 'PERSONAL', fecha: '2024-01-19', horaInicio: '15:00', horaFin: '16:00', duracion: '1h', estado: 'PENDIENTE' }
]

const approve = async (id: string) => {
  try {
    await api.put(`/permits/${id}/status`, { estado: 'APROBADO' })
    const permit = permits.value.find((p: any) => p.id === id)
    if (permit) permit.estado = 'APROBADO'
    message.success('Permiso aprobado')
    loadPermits()
  } catch (error) {
    message.error('Error al aprobar permiso')
  }
}

const reject = async (id: string) => {
  try {
    await api.put(`/permits/${id}/status`, { estado: 'RECHAZADO' })
    const permit = permits.value.find((p: any) => p.id === id)
    if (permit) permit.estado = 'RECHAZADO'
    message.warning('Permiso rechazado')
    loadPermits()
  } catch (error) {
    message.error('Error al rechazar permiso')
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const savePermit = async () => {
  try {
    await api.post('/permits', {
      empleadoId: formData.value.empleadoId,
      tipo: formData.value.tipo,
      fecha: new Date(formData.value.fecha).toISOString().split('T')[0],
      horaInicio: formatTime(formData.value.horaInicio),
      horaFin: formatTime(formData.value.horaFin),
      motivo: formData.value.motivo
    })
    message.success('Permiso registrado correctamente')
    showModal.value = false
    loadPermits()
    formData.value = {
      empleadoId: null,
      tipo: 'PERSONAL',
      fecha: Date.now(),
      horaInicio: Date.now(),
      horaFin: Date.now() + 3600000,
      motivo: ''
    }
  } catch (error) {
    message.error('Error al registrar permiso')
  }
}

onMounted(() => {
  loadPermits()
})
</script>

<style scoped>
.permits-list {
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
