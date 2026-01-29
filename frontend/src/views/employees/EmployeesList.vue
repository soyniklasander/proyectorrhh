<template>
  <div class="contracts-container">
    <n-card title="Gestión de Empleados">
      <template #header-extra>
        <n-space>
          <n-button @click="refreshData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
          </n-button>
          
          <n-button type="primary" @click="$router.push('/empleados/nuevo')">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            Nuevo Empleado
          </n-button>
        </n-space>
      </template>

      <n-space vertical size="large">
        <!-- Filtros -->
        <n-card size="small" title="Filtros">
          <n-form inline :model="filters" label-placement="left">
            <n-form-item label="Buscar">
              <n-input
                v-model:value="filters.search"
                placeholder="Nombre, DNI, puesto..."
                clearable
                @input="debouncedSearch"
              />
            </n-form-item>
            
            <n-form-item label="Estado">
              <n-select
                v-model:value="filters.estado"
                :options="ESTADO_EMPLEADO_OPTIONS"
                placeholder="Todos los estados"
                clearable
                @update:value="loadEmployees"
              />
            </n-form-item>
            
            <n-form-item label="Departamento">
              <n-select
                v-model:value="filters.departamento"
                placeholder="Todos los departamentos"
                clearable
                :options="departmentOptions"
                @update:value="loadEmployees"
              />
            </n-form-item>
            
            <n-form-item>
              <n-button @click="clearFilters">Limpiar</n-button>
            </n-form-item>
          </n-form>
        </n-card>

        <!-- Tabla de empleados -->
        <n-data-table
          :columns="columns"
          :data="employees"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row) => row.id"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import { 
  AddIcon, RefreshIcon, EditIcon, DeleteIcon, EyeIcon 
} from '@vicons/ionicons5'
import { 
  ESTADO_EMPLEADO_OPTIONS
} from '@/types/employee.types'
import type { DataTableColumns } from 'naive-ui'
import type { Employee } from '@/types/employee.types'
import { debounce } from 'lodash-es'
import api from '@/services/api'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

// Reactive data
const loading = ref(false)
const employees = ref<Employee[]>([])
const error = ref('')

const filters = reactive({
  search: '',
  estado: '',
  departamento: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
})

// Mock department options (reemplazar con API real)
const departmentOptions = [
  { label: 'Tecnología', value: 'Tecnología' },
  { label: 'Recursos Humanos', value: 'Recursos Humanos' },
  { label: 'Contabilidad', value: 'Contabilidad' },
  { label: 'Ventas', value: 'Ventas' },
  { label: 'Logística', value: 'Logística' }
]

// Columnas de la tabla
const columns: DataTableColumns<Employee> = [
  {
    title: 'Foto',
    key: 'foto',
    width: 60,
    render(row) {
      return h('div', { class: 'employee-avatar' }, [
        h('img', {
          src: row.foto || '/default-avatar.png',
          alt: row.nombreCompleto,
          class: 'avatar-img',
          onError: (e: Event) => {
            const target = e.target as HTMLImageElement
            target.src = '/default-avatar.png'
          }
        })
      ])
    }
  },
  {
    title: 'Empleado',
    key: 'nombreCompleto',
    width: 200,
    render(row) {
      return h('div', { class: 'employee-info' }, [
        h('div', { class: 'employee-name' }, row.nombreCompleto),
        h('div', { class: 'employee-dni' }, `DNI: ${row.numeroDocumento}`)
      ])
    }
  },
  {
    title: 'Contacto',
    key: 'contacto',
    width: 150,
    render(row) {
      return h('div', { class: 'contact-info' }, [
        h('div', { class: 'contact-item' }, row.email || 'Sin email'),
        h('div', { class: 'contact-item' }, row.telefono || 'Sin teléfono')
      ])
    }
  },
  {
    title: 'Puesto',
    key: 'puesto',
    width: 120,
    render(row) {
      return h('span', row.currentContract?.puesto || 'Sin contrato')
    }
  },
  {
    title: 'Fecha Ingreso',
    key: 'fechaIngreso',
    width: 120,
    render(row) {
      return formatDate(row.fechaIngreso)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 100,
    render(row) {
      const type = getStatusType(row.estado)
      return h('n-tag', {
        type,
        size: 'small'
      }, () => row.estado)
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 120,
    render(row) {
      return h('div', { class: 'action-buttons' }, [
        h('n-button', {
          circle: true,
          size: 'small',
          quaternary: true,
          onClick: () => viewEmployee(row.id)
        }, () => h(EyeIcon)),
        h('n-button', {
          circle: true,
          size: 'small',
          quaternary: true,
          onClick: () => editEmployee(row.id)
        }, () => h(EditIcon)),
        h('n-button', {
          circle: true,
          size: 'small',
          quaternary: true,
          type: 'error',
          onClick: () => confirmDelete(row)
        }, () => h(DeleteIcon))
      ])
    }
  }
]

// Methods
const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-PE')
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

const loadEmployees = async () => {
  loading.value = true
  
  try {
    // Llamada a API real
    const response = await api.get('/employees')
    
    if (response.data.success) {
      employees.value = response.data.data || []
    } else {
      throw new Error(response.data.error || 'Error en la API')
    }
    
    // Aplicar filtros en el cliente
    let filteredEmployees = [...employees.value]
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.nombreCompleto?.toLowerCase().includes(searchTerm) ||
        emp.numeroDocumento?.includes(searchTerm) ||
        (emp.currentContract?.puesto || '').toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.estado) {
      filteredEmployees = filteredEmployees.filter(emp => emp.estado === filters.estado)
    }
    
    if (filters.departamento) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.currentContract?.departamentoTrabajo === filters.departamento
      )
    }
    
    // Actualizar datos paginados
    pagination.itemCount = filteredEmployees.length
    
    // Para paginación, tomar solo los elementos de la página actual
    const startIndex = (pagination.page - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    
    // Actualizar el array de empleados con datos paginados
    employees.value = filteredEmployees.slice(startIndex, endIndex)
    
  } catch (err) {
    message.error('Error al cargar empleados')
    console.error('Load employees error:', err)
    
    // Fallback a datos mock si hay error
    employees.value = []
    pagination.itemCount = 0
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(loadEmployees, 300)

const refreshData = () => {
  loadEmployees()
}

const clearFilters = () => {
  Object.assign(filters, {
    search: '',
    estado: '',
    departamento: ''
  })
  pagination.page = 1
  loadEmployees()
}

const viewEmployee = (id: string) => {
  router.push(`/empleados/${id}`)
}

const editEmployee = (id: string) => {
  router.push(`/empleados/${id}/edit`)
}

const confirmDelete = (employee: Employee) => {
  dialog.warning({
    title: 'Eliminar Empleado',
    content: `¿Estás seguro de que deseas eliminar a ${employee.nombreCompleto}? Esta acción no se puede deshacer.`,
    positiveText: 'Eliminar',
    negativeText: 'Cancelar',
    onPositiveClick: async () => {
      try {
        // TODO: Implementar delete API
        await api.delete(`/employees/${employee.id}`)
        message.success('Empleado eliminado exitosamente')
        loadEmployees()
      } catch (error) {
        message.error('Error al eliminar empleado')
      }
    }
  })
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadEmployees()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadEmployees()
}

// Load initial data
loadEmployees()
</script>

<style scoped>
.contracts-container {
  padding: 0;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.employee-name {
  font-weight: 600;
  color: var(--text-primary);
}

.employee-dni {
  font-size: 12px;
  color: var(--text-secondary);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-item {
  font-size: 12px;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

:deep(.n-data-table-th) {
  font-weight: 600;
}

:deep(.n-data-table-td) {
  vertical-align: middle;
}

/* Responsive */
@media (max-width: 768px) {
  .contact-info {
    display: none;
  }
  
  .employee-info .employee-dni {
    display: none;
  }
}
</style>