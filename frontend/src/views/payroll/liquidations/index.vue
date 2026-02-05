<template>
  <div class="liquidations-page">
    <PageHeader title="Liquidaciones" subtitle="Cálculo y generación de liquidaciones">
      <template #extra>
        <n-button type="primary" @click="showCreateModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nueva Liquidación
        </n-button>
      </template>
    </PageHeader>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="pending" tab="Pendientes">
        <n-card :bordered="false" class="table-card">
          <n-data-table
            :columns="columns"
            :data="pendingLiquidations"
            :loading="loading"
            :pagination="pagination"
            :bordered="false"
            :row-key="(row: Liquidation) => row.id"
          />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="processed" tab="Procesadas">
        <n-card :bordered="false" class="table-card">
          <n-data-table
            :columns="columns"
            :data="processedLiquidations"
            :loading="loading"
            :pagination="pagination"
            :bordered="false"
            :row-key="(row: Liquidation) => row.id"
          />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showCreateModal" preset="card" title="Nueva Liquidación" style="width: 500px">
      <n-form :model="createFormData" label-placement="left" label-width="120px">
        <n-form-item label="Empleado" path="empleadoId">
          <n-select
            v-model:value="createFormData.empleadoId"
            :options="employeeOptions"
            filterable
            placeholder="Seleccionar empleado"
          />
        </n-form-item>
        <n-form-item label="Tipo Cese">
          <n-select
            v-model:value="createFormData.tipoLiquidacion"
            :options="tipoOptions"
            placeholder="Tipo de liquidación"
          />
        </n-form-item>
        <n-form-item label="Fecha Cese">
          <n-date-picker v-model:value="createFormData.fechaLiquidacion" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Observación">
          <n-input v-model:value="createFormData.observacion" type="textarea" :rows="3" placeholder="Motivo del cese" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCreateModal = false">Cancelar</n-button>
          <n-button type="primary" @click="handleCreate" :loading="creating">Crear</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetailModal" preset="card" title="Detalle de Liquidación" style="width: 900px">
      <template v-if="selectedLiquidation">
        <n-descriptions :column="3" label-placement="left" class="mb-4">
          <n-descriptions-item label="Empleado">{{ selectedLiquidation.empleadoNombre }}</n-descriptions-item>
          <n-descriptions-item label="DNI">{{ selectedLiquidation.empleadoDni }}</n-descriptions-item>
          <n-descriptions-item label="Tipo">{{ selectedLiquidation.tipoLiquidacion }}</n-descriptions-item>
          <n-descriptions-item label="Fecha Ingreso">{{ formatDate(selectedLiquidation.fechaIngreso) }}</n-descriptions-item>
          <n-descriptions-item label="Fecha Cese">{{ formatDate(selectedLiquidation.fechaLiquidacion) }}</n-descriptions-item>
          <n-descriptions-item label="Días Laborados">{{ selectedLiquidation.diasLaborados }}</n-descriptions-item>
        </n-descriptions>

        <n-grid :cols="3" :x-gap="16" :y-gap="16" class="mb-4">
          <n-gi>
            <n-card :bordered="false" class="concept-card income">
              <div class="concept-title">REMUNERACIONES</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.conceptos.remuneracion?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card income">
              <div class="concept-title">VACACIONES</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.conceptos.vacacionesTruncas?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card income">
              <div class="concept-title">CTS</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.conceptos.cts?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card income">
              <div class="concept-title">GRATIFICACIÓN</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.conceptos.gratificacion?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card income">
              <div class="concept-title">OTROS</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.conceptos.otros?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card total-income">
              <div class="concept-title">TOTAL BRUTO</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.conceptos.totalBruto?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
        </n-grid>

        <n-divider>Descuentos</n-divider>

        <n-grid :cols="3" :x-gap="16" :y-gap="16" class="mb-4">
          <n-gi>
            <n-card :bordered="false" class="concept-card discount">
              <div class="concept-title">AFP/ONP</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.descuentos.afpOnp?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card discount">
              <div class="concept-title">ESSALUD</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.descuentos.essalud?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card discount">
              <div class="concept-title">PRÉSTAMOS</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.descuentos.prestamos?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card discount">
              <div class="concept-title">ADELANTOS</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.descuentos.adelantos?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card discount">
              <div class="concept-title">OTROS</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.descuentos.otros?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card :bordered="false" class="concept-card total-discount">
              <div class="concept-title">TOTAL DESC.</div>
              <div class="concept-amount">S/ {{ selectedLiquidation.descuentos.totalDescuentos?.toFixed(2) }}</div>
            </n-card>
          </n-gi>
        </n-grid>

        <n-card :bordered="false" class="total-card">
          <div class="total-label">NETO A PAGAR</div>
          <div class="total-amount">S/ {{ selectedLiquidation.totalNeto?.toFixed(2) }}</div>
        </n-card>
      </template>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">Cerrar</n-button>
          <n-button 
            v-if="selectedLiquidation?.estado === 'CALCULADA'" 
            type="success" 
            @click="approveLiquidation"
          >
            <template #icon><n-icon><CheckmarkOutline /></n-icon></template>
            Aprobar
          </n-button>
          <n-button type="primary" @click="exportLiquidation">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>
            Exportar
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NDataTable, NTabs, NTabPane, NTag, NProgress, useMessage, NModal, NForm, NFormItem,
  NInputNumber, NInput, NDatePicker, NSelect, NSpace, NDivider, NGrid, NGi, NDescriptions, NDescriptionsItem,
  type DataTableColumns
} from 'naive-ui'
import {
  AddOutline, EyeOutline, CalculatorOutline, CheckmarkOutline, DownloadOutline, TrashOutline
} from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'
import payrollService, { type Liquidation } from '@/services/payroll.service'

const message = useMessage()
const loading = ref(false)
const creating = ref(false)

const liquidations = ref<Liquidation[]>([])
const pendingLiquidations = ref<Liquidation[]>([])
const processedLiquidations = ref<Liquidation[]>([])
const employeeOptions = ref<{ label: string; value: string }[]>([])

const activeTab = ref('pending')
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedLiquidation = ref<Liquidation | null>(null)

const pagination = { pageSize: 10 }

const createFormData = ref({
  empleadoId: '',
  tipoLiquidacion: 'RENUNCIA' as 'RENUNCIA' | 'DESPIDO' | 'CESE' | 'FIN_CONTRATO' | 'OTRO',
  fechaLiquidacion: Date.now(),
  observacion: ''
})

const tipoOptions = [
  { label: 'Renuncia', value: 'RENUNCIA' },
  { label: 'Despido', value: 'DESPIDO' },
  { label: 'Cese', value: 'CESE' },
  { label: 'Fin de Contrato', value: 'FIN_CONTRATO' },
  { label: 'Otro', value: 'OTRO' }
]

const columns: DataTableColumns<Liquidation> = [
  { title: 'Código', key: 'empleadoCodigo', width: 90 },
  { title: 'Empleado', key: 'empleadoNombre', width: 200 },
  { title: 'Tipo', key: 'tipoLiquidacion', width: 130 },
  { title: 'Ingreso', key: 'fechaIngreso', width: 110, render: (row) => formatDate(row.fechaIngreso) },
  { title: 'Cese', key: 'fechaLiquidacion', width: 110, render: (row) => formatDate(row.fechaLiquidacion) },
  { title: 'Días', key: 'diasLaborados', width: 80 },
  { 
    title: 'Total Neto', 
    key: 'totalNeto', 
    width: 130, 
    render: (row) => h('strong', null, `S/ ${row.totalNeto?.toFixed(2) || '0.00'}`) 
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 120,
    render: (row) => {
      const type = row.estado === 'PAGADA' || row.estado === 'APROBADA' ? 'success' : 
                   row.estado === 'CALCULADA' ? 'info' : 'warning'
      return h(NTag, { type, size: 'small' }, () => row.estado)
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 180,
    render: (row) => h(NSpace, { size: 'small' }, () => [
      h(NButton, { size: 'small', secondary: true, onClick: () => viewDetails(row) }, { 
        icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) 
      }),
      row.estado === 'PENDIENTE' && h(NButton, { 
        size: 'small', 
        type: 'warning',
        onClick: () => calculateLiquidation(row) 
      }, { 
        icon: () => h(NIcon, null, { default: () => h(CalculatorOutline) }) 
      })
    ])
  }
]

const formatDate = (date: string | number) => {
  if (!date) return '-'
  const d = typeof date === 'number' ? new Date(date) : new Date(date)
  return d.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const loadLiquidations = async () => {
  loading.value = true
  try {
    const { data } = await payrollService.getLiquidations({ limit: 200 })
    liquidations.value = data
    pendingLiquidations.value = data.filter(l => ['PENDIENTE', 'CALCULADA'].includes(l.estado))
    processedLiquidations.value = data.filter(l => ['APROBADA', 'PAGADA', 'ANULADA'].includes(l.estado))
  } catch (error) {
    console.error(error)
    message.error('Error al cargar liquidaciones')
  } finally {
    loading.value = false
  }
}

const viewDetails = (liquidation: Liquidation) => {
  selectedLiquidation.value = liquidation
  showDetailModal.value = true
}

const handleCreate = async () => {
  creating.value = true
  try {
    await payrollService.createLiquidation({
      ...createFormData.value,
      fechaLiquidacion: new Date(createFormData.value.fechaLiquidacion).toISOString()
    })
    message.success('Liquidación creada correctamente')
    showCreateModal.value = false
    loadLiquidations()
  } catch (error) {
    console.error(error)
    message.error('Error al crear liquidación')
  } finally {
    creating.value = false
  }
}

const calculateLiquidation = async (liquidation: Liquidation) => {
  try {
    await payrollService.calculateLiquidation(liquidation.id)
    message.success('Liquidación calculada correctamente')
    loadLiquidations()
  } catch (error) {
    console.error(error)
    message.error('Error al calcular liquidación')
  }
}

const approveLiquidation = async () => {
  if (!selectedLiquidation.value) return
  try {
    await payrollService.approveLiquidation(selectedLiquidation.value.id)
    message.success('Liquidación aprobada')
    showDetailModal.value = false
    loadLiquidations()
  } catch (error) {
    console.error(error)
    message.error('Error al aprobar liquidación')
  }
}

const exportLiquidation = async () => {
  if (!selectedLiquidation.value) return
  try {
    const blob = await payrollService.exportLiquidation(selectedLiquidation.value.id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `liquidacion_${selectedLiquidation.value.empleadoCodigo}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    message.success('Liquidación exportada')
  } catch (error) {
    console.error(error)
    message.error('Error al exportar')
  }
}

onMounted(() => { loadLiquidations() })
</script>

<style scoped>
.liquidations-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
.mb-4 { margin-bottom: 16px; }
.concept-card { border-radius: 8px; text-align: center; }
.concept-card.income { background: #e8f5e9; }
.concept-card.discount { background: #ffebee; }
.concept-card.total-income { background: #c8e6c9; border: 2px solid #4caf50; }
.concept-card.total-discount { background: #ffcdd2; border: 2px solid #f44336; }
.concept-title { font-size: 11px; font-weight: 600; color: #666; margin-bottom: 8px; }
.concept-amount { font-size: 20px; font-weight: bold; color: #333; }
.total-card { border-radius: 12px; background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%); color: white; text-align: center; padding: 24px; }
.total-label { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.total-amount { font-size: 36px; font-weight: bold; }
</style>
