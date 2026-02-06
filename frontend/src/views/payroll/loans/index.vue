<template>
  <AppleCard>
    <div class="header-actions">
      <div>
        <h3>Préstamos al Personal</h3>
        <p>Gestión de préstamos y amortizaciones</p>
      </div>
      <div class="controls">
        <AppleSearchInput v-model="searchQuery" placeholder="Buscar empleado..." />
        <AppleSelect v-model="statusFilter" :options="statusOptions" placeholder="Estado" style="width: 150px" />
        <AppleButton variant="primary" @click="showModal = true">Nuevo Préstamo</AppleButton>
      </div>
    </div>

    <AppleTable :columns="columns" :data="filteredLoans" />

    <AppleModal v-model:show="showModal" title="Nuevo Préstamo" style="width: 600px">
      <div class="form-grid">
        <div class="form-group"><label>Empleado</label><AppleSelect v-model="formData.empleadoId" :options="employeeOptions" filterable /></div>
        <div class="form-group"><label>Monto Total (S/)</label><AppleInput v-model="formData.montoTotalStr" /></div>
        <div class="form-group"><label>Nº Cuotas</label><AppleInput v-model="formData.cuotasTotalesStr" /></div>
        <div class="form-group"><label>Tasa Interés (%)</label><AppleInput v-model="formData.tasaInteresStr" /></div>
        <div class="form-group"><label>Fecha Inicio</label><AppleDatePicker v-model="formData.fechaInicio" type="date" /></div>
        <div class="form-group full"><label>Motivo</label><textarea v-model="formData.motivo" class="textarea" rows="3"></textarea></div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showModal = false">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="submitting" @click="handleSubmit">Guardar</AppleButton>
        </div>
      </template>
    </AppleModal>

    <AppleModal v-model:show="showDetails" title="Detalle del Préstamo" style="width: 700px">
      <div v-if="selectedLoan" class="loan-details">
        <div class="detail-row">
          <span><strong>{{ selectedLoan.empleadoNombre }}</strong></span>
          <span :class="['badge', selectedLoan.estado === 'ACTIVO' ? 'warning' : 'success']">{{ selectedLoan.estado }}</span>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><label>Monto Total</label><span>S/ {{ selectedLoan.montoTotal?.toFixed(2) }}</span></div>
          <div class="detail-item"><label>Saldo Pendiente</label><span>S/ {{ selectedLoan.saldoPendiente?.toFixed(2) }}</span></div>
          <div class="detail-item"><label>Cuota Mensual</label><span>S/ {{ selectedLoan.cuotaMensual?.toFixed(2) }}</span></div>
          <div class="detail-item"><label>Progreso</label><span>{{ selectedLoan.cuotasPagadas }}/{{ selectedLoan.cuotasTotales }}</span></div>
        </div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showDetails = false">Cerrar</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AppleCard, AppleButton, AppleSearchInput, AppleSelect, AppleTable, AppleModal, AppleInput, AppleDatePicker } from '@/components/apple'
import payrollService, { type Loan } from '@/services/payroll.service'

const loading = ref(false)
const submitting = ref(false)
const loans = ref<Loan[]>([])
const searchQuery = ref('')
const statusFilter = ref<string | null>(null)
const showModal = ref(false)
const showDetails = ref(false)
const selectedLoan = ref<Loan | null>(null)

const formData = ref({ empleadoId: '', montoTotal: 0, montoTotalStr: '0', cuotasTotales: 12, cuotasTotalesStr: '12', tasaInteres: 0, tasaInteresStr: '0', fechaInicio: new Date(), motivo: '' })
const employeeOptions = ref<{ label: string; value: string }[]>([])
const statusOptions = [{ label: 'Activo', value: 'ACTIVO' }, { label: 'Cancelado', value: 'CANCELADO' }, { label: 'Anulado', value: 'ANULADO' }]

watch(() => formData.value.montoTotal, (val) => { formData.value.montoTotalStr = String(val) })
watch(() => formData.value.cuotasTotales, (val) => { formData.value.cuotasTotalesStr = String(val) })
watch(() => formData.value.tasaInteres, (val) => { formData.value.tasaInteresStr = String(val) })

const filteredLoans = computed(() => {
  let result = loans.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(l => l.empleadoNombre?.toLowerCase().includes(query) || l.empleadoCodigo?.toLowerCase().includes(query))
  }
  if (statusFilter.value) result = result.filter(l => l.estado === statusFilter.value)
  return result
})

const columns = [
  { title: 'Código', key: 'empleadoCodigo' },
  { title: 'Empleado', key: 'empleadoNombre' },
  { title: 'Monto', key: 'montoTotal', render: (row: any) => `S/ ${row.montoTotal?.toFixed(2)}` },
  { title: 'Saldo', key: 'saldoPendiente', render: (row: any) => `S/ ${row.saldoPendiente?.toFixed(2)}` },
  { title: 'Cuota', key: 'cuotaMensual', render: (row: any) => `S/ ${row.cuotaMensual?.toFixed(2)}` },
  { title: 'Progreso', key: 'progreso', render: (row: any) => `${row.cuotasPagadas}/${row.cuotasTotales}` },
  { title: 'Estado', key: 'estado', render: (row: any) => row.estado },
  { title: 'Acciones', key: 'actions', render: (row: any) => h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => viewDetails(row) }, () => 'Ver') }
]

const viewDetails = (loan: Loan) => { selectedLoan.value = loan; showDetails.value = true }

const loadLoans = async () => {
  try {
    const { data } = await payrollService.getLoans({ limit: 100 })
    loans.value = data
  } catch (error) { console.error(error) }
}

const loadEmployees = async () => {
  try {
    const { data } = await payrollService.getEmployeeDiscounts({ limit: 50 })
    employeeOptions.value = data.map((e: any) => ({ label: `${e.empleadoCodigo} - ${e.empleadoNombre}`, value: e.empleadoId }))
  } catch (error) { console.error(error) }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await payrollService.createLoan({ empleadoId: formData.value.empleadoId, montoTotal: Number(formData.value.montoTotalStr), cuotasTotales: Number(formData.value.cuotasTotalesStr), tasaInteres: Number(formData.value.tasaInteresStr), fechaInicio: formData.value.fechaInicio.toISOString(), motivo: formData.value.motivo })
    alert('Préstamo creado correctamente')
    showModal.value = false
    loadLoans()
  } catch (error) { console.error(error) }
  finally { submitting.value = false }
}

onMounted(() => { loadLoans(); loadEmployees() })
</script>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.header-actions h3 { margin: 0 0 4px 0; font-size: 20px; font-weight: 600; }
.header-actions p { margin: 0; color: var(--color-text-secondary); }
.controls { display: flex; gap: 12px; align-items: center; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: span 2; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical; font-family: inherit; }
.loan-details { padding: 16px; background: #f8fafc; border-radius: 8px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.detail-item { text-align: center; }
.detail-item label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.detail-item span { font-size: 18px; font-weight: 600; }
.badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.badge.warning { background: #fef3c7; color: #92400e; }
.badge.success { background: #dcfce7; color: #166534; }
</style>
