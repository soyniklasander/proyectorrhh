<template>
  <div class="payroll-list">
    <n-card :bordered="false" class="table-card">
      <template #header>
        <div class="card-header">
          <span>Historial de Planillas</span>
          <n-button type="primary" size="small" @click="refresh">
            <template #icon><n-icon><RefreshOutline /></n-icon></template>
            Actualizar
          </n-button>
        </div>
      </template>

      <n-data-table
        :columns="columns"
        :data="payrollPeriods"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        size="small"
        :row-key="(row: PayrollPeriod) => row.id"
      />
    </n-card>

    <n-modal v-model:show="showDetailModal" style="width: 700px" preset="card" title="Detalle de Planilla">
      <div v-if="selectedPeriod" class="period-detail">
        <div class="detail-header">
          <n-descriptions :column="2" label-placement="left" bordered>
            <n-descriptions-item label="Período">
              <strong>{{ selectedPeriod.period }}</strong>
            </n-descriptions-item>
            <n-descriptions-item label="Estado">
              <n-tag :type="getStatusType(selectedPeriod.status)">{{ selectedPeriod.status }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="Empleados">
              {{ selectedPeriod.employeeCount }}
            </n-descriptions-item>
            <n-descriptions-item label="Total Neto">
              <strong style="color: #10b981">S/ {{ formatMoney(selectedPeriod.totalNeto) }}</strong>
            </n-descriptions-item>
            <n-descriptions-item label="Fecha Generación">
              {{ formatDate(selectedPeriod.generatedAt) }}
            </n-descriptions-item>
            <n-descriptions-item label="Generado Por">
              {{ selectedPeriod.generatedBy || 'Sistema' }}
            </n-descriptions-item>
          </n-descriptions>
        </div>

        <n-divider />

        <div class="detail-stats">
          <n-grid :cols="4" :x-gap="16">
            <n-gi>
              <n-statistic label="Total Ingresos">
                <template #prefix>S/</template>
                {{ formatMoney(selectedPeriod.totalIngresos) }}
              </n-statistic>
            </n-gi>
            <n-gi>
              <n-statistic label="Total Descuentos">
                <template #prefix>S/</template>
                {{ formatMoney(selectedPeriod.totalDeducciones) }}
              </n-statistic>
            </n-gi>
            <n-gi>
              <n-statistic label="Aportaciones">
                <template #prefix>S/</template>
                {{ formatMoney(selectedPeriod.totalAportaciones) }}
              </n-statistic>
            </n-gi>
            <n-gi>
              <n-statistic label="Neto Pagado">
                <template #prefix>S/</template>
                {{ formatMoney(selectedPeriod.totalNeto) }}
              </n-statistic>
            </n-gi>
          </n-grid>
        </div>

        <n-divider />

        <div class="detail-actions">
          <n-button type="info" @click="viewPayslips">
            <template #icon><n-icon><DocumentTextOutline /></n-icon></template>
            Ver Boletas
          </n-button>
          <n-button type="success" @click="exportPeriod">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>
            Exportar CSV
          </n-button>
          <n-button type="warning" :loading="regenerating" @click="regeneratePeriod">
            <template #icon><n-icon><RefreshOutline /></n-icon></template>
            Regenerar
          </n-button>
          <n-button type="error" :disabled="selectedPeriod.status === 'CERRADA'" @click="closePeriod">
            Cerrar Período
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NDataTable, NTag, NModal, NDescriptions,
  NDivider, NStatistic, NGrid, NGi, useMessage, type DataTableColumns
} from 'naive-ui'
import {
  RefreshOutline, DownloadOutline, DocumentTextOutline, EyeOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

interface PayrollPeriod {
  id: string
  period: string
  status: 'BORRADOR' | 'PENDIENTE' | 'CERRADA' | 'PAGADA'
  employeeCount: number
  totalIngresos: number
  totalDeducciones: number
  totalAportaciones: number
  totalNeto: number
  generatedAt: string
  generatedBy?: string
}

const message = useMessage()
const loading = ref(false)
const regenerating = ref(false)
const payrollPeriods = ref<PayrollPeriod[]>([])
const showDetailModal = ref(false)
const selectedPeriod = ref<PayrollPeriod | null>(null)

const pagination = { pageSize: 10 }

const getStatusType = (status: string) => {
  switch (status) {
    case 'BORRADOR': return 'default'
    case 'PENDIENTE': return 'warning'
    case 'CERRADA': return 'info'
    case 'PAGADA': return 'success'
    default: return 'default'
  }
}

const formatMoney = (val: number) =>
  val?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'

const formatDate = (val: string) =>
  val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-'

const columns: DataTableColumns<PayrollPeriod> = [
  {
    title: 'Período',
    key: 'period',
    fixed: 'left',
    width: 120,
    render: (row) => h('strong', null, { default: () => row.period })
  },
  {
    title: 'Estado',
    key: 'status',
    width: 120,
    render: (row) => h(NTag, { type: getStatusType(row.status), size: 'small' }, {
      default: () => row.status
    })
  },
  { title: 'Empleados', key: 'employeeCount', width: 100 },
  {
    title: 'Total Ingresos',
    key: 'totalIngresos',
    width: 140,
    render: (row) => `S/ ${formatMoney(row.totalIngresos)}`
  },
  {
    title: 'Descuentos',
    key: 'totalDeducciones',
    width: 140,
    render: (row) => h('span', { style: 'color: #ef4444' }, `-S/ ${formatMoney(row.totalDeducciones)}`)
  },
  {
    title: 'Neto Pagado',
    key: 'totalNeto',
    width: 140,
    render: (row) => h('strong', { style: 'color: #10b981' }, `S/ ${formatMoney(row.totalNeto)}`)
  },
  {
    title: 'Generado',
    key: 'generatedAt',
    width: 160,
    render: (row) => formatDate(row.generatedAt)
  },
  {
    title: 'Acciones',
    key: 'actions',
    fixed: 'right',
    width: 120,
    render: (row) => h('div', { style: 'display: flex; gap: 8px' }, [
      h(
        NButton,
        { size: 'small', secondary: true, onClick: () => openDetail(row) },
        { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }
      ),
      h(
        NButton,
        { size: 'small', secondary: true, type: 'success', onClick: () => exportPeriodId(row) },
        { icon: () => h(NIcon, null, { default: () => h(DownloadOutline) }) }
      )
    ])
  }
]

const fetchPayrollPeriods = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/payroll/periods')
    if (data.success) {
      payrollPeriods.value = data.data
    }
  } catch (error) {
    console.error(error)
    message.error('Error al cargar períodos de planilla')
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  fetchPayrollPeriods()
}

const openDetail = (period: PayrollPeriod) => {
  selectedPeriod.value = period
  showDetailModal.value = true
}

const viewPayslips = () => {
  if (selectedPeriod.value) {
    message.info(`Navegando a boletas de ${selectedPeriod.value.period}`)
    showDetailModal.value = false
  }
}

const exportPeriod = () => {
  if (selectedPeriod.value) {
    const period = selectedPeriod.value.period
    message.success(`Exportando planilla ${period}`)
  }
}

const exportPeriodId = (period: PayrollPeriod) => {
  message.success(`Exportando planilla ${period.period}`)
}

const regeneratePeriod = async () => {
  if (!selectedPeriod.value) return
  regenerating.value = true
  try {
    const { data } = await api.post('/payroll/regenerate', {
      period: selectedPeriod.value.period
    })
    if (data.success) {
      message.success('Planilla regenerada correctamente')
      fetchPayrollPeriods()
    }
  } catch (error) {
    message.error('Error al regenerar planilla')
  } finally {
    regenerating.value = false
  }
}

const closePeriod = () => {
  if (selectedPeriod.value && selectedPeriod.value.status !== 'CERRADA') {
    message.warning(`Cerrando período ${selectedPeriod.value.period}`)
    showDetailModal.value = false
  }
}

onMounted(() => {
  fetchPayrollPeriods()
})
</script>

<style scoped>
.payroll-list {
  padding: 0;
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.period-detail {
  padding: 10px 0;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-stats {
  margin: 20px 0;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
