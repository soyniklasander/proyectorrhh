<template>
  <AppleContainer>
    <ApplePageHeader title="Historial de Planillas" subtitle="Períodos de planilla generados">
      <template #actions>
        <AppleButton variant="secondary" @click="refresh">Actualizar</AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <AppleTable :columns="columns" :data="payrollPeriods" />
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTable } from '@/components/apple'
import { api } from '@/services/api'
import { useMessage } from 'naive-ui'
import dayjs from 'dayjs'

dayjs.locale('es')

interface PayrollPeriod {
  id: string
  period: string
  status: 'BORRADOR' | 'PENDIENTE' | 'CERRADA' | 'PAGADA'
  employeeCount: number
  totalIngresos: number
  totalDeducciones: number
  totalNeto: number
  generatedAt: string
}

const loading = ref(false)
const payrollPeriods = ref<PayrollPeriod[]>([])
const message = useMessage()

const formatMoney = (val: number) => val?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'
const formatDate = (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-'

const columns = [
  { title: 'Período', key: 'period', render: (row: PayrollPeriod) => row.period },
  { title: 'Estado', key: 'status', render: (row: PayrollPeriod) => row.status },
  { title: 'Empleados', key: 'employeeCount' },
  { title: 'Ingresos', key: 'totalIngresos', render: (row: PayrollPeriod) => `S/ ${formatMoney(row.totalIngresos)}` },
  { title: 'Descuentos', key: 'totalDeducciones', render: (row: PayrollPeriod) => `S/ ${formatMoney(row.totalDeducciones)}` },
  { title: 'Neto', key: 'totalNeto', render: (row: PayrollPeriod) => `S/ ${formatMoney(row.totalNeto)}` },
  { title: 'Generado', key: 'generatedAt', render: (row: PayrollPeriod) => formatDate(row.generatedAt) },
  { title: 'Acciones', key: 'actions', render: (row: PayrollPeriod) => h('div', { style: 'display: flex; gap: 8px;' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => openDetail(row) }, () => 'Ver'), h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => exportPeriod(row) }, () => 'Exportar')]) }
]

const fetchPayrollPeriods = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/payroll/periods')
    if (data.success && data.data) {
      payrollPeriods.value = data.data
    } else if (Array.isArray(data)) {
      payrollPeriods.value = data
    }
  } catch (error: any) {
    console.error('Error fetching payroll periods:', error)
    // Usar datos mock
    payrollPeriods.value = getMockPayrollPeriods()
    message.warning('Usando datos de demostración')
  } finally {
    loading.value = false
  }
}

const getMockPayrollPeriods = (): PayrollPeriod[] => [
  { id: 'PP-001', period: 'Enero 2026', status: 'PAGADA', employeeCount: 45, totalIngresos: 285000, totalDeducciones: 45000, totalNeto: 240000, generatedAt: '2026-01-31T18:00:00' },
  { id: 'PP-002', period: 'Diciembre 2025', status: 'PAGADA', employeeCount: 44, totalIngresos: 278000, totalDeducciones: 44000, totalNeto: 234000, generatedAt: '2025-12-31T18:00:00' },
  { id: 'PP-003', period: 'Noviembre 2025', status: 'PAGADA', employeeCount: 43, totalIngresos: 272000, totalDeducciones: 43000, totalNeto: 229000, generatedAt: '2025-11-30T18:00:00' },
  { id: 'PP-004', period: 'Octubre 2025', status: 'PAGADA', employeeCount: 42, totalIngresos: 265000, totalDeducciones: 42000, totalNeto: 223000, generatedAt: '2025-10-31T18:00:00' },
  { id: 'PP-005', period: 'Septiembre 2025', status: 'PAGADA', employeeCount: 41, totalIngresos: 258000, totalDeducciones: 41000, totalNeto: 217000, generatedAt: '2025-09-30T18:00:00' },
  { id: 'PP-006', period: 'Agosto 2025', status: 'PAGADA', employeeCount: 40, totalIngresos: 252000, totalDeducciones: 40000, totalNeto: 212000, generatedAt: '2025-08-31T18:00:00' }
]

const refresh = () => fetchPayrollPeriods()
const openDetail = (period: PayrollPeriod) => {
  message.info(`Ver detalle de planilla: ${period.period}`)
}
const exportPeriod = (period: PayrollPeriod) => {
  message.success(`Exportando planilla: ${period.period}`)
}

onMounted(() => fetchPayrollPeriods())
</script>
