<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Planilla y Nómina</h1>
        <p class="subtitle">Gestión mensual de pagos y beneficios.</p>
      </div>
      
      <div class="controls">
        <n-date-picker
          v-model:value="selectedDate"
          type="month"
          clearable
          :format="'yyyy-MM'"
          style="width: 200px"
          @update:value="fetchPayroll"
        />
        <n-button type="warning" :loading="generating" @click="generatePayroll">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          Generar / Recalcular
        </n-button>
        <n-button type="success" :loading="exporting" @click="exportPayroll">
          <template #icon><n-icon><CloudDownloadOutline /></n-icon></template>
          Exportar CSV
        </n-button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="stats-grid">
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Total Planilla" :value="summary.totalNeto">
          <template #prefix>S/</template>
        </n-statistic>
      </n-card>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Empleados" :value="summary.count">
          <template #prefix><n-icon><PeopleOutline /></n-icon></template>
        </n-statistic>
      </n-card>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Total Ingresos" :value="summary.totalIngresos">
          <template #prefix>S/</template>
        </n-statistic>
      </n-card>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Total Deducciones" :value="summary.totalDeducciones">
          <template #prefix>S/</template>
        </n-statistic>
      </n-card>
    </div>

    <!-- Main Table -->
    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="payrollData"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        size="small"
      />
    </n-card>

    <!-- Paystub Modal -->
    <n-modal v-model:show="showDetailModal" style="width: 600px" preset="card" title="Boleta de Pago">
      <div v-if="selectedRow" class="paystub-container">
        <div class="paystub-header">
          <h3>RickERP - Boleta de Pago</h3>
          <p>{{ formatPeriod(selectedDate) }}</p>
        </div>

        <div class="paystub-info">
          <div class="info-row">
            <span class="label">Empleado:</span>
            <span class="value">{{ selectedRow.employeeName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Documento:</span>
            <span class="value">{{ selectedRow.dni }}</span>
          </div>
        </div>

        <n-divider />

        <div class="paystub-body">
          <div class="section">
            <h4>Ingresos</h4>
            <div class="row"><span>Básico</span> <span>S/ {{ formatMoney(selectedRow.basico) }}</span></div>
            <div class="row"><span>Asig. Familiar</span> <span>S/ {{ formatMoney(selectedRow.asignacionFamiliar || 0) }}</span></div>
            <div class="row"><span>Horas Extras</span> <span>S/ {{ formatMoney(selectedRow.horasExtras) }}</span></div>
            <div class="row"><span>Bonificaciones</span> <span>S/ {{ formatMoney(selectedRow.bonificaciones) }}</span></div>
            <div class="row total"><span>Total Ingresos</span> <span>S/ {{ formatMoney(selectedRow.totalIngresos) }}</span></div>
          </div>

          <div class="section">
            <h4>Descuentos</h4>
            <div class="row"><span>Sistema Pensiones</span> <span>S/ {{ formatMoney(selectedRow.afp) }}</span></div>
            <div class="row"><span>Adelantos</span> <span>S/ {{ formatMoney(selectedRow.adelantos || 0) }}</span></div>
            <div class="row"><span>Otros</span> <span>S/ {{ formatMoney(selectedRow.otrosDescuentos) }}</span></div>
            <div class="row total text-red"><span>Total Descuentos</span> <span>S/ {{ formatMoney(selectedRow.afp + selectedRow.otrosDescuentos) }}</span></div>
          </div>
        </div>

        <n-divider />

        <div class="paystub-footer">
          <div class="net-pay">
            <span>NETO A PAGAR</span>
            <span>S/ {{ formatMoney(selectedRow.neto) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showDetailModal = false">Cerrar</n-button>
          <n-button type="primary" @click="printPaystub">Imprimir</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NStatistic, NDataTable, NDatePicker, NModal, NDivider, useMessage,
  type DataTableColumns
} from 'naive-ui'
import {
  RefreshOutline, CloudDownloadOutline, PeopleOutline, EyeOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'
import dayjs from 'dayjs'

interface PayrollRow {
  id: string
  employeeName: string
  dni: string
  basico: number
  asignacionFamiliar?: number
  horasExtras: number
  bonificaciones: number
  totalIngresos: number
  afp: number
  adelantos?: number
  otrosDescuentos: number
  neto: number
}

const message = useMessage()
const selectedDate = ref(Date.now())
const loading = ref(false)
const generating = ref(false)
const exporting = ref(false)
const payrollData = ref<PayrollRow[]>([])
const showDetailModal = ref(false)
const selectedRow = ref<PayrollRow | null>(null)

const pagination = { pageSize: 10 }

const summary = computed(() => {
  return payrollData.value.reduce((acc, row) => ({
    count: acc.count + 1,
    totalNeto: acc.totalNeto + row.neto,
    totalIngresos: acc.totalIngresos + row.totalIngresos,
    totalDeducciones: acc.totalDeducciones + (row.afp + row.otrosDescuentos)
  }), { count: 0, totalNeto: 0, totalIngresos: 0, totalDeducciones: 0 })
})

const columns: DataTableColumns<PayrollRow> = [
  { title: 'Empleado', key: 'employeeName', fixed: 'left', width: 200 },
  { title: 'DNI', key: 'dni', width: 100 },
  {
    title: 'Básico',
    key: 'basico',
    render: (row) => `S/ ${formatMoney(row.basico)}`
  },
  {
    title: 'Ingresos',
    key: 'totalIngresos',
    render: (row) => h('strong', `S/ ${formatMoney(row.totalIngresos)}`)
  },
  {
    title: 'Descuentos',
    key: 'deducciones',
    render: (row) => h('span', { style: 'color: #ef4444' }, `-S/ ${formatMoney(row.afp + row.otrosDescuentos)}`)
  },
  {
    title: 'Neto',
    key: 'neto',
    render: (row) => h('strong', { style: 'color: #10b981' }, `S/ ${formatMoney(row.neto)}`)
  },
  {
    title: 'Acciones',
    key: 'actions',
    fixed: 'right',
    width: 100,
    render: (row) => h(
      NButton,
      { size: 'small', secondary: true, onClick: () => openDetail(row) },
      { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }
    )
  }
]

const formatMoney = (val: number) => val?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'
const formatPeriod = (ts: number) => dayjs(ts).format('MMMM YYYY').toUpperCase()

const fetchPayroll = async () => {
  loading.value = true
  const period = dayjs(selectedDate.value).format('YYYY-MM')
  try {
    const { data } = await api.get(`/payroll/payslips?period=${period}`)
    if (data.success) {
      payrollData.value = data.data.map((item: any) => ({
        id: item.id,
        employeeName: item.empleado_codigo || 'Sin nombre',
        dni: item.empleado_codigo || '-',
        basico: item.salario_base || 0,
        asignacionFamiliar: item.asignacion_familiar || 0,
        horasExtras: item.horas_extras || 0,
        bonificaciones: (item.bonificaciones || 0) + (item.comisiones || 0),
        totalIngresos: item.total_ingresos || 0,
        afp: item.afp_descuento || 0,
        adelantos: item.adelantos || 0,
        otrosDescuentos: (item.prestamos || 0) + (item.descuentos_judiciales || 0) + (item.otros_descuentos || 0),
        neto: item.neto_pagar || 0
      }))
    } else {
      payrollData.value = []
    }
  } catch (error) {
    console.error(error)
    message.error('Error al cargar la planilla')
    payrollData.value = []
  } finally {
    loading.value = false
  }
}

const generatePayroll = async () => {
  generating.value = true
  const period = dayjs(selectedDate.value).format('YYYY-MM')
  try {
    const { data } = await api.post('/payroll/payslips/generate', { periodo: period })
    if (data.success) {
      message.success(`Planilla generada: ${data.count} boletas creadas`)
      fetchPayroll()
    }
  } catch (error) {
    message.error('Error al generar planilla')
  } finally {
    generating.value = false
  }
}

const exportPayroll = async () => {
  exporting.value = true
  const period = dayjs(selectedDate.value).format('YYYY-MM')
  try {
    const response = await api.post('/payroll/payslips/export', { periodo: period }, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Planilla_${period}.csv`)
    document.body.appendChild(link)
    link.click()
    message.success('Exportación completada')
  } catch (error) {
    message.error('Error al exportar')
  } finally {
    exporting.value = false
  }
}

const openDetail = (row: PayrollRow) => {
  selectedRow.value = row
  showDetailModal.value = true
}

const printPaystub = () => {
  window.print()
}

onMounted(() => {
  fetchPayroll()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.controls {
  display: flex;
  gap: 12px;
  align-items: center;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}
.subtitle {
  color: #6b7280;
  margin: 4px 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Paystub Styles */
.paystub-container {
  padding: 10px;
}
.paystub-header {
  text-align: center;
  margin-bottom: 20px;
}
.paystub-header h3 { margin: 0; font-size: 18px; }
.paystub-header p { margin: 4px 0 0; color: #666; }

.paystub-info {
  margin-bottom: 20px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}
.info-row .label { font-weight: 600; color: #555; }

.paystub-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  text-transform: uppercase;
  color: #888;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.row.total {
  margin-top: 12px;
  font-weight: 700;
  font-size: 14px;
  border-top: 1px solid #eee;
  padding-top: 8px;
}
.text-red { color: #ef4444; }

.paystub-footer {
  margin-top: 20px;
  text-align: right;
}
.net-pay {
  display: inline-block;
  background: #ecfdf5;
  padding: 12px 24px;
  border-radius: 8px;
  color: #065f46;
  font-weight: 700;
  font-size: 16px;
  border: 1px solid #a7f3d0;
}
.net-pay span:first-child { margin-right: 12px; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
