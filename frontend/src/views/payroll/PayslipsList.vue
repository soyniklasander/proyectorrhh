<template>
  <div class="payslips-list">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Boletas de Pago</h1>
        <p class="subtitle">Visualización y gestión de recibos de pago por empleado.</p>
      </div>

      <div class="controls">
        <n-select
          v-model:value="selectedEmployee"
          clearable
          filterable
          placeholder="Filtrar por empleado"
          :options="employeeOptions"
          style="width: 300px"
        />
        <n-date-picker
          v-model:value="selectedPeriod"
          type="month"
          clearable
          :format="'yyyy-MM'"
          style="width: 180px"
          @update:value="loadPayslips"
        />
        <n-button type="success" @click="exportAllPayslips">
          <template #icon><n-icon><DownloadOutline /></n-icon></template>
          Exportar Todas
        </n-button>
      </div>
    </div>

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

    <n-modal v-model:show="showPayslipModal" style="width: 700px" preset="card" :title="`Boleta de Pago - ${selectedPayslip?.period || ''}`">
      <div v-if="selectedPayslip" class="payslip-container">
        <div class="payslip-header">
          <div class="company-info">
            <h2>RickERP</h2>
            <p>Sistema de Gestión de Recursos Humanos</p>
          </div>
          <div class="payslip-title">
            <h3>BOLETA DE PAGO</h3>
            <p>{{ selectedPayslip.period }}</p>
          </div>
        </div>

        <n-divider />

        <div class="employee-section">
          <n-descriptions :column="2" label-placement="left" bordered size="small">
            <n-descriptions-item label="Empleado">
              <strong>{{ selectedPayslip.employeeName }}</strong>
            </n-descriptions-item>
            <n-descriptions-item label="DNI/CI">
              {{ selectedPayslip.dni }}
            </n-descriptions-item>
            <n-descriptions-item label="Cargo">
              {{ selectedPayslip.position }}
            </n-descriptions-item>
            <n-descriptions-item label="Área">
              {{ selectedPayslip.department }}
            </n-descriptions-item>
            <n-descriptions-item label="Fecha Ingreso">
              {{ formatDate(selectedPayslip.hireDate) }}
            </n-descriptions-item>
            <n-descriptions-item label="Tipo Planilla">
              {{ selectedPayslip.payrollType }}
            </n-descriptions-item>
          </n-descriptions>
        </div>

        <n-divider />

        <div class="earnings-section">
          <h4>INGRESOS</h4>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th class="text-right">Haber</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sueldo Básico</td>
                <td class="text-right">S/ {{ formatMoney(selectedPayslip.salarioBase) }}</td>
              </tr>
              <tr v-if="selectedPayslip.asignacionFamiliar > 0">
                <td>Asignación Familiar</td>
                <td class="text-right">S/ {{ formatMoney(selectedPayslip.asignacionFamiliar) }}</td>
              </tr>
              <tr v-if="selectedPayslip.horasExtras > 0">
                <td>Horas Extras ({{ selectedPayslip.horasExtrasCount }} hrs)</td>
                <td class="text-right">S/ {{ formatMoney(selectedPayslip.horasExtras) }}</td>
              </tr>
              <tr v-if="selectedPayslip.bonificaciones > 0">
                <td>Bonificaciones</td>
                <td class="text-right">S/ {{ formatMoney(selectedPayslip.bonificaciones) }}</td>
              </tr>
              <tr v-if="selectedPayslip.comisiones > 0">
                <td>Comisiones</td>
                <td class="text-right">S/ {{ formatMoney(selectedPayslip.comisiones) }}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL INGRESOS</td>
                <td class="text-right">S/ {{ formatMoney(selectedPayslip.totalIngresos) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="deductions-section">
          <h4>DESCUENTOS</h4>
          <table class="detail-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th class="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AFP (Sistema de Pensiones - {{ selectedPayslip.afpName }})</td>
                <td class="text-right text-red">-S/ {{ formatMoney(selectedPayslip.afpDescuento) }}</td>
              </tr>
              <tr v-if="selectedPayslip.adelantos > 0">
                <td>Adelantos</td>
                <td class="text-right text-red">-S/ {{ formatMoney(selectedPayslip.adelantos) }}</td>
              </tr>
              <tr v-if="selectedPayslip.prestamos > 0">
                <td>Préstamos</td>
                <td class="text-right text-red">-S/ {{ formatMoney(selectedPayslip.prestamos) }}</td>
              </tr>
              <tr v-if="selectedPayslip.otrosDescuentos > 0">
                <td>Otros Descuentos</td>
                <td class="text-right text-red">-S/ {{ formatMoney(selectedPayslip.otrosDescuentos) }}</td>
              </tr>
              <tr class="total-row deduction">
                <td>TOTAL DESCUENTOS</td>
                <td class="text-right">-S/ {{ formatMoney(selectedPayslip.totalDescuentos) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <n-divider />

        <div class="net-section">
          <div class="net-row">
            <span class="net-label">NETO A PAGAR</span>
            <span class="net-amount">S/ {{ formatMoney(selectedPayslip.netoPagar) }}</span>
          </div>
          <div class="net-words">
            Son: {{ amountInWords(selectedPayslip.netoPagar) }}
          </div>
        </div>

        <n-divider />

        <div class="contributions-section">
          <h4>APORTACIONES DEL EMPLEADOR</h4>
          <n-grid :cols="3" :x-gap="16">
            <n-gi>
              <div class="contribution-item">
                <span>Essalud</span>
                <span>S/ {{ formatMoney(selectedPayslip.essalud) }}</span>
              </div>
            </n-gi>
            <n-gi>
              <div class="contribution-item">
                <span>Senati/Otros</span>
                <span>S/ {{ formatMoney(selectedPayslip.senati) }}</span>
              </div>
            </n-gi>
            <n-gi>
              <div class="contribution-item">
                <span>Total Aportaciones</span>
                <span>S/ {{ formatMoney(selectedPayslip.totalAportaciones) }}</span>
              </div>
            </n-gi>
          </n-grid>
        </div>
      </div>

      <template #footer>
        <div class="modal-actions">
          <n-button @click="showPayslipModal = false">Cerrar</n-button>
          <n-button type="info" @click="downloadPayslip">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>
            Descargar PDF
          </n-button>
          <n-button type="primary" @click="printPayslip">
            <template #icon><n-icon><PrintOutline /></n-icon></template>
            Imprimir
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, h } from 'vue'
import {
  NButton, NIcon, NCard, NSelect, NDatePicker, NDataTable, NModal,
  NDivider, NDescriptions, NDescriptionsItem, NGrid, NGi, useMessage,
  type DataTableColumns
} from 'naive-ui'
import {
  DownloadOutline, PrintOutline, EyeOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

interface Payslip {
  id: string
  period: string
  employeeId: string
  employeeName: string
  dni: string
  position: string
  department: string
  hireDate: string
  payrollType: string
  salarioBase: number
  asignacionFamiliar: number
  horasExtras: number
  horasExtrasCount: number
  bonificaciones: number
  comisiones: number
  totalIngresos: number
  afpName: string
  afpDescuento: number
  adelantos: number
  prestamos: number
  otrosDescuentos: number
  totalDescuentos: number
  netoPagar: number
  essalud: number
  senati: number
  totalAportaciones: number
}

const message = useMessage()
const loading = ref(false)
const payslips = ref<Payslip[]>([])
const selectedEmployee = ref<string | null>(null)
const selectedPeriod = ref<number | null>(null)
const showPayslipModal = ref(false)
const selectedPayslip = ref<Payslip | null>(null)
const employeeOptions = ref<{ label: string; value: string }[]>([])

const pagination = { pageSize: 10 }

const formatMoney = (val: number) =>
  val?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'

const formatDate = (val: string) =>
  val ? dayjs(val).format('DD/MM/YYYY') : '-'

const amountInWords = (amount: number): string => {
  const ones = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
  const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
  const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE']

  const intPart = Math.floor(amount)
  const decPart = Math.round((amount - intPart) * 100)

  let result = `${intPart} CON ${decPart}/100 SOLES`
  return result
}

const columns: DataTableColumns<Payslip> = [
  {
    title: 'Período',
    key: 'period',
    fixed: 'left',
    width: 100,
    render: (row) => h('strong', null, { default: () => row.period })
  },
  { title: 'Empleado', key: 'employeeName', fixed: 'left', width: 200 },
  { title: 'DNI', key: 'dni', width: 100 },
  {
    title: 'Básico',
    key: 'salarioBase',
    width: 120,
    render: (row) => `S/ ${formatMoney(row.salarioBase)}`
  },
  {
    title: 'Ingresos',
    key: 'totalIngresos',
    width: 120,
    render: (row) => h('strong', { style: 'color: #3b82f6' }, `S/ ${formatMoney(row.totalIngresos)}`)
  },
  {
    title: 'Descuentos',
    key: 'totalDescuentos',
    width: 120,
    render: (row) => h('span', { style: 'color: #ef4444' }, `-S/ ${formatMoney(row.totalDescuentos)}`)
  },
  {
    title: 'Neto',
    key: 'netoPagar',
    width: 120,
    render: (row) => h('strong', { style: 'color: #10b981' }, `S/ ${formatMoney(row.netoPagar)}`)
  },
  {
    title: 'Acciones',
    key: 'actions',
    fixed: 'right',
    width: 100,
    render: (row) => h(
      NButton,
      { size: 'small', secondary: true, onClick: () => openPayslip(row) },
      { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }
    )
  }
]

const loadPayslips = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (selectedEmployee.value) params.append('employeeId', selectedEmployee.value)
  if (selectedPeriod.value) params.append('period', dayjs(selectedPeriod.value).format('YYYY-MM'))

  try {
    const { data } = await api.get(`/payroll/payslips?${params.toString()}`)
    if (data.success) {
      payslips.value = data.data
    }
  } catch (error) {
    console.error(error)
    message.error('Error al cargar boletas')
  } finally {
    loading.value = false
  }
}

const loadEmployees = async () => {
  try {
    const { data } = await api.get('/employees')
    if (data.success) {
      employeeOptions.value = data.data.map((e: any) => ({
        label: `${e.nombres} ${e.apellidos}`,
        value: e.id
      }))
    }
  } catch (error) {
    console.error(error)
  }
}

const openPayslip = (payslip: Payslip) => {
  selectedPayslip.value = payslip
  showPayslipModal.value = true
}

const downloadPayslip = () => {
  message.success('Descargando boleta en PDF...')
}

const printPayslip = () => {
  window.print()
}

const exportAllPayslips = () => {
  message.success('Exportando todas las boletas...')
}

watch([selectedEmployee, selectedPeriod], () => {
  loadPayslips()
})

onMounted(() => {
  loadEmployees()
  loadPayslips()
  selectedPeriod.value = Date.now()
})
</script>

<style scoped>
.payslips-list {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
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

.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.payslip-container {
  padding: 10px;
}

.payslip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.company-info h2 {
  margin: 0;
  font-size: 24px;
  color: #3b82f6;
}

.company-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
}

.payslip-title {
  text-align: right;
}

.payslip-title h3 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.payslip-title p {
  margin: 4px 0 0;
  color: #666;
}

.employee-section {
  margin: 20px 0;
}

.earnings-section, .deductions-section, .contributions-section {
  margin: 20px 0;
}

.earnings-section h4, .deductions-section h4, .contributions-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  text-transform: uppercase;
  color: #666;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 8px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.detail-table th, .detail-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.detail-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #555;
}

.text-right {
  text-align: right;
}

.text-red {
  color: #ef4444;
}

.total-row {
  font-weight: 700;
  background: #f8fafc;
}

.total-row.deduction {
  color: #ef4444;
}

.net-section {
  text-align: right;
}

.net-row {
  display: inline-block;
  background: #ecfdf5;
  padding: 16px 32px;
  border-radius: 8px;
  border: 2px solid #a7f3d0;
}

.net-label {
  display: block;
  font-size: 12px;
  color: #065f46;
  margin-bottom: 4px;
}

.net-amount {
  font-size: 28px;
  font-weight: 700;
  color: #065f46;
}

.net-words {
  margin-top: 12px;
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.contribution-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media print {
  .modal-actions {
    display: none;
  }
}
</style>
