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
import { ref, onMounted } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTable } from '@/components/apple'
import { api } from '@/services/api'
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
    if (data.success) payrollPeriods.value = data.data
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const refresh = () => fetchPayrollPeriods()
const openDetail = (period: PayrollPeriod) => alert(`Ver detalle de: ${period.period}`)
const exportPeriod = (period: PayrollPeriod) => alert(`Exportando: ${period.period}`)

onMounted(() => fetchPayrollPeriods())
</script>
