<template>
  <AppleContainer>
    <!-- Header Apple -->
    <ApplePageHeader
      title="Dashboard"
      subtitle="Panel de control general y métricas clave"
    >
      <template #actions>
        <AppleButton variant="secondary" :icon="Calendar">
          {{ currentMonth }}
        </AppleButton>
        <AppleButton :icon="Plus">
          Nuevo Registro
        </AppleButton>
      </template>
    </ApplePageHeader>

    <!-- Stats Grid con AppleStatCard -->
    <AppleSection v-if="loading" title="Cargando estadísticas...">
      <AppleGrid :columns="4">
        <AppleSkeleton v-for="i in 4" :key="i" variant="card" />
      </AppleGrid>
    </AppleSection>

    <AppleSection v-else title="Indicadores Principales">
      <AppleGrid :columns="4">
        <AppleStatCard
          :icon="Users"
          :value="stats.totalEmployees"
          label="Total Empleados"
          color="blue"
          :clickable="true"
          @click="$router.push('/employees')"
        />
        <AppleStatCard
          :icon="FileText"
          :value="stats.activeContracts"
          label="Contratos Activos"
          color="green"
        />
        <AppleStatCard
          :icon="Wallet"
          :value="stats.monthlyPayroll"
          label="Nómina Mensual"
          color="orange"
          format="currency"
        />
        <AppleStatCard
          :icon="Clock"
          :value="stats.pendingOvertime"
          label="Horas Extras Pend."
          color="red"
        />
      </AppleGrid>
    </AppleSection>

    <!-- Content Grid -->
    <AppleGrid :columns="3" gap="lg">
      <!-- Main Table -->
      <div style="grid-column: span 2;">
        <AppleCard title="Últimos Ingresos" hover-lift>
          <template #header-extra>
            <AppleButton variant="ghost" @click="$router.push('/employees')">
              Ver Todos
            </AppleButton>
          </template>
          
          <AppleTable
            :columns="columns"
            :data="recentEmployees"
            :loading="loading"
            :bordered="false"
          />
        </AppleCard>
      </div>

      <!-- Side Actions -->
      <div>
        <AppleCard title="Acciones Rápidas" padded>
          <div class="quick-actions">
            <AppleButton 
              variant="primary" 
              block 
              :icon="UserPlus"
              @click="$router.push('/contracts/new')"
            >
              Nuevo Ingreso
            </AppleButton>

            <AppleButton 
              variant="secondary" 
              block 
              :icon="FileText"
              @click="$router.push('/contracts')"
            >
              Gestionar Contratos
            </AppleButton>

            <AppleButton 
              variant="secondary" 
              block 
              :icon="Wallet"
              @click="$router.push('/payroll')"
            >
              Generar Planilla
            </AppleButton>

            <AppleButton 
              variant="secondary" 
              block 
              :icon="Clock"
              @click="$router.push('/time')"
            >
              Registrar Horas
            </AppleButton>
          </div>
        </AppleCard>

        <AppleCard style="margin-top: 20px;">
          <AppleCardHeader title="Estado del Sistema" :icon="Activity" />
          <AppleTimeline
            :items="systemStatus"
            :current="0"
          />
        </AppleCard>
      </div>
    </AppleGrid>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { h } from 'vue'
import {
  Users,
  FileText,
  Wallet,
  Clock,
  Calendar,
  Plus,
  UserPlus,
  Activity,
  CheckCircle,
  RefreshCw
} from 'lucide-vue-next'

import {
  AppleContainer,
  ApplePageHeader,
  AppleSection,
  AppleGrid,
  AppleStatCard,
  AppleCard,
  AppleCardHeader,
  AppleButton,
  AppleTable,
  AppleSkeleton,
  AppleTimeline,
  AppleBadge
} from '@/components/apple'

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

const currentMonth = computed(() => {
  return dayjs().format('MMMM YYYY')
})

const systemStatus = ref([
  {
    title: 'Sistema Operativo',
    description: 'Todos los servicios funcionando correctamente',
    time: 'Ahora',
    completed: true,
    icon: CheckCircle
  },
  {
    title: 'Última Sincronización',
    description: 'Datos actualizados correctamente',
    time: dayjs().format('HH:mm'),
    completed: true,
    icon: RefreshCw
  }
])

const columns = [
  { title: 'Nombre', key: 'nombreCompleto' },
  { title: 'DNI', key: 'numeroDocumento' },
  {
    title: 'Ingreso',
    key: 'fechaIngreso',
    render: (row: EmployeeSummary) => dayjs(row.fechaIngreso).format('DD/MM/YYYY')
  },
  {
    title: 'Estado',
    key: 'estado',
    render: (row: EmployeeSummary) => h(AppleBadge, {
      type: row.estado === 'ACTIVO' ? 'success' : 'neutral',
      label: row.estado
    })
  }
]

const fetchDashboardData = async () => {
  try {
    const { data } = await api.get('/dashboard/summary')
    if (data.success) {
      stats.value = {
        totalEmployees: data.data.stats?.totalEmployees || 0,
        activeContracts: data.data.stats?.activeContracts || 0,
        monthlyPayroll: data.data.stats?.monthlyPayroll || 0,
        pendingOvertime: data.data.stats?.pendingOvertime || 0
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
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
