<template>
  <div class="attendance-list">
    <n-card title="Control de Asistencia">
      <template #header-extra>
        <n-space>
          <n-button @click="refreshData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
          </n-button>
          <n-button type="primary" @click="$router.push('/asistencia/nuevo')">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            Nuevo Registro
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

        <!-- Tabla de asistencia -->
        <n-data-table
          :columns="columns"
          :data="attendanceList"
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
const attendanceList = ref([])
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
const mockAttendance = [
  {
    id: '1',
    nombreCompleto: 'Juan Pérez García',
    numeroDocumento: '12345678',
    fecha: '2024-01-29',
    horaEntrada: '08:05',
    horaSalida: '17:30',
    tipoControl: 'FALTA',
    minutosTardanza: 0,
    minutosFalta: 480,
    estado: 'PENDIENTE'
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
    title: 'Entrada',
    key: 'horaEntrada',
    render(row) {
      return h('span', row.horaEntrada || '--:--')
    }
  },
  {
    title: 'Salida',
    key: 'horaSalida',
    render(row) {
      return h('span', row.horaSalida || '--:--')
    }
  },
  {
    title: 'Tipo',
    key: 'tipoControl',
    render(row) {
      const typeMap = {
        'FALTA': 'error',
        'TARDANZA': 'warning',
        'PERMISO': 'info',
        'VACACION': 'success'
      }
      return h('n-tag', { type: typeMap[row.tipoControl] || 'default', size: 'small' }, () => row.tipoControl)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    render(row) {
      const typeMap = {
        'APROBADO': 'success',
        'PENDIENTE': 'warning',
        'RECHAZADO': 'error'
      }
      return h('n-tag', { type: typeMap[row.estado] || 'default', size: 'small' }, () => row.estado)
    }
  }
]

// Methods
const debouncedSearch = debounce(loadAttendance, 300)

const loadAttendance = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredAttendance = [...mockAttendance]
    
    if (filters.empleado) {
      const searchTerm = filters.empleado.toLowerCase()
      filteredAttendance = filteredAttendance.filter(item =>
        item.nombreCompleto?.toLowerCase().includes(searchTerm) ||
        item.numeroDocumento?.includes(searchTerm)
      )
    }
    
    pagination.itemCount = filteredAttendance.length
    attendanceList.value = filteredAttendance
    
  } catch (error) {
    console.error('Error loading attendance:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadAttendance()
}

const clearFilters = () => {
  filters.empleado = ''
  pagination.page = 1
  loadAttendance()
}

onMounted(() => {
  loadAttendance()
})
</script>

<style scoped>
.attendance-list {
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