<template>
  <AppleCard>
    <div class="list-header">
      <h4>Historial de Liquidaciones</h4>
      <AppleButton variant="secondary" :icon="DownloadIcon">
        Exportar Excel
      </AppleButton>
    </div>

    <AppleTable
      :columns="columns"
      :data="liquidaciones"
      :loading="loading"
      :bordered="false"
      :striped="true"
      pagination
    />
  </AppleCard>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import {
  AppleCard,
  AppleButton,
  AppleTable,
  AppleTag,
  AppleAvatar
} from '@/components/apple'
import { Download } from 'lucide-vue-next'

const DownloadIcon = Download
const loading = ref(false)

const liquidaciones = ref([
  { id: 'LIQ-001', empleado: 'Juan Pérez García', dni: '12345678', cargo: 'Analista', fechaLiquidacion: '2026-01-15', montoTotal: 12500.50, estado: 'PAGADO' },
  { id: 'LIQ-002', empleado: 'María López Torres', dni: '87654321', cargo: 'Asistente', fechaLiquidacion: '2026-01-20', montoTotal: 8300.00, estado: 'PENDIENTE' }
])

const getStatusType = (status: string): 'default' | 'success' | 'warning' | 'error' | 'primary' => {
  const types: Record<string, 'default' | 'success' | 'warning' | 'error' | 'primary'> = { 'PAGADO': 'success', 'PENDIENTE': 'warning', 'EN_PROCESO': 'primary' }
  return types[status] || 'default'
}

const formatCurrency = (amount: number) => `S/ ${(amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

const columns = [
  { title: 'Código', key: 'id', width: '120px' },
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'empleado-info' }, [
        h(AppleAvatar, { src: '', size: 'sm', name: row.empleado }),
        h('div', { style: 'margin-left: 10px;' }, [
          h('div', { style: 'font-weight: 500;' }, row.empleado),
          h('div', { style: 'font-size: 12px;' }, `DNI: ${row.dni}`)
        ])
      ])
    }
  },
  { title: 'Cargo', key: 'cargo' },
  { title: 'Fecha', key: 'fechaLiquidacion', width: '140px' },
  { title: 'Monto Total', key: 'montoTotal', width: '140px', render: (row: any) => h('strong', { style: 'color: #059669;' }, formatCurrency(row.montoTotal)) },
  {
    title: 'Estado',
    key: 'estado',
    width: '120px',
    render(row: any) {
      const labels: Record<string, string> = { 'PAGADO': 'Pagado', 'PENDIENTE': 'Pendiente', 'EN_PROCESO': 'En Proceso' }
      return h(AppleTag, { type: getStatusType(row.estado), label: labels[row.estado] || row.estado })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: '180px',
    render(row: any) {
      return h('div', { class: 'actions' }, [
        h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => viewBoleta(row) }, () => 'Ver Boleta'),
        h(AppleButton, { variant: 'primary', size: 'small', onClick: () => downloadPDF(row) }, () => 'PDF')
      ])
    }
  }
]

const viewBoleta = (row: any) => console.log('View:', row)
const downloadPDF = (row: any) => alert('Descargando...')
const exportLiquidaciones = () => alert('Exportando...')
</script>

<style scoped>
.liquidaciones-list { padding: 16px 0; }
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.list-header h4 { font-size: 18px; font-weight: 600; margin: 0; }
.empleado-info { display: flex; align-items: center; }
.actions { display: flex; gap: 8px; }
</style>
