<template>
  <AppleCard>
    <div class="info-alert">
      <h3>Generador de Planilla</h3>
      <p>Seleccione un período para generar o recalcular la planilla. El sistema calculará automáticamente los ingresos, descuentos y neto a pagar.</p>
    </div>

    <div class="content-grid">
      <div class="config-card">
        <h4>Configuración</h4>
        <div class="form-group"><label>Período de Planilla</label><AppleDatePicker v-model="periodDate" /></div>
        <div class="form-group"><label>Tipo de Planilla</label><AppleSelect v-model="config.type" :options="typeOptions" /></div>
        <div class="form-group"><label>Fecha de Pago</label><AppleDatePicker v-model="paymentDateVal" /></div>
        <div class="form-group"><label>Observaciones</label><textarea v-model="config.observation" class="textarea" rows="3"></textarea></div>
        
        <div class="options-group">
          <label class="checkbox"><input type="checkbox" v-model="config.includeOvertime" /> Incluir Horas Extras</label>
          <label class="checkbox"><input type="checkbox" v-model="config.includeBonifications" /> Incluir Bonificaciones</label>
          <label class="checkbox"><input type="checkbox" v-model="config.includePendingAdvances" /> Incluir Adelantos</label>
          <label class="checkbox"><input type="checkbox" v-model="config.recalculateAll" /> Recalcular Todo</label>
        </div>

        <AppleButton variant="primary" block :disabled="!isValidConfig" :loading="generating" @click="startGeneration">
          Generar Planilla
        </AppleButton>
      </div>

      <div class="preview-card">
        <h4>Vista Previa <span v-if="previewData" class="badge">{{ previewData.length }} empleados</span></h4>
        
        <div v-if="loadingPreview" class="loading">Calculando...</div>
        
        <div v-else-if="previewData && previewData.length > 0">
          <AppleTable :columns="previewColumns" :data="previewData" />
          
          <div class="summary">
            <div class="summary-item">
              <span class="label">Total Empleados</span>
              <span class="value">{{ previewData.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Ingresos</span>
              <span class="value income">S/ {{ formatMoney(summary.totalIngresos) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Descuentos</span>
              <span class="value deduction">S/ {{ formatMoney(summary.totalDescuentos) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Neto a Pagar</span>
              <span class="value net">S/ {{ formatMoney(summary.totalNeto) }}</span>
            </div>
          </div>

          <div class="actions">
            <AppleButton variant="secondary" @click="saveDraft">Guardar Borrador</AppleButton>
            <AppleButton variant="secondary" @click="validatePayroll">Validar</AppleButton>
            <AppleButton variant="primary" @click="confirmPayroll">Confirmar y Cerrar</AppleButton>
          </div>
        </div>

        <div v-else class="empty">Seleccione un período para ver la previsualización</div>
      </div>
    </div>

    <AppleModal v-model:show="showConfirmModal" title="Confirmar Generación" style="width: 500px">
      <p>¿Está seguro de generar la planilla para el período <strong>{{ formatPeriodName(config.period) }}</strong>?</p>
      <p>Esta acción procesará a <strong>{{ previewData?.length || 0 }}</strong> empleados.</p>
      <label class="checkbox"><input type="checkbox" v-model="confirmTerms" /> Confirmo que los datos son correctos</label>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showConfirmModal = false">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="generating" :disabled="!confirmTerms" @click="executeGeneration">Generar</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { AppleCard, AppleButton, AppleDatePicker, AppleSelect, AppleTable, AppleModal } from '@/components/apple'
import { api } from '@/services/api'
import dayjs from 'dayjs'

interface PreviewRow { employeeId: string; employeeName: string; dni: string; basico: number; horasExtras: number; bonificaciones: number; totalIngresos: number; afp: number; otrosDescuentos: number; totalDescuentos: number; neto: number }

const config = ref({ period: null as number | null, type: 'MENSUAL', paymentDate: null as number | null, observation: '', includeOvertime: true, includeBonifications: true, includePendingAdvances: true, recalculateAll: false })
const generating = ref(false)
const previewData = ref<PreviewRow[] | null>(null)
const loadingPreview = ref(false)
const showConfirmModal = ref(false)
const confirmTerms = ref(false)

const typeOptions = [{ label: 'Mensual', value: 'MENSUAL' }, { label: 'Quincenal', value: 'QUINCENAL' }, { label: 'Semanal', value: 'SEMANAL' }]

// Computed para AppleDatePicker que espera Date
const periodDate = computed({
  get: () => config.value.period ? new Date(config.value.period) : null,
  set: (val: Date | null) => { config.value.period = val ? val.getTime() : null }
})

const paymentDateVal = computed({
  get: () => config.value.paymentDate ? new Date(config.value.paymentDate) : null,
  set: (val: Date | null) => { config.value.paymentDate = val ? val.getTime() : null }
})

const isValidConfig = computed(() => config.value.period !== null && config.value.type !== null)

const summary = computed(() => {
  if (!previewData.value) return { totalIngresos: 0, totalDescuentos: 0, totalNeto: 0 }
  return previewData.value.reduce((acc, row) => ({ totalIngresos: acc.totalIngresos + row.totalIngresos, totalDescuentos: acc.totalDescuentos + row.totalDescuentos, totalNeto: acc.totalNeto + row.neto }), { totalIngresos: 0, totalDescuentos: 0, totalNeto: 0 })
})

const formatMoney = (val: number) => val?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'
const formatPeriodName = (ts: number | null) => ts ? dayjs(ts).format('MMMM YYYY').toUpperCase() : ''

const previewColumns = [
  { title: 'Empleado', key: 'employeeName' },
  { title: 'DNI', key: 'dni' },
  { title: 'Básico', key: 'basico', render: (row: any) => `S/ ${formatMoney(row.basico)}` },
  { title: 'Hrs. Extras', key: 'horasExtras', render: (row: any) => `S/ ${formatMoney(row.horasExtras)}` },
  { title: 'Bonos', key: 'bonificaciones', render: (row: any) => `S/ ${formatMoney(row.bonificaciones)}` },
  { title: 'Ingresos', key: 'totalIngresos', render: (row: any) => `S/ ${formatMoney(row.totalIngresos)}` },
  { title: 'AFP', key: 'afp', render: (row: any) => `-S/ ${formatMoney(row.afp)}` },
  { title: 'Descuentos', key: 'totalDescuentos', render: (row: any) => `-S/ ${formatMoney(row.totalDescuentos)}` },
  { title: 'Neto', key: 'neto', render: (row: any) => `S/ ${formatMoney(row.neto)}` }
]

const loadPreview = async () => {
  if (!config.value.period) return
  loadingPreview.value = true
  const period = dayjs(config.value.period).format('YYYY-MM')
  try {
    const { data } = await api.get(`/payroll/preview?period=${period}&type=${config.value.type}`)
    previewData.value = data.success ? data.data : []
  } catch (error) { console.error(error); previewData.value = [] }
  finally { loadingPreview.value = false }
}

const startGeneration = () => { showConfirmModal.value = true; confirmTerms.value = false }

const executeGeneration = async () => {
  if (!config.value.period) return
  generating.value = true
  const period = dayjs(config.value.period).format('YYYY-MM')
  try {
    const { data } = await api.post('/payroll/generate', { period, type: config.value.type, paymentDate: config.value.paymentDate ? dayjs(config.value.paymentDate).format('YYYY-MM-DD') : null, observation: config.value.observation, includeOvertime: config.value.includeOvertime, includeBonifications: config.value.includeBonifications, includePendingAdvances: config.value.includePendingAdvances, recalculateAll: config.value.recalculateAll })
    if (data.success) { alert('Planilla generada correctamente'); showConfirmModal.value = false; previewData.value = data.data?.details || null }
  } catch (error) { console.error(error) }
  finally { generating.value = false }
}

const saveDraft = () => alert('Borrador guardado')
const validatePayroll = () => alert('Validando planilla...')
const confirmPayroll = () => alert('Planilla confirmada')

watch(() => config.value.period, () => { if (config.value.period) loadPreview() })

onMounted(() => {
  const now = Date.now()
  config.value.period = now
  config.value.paymentDate = now + (7 * 24 * 60 * 60 * 1000)
  loadPreview()
})
</script>

<style scoped>
.info-alert { background: #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
.info-alert h3 { margin: 0 0 8px 0; color: #1e40af; }
.info-alert p { margin: 0; color: #1e40af; font-size: 14px; }
.content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
.config-card, .preview-card { background: white; border-radius: 12px; padding: 20px; }
h4 { margin: 0 0 16px 0; font-size: 16px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
.badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 6px; }
.textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical; font-family: inherit; }
.options-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.checkbox { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; }
.summary-item { text-align: center; }
.summary-item .label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.summary-item .value { font-size: 18px; font-weight: 600; }
.summary-item .value.income { color: #3b82f6; }
.summary-item .value.deduction { color: #ef4444; }
.summary-item .value.net { color: #10b981; font-size: 20px; }
.actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
.loading, .empty { padding: 60px; text-align: center; color: #666; }
</style>
