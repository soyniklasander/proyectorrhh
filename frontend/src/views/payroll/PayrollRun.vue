<template>
  <div class="payroll-run">
    <n-alert type="info" class="info-alert">
      <template #header>
        Generador de Planilla
      </template>
      Seleccione un período para generar o recalcular la planilla. El sistema calculará automáticamente los ingresos, descuentos y neto a pagar para cada empleado.
    </n-alert>

    <n-grid :cols="24" :x-gap="24">
      <n-gi :span="8">
        <n-card :bordered="false" class="config-card">
          <template #header>Configuración</template>

          <n-form ref="formRef" :model="config" :rules="rules" label-placement="top">
            <n-form-item label="Período de Planilla" path="period">
              <n-date-picker
                v-model:value="config.period"
                type="month"
                clearable
                :format="'MMMM YYYY'"
                style="width: 100%"
                @update:value="onPeriodChange"
              />
            </n-form-item>

            <n-form-item label="Tipo de Planilla" path="type">
              <n-select
                v-model:value="config.type"
                :options="typeOptions"
                placeholder="Seleccionar tipo"
              />
            </n-form-item>

            <n-form-item label="Fecha de Pago" path="paymentDate">
              <n-date-picker
                v-model:value="config.paymentDate"
                type="date"
                clearable
                style="width: 100%"
              />
            </n-form-item>

            <n-form-item label="Observaciones">
              <n-input
                v-model:value="config.observation"
                type="textarea"
                :rows="3"
                placeholder="Notas adicionales..."
              />
            </n-form-item>

            <n-divider />

            <div class="config-options">
              <n-checkbox v-model:checked="config.includeOvertime">
                Incluir Horas Extras
              </n-checkbox>
              <n-checkbox v-model:checked="config.includeBonifications">
                Incluir Bonificaciones
              </n-checkbox>
              <n-checkbox v-model:checked="config.includePendingAdvances">
                Incluir Adelantos Pendientes
              </n-checkbox>
              <n-checkbox v-model:checked="config.recalculateAll">
                Recalcular Todo (sobrescribir)
              </n-checkbox>
            </div>

            <n-divider />

            <n-button
              type="primary"
              block
              size="large"
              :loading="generating"
              :disabled="!isValidConfig"
              @click="startGeneration"
            >
              <template #icon><n-icon><FlashOutline /></n-icon></template>
              Generar Planilla
            </n-button>
          </n-form>
        </n-card>
      </n-gi>

      <n-gi :span="16">
        <n-card :bordered="false" class="preview-card">
          <template #header>
            <div class="preview-header">
              <span>Vista Previa</span>
              <n-tag v-if="previewData" type="success">{{ previewData.length }} empleados</n-tag>
            </div>
          </template>

          <div v-if="loadingPreview" class="loading-container">
            <n-spin size="large" />
            <p>Calculando...</p>
          </div>

          <div v-else-if="previewData && previewData.length > 0" class="preview-content">
            <n-data-table
              :columns="previewColumns"
              :data="previewData"
              :max-height="400"
              :bordered="false"
              size="small"
              :pagination="false"
            />

            <n-divider />

            <div class="preview-summary">
              <n-grid :cols="4" :x-gap="16">
                <n-gi>
                  <div class="summary-item">
                    <span class="label">Total Empleados</span>
                    <span class="value">{{ previewData.length }}</span>
                  </div>
                </n-gi>
                <n-gi>
                  <div class="summary-item">
                    <span class="label">Total Ingresos</span>
                    <span class="value income">S/ {{ formatMoney(summary.totalIngresos) }}</span>
                  </div>
                </n-gi>
                <n-gi>
                  <div class="summary-item">
                    <span class="label">Total Descuentos</span>
                    <span class="value deduction">S/ {{ formatMoney(summary.totalDescuentos) }}</span>
                  </div>
                </n-gi>
                <n-gi>
                  <div class="summary-item">
                    <span class="label">Neto a Pagar</span>
                    <span class="value net">S/ {{ formatMoney(summary.totalNeto) }}</span>
                  </div>
                </n-gi>
              </n-grid>
            </div>

            <div class="preview-actions">
              <n-button @click="saveDraft">
                Guardar Borrador
              </n-button>
              <n-button type="info" @click="validatePayroll">
                Validar y Previsualizar
              </n-button>
              <n-button type="success" @click="confirmPayroll">
                Confirmar y Cerrar
              </n-button>
            </div>
          </div>

          <div v-else class="empty-preview">
            <n-empty description="Seleccione un período para ver la previsualización" />
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-modal v-model:show="showConfirmModal" style="width: 500px" preset="dialog" title="Confirmar Generación">
      <template #default>
        <p>¿Está seguro de generar la planilla para el período <strong>{{ formatPeriodName(config.period) }}</strong>?</p>
        <p>Esta acción procesará a <strong>{{ previewData?.length || 0 }}</strong> empleados.</p>
        <n-checkbox v-model:checked="confirmTerms" style="margin-top: 16px">
          Confirmo que los datos son correctos y deseo proceder con la generación
        </n-checkbox>
      </template>
      <template #action>
        <n-button @click="showConfirmModal = false">Cancelar</n-button>
        <n-button
          type="primary"
          :loading="generating"
          :disabled="!confirmTerms"
          @click="executeGeneration"
        >
          Generar Planilla
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NForm, NFormItem, NDatePicker, NSelect,
  NInput, NCheckbox, NDivider, NDataTable, NGrid, NGi, NSpin,
  NEmpty, NAlert, NTag, NModal, useMessage, type DataTableColumns
} from 'naive-ui'
import {
  FlashOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

interface PreviewRow {
  employeeId: string
  employeeName: string
  dni: string
  basico: number
  asignacionFamiliar: number
  horasExtras: number
  bonificaciones: number
  totalIngresos: number
  afp: number
  otrosDescuentos: number
  totalDescuentos: number
  neto: number
}

const message = useMessage()

const formRef = ref()
const config = ref({
  period: null as number | null,
  type: 'MENSUAL',
  paymentDate: null as number | null,
  observation: '',
  includeOvertime: true,
  includeBonifications: true,
  includePendingAdvances: true,
  recalculateAll: false
})

const rules = {
  period: { required: true, message: 'Seleccione un período' },
  type: { required: true, message: 'Seleccione el tipo de planilla' }
}

const typeOptions = [
  { label: 'Mensual', value: 'MENSUAL' },
  { label: 'Quincenal', value: 'QUINCENAL' },
  { label: 'Semanal', value: 'SEMANAL' }
]

const loadingPreview = ref(false)
const generating = ref(false)
const previewData = ref<PreviewRow[] | null>(null)
const showConfirmModal = ref(false)
const confirmTerms = ref(false)

const isValidConfig = computed(() =>
  config.value.period !== null && config.value.type !== null
)

const summary = computed(() => {
  if (!previewData.value) {
    return { totalIngresos: 0, totalDescuentos: 0, totalNeto: 0 }
  }
  return previewData.value.reduce((acc, row) => ({
    totalIngresos: acc.totalIngresos + row.totalIngresos,
    totalDescuentos: acc.totalDescuentos + row.totalDescuentos,
    totalNeto: acc.totalNeto + row.neto
  }), { totalIngresos: 0, totalDescuentos: 0, totalNeto: 0 })
})

const formatMoney = (val: number) =>
  val?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'

const formatPeriodName = (ts: number | null) =>
  ts ? dayjs(ts).format('MMMM YYYY').toUpperCase() : ''

const previewColumns: DataTableColumns<PreviewRow> = [
  { title: 'Empleado', key: 'employeeName', fixed: 'left', width: 200 },
  { title: 'DNI', key: 'dni', width: 100 },
  {
    title: 'Básico',
    key: 'basico',
    width: 120,
    render: (row) => `S/ ${formatMoney(row.basico)}`
  },
  {
    title: 'Hrs. Extras',
    key: 'horasExtras',
    width: 100,
    render: (row) => `S/ ${formatMoney(row.horasExtras)}`
  },
  {
    title: 'Bonos',
    key: 'bonificaciones',
    width: 100,
    render: (row) => `S/ ${formatMoney(row.bonificaciones)}`
  },
  {
    title: 'Ingresos',
    key: 'totalIngresos',
    width: 120,
    render: (row) => h('strong', null, { default: () => `S/ ${formatMoney(row.totalIngresos)}` })
  },
  {
    title: 'AFP',
    key: 'afp',
    width: 100,
    render: (row) => h('span', { style: 'color: #ef4444' }, `-S/ ${formatMoney(row.afp)}`)
  },
  {
    title: 'Descuentos',
    key: 'totalDescuentos',
    width: 120,
    render: (row) => h('span', { style: 'color: #ef4444' }, `-S/ ${formatMoney(row.totalDescuentos)}`)
  },
  {
    title: 'Neto',
    key: 'neto',
    width: 120,
    render: (row) => h('strong', { style: 'color: #10b981' }, `S/ ${formatMoney(row.neto)}`)
  }
]

const onPeriodChange = () => {
  if (config.value.period) {
    loadPreview()
  }
}

const loadPreview = async () => {
  if (!config.value.period) return

  loadingPreview.value = true
  const period = dayjs(config.value.period).format('YYYY-MM')

  try {
    const { data } = await api.get(`/payroll/preview?period=${period}&type=${config.value.type}`)
    if (data.success) {
      previewData.value = data.data
    } else {
      previewData.value = []
    }
  } catch (error) {
    console.error(error)
    message.error('Error al cargar previsualización')
    previewData.value = []
  } finally {
    loadingPreview.value = false
  }
}

const startGeneration = () => {
  showConfirmModal.value = true
  confirmTerms.value = false
}

const executeGeneration = async () => {
  if (!config.value.period) return

  generating.value = true
  const period = dayjs(config.value.period).format('YYYY-MM')

  try {
    const { data } = await api.post('/payroll/generate', {
      period,
      type: config.value.type,
      paymentDate: config.value.paymentDate ? dayjs(config.value.paymentDate).format('YYYY-MM-DD') : null,
      observation: config.value.observation,
      includeOvertime: config.value.includeOvertime,
      includeBonifications: config.value.includeBonifications,
      includePendingAdvances: config.value.includePendingAdvances,
      recalculateAll: config.value.recalculateAll
    })

    if (data.success) {
      message.success('Planilla generada correctamente')
      showConfirmModal.value = false
      previewData.value = data.data?.details || null
    }
  } catch (error) {
    message.error('Error al generar planilla')
  } finally {
    generating.value = false
  }
}

const saveDraft = () => {
  message.success('Borrador guardado')
}

const validatePayroll = () => {
  message.info('Validando planilla...')
}

const confirmPayroll = () => {
  message.success('Planilla confirmada')
}

watch(() => config.value.period, () => {
  if (config.value.period) {
    loadPreview()
  }
})

onMounted(() => {
  const now = Date.now()
  config.value.period = now
  config.value.paymentDate = now + (7 * 24 * 60 * 60 * 1000)
  loadPreview()
})
</script>

<style scoped>
.payroll-run {
  padding: 0;
}

.info-alert {
  margin-bottom: 24px;
}

.config-card, .preview-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #666;
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.preview-summary {
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.summary-item .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
}

.summary-item .value.income {
  color: #3b82f6;
}

.summary-item .value.deduction {
  color: #ef4444;
}

.summary-item .value.net {
  color: #10b981;
  font-size: 20px;
}

.preview-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
