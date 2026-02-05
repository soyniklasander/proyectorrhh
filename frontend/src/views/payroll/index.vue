<template>
  <AppleContainer>
    <!-- Header -->
    <ApplePageHeader
      title="Planilla y Nómina"
      subtitle="Gestión mensual de pagos y beneficios"
    >
      <template #actions>
        <AppleDatePicker
          v-model="selectedDate"
          type="month"
          @change="fetchPayroll"
        />
        <AppleButton 
          variant="secondary" 
          :loading="generating"
          :icon="RefreshCw"
          @click="generatePayroll"
        >
          Generar
        </AppleButton>
        <AppleButton 
          variant="primary" 
          :loading="exporting"
          :icon="Download"
          @click="exportPayroll"
        >
          Exportar CSV
        </AppleButton>
      </template>
    </ApplePageHeader>

    <!-- Summary Cards -->
    <AppleSection v-if="loading" title="Cargando...">
      <AppleGrid :columns="4">
        <AppleSkeleton v-for="i in 4" :key="i" variant="card" />
      </AppleGrid>
    </AppleSection>

    <AppleSection v-else title="Resumen del Período">
      <AppleGrid :columns="4">
        <AppleStatCard
          :icon="Wallet"
          :value="summary.totalNeto"
          label="Total Planilla"
          color="blue"
          format="currency"
        />
        <AppleStatCard
          :icon="Users"
          :value="summary.count"
          label="Empleados"
          color="green"
        />
        <AppleStatCard
          :icon="TrendingUp"
          :value="summary.totalIngresos"
          label="Total Ingresos"
          color="orange"
          format="currency"
        />
        <AppleStatCard
          :icon="TrendingDown"
          :value="summary.totalDeducciones"
          label="Total Deducciones"
          color="red"
          format="currency"
        />
      </AppleGrid>
    </AppleSection>

    <!-- Main Table -->
    <AppleCard title="Detalle de Planilla" padded hover-lift>
      <AppleTable
        :columns="columns"
        :data="payrollData"
        :loading="loading"
        :bordered="false"
      />
    </AppleCard>

    <!-- Paystub Modal -->
    <AppleModal
      v-model:show="showDetailModal"
      title="Boleta de Pago"
      subtitle="RickERP - Sistema de Nómina"
      size="medium"
    >
      <div v-if="selectedRow" class="paystub-content">
        <!-- Period Header -->
        <div class="paystub-period">
          <AppleBadge type="primary" :label="formatPeriod(selectedDate)" />
        </div>

        <!-- Employee Info -->
        <AppleCardSection title="Información del Empleado">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Empleado</span>
              <span class="info-value">{{ selectedRow.employeeName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Documento</span>
              <span class="info-value">{{ selectedRow.dni }}</span>
            </div>
          </div>
        </AppleCardSection>

        <AppleDivider />

        <!-- Income Section -->
        <AppleCardSection title="Ingresos">
          <div class="amount-list">
            <div class="amount-row">
              <span>Sueldo Básico</span>
              <span class="amount-positive">S/ {{ formatMoney(selectedRow.basico) }}</span>
            </div>
            <div class="amount-row">
              <span>Asignación Familiar</span>
              <span class="amount-positive">S/ {{ formatMoney(selectedRow.asignacionFamiliar || 0) }}</span>
            </div>
            <div class="amount-row">
              <span>Horas Extras</span>
              <span class="amount-positive">S/ {{ formatMoney(selectedRow.horasExtras) }}</span>
            </div>
            <div class="amount-row">
              <span>Bonificaciones</span>
              <span class="amount-positive">S/ {{ formatMoney(selectedRow.bonificaciones) }}</span>
            </div>
            <div class="amount-row total">
              <span>Total Ingresos</span>
              <span class="amount-positive">S/ {{ formatMoney(selectedRow.totalIngresos) }}</span>
            </div>
          </div>
        </AppleCardSection>

        <AppleDivider />

        <!-- Deductions Section -->
        <AppleCardSection title="Descuentos">
          <div class="amount-list">
            <div class="amount-row">
              <span>Sistema de Pensiones (AFP)</span>
              <span class="amount-negative">- S/ {{ formatMoney(selectedRow.afp) }}</span>
            </div>
            <div class="amount-row">
              <span>Adelantos</span>
              <span class="amount-negative">- S/ {{ formatMoney(selectedRow.adelantos || 0) }}</span>
            </div>
            <div class="amount-row">
              <span>Otros Descuentos</span>
              <span class="amount-negative">- S/ {{ formatMoney(selectedRow.otrosDescuentos) }}</span>
            </div>
            <div class="amount-row total">
              <span>Total Descuentos</span>
              <span class="amount-negative">- S/ {{ formatMoney(selectedRow.afp + selectedRow.otrosDescuentos) }}</span>
            </div>
          </div>
        </AppleCardSection>

        <AppleDivider />

        <!-- Net Pay -->
        <div class="net-pay-section">
          <div class="net-pay-row">
            <span class="net-pay-label">NETO A PAGAR</span>
            <span class="net-pay-value">S/ {{ formatMoney(selectedRow.neto) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <AppleButtonGroup>
          <AppleButton variant="ghost" @click="showDetailModal = false">
            Cerrar
          </AppleButton>
          <AppleButton variant="primary" :icon="Printer" @click="printPaystub">
            Imprimir
          </AppleButton>
        </AppleButtonGroup>
      </template>
    </AppleModal>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  Wallet, Users, TrendingUp, TrendingDown, RefreshCw, Download, Eye, Printer
} from 'lucide-vue-next'

import {
  AppleContainer,
  ApplePageHeader,
  AppleSection,
  AppleGrid,
  AppleStatCard,
  AppleCard,
  AppleCardSection,
  AppleTable,
  AppleSkeleton,
  AppleModal,
  AppleButton,
  AppleButtonGroup,
  AppleBadge,
  AppleDivider,
  AppleDatePicker,
  AppleIconButton
} from '@/components/apple'

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

const selectedDate = ref(Date.now())
const loading = ref(false)
const generating = ref(false)
const exporting = ref(false)
const payrollData = ref<PayrollRow[]>([])
const showDetailModal = ref(false)
const selectedRow = ref<PayrollRow | null>(null)

const summary = computed(() => {
  return payrollData.value.reduce((acc, row) => ({
    count: acc.count + 1,
    totalNeto: acc.totalNeto + row.neto,
    totalIngresos: acc.totalIngresos + row.totalIngresos,
    totalDeducciones: acc.totalDeducciones + (row.afp + row.otrosDescuentos)
  }), { count: 0, totalNeto: 0, totalIngresos: 0, totalDeducciones: 0 })
})

const columns = [
  { title: 'Empleado', key: 'employeeName', width: 200 },
  { title: 'DNI', key: 'dni', width: 100 },
  {
    title: 'Básico',
    key: 'basico',
    render: (row: PayrollRow) => `S/ ${formatMoney(row.basico)}`
  },
  {
    title: 'Ingresos',
    key: 'totalIngresos',
    render: (row: PayrollRow) => h('strong', `S/ ${formatMoney(row.totalIngresos)}`)
  },
  {
    title: 'Descuentos',
    key: 'deducciones',
    render: (row: PayrollRow) => h('span', { style: 'color: #FF3B30' }, `-S/ ${formatMoney(row.afp + row.otrosDescuentos)}`)
  },
  {
    title: 'Neto',
    key: 'neto',
    render: (row: PayrollRow) => h('strong', { style: 'color: #34C759' }, `S/ ${formatMoney(row.neto)}`)
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render: (row: PayrollRow) => h(AppleIconButton, {
      size: 'small',
      variant: 'ghost',
      icon: Eye,
      onClick: () => openDetail(row)
    })
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
      fetchPayroll()
    }
  } catch (error) {
    console.error(error)
  } finally {
    generating.value = false
  }
}

const exportPayroll = async () => {
  exporting.value = true
  const period = dayjs(selectedDate.value).format('YYYY-MM')
  try {
    const { data } = await api.get(`/payroll/export?period=${period}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `planilla-${period}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error(error)
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
.paystub-content {
  padding: 8px 0;
}

.paystub-period {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 13px;
  color: #86868B;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.amount-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 14px;
}

.amount-row.total {
  padding-top: 12px;
  border-top: 1px solid #E8E8ED;
  font-weight: 600;
}

.amount-positive {
  color: #34C759;
  font-weight: 500;
}

.amount-negative {
  color: #FF3B30;
  font-weight: 500;
}

.net-pay-section {
  background: #F5F5F7;
  border-radius: 12px;
  padding: 20px;
  margin-top: 8px;
}

.net-pay-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.net-pay-label {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.net-pay-value {
  font-size: 24px;
  font-weight: 700;
  color: #007AFF;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
</style>
