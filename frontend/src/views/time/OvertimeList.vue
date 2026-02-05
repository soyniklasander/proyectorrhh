<template>
  <div class="overtime-list">
    <div class="list-header">
      <div class="header-left">
        <n-tag type="warning">{{ totalHours }} horas registradas</n-tag>
        <n-tag type="success">S/ {{ totalCost.toLocaleString() }} total</n-tag>
        <n-tag type="info">{{ pendingCount }} pendientes</n-tag>
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
        <n-date-picker
          v-model:value="dateRange"
          type="daterange"
          style="width: 250px"
        />
        <n-button type="primary" @click="showModal = true">
          ➕ Registrar Horas Extras
        </n-button>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredOvertime"
      :loading="loading"
      :bordered="false"
      :striped="true"
    />

    <n-modal v-model:show="showModal" preset="card" title="Registrar Horas Extras" style="width: 500px">
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
        <n-form-item label="Horas">
          <n-input-number v-model:value="formData.horas" :min="1" :max="12" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Tipo">
          <n-select
            v-model:value="formData.tipo"
            :options="typeOptions"
            placeholder="Tipo de hora extra"
          />
        </n-form-item>
        <n-form-item label="Motivo">
          <n-input v-model:value="formData.motivo" type="textarea" placeholder="Motivo de las horas extras" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">Cancelar</n-button>
          <n-button type="primary" @click="saveOvertime">Guardar</n-button>
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
const dateRange = ref<[number, number] | null>(null)
const showModal = ref(false)
const overtimeRecords = ref<any[]>([])
const formData = ref({
  empleadoId: null,
  fecha: Date.now(),
  horas: 2,
  tipo: 'ORDINARIA',
  motivo: ''
})

const statusOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobadas', value: 'APROBADA' },
  { label: 'Rechazadas', value: 'RECHAZADA' }
]

const typeOptions = [
  { label: 'Ordinaria (25%)', value: 'ORDINARIA' },
  { label: 'Feriado (100%)', value: 'FERIADO' },
  { label: ' Nocturna (35%)', value: 'NOCTURNA' }
]

const employeeOptions = [
  { label: 'Juan Pérez', value: 'emp-001' },
  { label: 'María López', value: 'emp-002' },
  { label: 'Carlos Rodríguez', value: 'emp-003' }
]

const totalHours = computed(() => 
  overtimeRecords.value.reduce((acc: number, r: any) => acc + (r.horas || 0), 0)
)
const totalCost = computed(() => 
  overtimeRecords.value.reduce((acc: number, r: any) => acc + (r.monto || 0), 0)
)
const pendingCount = computed(() => 
  overtimeRecords.value.filter((r: any) => r.estado === 'PENDIENTE').length
)

const getStatusType = (status: string | undefined | null) => {
  if (!status) return 'default'
  switch (status) {
    case 'APROBADA': return 'success'
    case 'PENDIENTE': return 'warning'
    case 'RECHAZADA': return 'error'
    default: return 'info'
  }
}

const getTypeColor = (type: string | undefined | null) => {
  if (!type) return 'default'
  switch (type) {
    case 'ORDINARIA': return 'info'
    case 'FERIADO': return 'warning'
    case 'NOCTURNA': return 'default'
    default: return 'info'
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
    title: 'Fecha',
    key: 'fecha',
    width: 120
  },
  {
    title: 'Horas',
    key: 'horas',
    width: 80,
    render(row: any) {
      return h('strong', { style: 'color: #f59e0b;' }, `${row.horas}h`)
    }
  },
  {
    title: 'Tipo',
    key: 'tipo',
    width: 140,
    render(row: any) {
      const typeColors: Record<string, string> = {
        'ORDINARIA': 'info',
        'FERIADO': 'warning',
        'NOCTURNA': 'default'
      }
      return h(NTag, { type: typeColors[row.tipo] || 'info', size: 'small' }, () => row.tipo || '')
    }
  },
  {
    title: 'Monto',
    key: 'monto',
    width: 100,
    render(row: any) {
      return h('strong', {}, `S/ ${Number(row.monto || 0).toFixed(2)}`)
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
    title: 'Acciones',
    key: 'actions',
    width: 180,
    render(row: any) {
      return h(NSpace, {}, () => [
        h(NButton, { size: 'small', type: 'success', onClick: () => approve(row.id) }, () => 'Aprobar'),
        h(NButton, { size: 'small', type: 'error', onClick: () => reject(row.id) }, () => 'Rechazar')
      ])
    }
  }
]

const columns = createColumns()

const filteredOvertime = computed(() => {
  let data = overtimeRecords.value || []
  
  if (search.value) {
    const s = search.value.toLowerCase()
    data = (data || []).filter((r: any) => r.nombreCompleto?.toLowerCase().includes(s))
  }
  
  if (filterStatus.value !== 'todos') {
    data = (data || []).filter((r: any) => r.estado === filterStatus.value)
  }
  
  return data || []
})

const loadOvertime = async () => {
  loading.value = true
  try {
    const response = await api.get('/overtime')
    if (response.data.success) {
      overtimeRecords.value = response.data.data
    }
  } catch (error) {
    overtimeRecords.value = generateMockData()
  } finally {
    loading.value = false
  }
}

const generateMockData = () => [
  { id: 'ot-001', nombreCompleto: 'Juan Pérez', fecha: '2024-01-15', horas: 2, tipo: 'ORDINARIA', monto: 50, estado: 'PENDIENTE' },
  { id: 'ot-002', nombreCompleto: 'María López', fecha: '2024-01-15', horas: 3, tipo: 'FERIADO', monto: 150, estado: 'APROBADA' },
  { id: 'ot-003', nombreCompleto: 'Carlos Rodríguez', fecha: '2024-01-14', horas: 1, tipo: 'NOCTURNA', monto: 30, estado: 'PENDIENTE' },
  { id: 'ot-004', nombreCompleto: 'Ana García', fecha: '2024-01-14', horas: 4, tipo: 'ORDINARIA', monto: 100, estado: 'APROBADA' }
]

const approve = async (id: string) => {
  try {
    await api.put(`/overtime/${id}/status`, { estado: 'APROBADA' })
    const record = overtimeRecords.value.find((r: any) => r.id === id)
    if (record) record.estado = 'APROBADA'
    message.success('Horas extras aprobadas')
    loadOvertime()
  } catch (error) {
    message.error('Error al aprobar horas extras')
  }
}

const reject = async (id: string) => {
  try {
    await api.put(`/overtime/${id}/status`, { estado: 'RECHAZADA' })
    const record = overtimeRecords.value.find((r: any) => r.id === id)
    if (record) record.estado = 'RECHAZADA'
    message.warning('Horas extras rechazadas')
    loadOvertime()
  } catch (error) {
    message.error('Error al rechazar horas extras')
  }
}

const saveOvertime = async () => {
  try {
    await api.post('/overtime', {
      empleadoId: formData.value.empleadoId,
      fecha: new Date(formData.value.fecha).toISOString().split('T')[0],
      horas: formData.value.horas,
      tipo: formData.value.tipo,
      motivo: formData.value.motivo
    })
    message.success('Horas extras registradas correctamente')
    showModal.value = false
    loadOvertime()
    formData.value = {
      empleadoId: null,
      fecha: Date.now(),
      horas: 2,
      tipo: 'ORDINARIA',
      motivo: ''
    }
  } catch (error) {
    message.error('Error al registrar horas extras')
  }
}

onMounted(() => {
  loadOvertime()
})
</script>

<style scoped>
.overtime-list {
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
