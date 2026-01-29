<template>
  <div class="employee-detail-container">
    <n-card v-if="loading" loading style="height: 400px" />
    
    <template v-else-if="employee">
      <!-- Header -->
      <n-card>
        <n-space align="center" justify="space-between">
          <n-space align="center">
            <n-avatar :size="80" :src="employee.foto">
              {{ employee.nombres.charAt(0) }}
            </n-avatar>
            
            <div>
              <h1 class="employee-name">{{ employee.nombreCompleto }}</h1>
              <n-space>
                <n-tag :type="getStatusType(employee.estado)">
                  {{ employee.estado }}
                </n-tag>
                <n-tag v-if="employee.currentContract">
                  {{ employee.currentContract.cargo }}
                </n-tag>
                <n-tag type="info">
                  DNI: {{ employee.numeroDocumento }}
                </n-tag>
              </n-space>
            </div>
          </n-space>
          
          <n-space>
            <n-button @click="$router.go(-1)">
              <template #icon>
                <n-icon><ArrowBackIcon /></n-icon>
              </template>
              Volver
            </n-button>
            
            <n-button @click="editEmployee">
              <template #icon>
                <n-icon><EditIcon /></n-icon>
              </template>
              Editar
            </n-button>
          </n-space>
        </n-space>
      </n-card>

      <!-- Content Tabs -->
      <n-tabs v-model:value="activeTab" type="line" class="detail-tabs">
        <n-tab-pane name="personal" tab="Información Personal">
          <n-grid cols="1 s:2 m:3" responsive="screen" :x-gap="24" :y-gap="16">
            <n-grid-item>
              <n-card title="Datos Personales" size="small">
                <n-descriptions :column="1" size="small">
                  <n-descriptions-item label="Nombre Completo">
                    {{ employee.nombreCompleto }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Tipo Documento">
                    {{ employee.tipoDocumento }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Número Documento">
                    {{ employee.numeroDocumento }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Fecha Nacimiento">
                    {{ formatDate(employee.fechaNacimiento) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Edad">
                    {{ calculateAge(employee.fechaNacimiento) }} años
                  </n-descriptions-item>
                  <n-descriptions-item label="Lugar Nacimiento">
                    {{ employee.lugarNacimiento || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Sexo">
                    {{ employee.sexo === 'M' ? 'Masculino' : employee.sexo === 'F' ? 'Femenino' : 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Estado Civil">
                    {{ employee.estadoCivil || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Nacionalidad">
                    {{ employee.nacionalidad || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Número de Hijos">
                    {{ employee.hijos || 0 }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </n-grid-item>

            <n-grid-item>
              <n-card title="Educación y Profesión" size="small">
                <n-descriptions :column="1" size="small">
                  <n-descriptions-item label="Nivel Educativo">
                    {{ employee.nivelEducativo || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Profesión">
                    {{ employee.profesion || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Licencia Conducir">
                    {{ employee.licenciaConducir || 'No especificado' }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </n-grid-item>

            <n-grid-item>
              <n-card title="Familiares" size="small">
                <n-descriptions :column="1" size="small">
                  <n-descriptions-item label="Nombre Cónyuge">
                    {{ employee.nombreConyuge || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="DNI Cónyuge">
                    {{ employee.dniConyuge || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Nombre Padre">
                    {{ employee.nombrePadre || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Nombre Madre">
                    {{ employee.nombreMadre || 'No especificado' }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </n-grid-item>
          </n-grid>
        </n-tab-pane>

        <n-tab-pane name="contact" tab="Contacto y Ubicación">
          <n-grid cols="1 s:2" responsive="screen" :x-gap="24" :y-gap="16">
            <n-grid-item>
              <n-card title="Información de Contacto" size="small">
                <n-descriptions :column="1" size="small">
                  <n-descriptions-item label="Teléfono">
                    {{ employee.telefono || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Email Personal">
                    {{ employee.email || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Email Corporativo">
                    {{ employee.emailCorporativo || 'No especificado' }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </n-grid-item>

            <n-grid-item>
              <n-card title="Dirección" size="small">
                <n-descriptions :column="1" size="small">
                  <n-descriptions-item label="Dirección">
                    {{ employee.direccion || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Departamento">
                    {{ employee.departamento || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Provincia">
                    {{ employee.provincia || 'No especificado' }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Distrito">
                    {{ employee.distrito || 'No especificado' }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </n-grid-item>
          </n-grid>
        </n-tab-pane>

        <n-tab-pane name="banking" tab="Datos Bancarios">
          <n-card title="Información Bancaria" size="small">
            <n-descriptions :column="1" size="small" v-if="employee.banco || employee.numeroCuenta">
              <n-descriptions-item label="Banco">
                {{ employee.banco || 'No especificado' }}
              </n-descriptions-item>
              <n-descriptions-item label="Tipo de Cuenta">
                {{ employee.tipoCuenta || 'No especificado' }}
              </n-descriptions-item>
              <n-descriptions-item label="Número de Cuenta">
                {{ employee.numeroCuenta || 'No especificado' }}
              </n-descriptions-item>
              <n-descriptions-item label="Código CCI">
                {{ employee.numeroCCI || 'No especificado' }}
              </n-descriptions-item>
            </n-descriptions>
            
            <n-empty v-else description="No hay información bancaria registrada" />
          </n-card>
        </n-tab-pane>

        <n-tab-pane name="contracts" tab="Contratos">
          <n-space vertical size="large">
            <n-card title="Contrato Actual" size="small" v-if="employee.currentContract">
              <n-descriptions :column="2" size="small">
                <n-descriptions-item label="Tipo de Contrato">
                  {{ employee.currentContract.tipoContrato }}
                </n-descriptions-item>
                <n-descriptions-item label="Régimen Laboral">
                  {{ employee.currentContract.regimenLaboral }}
                </n-descriptions-item>
                <n-descriptions-item label="Fecha Inicio">
                  {{ formatDate(employee.currentContract.fechaInicio) }}
                </n-descriptions-item>
                <n-descriptions-item label="Fecha Fin">
                  {{ employee.currentContract.fechaFin ? formatDate(employee.currentContract.fechaFin) : 'Indefinido' }}
                </n-descriptions-item>
                <n-descriptions-item label="Cargo">
                  {{ employee.currentContract.cargo }}
                </n-descriptions-item>
                <n-descriptions-item label="Puesto">
                  {{ employee.currentContract.puesto || 'No especificado' }}
                </n-descriptions-item>
                <n-descriptions-item label="Salario Base">
                  S/. {{ employee.currentContract.salarioBase.toFixed(2) }}
                </n-descriptions-item>
                <n-descriptions-item label="Moneda">
                  {{ employee.currentContract.tipoMoneda }}
                </n-descriptions-item>
                <n-descriptions-item label="Días Trabajo">
                  {{ employee.currentContract.diasTrabajo }} días/semana
                </n-descriptions-item>
                <n-descriptions-item label="Horas Semanales">
                  {{ employee.currentContract.horasSemanales }} horas
                </n-descriptions-item>
                <n-descriptions-item label="AFP/ONP">
                  {{ employee.currentContract.nombreAFP || employee.currentContract.afp }}
                </n-descriptions-item>
                <n-descriptions-item label="CUSPP">
                  {{ employee.currentContract.cuspp || 'No especificado' }}
                </n-descriptions-item>
              </n-descriptions>
            </n-card>
            
            <n-card title="Historial de Contratos" size="small" v-if="employee.contracts && employee.contracts.length > 0">
              <n-data-table
                :columns="contractColumns"
                :data="employee.contracts"
                :pagination="{ pageSize: 10 }"
                size="small"
              />
            </n-card>
            
            <n-empty v-else-if="!employee.currentContract" description="No hay contratos registrados" />
          </n-space>
        </n-tab-pane>

        <n-tab-pane name="payroll" tab="Historial de Nómina">
          <n-card title="Historial de Planillas" size="small">
            <n-empty description="Historial de nómina no disponible temporalmente" />
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </template>
    
    <n-card v-else-if="error">
      <n-result
        status="error"
        title="Error"
        :description="error"
      >
        <template #footer>
          <n-space>
            <n-button @click="loadEmployee">Reintentar</n-button>
            <n-button @click="$router.push('/empleados')">Volver a Empleados</n-button>
          </n-space>
        </template>
      </n-result>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useEmployeeStore } from '@/store/employees'
import { 
  ArrowBackIcon, EditIcon 
} from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import type { Employee, Contract } from '@/types/employee.types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const employeeStore = useEmployeeStore()

const activeTab = ref('personal')

const loading = computed(() => employeeStore.loading)
const error = computed(() => employeeStore.error)
const employee = computed(() => employeeStore.currentEmployee)

const contractColumns: DataTableColumns<Contract> = [
  {
    title: 'Tipo',
    key: 'tipoContrato',
    width: 120
  },
  {
    title: 'Régimen',
    key: 'regimenLaboral',
    width: 100
  },
  {
    title: 'Cargo',
    key: 'cargo'
  },
  {
    title: 'Fecha Inicio',
    key: 'fechaInicio',
    width: 120,
    render(row) {
      return formatDate(row.fechaInicio)
    }
  },
  {
    title: 'Fecha Fin',
    key: 'fechaFin',
    width: 120,
    render(row) {
      return row.fechaFin ? formatDate(row.fechaFin) : 'Indefinido'
    }
  },
  {
    title: 'Salario',
    key: 'salarioBase',
    width: 100,
    render(row) {
      return `S/. ${row.salarioBase.toFixed(2)}`
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 100,
    render(row) {
      const type = getContractStatusType(row.estado)
      return h('n-tag', { type, size: 'small' }, () => row.estado)
    }
  }
]

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const calculateAge = (birthDate: string) => {
  return dayjs().diff(dayjs(birthDate), 'year')
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'ACTIVO': 'success',
    'INACTIVO': 'error',
    'SUSPENDIDO': 'warning',
    'CESADO': 'default'
  }
  return types[status] || 'default'
}

const getContractStatusType = (status: string) => {
  const types: Record<string, any> = {
    'VIGENTE': 'success',
    'SUSPENDIDO': 'warning',
    'FINALIZADO': 'error',
    'RENOVADO': 'info'
  }
  return types[status] || 'default'
}

const editEmployee = () => {
  router.push(`/empleados/${route.params.id}/edit`)
}

const loadEmployee = async () => {
  await employeeStore.fetchEmployee(route.params.id as string)
}

onMounted(() => {
  loadEmployee()
})
</script>

<style scoped>
.employee-detail-container {
  padding: 0;
}

.employee-name {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-tabs {
  margin-top: 16px;
}

:deep(.n-card) {
  border-radius: 12px;
}

:deep(.n-descriptions) {
  margin-top: 8px;
}

:deep(.n-descriptions-item) {
  padding: 4px 0;
}

:deep(.n-descriptions-item-label) {
  font-weight: 500;
  color: var(--text-secondary);
}

:deep(.n-descriptions-item-content) {
  color: var(--text-primary);
}

:deep(.n-data-table-th) {
  font-weight: 600;
  font-size: 12px;
}

:deep(.n-data-table-td) {
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .employee-name {
    font-size: 1.5rem;
  }
  
  :deep(.n-grid) {
    grid-template-columns: 1fr !important;
  }
  
  :deep(.n-descriptions) {
    --n-label-width: 120px;
  }
}
</style>