<template>
  <div class="dashboard">
    <n-space direction="vertical" size="large">
      <!-- Header con título y acciones -->
      <n-card>
        <n-space justify="space-between" align="center">
          <div>
            <h1 class="dashboard-title">Panel Principal</h1>
            <p class="dashboard-subtitle">
              Bienvenido {{ user?.name || 'Usuario' }}
            </p>
          </div>
          
          <n-space>
            <n-button
              @click="exportPayroll"
              :loading="loading"
              v-if="hasPermission('payroll.export')"
            >
              <template #icon>
                <n-icon><DownloadIcon /></n-icon>
              </template>
              Exportar Nómina
            </n-button>
            
            <n-button type="primary" @click="generatePayroll">
              <template #icon>
                <n-icon><CalculateIcon /></n-icon>
              </template>
              Generar Planilla
            </n-button>
          </n-space>
        </n-space>
      </n-card>

      <!-- Tarjetas de resumen -->
      <n-grid cols="1 s:2 m:4" responsive="screen" :x-gap="16" :y-gap="16">
        <n-grid-item>
          <n-card>
            <n-statistic label="Empleados Activos" :value="stats.activeEmployees">
              <template #prefix>
                <n-icon color="#18a058"><PeopleIcon /></n-icon>
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        
        <n-grid-item>
          <n-card>
            <n-statistic label="Contratos Vigentes" :value="stats.activeContracts">
              <template #prefix>
                <n-icon color="#2080f0"><DocumentIcon /></n-icon>
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        
        <n-grid-item>
          <n-card>
            <n-statistic 
              label="Horas Extras Mes" 
              :value="stats.overtimeHours"
              suffix="hrs"
            >
              <template #prefix>
                <n-icon color="#f0a020"><TimeIcon /></n-icon>
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        
        <n-grid-item>
          <n-card>
            <n-statistic 
              label="Total Nómina Mes" 
              :value="stats.totalPayroll"
              :precision="2"
              prefix="S/"
            >
              <template #prefix>
                <n-icon color="#18a058"><MoneyIcon /></n-icon>
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- Secciones principales -->
      <n-grid cols="1 l:2" responsive="screen" :x-gap="16" :y-gap="16">
        <!-- Empleados Recientes -->
        <n-grid-item>
          <n-card title="Empleados Recientes" size="small">
            <template #header-extra>
              <n-button text @click="$router.push('/empleados')">
                Ver todos
                <template #icon>
                  <n-icon><ArrowRightIcon /></n-icon>
                </template>
              </n-button>
            </template>
            
            <n-list>
              <n-list-item v-for="employee in recentEmployees" :key="employee.id">
                <n-space align="center" justify="space-between">
                  <n-space align="center">
                    <n-avatar :src="employee.foto" round>
                      {{ employee.nombres.charAt(0) }}
                    </n-avatar>
                    <div>
                      <n-text strong>{{ employee.nombreCompleto }}</n-text>
                      <br>
                      <n-text depth="3" style="font-size: 12px">
                        {{ employee.puesto }} • {{ formatDate(employee.fechaIngreso) }}
                      </n-text>
                    </div>
                  </n-space>
                  
                  <n-tag :type="getEmployeeStatusType(employee.estado)" size="small">
                    {{ employee.estado }}
                  </n-tag>
                </n-space>
              </n-list-item>
            </n-list>
          </n-card>
        </n-grid-item>

        <!-- Próximos Cumpleaños -->
        <n-grid-item>
          <n-card title="Próximos Cumpleaños" size="small">
            <n-list>
              <n-list-item v-for="employee in upcomingBirthdays" :key="employee.id">
                <n-space align="center" justify="space-between">
                  <n-space align="center">
                    <n-avatar round>
                      🎂
                    </n-avatar>
                    <div>
                      <n-text strong>{{ employee.nombreCompleto }}</n-text>
                      <br>
                      <n-text depth="3" style="font-size: 12px">
                        {{ formatDate(employee.fechaNacimiento) }}
                      </n-text>
                    </div>
                  </n-space>
                  
                  <n-tag type="warning" size="small">
                    {{ getDaysUntilBirthday(employee.fechaNacimiento) }} días
                  </n-tag>
                </n-space>
              </n-list-item>
            </n-list>
          </n-card>
        </n-grid-item>

        <!-- Contratos por Vencer -->
        <n-grid-item>
          <n-card title="Contratos por Vencer" size="small">
            <template #header-extra>
              <n-button text @click="$router.push('/contratos')">
                Ver todos
                <template #icon>
                  <n-icon><ArrowRightIcon /></n-icon>
                </template>
              </n-button>
            </template>
            
            <n-list>
              <n-list-item v-for="contract in expiringContracts" :key="contract.id">
                <n-space align="center" justify="space-between">
                  <div>
                    <n-text strong>{{ contract.employee?.nombreCompleto }}</n-text>
                    <br>
                    <n-text depth="3" style="font-size: 12px">
                      {{ contract.cargo }} • {{ formatDate(contract.fechaFin) }}
                    </n-text>
                  </div>
                  
                  <n-tag 
                    :type="getContractUrgency(contract.fechaFin)" 
                    size="small"
                  >
                    {{ getDaysUntilExpiry(contract.fechaFin) }} días
                  </n-tag>
                </n-space>
              </n-list-item>
            </n-list>
          </n-card>
        </n-grid-item>

        <!-- Actividad Reciente -->
        <n-grid-item>
          <n-card title="Actividad Reciente" size="small">
            <n-timeline>
              <n-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :type="activity.type"
                :title="activity.title"
                :content="activity.description"
                :time="formatDateTime(activity.timestamp)"
              />
            </n-timeline>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-space>

    <!-- Modal para generar planilla -->
    <n-modal v-model:show="showGenerateModal" preset="dialog" title="Generar Planilla">
      <n-form :model="generateForm" label-placement="left" :label-width="100">
        <n-form-item label="Período">
          <n-date-picker
            v-model:value="generateForm.period"
            type="month"
            format="MM/yyyy"
            style="width: 100%"
          />
        </n-form-item>
        
        <n-form-item label="Empleados">
          <n-checkbox-group v-model:value="generateForm.employeeIds">
            <n-space vertical>
              <n-checkbox 
                v-for="emp in employeeOptions" 
                :key="emp.value"
                :value="emp.value"
                :label="emp.label"
              />
            </n-space>
          </n-checkbox-group>
        </n-form-item>
      </n-form>
      
      <template #action>
        <n-space>
          <n-button @click="showGenerateModal = false">Cancelar</n-button>
          <n-button 
            type="primary" 
            :loading="loading"
            @click="confirmGenerate"
          >
            Generar
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/store/auth'
import { useEmployeeStore } from '@/store/employees'
import { usePayrollStore } from '@/store/payroll'
import { 
  PeopleIcon, DocumentIcon, TimeIcon, MoneyIcon, 
  DownloadIcon, CalculateIcon, ArrowRightIcon 
} from '@vicons/ionicons5'
import type { Employee, Contract } from '@/types/employee.types'
import type { Payroll } from '@/types/payroll.types'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const employeeStore = useEmployeeStore()
const payrollStore = usePayrollStore()

// Reactive data
const loading = ref(false)
const showGenerateModal = ref(false)
const recentEmployees = ref<Employee[]>([])
const expiringContracts = ref<Contract[]>([])
const upcomingBirthdays = ref<Employee[]>([])
const recentActivities = ref<any[]>([])

const generateForm = reactive({
  period: dayjs().format('YYYY-MM'),
  employeeIds: [] as string[]
})

// Computed
const user = computed(() => authStore.user)
const employeeOptions = computed(() => 
  recentEmployees.value.map(emp => ({
    label: emp.nombreCompleto,
    value: emp.id
  }))
)

const stats = reactive({
  activeEmployees: 0,
  activeContracts: 0,
  overtimeHours: 0,
  totalPayroll: 0
})

// Methods
const hasPermission = (permission: string) => {
  // TODO: Implementar verificación de permisos
  return true
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const getEmployeeStatusType = (status: string) => {
  const types: Record<string, any> = {
    'ACTIVO': 'success',
    'INACTIVO': 'error',
    'SUSPENDIDO': 'warning',
    'CESADO': 'default'
  }
  return types[status] || 'default'
}

const getDaysUntilBirthday = (birthDate: string) => {
  const today = dayjs()
  const birthday = dayjs(birthDate).year(today.year())
  
  if (birthday.isBefore(today)) {
    birthday.add(1, 'year')
  }
  
  return birthday.diff(today, 'day')
}

const getDaysUntilExpiry = (endDate: string) => {
  const today = dayjs()
  const expiry = dayjs(endDate)
  return expiry.diff(today, 'day')
}

const getContractUrgency = (endDate: string) => {
  const days = getDaysUntilExpiry(endDate)
  if (days <= 7) return 'error'
  if (days <= 30) return 'warning'
  return 'default'
}

const generatePayroll = () => {
  showGenerateModal.value = true
}

const confirmGenerate = async () => {
  loading.value = true
  
  try {
    await payrollStore.generatePayroll(
      generateForm.period,
      generateForm.employeeIds.length ? generateForm.employeeIds : undefined
    )
    
    message.success('Planilla generada exitosamente')
    showGenerateModal.value = false
  } catch (error) {
    message.error('Error al generar planilla')
  } finally {
    loading.value = false
  }
}

const exportPayroll = async () => {
  loading.value = true
  
  try {
    await payrollStore.exportPayrollExcel(dayjs().format('YYYY-MM'))
    message.success('Archivo exportado exitosamente')
  } catch (error) {
    message.error('Error al exportar archivo')
  } finally {
    loading.value = false
  }
}

const loadDashboardData = async () => {
  loading.value = true
  
  try {
    // Cargar datos de ejemplo (implementar con APIs reales)
    stats.activeEmployees = 45
    stats.activeContracts = 42
    stats.overtimeHours = 127
    stats.totalPayroll = 125450.50
    
    // Datos de ejemplo para empleados recientes
    recentEmployees.value = [
      {
        id: '1',
        nombreCompleto: 'Juan Pérez García',
        puesto: 'Desarrollador Senior',
        fechaIngreso: '2024-01-15',
        estado: 'ACTIVO',
        foto: ''
      } as any
    ]
    
    // Datos de ejemplo para contratos por vencer
    expiringContracts.value = [
      {
        id: '1',
        employee: { nombreCompleto: 'María López Martínez' },
        cargo: 'Diseñadora UX',
        fechaFin: '2024-02-28'
      } as any
    ]
    
    // Datos de ejemplo para cumpleaños
    upcomingBirthdays.value = [
      {
        id: '1',
        nombreCompleto: 'Carlos Rodríguez Sánchez',
        fechaNacimiento: '1990-02-05'
      } as any
    ]
    
    // Datos de ejemplo para actividad
    recentActivities.value = [
      {
        id: '1',
        type: 'success',
        title: 'Nuevo empleado',
        description: 'Juan Pérez se unió al equipo',
        timestamp: new Date().toISOString()
      }
    ]
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.dashboard-subtitle {
  margin: 0;
  color: var(--text-secondary);
}

:deep(.n-card) {
  border-radius: 12px;
}

:deep(.n-statistic .n-statistic__label) {
  color: var(--text-secondary);
  font-weight: 500;
}

:deep(.n-statistic .n-statistic__value) {
  font-weight: 700;
}

:deep(.n-list-item) {
  padding: 12px 0;
}

:deep(.n-timeline-item) {
  padding-bottom: 16px;
}
</style>