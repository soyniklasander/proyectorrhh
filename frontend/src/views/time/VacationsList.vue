<template>
  <div class="vacations-list">
    <AppleCard>
      <div class="list-header">
        <div class="header-left">
          <AppleBadge type="info" :label="`${pendingCount} pendientes`" />
          <AppleBadge type="success" :label="`${approvedCount} aprobados`" />
          <AppleBadge type="warning" :label="`${daysAvailable} días disponibles`" />
        </div>
        <div class="header-right">
          <AppleSearchInput v-model="search" placeholder="Buscar..." class="search-input" />
          <AppleSelect
            v-model="filterStatus"
            placeholder="Todos los estados"
            :options="statusOptions"
            class="filter-select"
          />
          <AppleButton variant="primary" :icon="PlusIcon" @click="showModal = true">
            ➕ Solicitar
          </AppleButton>
        </div>
      </div>

      <AppleTable
        :columns="columns"
        :data="filteredVacations"
        :loading="loading"
        :bordered="false"
        :striped="true"
      />
    </AppleCard>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <AppleCard class="modal-card" title="Solicitar Vacaciones">
        <div class="form-grid">
          <div class="form-item">
            <label>Empleado</label>
            <select v-model="formData.empleadoId" class="form-select">
              <option :value="null">Seleccionar</option>
              <option v-for="emp in employeeOptions" :key="emp.value" :value="emp.value">
                {{ emp.label }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label>Tipo</label>
            <select v-model="formData.tipo" class="form-select">
              <option value="VACACIONES">Vacaciones</option>
              <option value="MEDICO">Permiso Médico</option>
              <option value="PERSONAL">Personal</option>
            </select>
          </div>
          <div class="form-item">
            <label>Fecha Inicio</label>
            <input type="date" v-model="formData.fechaInicioString" class="form-input" />
          </div>
          <div class="form-item">
            <label>Fecha Fin</label>
            <input type="date" v-model="formData.fechaFinString" class="form-input" />
          </div>
          <div class="form-item full-width">
            <label>Motivo</label>
            <textarea v-model="formData.motivo" class="form-textarea"></textarea>
          </div>
        </div>
        <template #footer>
          <div class="modal-actions">
            <AppleButton variant="ghost" @click="showModal = false">Cancelar</AppleButton>
            <AppleButton variant="primary" @click="saveVacation">Enviar</AppleButton>
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
  AppleTag,
  AppleSearchInput,
  AppleSelect
} from '@/components/apple'
import { Plus } from 'lucide-vue-next'
import { api } from '@/services/api'

const PlusIcon = Plus

const loading = ref(false)
const search = ref('')
const filterStatus = ref('todos')
const showModal = ref(false)
const vacationRecords = ref<any[]>([])

const formData = ref({
  empleadoId: null as string | null,
  tipo: 'VACACIONES',
  fechaInicio: new Date().toISOString().split('T')[0],
  fechaInicioString: new Date().toISOString().split('T')[0],
  fechaFin: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  fechaFinString: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  motivo: ''
})

const statusOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobados', value: 'APROBADO' },
  { label: 'Rechazados', value: 'RECHAZADO' }
]

const employeeOptions = [
  { label: 'Juan Pérez', value: 'emp-001' },
  { label: 'María López', value: 'emp-002' }
]

const pendingCount = computed(() => vacationRecords.value.filter((r: any) => r.estado === 'PENDIENTE').length)
const approvedCount = computed(() => vacationRecords.value.filter((r: any) => r.estado === 'APROBADO').length)
const daysAvailable = computed(() => 15)

const getStatusType = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'APROBADO': return 'success'
    case 'PENDIENTE': return 'warning'
    case 'RECHAZADO': return 'error'
    default: return 'default'
  }
}

const columns = [
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'employee-cell' }, [
        h(AppleAvatar, { src: '', size: 'sm', name: row.nombreCompleto || '' }),
        h('span', { style: 'margin-left: 8px;' }, row.nombreCompleto || '')
      ])
    }
  },
  {
    title: 'Tipo',
    key: 'tipo',
    width: '140px',
    render(row: any) {
      return h(AppleTag, { type: 'primary', label: row.tipo || '' })
    }
  },
  { title: 'Inicio', key: 'fechaInicio', width: '120px' },
  { title: 'Fin', key: 'fechaFin', width: '120px' },
  { title: 'Días', key: 'dias', width: '70px', render: (row: any) => h('strong', {}, row.dias || 0) },
  {
    title: 'Estado',
    key: 'estado',
    width: '120px',
    render(row: any) {
      return h(AppleTag, { type: getStatusType(row.estado), label: row.estado || '' })
    }
  },
  { title: 'Motivo', key: 'motivo' },
  {
    title: 'Acciones',
    key: 'actions',
    width: '180px',
    render(row: any) {
      if (row.estado !== 'PENDIENTE') {
        return h('span', { style: 'color: #9ca3af; font-size: 12px;' }, 'Completado')
      }
      return h('div', { class: 'action-buttons' }, [
        h(AppleButton, { variant: 'success', size: 'small', onClick: () => approve(row.id) }, () => 'Aprobar'),
        h(AppleButton, { variant: 'danger', size: 'small', onClick: () => reject(row.id) }, () => 'Rechazar')
      ])
    }
  }
]

const filteredVacations = computed(() => {
  let data = vacationRecords.value || []
  if (search.value) {
    data = data.filter((r: any) => r.nombreCompleto?.toLowerCase().includes(search.value.toLowerCase()))
  }
  if (filterStatus.value !== 'todos') {
    data = data.filter((r: any) => r.estado === filterStatus.value)
  }
  return data
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
  { id: 'vac-001', nombreCompleto: 'Juan Pérez', tipo: 'VACACIONES', fechaInicio: '2024-02-01', fechaFin: '2024-02-10', dias: 10, estado: 'PENDIENTE', motivo: 'Vacaciones' },
  { id: 'vac-002', nombreCompleto: 'María López', tipo: 'MEDICO', fechaInicio: '2024-01-20', fechaFin: '2024-01-22', dias: 3, estado: 'APROBADO', motivo: 'Médico' }
]

const approve = async (id: string) => {
  try {
    await api.put(`/vacations/${id}/status`, { estado: 'APROBADO' })
    const record = vacationRecords.value.find((r: any) => r.id === id)
    if (record) record.estado = 'APROBADO'
    alert('Aprobado')
    loadVacations()
  } catch (error) {
    alert('Error')
  }
}

const reject = async (id: string) => {
  try {
    await api.put(`/vacations/${id}/status`, { estado: 'RECHAZADO' })
    const record = vacationRecords.value.find((r: any) => r.id === id)
    if (record) record.estado = 'RECHAZADO'
    alert('Rechazado')
    loadVacations()
  } catch (error) {
    alert('Error')
  }
}

const saveVacation = async () => {
  try {
    await api.post('/vacations', {
      empleadoId: formData.value.empleadoId,
      tipo: formData.value.tipo,
      fechaInicio: formData.value.fechaInicioString,
      fechaFin: formData.value.fechaFinString,
      motivo: formData.value.motivo
    })
    alert('Solicitud enviada')
    showModal.value = false
    loadVacations()
  } catch (error) {
    alert('Error')
  }
}

onMounted(() => loadVacations())
</script>

<style scoped>
.vacations-list { padding: 0; }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.header-left, .header-right { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.search-input { max-width: 200px; }
.filter-select { width: 150px; }
.employee-cell { display: flex; align-items: center; }
.action-buttons { display: flex; gap: 8px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-card { width: 500px; max-width: 90vw; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-item { display: flex; flex-direction: column; gap: 6px; }
.form-item.full-width { grid-column: span 2; }
.form-item label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.form-input, .form-select, .form-textarea { padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 14px; }
.form-textarea { min-height: 80px; resize: vertical; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
</style>
