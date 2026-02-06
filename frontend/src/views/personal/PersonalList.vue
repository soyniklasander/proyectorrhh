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

const RefreshIcon = RefreshCw
const PlusIcon = Plus

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
    const response = await api.get('/employees')
    if (response.data.success) {
      employees.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar empleados:', error)
  } finally {
    loading.value = false
  }
}

const editEmployee = (id: string) => {
  console.log('Edit employee:', id)
}

const toggleStatus = async (id: string, currentStatus: string) => {
  console.log('Toggle status:', id, currentStatus)
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
