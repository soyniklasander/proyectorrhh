<template>
  <div class="desvinculacion-module">
    <div class="module-header">
      <h3>Gestión de Desvinculaciones</h3>
      <p>Control de contratos terminados, liquidaciones y procesos de salida</p>
    </div>

    <div class="stats-cards">
      <div class="stat-card expired">
        <div class="stat-value">{{ stats.expired }}</div>
        <div class="stat-label">Contratos Vencidos</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">Por Liquidar</div>
      </div>
      <div class="stat-card processing">
        <div class="stat-value">{{ stats.processing }}</div>
        <div class="stat-label">En Proceso</div>
      </div>
      <div class="stat-card completed">
        <div class="stat-value">{{ stats.completed }}</div>
        <div class="stat-label">Completados</div>
      </div>
    </div>

    <div class="filters-bar">
      <n-input v-model:value="search" placeholder="Buscar empleado..." class="search-input" />
      <n-select v-model:value="filterStatus" :options="statusOptions" placeholder="Estado" />
      <n-date-picker v-model:value="filterDateRange" type="daterange" placeholder="Rango de fechas" />
      <n-button type="primary" @click="loadDesvinculaciones">
        🔄 Actualizar
      </n-button>
    </div>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="pendientes" tab="Pendientes de Revisión">
        <n-data-table
          :columns="columns"
          :data="pendingList"
          :loading="loading"
          :pagination="{ pageSize: 10 }"
        />
      </n-tab-pane>
      <n-tab-pane name="liquidaciones" tab="Liquidaciones">
        <LiquidacionesList />
      </n-tab-pane>
      <n-tab-pane name="documentos" tab="Documentos de Salida">
        <DocumentosSalida />
      </n-tab-pane>
    </n-tabs>

    <!-- Modal de Liquidación -->
    <n-modal v-model:show="showLiquidationModal" preset="card" title="Generar Liquidación" style="width: 700px">
      <LiquidationForm :contract="selectedContract" @saved="onLiquidationSaved" />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NInput, NSelect, NDatePicker, NDataTable, NModal } from 'naive-ui'
import LiquidacionesList from './LiquidacionesList.vue'
import DocumentosSalida from './DocumentosSalida.vue'
import LiquidationForm from './LiquidationForm.vue'

const message = useMessage()
const loading = ref(false)
const search = ref('')
const filterStatus = ref('')
const filterDateRange = ref<[number, number] | null>(null)
const activeTab = ref('pendientes')
const showLiquidationModal = ref(false)
const selectedContract = ref<any>(null)

const desvinculaciones = ref<any[]>([])
const stats = ref({
  expired: 0,
  pending: 3,
  processing: 1,
  completed: 12
})

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'En Proceso', value: 'PROCESO' },
  { label: 'Liquidado', value: 'LIQUIDADO' }
]

const pendingList = computed(() => {
  let data = desvinculaciones.value.filter((d: any) => 
    d.estado === 'VENCIDO' || d.estado === 'POR_TERMINAR'
  )
  
  if (search.value) {
    const s = search.value.toLowerCase()
    data = data.filter((d: any) => 
      d.nombre?.toLowerCase().includes(s) ||
      d.dni?.includes(search.value)
    )
  }
  
  return data
})

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    'PENDIENTE': 'warning',
    'PROCESO': 'info',
    'LIQUIDADO': 'success',
    'VENCIDO': 'error'
  }
  return types[status] || 'default'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-PE')
}

const createColumns = () => [
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', {}, [
        h('div', { style: 'font-weight: 600;' }, row.nombre || ''),
        h('div', { style: 'font-size: 12px; color: #6b7280;' }, `DNI: ${row.dni || ''}`)
      ])
    }
  },
  {
    title: 'Cargo',
    key: 'cargo'
  },
  {
    title: 'Fecha Término',
    key: 'fechaFin',
    width: 130,
    render(row: any) {
      return h('div', { style: row.estado === 'VENCIDO' ? 'color: #ef4444; font-weight: 600;' : '' }, 
        formatDate(row.fechaFin)
      )
    }
  },
  {
    title: 'Motivo',
    key: 'motivo',
    width: 150
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 120,
    render(row: any) {
      return h(NTag, { type: getStatusType(row.estado), size: 'small', round: true }, () => row.estado || '')
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 200,
    render(row: any) {
      return h('div', { class: 'actions' }, [
        h(NButton, { 
          size: 'small', 
          type: 'info',
          onClick: () => viewDetails(row)
        }, () => 'Ver Detalle'),
        h(NButton, { 
          size: 'small', 
          type: 'warning',
          onClick: () => generateLetter(row)
        }, () => 'Carta'),
        h(NButton, { 
          size: 'small', 
          type: 'success',
          onClick: () => openLiquidation(row)
        }, () => 'Liquidar')
      ])
    }
  }
]

const columns = createColumns()

const loadDesvinculaciones = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/contracts?status=VENCIDO,POR_TERMINAR', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      desvinculaciones.value = data.data
    }
  } catch (error) {
    message.error('Error al cargar desvinculaciones')
  } finally {
    loading.value = false
  }
}

const viewDetails = (row: any) => {
  console.log('View details:', row)
}

const generateLetter = (row: any) => {
  console.log('Generate letter:', row)
}

const openLiquidation = (row: any) => {
  selectedContract.value = row
  showLiquidationModal.value = true
}

const onLiquidationSaved = () => {
  showLiquidationModal.value = false
  loadDesvinculaciones()
  message.success('Liquidación generada correctamente')
}

onMounted(() => {
  loadDesvinculaciones()
})
</script>

<style scoped>
.desvinculacion-module {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.module-header {
  text-align: center;
  margin-bottom: 32px;
}

.module-header h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.module-header p {
  color: #6b7280;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-card.expired {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.stat-card.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.stat-card.processing {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.stat-card.completed {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  margin-top: 4px;
}

.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  max-width: 280px;
}

.actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>