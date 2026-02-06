<template>
  <div class="permits-list">
    <AppleCard>
      <div class="list-header">
        <div class="header-left">
          <AppleBadge type="info" :label="`${permits.length} permisos`" />
          <AppleBadge type="warning" :label="`${pendingPermits} pendientes`" />
          <AppleBadge type="success" :label="`${approvedPermits} aprobados`" />
        </div>
        <div class="header-right">
          <AppleSearchInput v-model="search" placeholder="Buscar..." class="search-input" />
          <AppleSelect v-model="filterType" placeholder="Todos los tipos" :options="typeOptions" class="filter-select" />
          <AppleButton variant="primary" :icon="PlusIcon" @click="showModal = true">➕ Nuevo</AppleButton>
        </div>
      </div>

      <AppleTable :columns="columns" :data="filteredPermits" :loading="loading" :bordered="false" :striped="true" />
    </AppleCard>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <AppleCard class="modal-card" title="Registrar Permiso">
        <div class="form-grid">
          <div class="form-item">
            <label>Empleado</label>
            <select v-model="formData.empleadoId" class="form-select">
              <option :value="null">Seleccionar</option>
              <option v-for="emp in employeeOptions" :key="emp.value" :value="emp.value">{{ emp.label }}</option>
            </select>
          </div>
          <div class="form-item">
            <label>Tipo</label>
            <select v-model="formData.tipo" class="form-select">
              <option value="PERSONAL">Personal</option>
              <option value="MEDICO">Médico</option>
              <option value="COMISION">Comisión</option>
            </select>
          </div>
          <div class="form-item"><label>Fecha</label><input type="date" v-model="formData.fechaString" class="form-input" /></div>
          <div class="form-item"><label>Hora Inicio</label><input type="time" v-model="formData.horaInicio" class="form-input" /></div>
          <div class="form-item"><label>Hora Fin</label><input type="time" v-model="formData.horaFin" class="form-input" /></div>
          <div class="form-item full-width"><label>Motivo</label><textarea v-model="formData.motivo" class="form-textarea"></textarea></div>
        </div>
        <template #footer>
          <div class="modal-actions">
            <AppleButton variant="ghost" @click="showModal = false">Cancelar</AppleButton>
            <AppleButton variant="primary" @click="savePermit">Guardar</AppleButton>
          </div>
        </template>
      </AppleCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { AppleCard, AppleButton, AppleBadge, AppleTable, AppleAvatar, AppleTag, AppleSearchInput, AppleSelect } from '@/components/apple'
import { Plus } from 'lucide-vue-next'
import { api } from '@/services/api'

const PlusIcon = Plus
const loading = ref(false)
const search = ref('')
const filterType = ref('')
const showModal = ref(false)
const permits = ref<any[]>([])

const formData = ref({
  empleadoId: null as string | null,
  tipo: 'PERSONAL',
  fecha: new Date().toISOString().split('T')[0],
  fechaString: new Date().toISOString().split('T')[0],
  horaInicio: '09:00',
  horaFin: '11:00',
  motivo: ''
})

const typeOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobados', value: 'APROBADO' }
]

const permitTypeOptions = [
  { label: 'Personal', value: 'PERSONAL' },
  { label: 'Médico', value: 'MEDICO' },
  { label: 'Comisión', value: 'COMISION' }
]

const employeeOptions = [
  { label: 'Juan Pérez', value: 'emp-001' },
  { label: 'María López', value: 'emp-002' }
]

const pendingPermits = computed(() => permits.value.filter((p: any) => p.estado === 'PENDIENTE').length)
const approvedPermits = computed(() => permits.value.filter((p: any) => p.estado === 'APROBADO').length)

const getStatusType = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'APROBADO': return 'success'
    case 'PENDIENTE': return 'warning'
    case 'RECHAZADO': return 'error'
    default: return 'default'
  }
}

const columns = [
  { title: 'Empleado', key: 'empleado', render: (row: any) => h('div', { class: 'cell' }, [h(AppleAvatar, { src: '', size: 'sm', name: row.nombreCompleto || '' }), h('span', { style: 'margin-left: 8px;' }, row.nombreCompleto || '')]) },
  { title: 'Tipo', key: 'tipo', width: '130px', render: (row: any) => h(AppleTag, { type: 'primary', label: row.tipo || '' }) },
  { title: 'Fecha', key: 'fecha', width: '110px' },
  { title: 'Inicio', key: 'horaInicio', width: '100px' },
  { title: 'Fin', key: 'horaFin', width: '100px' },
  { title: 'Estado', key: 'estado', width: '110px', render: (row: any) => h(AppleTag, { type: getStatusType(row.estado), label: row.estado || '' }) },
  { title: 'Acciones', key: 'actions', width: '180px', render: (row: any) => {
    if (row.estado !== 'PENDIENTE') return h('span', { style: 'color: #9ca3af; font-size: 12px;' }, 'Completado')
    return h('div', { class: 'actions' }, [
      h(AppleButton, { variant: 'success', size: 'small', onClick: () => approve(row.id) }, () => 'Aprobar'),
      h(AppleButton, { variant: 'danger', size: 'small', onClick: () => reject(row.id) }, () => 'Rechazar')
    ])
  }}
]

const filteredPermits = computed(() => {
  let data = permits.value || []
  if (search.value) data = data.filter((p: any) => p.nombreCompleto?.toLowerCase().includes(search.value.toLowerCase()))
  if (filterType.value) data = data.filter((p: any) => p.estado === filterType.value)
  return data
})

const loadPermits = async () => {
  loading.value = true
  try {
    const response = await api.get('/permits')
    if (response.data.success) permits.value = response.data.data
  } catch (error) {
    permits.value = generateMockData()
  } finally { loading.value = false }
}

const generateMockData = () => [
  { id: 'perm-001', nombreCompleto: 'Juan Pérez', tipo: 'PERSONAL', fecha: '2024-01-16', horaInicio: '09:00', horaFin: '11:00', estado: 'PENDIENTE' },
  { id: 'perm-002', nombreCompleto: 'María López', tipo: 'MEDICO', fecha: '2024-01-15', horaInicio: '14:00', horaFin: '17:00', estado: 'APROBADO' }
]

const approve = async (id: string) => {
  await api.put(`/permits/${id}/status`, { estado: 'APROBADO' })
  permits.value.find((p: any) => p.id === id)!.estado = 'APROBADO'
  alert('Aprobado')
}

const reject = async (id: string) => {
  await api.put(`/permits/${id}/status`, { estado: 'RECHAZADO' })
  permits.value.find((p: any) => p.id === id)!.estado = 'RECHAZADO'
  alert('Rechazado')
}

const savePermit = async () => {
  await api.post('/permits', { empleadoId: formData.value.empleadoId, tipo: formData.value.tipo, fecha: formData.value.fechaString, horaInicio: formData.value.horaInicio, horaFin: formData.value.horaFin, motivo: formData.value.motivo })
  alert('Registrado')
  showModal.value = false
  loadPermits()
}

onMounted(loadPermits)
</script>

<style scoped>
.permits-list { padding: 0; }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.header-left, .header-right { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.search-input { max-width: 200px; }
.filter-select { width: 180px; }
.cell { display: flex; align-items: center; }
.actions { display: flex; gap: 8px; }
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
