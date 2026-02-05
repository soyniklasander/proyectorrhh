<template>
  <div class="payslips-page">
    <PageHeader title="Boletas de Pago" subtitle="Consulta y descarga de recibos de pago">
      <template #extra>
        <n-space>
          <n-date-picker v-model:value="selectedPeriod" type="month" :is-date-disabled="(ts: number) => ts > Date.now()" />
          <n-select
            v-model:value="statusFilter"
            :options="statusOptions"
            placeholder="Estado"
            clearable
            style="width: 150px"
          />
          <n-button @click="loadPayslips" :loading="loading">
            <template #icon><n-icon><RefreshOutline /></n-icon></template>
            Actualizar
          </n-button>
          <n-button type="info" @click="showGenerateModal = true">
            <template #icon><n-icon><CalculatorOutline /></n-icon></template>
            Generar Planilla
          </n-button>
          <n-button type="primary" @click="exportPayslips" :loading="exporting">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>
            Exportar
          </n-button>
        </n-space>
      </template>
    </PageHeader>

    <n-grid :cols="4" :x-gap="16" :y-gap="16" class="summary-cards">
      <n-gi>
        <n-card :bordered="false" class="summary-card">
          <n-statistic label="Total Empleados" :value="payslips.length" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="summary-card">
          <n-statistic label="Total Ingresos" prefix="S/" :value="totalIngresos" :precision="2" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="summary-card">
          <n-statistic label="Total Descuentos" prefix="S/" :value="totalDescuentos" :precision="2" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" class="summary-card highlight">
          <n-statistic label="Neto a Pagar" prefix="S/" :value="totalNeto" :precision="2" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="payslips"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :row-key="(row: Payslip) => row.id"
      />
    </n-card>

    <n-modal v-model:show="showGenerateModal" preset="card" title="Generar Planilla" style="width: 500px">
      <n-form :model="generateFormData" label-placement="left" label-width="120px">
        <n-form-item label="Período">
          <n-date-picker v-model:value="generateFormData.periodo" type="month" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Regenerar">
          <n-switch v-model:value="generateFormData.regenerateExisting" />
          <span style="margin-left: 8px; font-size: 12px; color: #666;">Sobreescribir planillas existentes</span>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showGenerateModal = false">Cancelar</n-button>
          <n-button type="primary" @click="handleGenerate" :loading="generating">Generar</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetailModal" preset="card" title="Detalle de Boleta" style="width: 800px">
      <n-tabs type="line" animated v-if="selectedPayslip">
        <n-tab-pane name="resumen" tab="Resumen">
          <n-descriptions :column="2" label-placement="left">
            <n-descriptions-item label="Empleado">{{ selectedPayslip.empleadoNombre }}</n-descriptions-item>
            <n-descriptions-item label="DNI">{{ selectedPayslip.empleadoDni }}</n-descriptions-item>
            <n-descriptions-item label="Período">{{ selectedPayslip.periodoLabel }}</n-descriptions-item>
            <n-descriptions-item label="Estado">
              <n-tag :type="getStatusType(selectedPayslip.estado)" size="small">{{ selectedPayslip.estado }}</n-tag>
            </n-descriptions-item>
          </n-descriptions>
          <n-divider />
          <n-grid :cols="3" :x-gap="16">
            <n-gi>
              <div class="detail-box income">
                <div class="label">INGRESOS</div>
                <div class="amount">S/ {{ selectedPayslip.ingresos.totalIngresos?.toFixed(2) }}</div>
              </div>
            </n-gi>
            <n-gi>
              <div class="detail-box discount">
                <div class="label">DESCUENTOS</div>
                <div class="amount">S/ {{ selectedPayslip.descuentos.totalDescuentos?.toFixed(2) }}</div>
              </div>
            </n-gi>
            <n-gi>
              <div class="detail-box total">
                <div class="label">NETO A PAGAR</div>
                <div class="amount">S/ {{ selectedPayslip.netoPagar?.toFixed(2) }}</div>
              </div>
            </n-gi>
          </n-grid>
        </n-tab-pane>
        <n-tab-pane name="detalle" tab="Detalle Completo">
          <n-collapse>
            <n-collapse-item title="Ingresos" name="ingresos">
              <n-data-table
                :columns="detailColumns"
                :data="getIngresosRows(selectedPayslip)"
                :bordered="false"
                size="small"
              />
            </n-collapse-item>
            <n-collapse-item title="Descuentos" name="descuentos">
              <n-data-table
                :columns="detailColumns"
                :data="getDescuentosRows(selectedPayslip)"
                :bordered="false"
                size="small"
              />
            </n-collapse-item>
          </n-collapse>
        </n-tab-pane>
      </n-tabs>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">Cerrar</n-button>
          <n-button type="primary" @click="downloadPayslip">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>
            Descargar PDF
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NDataTable, NSpace, NTag, useMessage, NModal, NDatePicker, NSelect,
  NStatistic, NGrid, NGi, NDivider, NTabs, NTabPane, NDescriptions, NDescriptionsItem,
  NCollapse, NCollapseItem, type DataTableColumns
} from 'naive-ui'
import {
  DownloadOutline, EyeOutline, RefreshOutline, CalculatorOutline
} from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'
import payrollService, { type Payslip } from '@/services/payroll.service'

const message = useMessage()
const loading = ref(false)
const exporting = ref(false)
const generating = ref(false)

const payslips = ref<Payslip[]>([])
const selectedPayslip = ref<Payslip | null>(null)
const selectedPeriod = ref(Date.now())
const statusFilter = ref<string | null>(null)
const showGenerateModal = ref(false)
const showDetailModal = ref(false)

const pagination = { pageSize: 10 }

const generateFormData = ref({
  periodo: Date.now(),
  regenerateExisting: false
})

const statusOptions = [
  { label: 'Borrador', value: 'BORRADOR' },
  { label: 'Procesado', value: 'PROCESADO' },
  { label: 'Aprobado', value: 'APROBADO' },
  { label: 'Pagado', value: 'PAGADO' }
]

const totalIngresos = computed(() => payslips.value.reduce((sum, p) => sum + (p.ingresos?.totalIngresos || 0), 0))
const totalDescuentos = computed(() => payslips.value.reduce((sum, p) => sum + (p.descuentos?.totalDescuentos || 0), 0))
const totalNeto = computed(() => payslips.value.reduce((sum, p) => sum + (p.netoPagar || 0), 0))

const filteredPayslips = computed(() => {
  let result = payslips.value
  if (statusFilter.value) {
    result = result.filter(p => p.estado === statusFilter.value)
  }
  return result
})

const columns: DataTableColumns<Payslip> = [
  { title: 'Código', key: 'empleadoCodigo', width: 90 },
  { title: 'Empleado', key: 'empleadoNombre', width: 200 },
  { title: 'Período', key: 'periodoLabel', width: 120 },
  { title: 'Ingresos', key: 'ingreso', width: 120, render: (row) => `S/ ${row.ingresos?.totalIngresos?.toFixed(2) || '0.00'}` },
  { title: 'Descuentos', key: 'descuento', width: 120, render: (row) => `S/ ${row.descuentos?.totalDescuentos?.toFixed(2) || '0.00'}` },
  { 
    title: 'Neto', 
    key: 'neto', 
    width: 130, 
    render: (row) => h('strong', null, `S/ ${row.netoPagar?.toFixed(2) || '0.00'}`) 
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 110,
    render: (row) => h(NTag, { type: getStatusType(row.estado), size: 'small' }, () => row.estado)
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render: (row) => h(NButton, { size: 'small', secondary: true, onClick: () => viewPayslip(row) }, { 
      icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) 
    })
  }
]

const detailColumns: DataTableColumns<{ concepto: string; monto: number }> = [
  { title: 'Concepto', key: 'concepto' },
  { title: 'Monto', key: 'monto', width: 120, render: (row) => `S/ ${row.monto?.toFixed(2)}` }
]

const getStatusType = (status: string) => {
  switch (status) {
    case 'BORRADOR': return 'warning'
    case 'PROCESADO': return 'info'
    case 'APROBADO': return 'success'
    case 'PAGADO': return 'success'
    default: return 'default'
  }
}

const getIngresosRows = (p: Payslip) => [
  { concepto: 'Salario Base', monto: p.ingresos?.salarioBase || 0 },
  { concepto: 'Horas Extras 25%', monto: p.ingresos?.horasExtras25 || 0 },
  { concepto: 'Horas Extras 35%', monto: p.ingresos?.horasExtras35 || 0 },
  { concepto: 'Horas Extras 100%', monto: p.ingresos?.horasExtras100 || 0 },
  { concepto: 'Bonificación Productividad', monto: p.ingresos?.bonificacionProductividad || 0 },
  { concepto: 'Bonificación Puesto', monto: p.ingresos?.bonificacionPuesto || 0 },
  { concepto: 'Asignación Familiar', monto: p.ingresos?.asignacionFamiliar || 0 },
  { concepto: 'Movilidad', monto: p.ingresos?.movilidad || 0 },
  { concepto: 'Refrigerio', monto: p.ingresos?.refrigerio || 0 },
  { concepto: 'Vacaciones Truncas', monto: p.ingresos?.vacacionesTruncas || 0 },
  { concepto: 'Otros Ingresos', monto: p.ingresos?.otrosIngresos || 0 }
].filter(r => r.monto > 0)

const getDescuentosRows = (p: Payslip) => [
  { concepto: 'AFP/ONP', monto: p.descuentos?.afpOnp || 0 },
  { concepto: 'ESSALUD', monto: p.descuentos?.essalud || 0 },
  { concepto: 'SCTR', monto: p.descuentos?.sctr || 0 },
  { concepto: 'Quinta Categoría', monto: p.descuentos?.quintaCategoria || 0 },
  { concepto: 'Préstamos', monto: p.descuentos?.prestamos || 0 },
  { concepto: 'Adelantos', monto: p.descuentos?.adelantos || 0 },
  { concepto: 'Faltas', monto: p.descuentos?.faltas || 0 },
  { concepto: 'Tardanzas', monto: p.descuentos?.tardanzas || 0 },
  { concepto: 'Otros Descuentos', monto: p.descuentos?.otrosDescuentos || 0 }
].filter(r => r.monto > 0)

const formatPeriod = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const loadPayslips = async () => {
  loading.value = true
  try {
    const periodo = formatPeriod(selectedPeriod.value)
    const { data } = await payrollService.getPayslips({ periodo, limit: 200 })
    payslips.value = data.map(p => ({ ...p, periodoLabel: periodo }))
  } catch (error) {
    console.error(error)
    message.error('Error al cargar boletas')
  } finally {
    loading.value = false
  }
}

const viewPayslip = (payslip: Payslip) => {
  selectedPayslip.value = payslip
  showDetailModal.value = true
}

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
    message.success('Exportación completada')
  } catch (error) {
    console.error(error)
    message.error('Error al exportar')
  } finally {
    exporting.value = false
  }
}

const handleGenerate = async () => {
  generating.value = true
  try {
    const periodo = formatPeriod(generateFormData.value.periodo)
    const result = await payrollService.generatePayroll({
      periodo,
      regenerateExisting: generateFormData.value.regenerateExisting
    })
    message.success(`Generados: ${result.data.generados}, Actualizados: ${result.data.actualizados}`)
    showGenerateModal.value = false
    loadPayslips()
  } catch (error) {
    console.error(error)
    message.error('Error al generar planilla')
  } finally {
    generating.value = false
  }
}

const downloadPayslip = () => {
  if (!selectedPayslip.value) return
  message.info('Funcionalidad de descarga PDF en desarrollo')
}

onMounted(() => { loadPayslips() })
</script>

<style scoped>
.payslips-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); margin-top: 16px; }
.summary-card { border-radius: 12px; }
.summary-card.highlight { background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%); color: white; }
.summary-card.highlight :deep(.n-statistic-value) { color: white; }
.detail-box { padding: 16px; border-radius: 8px; text-align: center; }
.detail-box.income { background: #e8f5e9; color: #2e7d32; }
.detail-box.discount { background: #ffebee; color: #c62828; }
.detail-box.total { background: #e3f2fd; color: #1565c0; }
.detail-box .label { font-size: 12px; font-weight: 500; margin-bottom: 8px; }
.detail-box .amount { font-size: 24px; font-weight: bold; }
</style>
