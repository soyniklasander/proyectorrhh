<template>
  <div class="overtime-list">
    <n-card title="Gestión de Horas Extras">
      <template #header-extra>
        <n-space>
          <n-button @click="refreshData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
          </n-button>
          <n-button type="primary" @click="$router.push('/horas-extras/nuevo')">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            Nueva Hora Extra
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

        <!-- Tabla de horas extras -->
        <n-data-table
          :columns="columns"
          :data="overtimeList"
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
const overtimeList = ref([])
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
const mockOvertime = [
  {
    id: '1',
    nombreCompleto: 'Juan Pérez García',
    numeroDocumento: '12345678',
    fecha: '2024-01-20',
    totalHoras: 8,
    tipoHora: 'HORA_25',
    montoCalculado: 400,
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
    title: 'Fecha',
    key: 'fecha'
  },
  {
    title: 'Horas',
    key: 'totalHoras',
    render(row) {
      return h('span', `${row.totalHoras} hrs`)
    }
  },
  {
    title: 'Tipo',
    key: 'tipoHora',
    render(row) {
      const typeMap = {
        'HORA_25': '25%',
        'HORA_35': '35%',
        'HORA_100': '100%'
      }
      return h('n-tag', { size: 'small' }, () => typeMap[row.tipoHora] || row.tipoHora)
    }
  },
  {
    title: 'Monto',
    key: 'montoCalculado',
    render(row) {
      return h('span', `S/. ${row.montoCalculado.toFixed(2)}`)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    render(row) {
      const typeMap = {
        'APROBADO': 'success',
        'SOLICITADO': 'warning',
        'RECHAZADO': 'error'
      }
      return h('n-tag', { type: typeMap[row.estado] || 'default', size: 'small' }, () => row.estado)
    }
  }
]

// Methods
const debouncedSearch = debounce(loadOvertime, 300)

const loadOvertime = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredOvertime = [...mockOvertime]
    
    if (filters.empleado) {
      const searchTerm = filters.empleado.toLowerCase()
      filteredOvertime = filteredOvertime.filter(item =>
        item.nombreCompleto?.toLowerCase().includes(searchTerm) ||
        item.numeroDocumento?.includes(searchTerm)
      )
    }
    
    pagination.itemCount = filteredOvertime.length
    overtimeList.value = filteredOvertime
    
  } catch (error) {
    console.error('Error loading overtime:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadOvertime()
}

const clearFilters = () => {
  filters.empleado = ''
  pagination.page = 1
  loadOvertime()
}

onMounted(() => {
  loadOvertime()
})
</script>

<style scoped>
.overtime-list {
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