<template>
  <div class="page-container">
    <div class="welcome-section">
      <h1 class="page-title">Bienvenido a RickERP</h1>
      <p class="subtitle">Panel de control general y métricas clave.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="stats-grid">
      <n-card v-for="i in 4" :key="i" :bordered="false" class="stat-skeleton">
        <n-skeleton text style="width: 60%" />
        <n-skeleton text style="width: 40%; margin-top: 12px" />
      </n-card>
    </div>

    <!-- Real Stats -->
    <div v-else class="stats-grid">
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Total Empleados" :value="stats.totalEmployees">
          <template #prefix>
            <n-icon color="#3b82f6"><PeopleOutline /></n-icon>
          </template>
        </n-statistic>
      </n-card>

      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Contratos Activos" :value="stats.activeContracts">
          <template #prefix>
            <n-icon color="#10b981"><DocumentTextOutline /></n-icon>
          </template>
        </n-statistic>
      </n-card>

      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Nómina Estimada" :value="stats.monthlyPayroll">
          <template #prefix>
            <n-icon color="#f59e0b"><WalletOutline /></n-icon>
          </template>
          <template #suffix>S/</template>
        </n-statistic>
      </n-card>

      <n-card class="stat-card" :bordered="false">
        <n-statistic label="Horas Extras (Pend)" :value="stats.pendingOvertime">
          <template #prefix>
            <n-icon color="#ef4444"><TimeOutline /></n-icon>
          </template>
        </n-statistic>
      </n-card>
    </div>

    <div class="dashboard-content">
      <div class="main-column">
        <n-card title="Últimos Ingresos" :bordered="false" class="table-card">
          <template #header-extra>
            <n-button text type="primary" @click="$router.push('/employees')">
              Ver Todos
            </n-button>
          </template>
          <n-data-table
            :columns="columns"
            :data="recentEmployees"
            :loading="loading"
            :bordered="false"
            size="small"
          />
        </n-card>
      </div>

      <div class="side-column">
        <n-card title="Acciones Rápidas" :bordered="false" class="actions-card">
          <div class="quick-actions">
            <n-button type="primary" block dashed class="action-btn" @click="$router.push('/contracts/new')">
              <template #icon><n-icon><PersonAddOutline /></n-icon></template>
              Nuevo Ingreso
            </n-button>

            <n-button type="info" block dashed class="action-btn" @click="$router.push('/contracts')">
              <template #icon><n-icon><DocumentTextOutline /></n-icon></template>
              Gestionar Contratos
            </n-button>

            <n-button type="warning" block dashed class="action-btn" @click="$router.push('/payroll')">
              <template #icon><n-icon><CashOutline /></n-icon></template>
              Generar Planilla
            </n-button>

            <n-button type="error" block dashed class="action-btn" @click="$router.push('/overtime')">
              <template #icon><n-icon><TimeOutline /></n-icon></template>
              Reg. Horas Extras
            </n-button>
          </div>
        </n-card>

        <n-card title="Estado del Sistema" :bordered="false" style="margin-top: 20px">
           <n-timeline>
             <n-timeline-item type="success" title="Sistema Operativo" time="Ahora" />
             <n-timeline-item type="info" title="Última Sincronización" :time="lastSync" />
           </n-timeline>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
  NCard, NStatistic, NIcon, NSkeleton, NDataTable, NButton, NTag, NTimeline, NTimelineItem,
  type DataTableColumns
} from 'naive-ui'
import {
  PeopleOutline, DocumentTextOutline, WalletOutline, TimeOutline,
  PersonAddOutline, CashOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'
import dayjs from 'dayjs'

interface DashboardStats {
  totalEmployees: number
  activeContracts: number
  monthlyPayroll: number
  pendingOvertime: number
}

interface EmployeeSummary {
  id: string
  nombreCompleto: string
  numeroDocumento: string
  fechaIngreso: string
  estado: string
}

const loading = ref(true)
const stats = ref<DashboardStats>({
  totalEmployees: 0,
  activeContracts: 0,
  monthlyPayroll: 0,
  pendingOvertime: 0
})
const recentEmployees = ref<EmployeeSummary[]>([])
const lastSync = ref(dayjs().format('HH:mm'))

const columns: DataTableColumns<EmployeeSummary> = [
  { title: 'Nombre', key: 'nombreCompleto' },
  { title: 'DNI', key: 'numeroDocumento' },
  {
    title: 'Ingreso',
    key: 'fechaIngreso',
    render: (row) => dayjs(row.fechaIngreso).format('DD/MM/YYYY')
  },
  {
    title: 'Estado',
    key: 'estado',
    render: (row) => h(
      NTag,
      { type: row.estado === 'ACTIVO' ? 'success' : 'default', size: 'small', round: true, bordered: false },
      { default: () => row.estado }
    )
  }
]

const fetchDashboardData = async () => {
  try {
    const { data } = await api.get('/dashboard/summary')
    if (data.success) {
      stats.value = data.data.stats || {
         totalEmployees: data.data.totalEmployees || 0,
         activeContracts: data.data.activeContracts || 0,
         monthlyPayroll: data.data.monthlyPayroll || 0, // Backend might not send this yet, fallback needed?
         pendingOvertime: 0
      }
      recentEmployees.value = data.data.recentEmployees || []
    }
  } catch (error) {
    console.error('Failed to load dashboard data', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}
.welcome-section {
  margin-bottom: 24px;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.subtitle {
  color: #6b7280;
  margin-top: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.actions-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  justify-content: flex-start;
  height: 48px;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
