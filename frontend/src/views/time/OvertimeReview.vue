<template>
  <div class="overtime-review">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Revisión de Horas Extras</h1>
        <p class="subtitle">Revisa y aprueba los registros cargados.</p>
      </div>
      <div class="controls">
        <n-button @click="goBack">
          <template #icon><n-icon><ArrowBackOutline /></n-icon></template>
          Volver
        </n-button>
      </div>
    </div>

    <n-card :bordered="false" class="filters-card">
      <n-space wrap>
        <n-select
          v-model:value="filters.status"
          clearable
          placeholder="Estado"
          :options="statusOptions"
          style="width: 180px"
          @update:value="loadRecords"
        />
        <n-input
          v-model:value="filters.search"
          placeholder="Buscar empleado..."
          clearable
          style="width: 250px"
          @update:value="loadRecords"
        />
        <n-date-picker
          v-model:value="filters.month"
          type="month"
          clearable
          placeholder="Filtrar por mes"
          style="width: 180px"
          @update:value="loadRecords"
        />
        <n-button @click="clearFilters">Limpiar</n-button>
      </n-space>
    </n-card>

    <n-card :bordered="false" class="table-card">
      <template #header>
        <div class="table-header">
          <span>Registros ({{ filteredRecords.length }})</span>
          <n-space>
            <n-checkbox v-model:checked="selectAll" @update:checked="toggleSelectAll">
              Seleccionar visibles
            </n-checkbox>
            <n-button
              type="success"
              size="small"
              :disabled="selectedIds.length === 0"
              @click="approveRRHH"
            >
              Aprobar RRHH ({{ selectedIds.length }})
            </n-button>
            <n-button
              type="error"
              size="small"
              :disabled="selectedIds.length === 0"
              @click="showRejectModal = true"
            >
              Rechazar ({{ selectedIds.length }})
            </n-button>
          </n-space>
        </div>
      </template>

      <n-data-table
        :columns="columns"
        :data="filteredRecords"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :row-key="(row: Record) => row.id"
        v-model:checked-row-keys="checkedRows"
      />
    </n-card>

    <n-modal v-model:show="showRejectModal" style="width: 500px" preset="dialog" title="Rechazar Registros">
      <n-input
        v-model:value="rejectComment"
        type="textarea"
        placeholder="Motivo del rechazo..."
        :rows="3"
      />
      <template #action>
        <n-button @click="showRejectModal = false">Cancelar</n-button>
        <n-button type="error" :loading="processing" :disabled="!rejectComment" @click="rejectRecords">
          Rechazar
        </n-button>
      </template>
    </n-modal>

    <n-modal v-model:show="showEditModal" style="width: 700px" preset="card" title="Editar Registro">
      <n-form v-if="editingRecord" :model="editingRecord" label-placement="top">
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="Código Empleado">
              <n-input v-model:value="editingRecord.empleado_codigo" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Nombre">
              <n-input v-model:value="editingRecord.empleado_nombre" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Fecha">
              <n-date-picker
                v-model:value="editingRecord.fechaTimestamp"
                type="date"
                style="width: 100%"
                @update:value="updateFecha"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Horas">
              <n-input-number v-model:value="editingRecord.horas" :min="0" :step="0.5" :precision="1" style="width: 100%" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Tipo">
              <n-select
                v-model:value="editingRecord.tipo"
                :options="tipoOptions"
                placeholder="Seleccionar tipo"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Proyecto">
              <n-input v-model:value="editingRecord.proyecto_codigo" placeholder="Código de proyecto" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="Motivo">
          <n-input v-model:value="editingRecord.motivo" type="textarea" :rows="2" />
        </n-form-item>
        <n-form-item label="Observaciones">
          <n-input v-model:value="editingRecord.observaciones" type="textarea" :rows="2" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="showEditModal = false">Cancelar</n-button>
          <n-button type="primary" :loading="processing" @click="saveEdit">
            Guardar Cambios
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton, NIcon, NCard, NInput, NSelect, NDataTable, NCheckbox,
  NDatePicker, NModal, NForm, NFormItem, NInputNumber, NGrid, NGi,
  NSpace, useMessage, type DataTableColumns
} from 'naive-ui'
import {
  ArrowBackOutline, CreateOutline, CheckmarkOutline, CloseOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'

interface Record {
  id: string
  empleado_codigo: string
  empleado_dni?: string
  empleado_nombre?: string
  fecha: string
  horas: number
  tipo: string
  motivo?: string
  proyecto_codigo?: string
  observaciones?: string
  estado: string
  aprobado_por?: string
  fecha_aprobacion?: string
  fechaTimestamp?: number
}

const route = useRoute()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const processing = ref(false)
const records = ref<Record[]>([])
const checkedRows = ref<string[]>([])
const showRejectModal = ref(false)
const showEditModal = ref(false)
const editingRecord = ref<Record | null>(null)
const rejectComment = ref('')

const filters = ref({
  status: null as string | null,
  search: '',
  month: null as number | null
})

const statusOptions = [
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Aprobado RRHH', value: 'APROBADO_RRHH' },
  { label: 'Aprobado CI', value: 'APROBADO_CI' },
  { label: 'Rechazado', value: 'RECHAZADO' }
]

const tipoOptions = [
  { label: 'ORDINARIA (1.25x)', value: 'ORDINARIA' },
  { label: 'NOCTURNA (1.50x)', value: 'NOCTURNA' },
  { label: 'FERIADOS (2.00x)', value: 'FERIADOS' },
  { label: 'DOMINGOS (1.50x)', value: 'DOMINGOS' }
]

const pagination = { pageSize: 20 }

const selectedIds = computed(() => checkedRows.value)

const selectAll = computed({
  get: () => filteredRecords.value.length > 0 && checkedRows.value.length === filteredRecords.value.length,
  set: () => {}
})

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    if (filters.value.status && r.estado !== filters.value.status) return false
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      if (!r.empleado_codigo?.toLowerCase().includes(search) &&
          !r.empleado_nombre?.toLowerCase().includes(search)) return false
    }
    if (filters.value.month) {
      const monthStr = new Date(filters.value.month).toISOString().slice(0, 7)
      if (!r.fecha.startsWith(monthStr)) return false
    }
    return true
  })
})

const getStatusType = (status: string) => {
  switch (status) {
    case 'PENDIENTE': return 'warning'
    case 'APROBADO_RRHH': return 'info'
    case 'APROBADO_CI': return 'success'
    case 'RECHAZADO': return 'error'
    default: return 'default'
  }
}

const columns: DataTableColumns<Record> = [
  {
    type: 'selection',
    width: 50
  },
  {
    title: 'Código',
    key: 'empleado_codigo',
    fixed: 'left',
    width: 100
  },
  {
    title: 'Empleado',
    key: 'empleado_nombre',
    fixed: 'left',
    width: 180
  },
  {
    title: 'Fecha',
    key: 'fecha',
    width: 110
  },
  {
    title: 'Horas',
    key: 'horas',
    width: 80,
    render: (row) => h('strong', null, { default: () => `${row.horas}h` })
  },
  {
    title: 'Tipo',
    key: 'tipo',
    width: 120,
    render: (row) => h('span', { style: { fontSize: '12px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' } }, row.tipo)
  },
  {
    title: 'Motivo',
    key: 'motivo',
    width: 200,
    ellipsis: { tooltip: true }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 130,
    render: (row) => h(NTag, { type: getStatusType(row.estado), size: 'small' }, () => row.estado)
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 120,
    render: (row) => h(NSpace, { size: 'small' }, () => [
      h(
        NButton,
        { size: 'small', secondary: true, onClick: () => openEdit(row), disabled: row.estado === 'APROBADO_CI' },
        { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }
      )
    ])
  }
]

const loadRecords = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.status) params.append('status', filters.value.status)
    if (route.query.importId) params.append('importId', route.query.importId as string)

    const { data } = await api.get(`/overtime/records?${params.toString()}`)
    if (data.success) {
      records.value = data.data.map((r: any) => ({
        ...r,
        fechaTimestamp: r.fecha ? new Date(r.fecha).getTime() : null
      }))
    }
  } catch (error) {
    console.error(error)
    message.error('Error al cargar registros')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { status: null, search: '', month: null }
}

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    checkedRows.value = filteredRecords.value.map(r => r.id)
  } else {
    checkedRows.value = []
  }
}

const approveRRHH = async () => {
  if (selectedIds.value.length === 0) return

  processing.value = true
  try {
    const { data } = await api.put('/overtime/records/batch/aprove-rrhh', {
      ids: selectedIds.value
    })

    if (data.success) {
      message.success(`${selectedIds.value.length} registros aprobados por RRHH`)
      checkedRows.value = []
      loadRecords()
    }
  } catch (error) {
    console.error(error)
    message.error('Error al aprobar registros')
  } finally {
    processing.value = false
  }
}

const rejectRecords = async () => {
  if (selectedIds.value.length === 0 || !rejectComment.value) return

  processing.value = true
  try {
    const { data } = await api.put('/overtime/records/batch/reject', {
      ids: selectedIds.value,
      comentarios: rejectComment.value
    })

    if (data.success) {
      message.success(`${selectedIds.value.length} registros rechazados`)
      showRejectModal.value = false
      rejectComment.value = ''
      checkedRows.value = []
      loadRecords()
    }
  } catch (error) {
    console.error(error)
    message.error('Error al rechazar registros')
  } finally {
    processing.value = false
  }
}

const openEdit = (record: Record) => {
  editingRecord.value = { ...record }
  showEditModal.value = true
}

const updateFecha = (ts: number | null) => {
  if (editingRecord.value && ts) {
    editingRecord.value.fecha = new Date(ts).toISOString().split('T')[0]
  }
}

const saveEdit = async () => {
  if (!editingRecord.value) return

  processing.value = true
  try {
    const { data } = await api.put(`/overtime/records/${editingRecord.value.id}`, {
      horas: editingRecord.value.horas,
      tipo: editingRecord.value.tipo,
      motivo: editingRecord.value.motivo,
      proyecto_codigo: editingRecord.value.proyecto_codigo,
      observaciones: editingRecord.value.observaciones
    })

    if (data.success) {
      message.success('Registro actualizado')
      showEditModal.value = false
      loadRecords()
    }
  } catch (error) {
    console.error(error)
    message.error('Error al guardar')
  } finally {
    processing.value = false
  }
}

const goBack = () => {
  router.push('/time?tab=overtime')
}

watch(() => route.query.importId, () => {
  loadRecords()
})

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.overtime-review {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.controls {
  display: flex;
  gap: 12px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
  margin: 4px 0 0;
}

.filters-card {
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
