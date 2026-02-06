<template>
  <AppleCard>
    <div class="header-actions">
      <div>
        <h3>Boletas de Pago</h3>
        <p>Consulta y descarga de recibos de pago</p>
      </div>
      <div class="controls">
        <AppleDatePicker v-model="periodDate" type="month" />
        <AppleSelect v-model="statusFilter" :options="statusOptions" placeholder="Estado" style="width: 150px" />
        <AppleButton variant="secondary" @click="loadPayslips">Actualizar</AppleButton>
        <AppleButton variant="primary" @click="showGenerateModal = true">Generar Planilla</AppleButton>
        <AppleButton variant="secondary" @click="exportPayslips">Exportar</AppleButton>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">{{ payslips.length }}</div><div class="stat-label">Total</div></div>
      <div class="stat-card"><div class="stat-value">S/ {{ formatMoney(totalIngresos) }}</div><div class="stat-label">Ingresos</div></div>
      <div class="stat-card"><div class="stat-value">S/ {{ formatMoney(totalDescuentos) }}</div><div class="stat-label">Descuentos</div></div>
      <div class="stat-card highlight"><div class="stat-value">S/ {{ formatMoney(totalNeto) }}</div><div class="stat-label">Neto</div></div>
    </div>

    <AppleTable :columns="columns" :data="payslips" />

    <AppleModal v-model:show="showGenerateModal" title="Generar Planilla" style="width: 500px">
      <div class="form-group"><label>Período</label><AppleDatePicker v-model="generatePeriodDate" type="month" style="width: 100%" /></div>
      <div class="form-group"><label>Regenerar existente</label><label class="checkbox"><input type="checkbox" v-model="generateFormData.regenerateExisting" /> Sobreescribir</label></div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showGenerateModal = false">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="generating" @click="handleGenerate">Generar</AppleButton>
        </div>
      </template>
    </AppleModal>

    <AppleModal v-model:show="showDetailModal" title="Detalle de Boleta" style="width: 800px">
      <div v-if="selectedPayslip">
        <div class="detail-header">
          <div><strong>{{ selectedPayslip.empleadoNombre }}</strong><br><small>{{ selectedPayslip.empleadoDni }}</small></div>
          <div>{{ selectedPayslip.periodoLabel }}</div>
          <div class="status-badge">{{ selectedPayslip.estado }}</div>
        </div>
        <div class="detail-totals">
          <div class="total-box income">INGRESOS<br>S/ {{ selectedPayslip.ingresos?.totalIngresos?.toFixed(2) }}</div>
          <div class="total-box discount">DESCUENTOS<br>S/ {{ selectedPayslip.descuentos?.totalDescuentos?.toFixed(2) }}</div>
          <div class="total-box total">NETO<br>S/ {{ selectedPayslip.netoPagar?.toFixed(2) }}</div>
        </div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showDetailModal = false">Cerrar</AppleButton>
          <AppleButton variant="primary" @click="downloadPayslip">Descargar PDF</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AppleCard, AppleButton, AppleDatePicker, AppleSelect, AppleTable, AppleModal } from '@/components/apple'
import payrollService, { type Payslip } from '@/services/payroll.service'

const loading = ref(false)
const exporting = ref(false)
const generating = ref(false)
const payslips = ref<Payslip[]>([])
const selectedPayslip = ref<Payslip | null>(null)
const selectedPeriod = ref(Date.now())
const statusFilter = ref<string | null>(null)
const showGenerateModal = ref(false)
const showDetailModal = ref(false)

const generateFormData = ref({ periodo: Date.now(), regenerateExisting: false })

const periodDate = computed({
  get: () => new Date(selectedPeriod.value),
  set: (val: Date) => { selectedPeriod.value = val.getTime() }
})

const generatePeriodDate = computed({
  get: () => new Date(generateFormData.value.periodo),
  set: (val: Date) => { generateFormData.value.periodo = val.getTime() }
})

const statusOptions = [{ label: 'Borrador', value: 'BORRADOR' }, { label: 'Procesado', value: 'PROCESADO' }, { label: 'Aprobado', value: 'APROBADO' }, { label: 'Pagado', value: 'PAGADO' }]

const totalIngresos = computed(() => payslips.value.reduce((sum, p) => sum + (p.ingresos?.totalIngresos || 0), 0))
const totalDescuentos = computed(() => payslips.value.reduce((sum, p) => sum + (p.descuentos?.totalDescuentos || 0), 0))
const totalNeto = computed(() => payslips.value.reduce((sum, p) => sum + (p.netoPagar || 0), 0))

const formatMoney = (val: number) => val?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'

const columns = [
  { title: 'Código', key: 'empleadoCodigo' },
  { title: 'Empleado', key: 'empleadoNombre' },
  { title: 'Período', key: 'periodoLabel' },
  { title: 'Ingresos', key: 'ingreso', render: (row: any) => `S/ ${row.ingresos?.totalIngresos?.toFixed(2) || '0.00'}` },
  { title: 'Descuentos', key: 'descuento', render: (row: any) => `S/ ${row.descuentos?.totalDescuentos?.toFixed(2) || '0.00'}` },
  { title: 'Neto', key: 'neto', render: (row: any) => `S/ ${row.netoPagar?.toFixed(2) || '0.00'}` },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'actions', render: (row: any) => h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => viewPayslip(row) }, () => 'Ver') }
]

const formatPeriod = (ts: number) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

const loadPayslips = async () => {
  loading.value = true
  try {
    const periodo = formatPeriod(selectedPeriod.value)
    const { data } = await payrollService.getPayslips({ periodo, limit: 200 })
    payslips.value = data.map((p: any) => ({ ...p, periodoLabel: periodo }))
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const viewPayslip = (payslip: Payslip) => { selectedPayslip.value = payslip; showDetailModal.value = true }

const exportPayslips = async () => {
  exporting.value = true
  try {
    const periodo = formatPeriod(selectedPeriod.value)
    const blob = await payrollService.exportPayslips(periodo)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `boletas_${periodo}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    alert('Exportación completada')
  } catch (error) { console.error(error) }
  finally { exporting.value = false }
}

const handleGenerate = async () => {
  generating.value = true
  try {
    const periodo = formatPeriod(generateFormData.value.periodo)
    const result = await payrollService.generatePayroll({ periodo, regenerateExisting: generateFormData.value.regenerateExisting })
    alert(`Generados: ${result.data.generados}, Actualizados: ${result.data.actualizados}`)
    showGenerateModal.value = false
    loadPayslips()
  } catch (error) { console.error(error) }
  finally { generating.value = false }
}

const downloadPayslip = () => alert('Funcionalidad de descarga PDF en desarrollo')

onMounted(() => { loadPayslips() })
</script>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.header-actions h3 { margin: 0 0 4px 0; font-size: 20px; font-weight: 600; }
.header-actions p { margin: 0; color: var(--color-text-secondary); }
.controls { display: flex; gap: 12px; align-items: center; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; padding: 16px; border-radius: 12px; text-align: center; }
.stat-card.highlight { background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%); color: white; }
.stat-value { font-size: 24px; font-weight: 700; }
.stat-label { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; }
.stat-card.highlight .stat-label { color: rgba(255,255,255,0.8); }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 6px; }
.checkbox { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.detail-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 16px; }
.status-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.detail-totals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.total-box { padding: 16px; border-radius: 8px; text-align: center; }
.total-box.income { background: #e8f5e9; color: #2e7d32; }
.total-box.discount { background: #ffebee; color: #c62828; }
.total-box.total { background: #e3f2fd; color: #1565c0; }
</style>
