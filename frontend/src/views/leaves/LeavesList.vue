<template>
  <div class="leaves-list">
    <n-card title="Gestión de Vacaciones y Permisos">
      <template #header-extra>
        <n-space>
          <n-button @click="refreshData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
          </n-button>
          <n-button type="primary" @click="$router.push('/vacaciones/nuevo')">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            Nuevo Permiso
          </n-button>
        </n-space>
      </template>

      <n-space vertical size="large">
        <!-- Filtros -->
        <n-card size="small" title="Filtros">
          <n-form inline :model="filters" label-placement="left">
            <n-form-item label="Empleado">
              <n-input
                v-model:value="filters.empleado"
                placeholder="Nombre o DNI"
                clearable
                @input="debouncedSearch"
              />
            </n-form-item>
            <n-form-item>
              <n-button @click="clearFilters">Limpiar</n-button>
            </n-form-item>
          </n-form>
        </n-card>

        <!-- Tabla de vacaciones -->
        <n-data-table
          :columns="columns"
          :data="leavesList"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row) => row.id"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  AddIcon, RefreshIcon, EditIcon, DeleteIcon, EyeIcon 
} from '@vicons/ionicons5'
import { debounce } from 'lodash-es'

// Reactive data
const loading = ref(false)
const leavesList = ref([])
const error = ref('')

const filters = reactive({
  empleado: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
})

// Mock data
const mockLeaves = [
  {
    id: '1',
    nombreCompleto: 'Juan Pérez García',
    numeroDocumento: '12345678',
    tipoPermiso: 'VACACION_PROGRAMADA',
    fechaInicio: '2024-02-01',
    fechaFin: '2024-02-15',
    cantidadDias: 15,
    estado: 'APROBADO'
  }
]

// Columnas
const columns = [
  {
    title: 'Empleado',
    key: 'nombreCompleto',
    render(row) {
      return h('div', { class: 'employee-info' }, [
        h('div', { class: 'employee-name' }, row.nombreCompleto),
        h('div', { class: 'employee-dni' }, `DNI: ${row.numeroDocumento}`)
      ])
    }
  },
  {
    title: 'Tipo',
    key: 'tipoPermiso',
    render(row) {
      const typeMap = {
        'VACACION_PROGRAMADA': 'Vacación',
        'ENFERMEDAD': 'Enfermedad',
        'PERMISO_PERSONAL': 'Personal'
      }
      return h('n-tag', { size: 'small' }, () => typeMap[row.tipoPermiso] || row.tipoPermiso)
    }
  },
  {
    title: 'Período',
    key: 'periodo',
    render(row) {
      return h('span', `${row.fechaInicio} - ${row.fechaFin}`)
    }
  },
  {
    title: 'Días',
    key: 'cantidadDias',
    render(row) {
      return h('span', `${row.cantidadDias} días`)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    render(row) {
      const typeMap = {
        'APROBADO': 'success',
        'SOLICITADO': 'warning',
        'RECHAZADO': 'error',
        'DISFRUTADO': 'info'
      }
      return h('n-tag', { type: typeMap[row.estado] || 'default', size: 'small' }, () => row.estado)
    }
  }
]

// Methods
const debouncedSearch = debounce(loadLeaves, 300)

const loadLeaves = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredLeaves = [...mockLeaves]
    
    if (filters.empleado) {
      const searchTerm = filters.empleado.toLowerCase()
      filteredLeaves = filteredLeaves.filter(item =>
        item.nombreCompleto?.toLowerCase().includes(searchTerm) ||
        item.numeroDocumento?.includes(searchTerm)
      )
    }
    
    pagination.itemCount = filteredLeaves.length
    leavesList.value = filteredLeaves
    
  } catch (error) {
    console.error('Error loading leaves:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadLeaves()
}

const clearFilters = () => {
  filters.empleado = ''
  pagination.page = 1
  loadLeaves()
}

onMounted(() => {
  loadLeaves()
})
</script>

<style scoped>
.leaves-list {
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
</style>