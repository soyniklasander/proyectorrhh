<template>
  <div class="liquidaciones-list">
    <div class="list-header">
      <h4>Historial de Liquidaciones</h4>
      <n-button type="primary" @click="exportLiquidaciones">
        📊 Exportar Excel
      </n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="liquidaciones"
      :loading="loading"
      :pagination="{ pageSize: 10 }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NDataTable } from 'naive-ui'

const message = useMessage()
const loading = ref(false)

const liquidaciones = ref([
  {
    id: 'LIQ-001',
    empleado: 'Juan Pérez García',
    dni: '12345678',
    cargo: 'Analista',
    fechaLiquidacion: '2026-01-15',
    montoTotal: 12500.50,
    estado: 'PAGADO'
  },
  {
    id: 'LIQ-002',
    empleado: 'María López Torres',
    dni: '87654321',
    cargo: 'Asistente',
    fechaLiquidacion: '2026-01-20',
    montoTotal: 8300.00,
    estado: 'PENDIENTE'
  }
])

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    'PAGADO': 'success',
    'PENDIENTE': 'warning',
    'EN_PROCESO': 'info'
  }
  return types[status] || 'default'
}

const formatCurrency = (amount: number) => {
  return `S/ ${(amount || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

const columns = [
  {
    title: 'Código',
    key: 'id',
    width: 120
  },
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'empleado-info' }, [
        h('div', { style: 'font-weight: 600;' }, row.empleado),
        h('div', { style: 'font-size: 12px; color: #6b7280;' }, `DNI: ${row.dni}`)
      ])
    }
  },
  {
    title: 'Cargo',
    key: 'cargo'
  },
  {
    title: 'Fecha Liquidación',
    key: 'fechaLiquidacion',
    width: 140
  },
  {
    title: 'Monto Total',
    key: 'montoTotal',
    width: 140,
    render(row: any) {
      return h('strong', { style: 'color: #059669;' }, formatCurrency(row.montoTotal))
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 120,
    render(row: any) {
      return h(NTag, { type: getStatusType(row.estado), size: 'small', round: true }, () => row.estado)
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 180,
    render(row: any) {
      return h('div', { class: 'actions' }, [
        h(NButton, { size: 'small', type: 'info', onClick: () => viewBoleta(row) }, () => 'Ver Boleta'),
        h(NButton, { size: 'small', type: 'primary', onClick: () => downloadPDF(row) }, () => 'PDF')
      ])
    }
  }
]

const viewBoleta = (row: any) => {
  console.log('View boleta:', row)
}

const downloadPDF = (row: any) => {
  console.log('Download PDF:', row)
  message.success('Descargando liquidación...')
}

const exportLiquidaciones = () => {
  message.success('Exportando a Excel...')
}

onMounted(() => {
  // Cargar liquidaciones desde API
})
</script>

<style scoped>
.liquidaciones-list {
  padding: 16px 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h4 {
  font-size: 18px;
  color: #374151;
}

.empleado-info {
  display: flex;
  flex-direction: column;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>