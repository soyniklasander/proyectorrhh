<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Gestión de Contratos</h1>
        <p class="subtitle">Administración de vínculos laborales y adendas.</p>
      </div>
      <n-button type="primary" @click="$router.push('/contracts/new')">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        Nuevo Contrato
      </n-button>
    </div>

    <!-- Stats Row -->
    <div class="stats-grid mb-6">
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Total Contratos" :value="contracts.length">
          <template #prefix><n-icon color="#3b82f6"><DocumentTextOutline /></n-icon></template>
        </n-statistic>
      </n-card>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Vigentes" :value="activeCount">
          <template #prefix><n-icon color="#10b981"><CheckmarkCircleOutline /></n-icon></template>
        </n-statistic>
      </n-card>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Por Vencer" :value="expiringCount">
          <template #prefix><n-icon color="#f59e0b"><AlertCircleOutline /></n-icon></template>
        </n-statistic>
      </n-card>
    </div>

    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="contracts"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { NButton, NIcon, NTag, NStatistic, NCard, type DataTableColumns } from 'naive-ui'
import { AddOutline, DocumentTextOutline, CheckmarkCircleOutline, AlertCircleOutline } from '@vicons/ionicons5'
import { api } from '@/services/api'

interface Contract {
  id: string
  nombreCompleto?: string
  cargo: string
  fechaInicio: string
  fechaFin?: string
  salarioBase: number
  estado: string
  [key: string]: any
}

const contracts = ref<Contract[]>([])
const loading = ref(false)
const pagination = { pageSize: 10 }

const activeCount = computed(() => contracts.value.filter(c => c.estado === 'VIGENTE').length)
const expiringCount = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const thirtyDaysFromNow = new Date(now)
  thirtyDaysFromNow.setDate(now.getDate() + 30)

  return contracts.value.filter(c => {
    if (c.estado !== 'VIGENTE' || !c.fechaFin) return false
    const endDate = new Date(c.fechaFin)
    endDate.setHours(0, 0, 0, 0)
    return endDate >= now && endDate <= thirtyDaysFromNow
  }).length
})

const columns: DataTableColumns<Contract> = [
  {
    title: 'Colaborador',
    key: 'nombreCompleto',
    render: (row) => row.nombreCompleto || 'Sin Nombre'
  },
  { title: 'Cargo', key: 'cargo' },
  {
    title: 'Inicio',
    key: 'fechaInicio',
    render: (row) => formatDate(row.fechaInicio)
  },
  {
    title: 'Fin',
    key: 'fechaFin',
    render: (row) => row.fechaFin ? formatDate(row.fechaFin) : 'Indefinido'
  },
  {
    title: 'Salario',
    key: 'salarioBase',
    render: (row) => `S/ ${row.salarioBase}`
  },
  {
    title: 'Estado',
    key: 'estado',
    render: (row) => h(
      NTag,
      { type: row.estado === 'VIGENTE' ? 'success' : 'warning', round: true, bordered: false },
      { default: () => row.estado }
    )
  },
  {
    title: 'Acciones',
    key: 'actions',
    render: (row) => h(
      NButton,
      { size: 'small', secondary: true, onClick: () => console.log('View', row.id) },
      { default: () => 'Ver' }
    )
  }
]

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-PE')
}

const fetchContracts = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/contracts')
    if (data.success) {
      contracts.value = data.data
    }
  } catch (error) {
    console.error('Error fetching contracts:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchContracts)
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
}
.stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.mb-6 {
  margin-bottom: 24px;
}
</style>
