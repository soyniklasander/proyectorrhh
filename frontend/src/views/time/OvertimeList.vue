<template>
  <div class="overtime-list">
    <AppleCard>
      <div class="list-header">
        <div class="header-left">
          <AppleBadge type="warning" :label="`${totalHours} horas`" />
          <AppleBadge type="success" :label="`S/ ${totalCost.toLocaleString()}`" />
          <AppleBadge type="info" :label="`${pendingCount} pendientes`" />
        </div>
        <div class="header-right">
          <AppleSearchInput v-model="search" placeholder="Buscar empleado..." />
          <AppleSelect v-model="filterStatus" placeholder="Todos" :options="statusOptions" />
          <AppleButton variant="primary" @click="showModal = true">Registrar</AppleButton>
        </div>
      </div>

      <AppleTable :columns="columns" :data="filteredOvertime" :bordered="false" :striped="true" />
    </AppleCard>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <AppleCard class="modal-card" title="Registrar Horas Extras">
        <div class="form-grid">
          <div class="form-item"><label>Empleado</label><AppleSelect v-model="formData.empleadoId" :options="employeeOptions" /></div>
          <div class="form-item"><label>Fecha</label><AppleInput v-model="formData.fechaString" /></div>
          <div class="form-item"><label>Horas</label><AppleInput v-model="formData.horasStr" /></div>
          <div class="form-item"><label>Tipo</label><AppleSelect v-model="formData.tipo" :options="tipoOptions" /></div>
          <div class="form-item full"><label>Motivo</label><textarea v-model="formData.motivo" class="textarea"></textarea></div>
        </div>
        <template #footer>
          <div class="modal-actions">
            <AppleButton variant="secondary" @click="showModal = false">Cancelar</AppleButton>
            <AppleButton variant="primary" @click="saveOvertime">Guardar</AppleButton>
          </div>
        </template>
      </AppleCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AppleCard, AppleButton, AppleBadge, AppleTable, AppleAvatar, AppleTag, AppleSearchInput, AppleSelect, AppleInput } from '@/components/apple'
import { api } from '@/services/api'

const loading = ref(false)
const search = ref('')
const filterStatus = ref('todos')
const showModal = ref(false)
const overtimeRecords = ref<any[]>([])

const formData = ref({ empleadoId: null as string | null, fechaString: new Date().toISOString().split('T')[0], horas: 2, horasStr: '2', tipo: 'ORDINARIA', motivo: '' })
const tipoOptions = [{ label: 'Ordinaria (25%)', value: 'ORDINARIA' }, { label: 'Feriado (100%)', value: 'FERIADO' }, { label: 'Nocturna (35%)', value: 'NOCTURNA' }]
const statusOptions = [{ label: 'Todos', value: 'todos' }, { label: 'Pendientes', value: 'PENDIENTE' }, { label: 'Aprobadas', value: 'APROBADA' }, { label: 'Rechazadas', value: 'RECHAZADA' }]
const employeeOptions = [{ label: 'Juan Pérez', value: 'emp-001' }, { label: 'María López', value: 'emp-002' }]

watch(() => formData.value.horas, (val) => { formData.value.horasStr = String(val) })

const totalHours = computed(() => overtimeRecords.value.reduce((acc: number, r: any) => acc + (r.horas || 0), 0))
const totalCost = computed(() => overtimeRecords.value.reduce((acc: number, r: any) => acc + (r.monto || 0), 0))
const pendingCount = computed(() => overtimeRecords.value.filter((r: any) => r.estado === 'PENDIENTE').length)

const columns = [
  { title: 'Empleado', key: 'empleado', render: (row: any) => h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [h(AppleAvatar, { src: '', size: 'sm', name: row.nombreCompleto || '' }), row.nombreCompleto || '']) },
  { title: 'Fecha', key: 'fecha' },
  { title: 'Horas', key: 'horas', render: (row: any) => `${row.horas}h` },
  { title: 'Tipo', key: 'tipo', render: (row: any) => row.tipo },
  { title: 'Monto', key: 'monto', render: (row: any) => `S/ ${Number(row.monto || 0).toFixed(2)}` },
  { title: 'Estado', key: 'estado', render: (row: any) => row.estado },
  { title: 'Acciones', key: 'actions', render: (row: any) => h('div', { style: 'display: flex; gap: 8px;' }, [h(AppleButton, { variant: 'secondary', size: 'small', onClick: () => approve(row.id) }, () => 'Aprobar'), h(AppleButton, { variant: 'secondary', size: 'small', onClick: () => reject(row.id) }, () => 'Rechazar')]) }
]

const filteredOvertime = computed(() => {
  let data = overtimeRecords.value || []
  if (search.value) data = data.filter((r: any) => r.nombreCompleto?.toLowerCase().includes(search.value.toLowerCase()))
  if (filterStatus.value !== 'todos') data = data.filter((r: any) => r.estado === filterStatus.value)
  return data
})

const loadOvertime = async () => {
  loading.value = true
  try {
    const response = await api.get('/overtime')
    if (response.data.success) overtimeRecords.value = response.data.data
  } catch (error) { overtimeRecords.value = generateMockData() }
  finally { loading.value = false }
}

const generateMockData = () => [
  { id: 'ot-001', nombreCompleto: 'Juan Pérez', fecha: '2024-01-15', horas: 2, tipo: 'ORDINARIA', monto: 50, estado: 'PENDIENTE' },
  { id: 'ot-002', nombreCompleto: 'María López', fecha: '2024-01-15', horas: 3, tipo: 'FERIADO', monto: 150, estado: 'APROBADA' },
  { id: 'ot-003', nombreCompleto: 'Carlos Rodríguez', fecha: '2024-01-14', horas: 1, tipo: 'NOCTURNA', monto: 30, estado: 'PENDIENTE' }
]

const approve = async (id: string) => {
  try { await api.put(`/overtime/${id}/status`, { estado: 'APROBADA' }); const record = overtimeRecords.value.find((r: any) => r.id === id); if (record) record.estado = 'APROBADA'; alert('Horas extras aprobadas'); loadOvertime() }
  catch { alert('Error al aprobar') }
}

const reject = async (id: string) => {
  try { await api.put(`/overtime/${id}/status`, { estado: 'RECHAZADA' }); const record = overtimeRecords.value.find((r: any) => r.id === id); if (record) record.estado = 'RECHAZADA'; alert('Horas extras rechazadas'); loadOvertime() }
  catch { alert('Error al rechazar') }
}

const saveOvertime = async () => {
  try {
    await api.post('/overtime', { empleadoId: formData.value.empleadoId, fecha: formData.value.fechaString, horas: Number(formData.value.horasStr), tipo: formData.value.tipo, motivo: formData.value.motivo })
    alert('Horas extras registradas')
    showModal.value = false
    loadOvertime()
  } catch { alert('Error al registrar') }
}

onMounted(() => loadOvertime())
</script>

<style scoped>
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.header-left, .header-right { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-card { width: 500px; max-width: 90vw; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-item { display: flex; flex-direction: column; gap: 6px; }
.form-item.full { grid-column: span 2; }
.form-item label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical; min-height: 80px; font-family: inherit; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
</style>
