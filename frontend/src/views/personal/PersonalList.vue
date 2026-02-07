<template>
  <AppleContainer>
    <ApplePageHeader
      title="Gestión de Personal"
      subtitle="Administra los empleados de tu organización"
    >
      <template #actions>
        <AppleButton variant="secondary" :icon="RefreshIcon" @click="loadEmployees">
          Actualizar
        </AppleButton>
        <AppleButton variant="primary" :icon="PlusIcon">
          Nuevo Empleado
        </AppleButton>
      </template>
    </ApplePageHeader>

    <!-- Filtros y Búsqueda -->
    <AppleCard class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <AppleBadge type="info" :label="`${(employees || []).length} empleados`" />
          <AppleBadge type="success" :label="`${activeCount} activos`" />
          <AppleBadge type="warning" :label="`${inactiveCount} inactivos`" />
        </div>
        <div class="filter-right">
          <AppleSearchInput
            v-model="search"
            placeholder="Buscar por nombre, DNI, email..."
            class="search-input"
          />
          <AppleSelect
            v-model="filterStatus"
            placeholder="Todos los estados"
            :options="statusOptions"
            class="filter-select"
            style="width: 160px;"
          />
        </div>
      </div>
    </AppleCard>

    <!-- Tabla de Empleados -->
    <AppleCard>
      <AppleTable
        :columns="columns"
        :data="filteredEmployees"
        :loading="loading"
        :bordered="false"
        :striped="true"
      >
        <template #actions="{ row }">
          <div class="action-buttons">
            <AppleButton variant="ghost" size="small" @click="editEmployee(row.id)">
              Editar
            </AppleButton>
            <AppleButton
              variant="ghost"
              size="small"
              @click="toggleStatus(row.id, row.estado)"
            >
              {{ row.estado === 'ACTIVO' ? 'Inactivar' : 'Activar' }}
            </AppleButton>
          </div>
        </template>
      </AppleTable>
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  AppleContainer,
  ApplePageHeader,
  AppleCard,
  AppleButton,
  AppleBadge,
  AppleSearchInput,
  AppleSelect,
  AppleTable,
  AppleAvatar,
  AppleTag
} from '@/components/apple'
import { api } from '@/services/api'
import { RefreshCw, Plus } from 'lucide-vue-next'

import { useMessage } from 'naive-ui'

const RefreshIcon = RefreshCw
const PlusIcon = Plus
const message = useMessage()

const employees = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const filterStatus = ref<string | null>('todos')

const activeCount = computed(() => employees.value.filter((e: any) => e.estado === 'ACTIVO').length)
const inactiveCount = computed(() => employees.value.filter((e: any) => e.estado === 'INACTIVO').length)

interface StatusOption {
  label: string
  value: string
}

const statusOptions: StatusOption[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Activos', value: 'ACTIVO' },
  { label: 'Inactivos', value: 'INACTIVO' },
  { label: 'Suspendidos', value: 'SUSPENDIDO' }
]

const getStatusType = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'ACTIVO': return 'success'
    case 'INACTIVO': return 'default'
    case 'SUSPENDIDO': return 'warning'
    default: return 'default'
  }
}

const columns = [
  {
    title: 'Foto',
    key: 'avatar',
    width: '70px',
    render(row: any) {
      return h('div', { class: 'avatar-cell' }, [
        h(AppleAvatar, {
          src: row.foto || '',
          size: 'sm',
          name: row.nombreCompleto || ''
        })
      ])
    }
  },
  {
    title: 'Nombre Completo',
    key: 'nombreCompleto',
    render(row: any) {
      return h('div', { class: 'name-cell' }, [
        h('div', { style: 'font-weight: 600; color: var(--text-primary);' }, row.nombreCompleto || ''),
        h('div', { style: 'font-size: 12px; color: var(--text-secondary);' }, row.email || '')
      ])
    }
  },
  {
    title: 'DNI',
    key: 'numeroDocumento',
    width: '120px'
  },
  {
    title: 'Cargo',
    key: 'cargo'
  },
  {
    title: 'Área',
    key: 'areaTrabajo'
  },
  {
    title: 'Régimen',
    key: 'regimenLaboral',
    width: '140px',
    render(row: any) {
      return h(AppleTag, { type: 'primary', label: row.regimenLaboral || '' })
    }
  },
  {
    title: 'Sueldo',
    key: 'salarioBase',
    width: '120px',
    render(row: any) {
      return h('strong', { style: 'color: var(--text-primary);' }, `S/ ${(row.salarioBase || 0).toLocaleString()}`)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: '110px',
    render(row: any) {
      return h(AppleTag, {
        type: getStatusType(row.estado),
        label: row.estado || ''
      })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: '180px',
    render(row: any) {
      return h('div', { class: 'actions-cell' }, [
        h(AppleButton, {
          variant: 'ghost',
          size: 'small',
          onClick: () => editEmployee(row.id)
        }, () => 'Editar'),
        h(AppleButton, {
          variant: 'ghost',
          size: 'small',
          onClick: () => toggleStatus(row.id, row.estado)
        }, () => row.estado === 'ACTIVO' ? 'Inactivar' : 'Activar')
      ])
    }
  }
]

const filteredEmployees = computed(() => {
  let data = employees.value
  
  if (search.value) {
    const s = search.value.toLowerCase()
    data = data.filter((emp: any) => 
      emp.nombreCompleto?.toLowerCase().includes(s) ||
      emp.numeroDocumento?.includes(search.value) ||
      emp.email?.toLowerCase().includes(s)
    )
  }
  
  if (filterStatus.value !== 'todos') {
    data = data.filter((emp: any) => emp.estado === filterStatus.value)
  }
  
  return data
})

const loadEmployees = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employees')
    if (Array.isArray(data)) {
      employees.value = data.map((e: any) => ({
        ...e,
        id: e.id || e.empleadoId,
        nombreCompleto: e.nombreCompleto || `${e.nombre} ${e.apellido}`,
        email: e.email || e.correo,
        numeroDocumento: e.numeroDocumento || e.dni,
        cargo: e.cargo || e.puesto || 'Sin cargo',
        areaTrabajo: e.areaTrabajo || e.area || 'General',
        salarioBase: e.salarioBase || e.sueldo || 0,
        estado: e.estado || e.estadoEmpleado || 'ACTIVO'
      }))
    } else if (data.success && data.data) {
      employees.value = data.data.map((e: any) => ({
        ...e,
        id: e.id || e.empleadoId,
        nombreCompleto: e.nombreCompleto || `${e.nombre} ${e.apellido}`,
        email: e.email || e.correo,
        numeroDocumento: e.numeroDocumento || e.dni,
        cargo: e.cargo || e.puesto || 'Sin cargo',
        areaTrabajo: e.areaTrabajo || e.area || 'General',
        salarioBase: e.salarioBase || e.sueldo || 0,
        estado: e.estado || e.estadoEmpleado || 'ACTIVO'
      }))
    }
  } catch (error: any) {
    console.error('Error al cargar empleados:', error)
    if (error.response?.status === 401) {
      message.error('Sesión expirada. Por favor inicie sesión nuevamente.')
    } else {
      // Datos mock para demostración
      employees.value = getMockEmployees()
      message.warning('Usando datos de demostración')
    }
  } finally {
    loading.value = false
  }
}

const getMockEmployees = () => [
  {
    id: 'EMP-001', nombreCompleto: 'Juan Carlos Pérez García', email: 'juan.perez@rickerp.com.pe',
    numeroDocumento: '47856321', cargo: 'Ingeniero de Software Senior', areaTrabajo: 'Tecnología',
    regimenLaboral: 'GRP - Régimen General', salarioBase: 8500, estado: 'ACTIVO'
  },
  {
    id: 'EMP-002', nombreCompleto: 'María Elena López Mendoza', email: 'maria.lopez@rickerp.com.pe',
    numeroDocumento: '29587416', cargo: 'Gerente de Recursos Humanos', areaTrabajo: 'RRHH',
    regimenLaboral: 'GRP - Régimen General', salarioBase: 12000, estado: 'ACTIVO'
  },
  {
    id: 'EMP-003', nombreCompleto: 'Roberto Carlos Mendoza Silva', email: 'roberto.mendoza@rickerp.com.pe',
    numeroDocumento: '15284739', cargo: 'Supervisor de Obra', areaTrabajo: 'Operaciones',
    regimenLaboral: 'RCL - Construcción Civil', salarioBase: 7200, estado: 'ACTIVO'
  },
  {
    id: 'EMP-004', nombreCompleto: 'Ana Sofía Torres Ruiz', email: 'ana.torres@rickerp.com.pe',
    numeroDocumento: '61829374', cargo: 'Asistente Administrativa', areaTrabajo: 'Administración',
    regimenLaboral: 'RMR - Microempresa', salarioBase: 2500, estado: 'INACTIVO'
  },
  {
    id: 'EMP-005', nombreCompleto: 'Pedro Andrés Fernández Díaz', email: 'pedro.fernandez@rickerp.com.pe',
    numeroDocumento: '38274651', cargo: 'Analista Contable', areaTrabajo: 'Contabilidad',
    regimenLaboral: 'RNP - Régimen Nacional de Pensiones', salarioBase: 4800, estado: 'ACTIVO'
  },
  {
    id: 'EMP-006', nombreCompleto: 'Carmen Rosa Vásquez López', email: 'carmen.vasquez@rickerp.com.pe',
    numeroDocumento: '52938471', cargo: 'Jefa de Marketing Digital', areaTrabajo: 'Marketing',
    regimenLaboral: 'GRP - Régimen General', salarioBase: 9500, estado: 'ACTIVO'
  }
]

const editEmployee = (id: string) => {
  const employee = employees.value.find(e => e.id === id)
  if (employee) {
    message.info(`Editar empleado: ${employee.nombreCompleto}`)
  }
}

const toggleStatus = async (id: string, currentStatus: string) => {
  const employee = employees.value.find(e => e.id === id)
  if (employee) {
    const newStatus = currentStatus === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    try {
      await api.put(`/employees/${id}/status`, { estado: newStatus })
      message.success(`Empleado ${newStatus === 'ACTIVO' ? 'activado' : 'inactivado'} exitosamente`)
      loadEmployees()
    } catch (error: any) {
      console.error('Error toggling status:', error)
      // Simular cambio para demostración
      employee.estado = newStatus
      message.success(`Empleado ${newStatus === 'ACTIVO' ? 'activado' : 'inactivado'} (demo)`)
    }
  }
}

onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.filter-card {
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-left {
  display: flex;
  gap: 12px;
}

.filter-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 280px;
}

.avatar-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.name-cell {
  display: flex;
  flex-direction: column;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
