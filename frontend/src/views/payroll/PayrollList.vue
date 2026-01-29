<template>
  <div class="payroll-list">
    <n-card title="Gestión de Planilla">
      <template #header-extra>
        <n-space>
          <n-button @click="refreshData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
          </n-button>
          <n-button type="primary" @click="exportPayroll">
            <template #icon>
              <n-icon><DownloadIcon /></n-icon>
            </template>
            Exportar Nómina
          </n-button>
        </n-space>
      </template>

      <n-space vertical size="large">
        <!-- Filtros -->
        <n-card size="small" title="Filtros">
          <n-form inline :model="filters" label-placement="left">
            <n-form-item label="Período">
              <n-date-picker
                v-model:value="filters.period"
                type="month"
                format="MM/yyyy"
                clearable
                @update:value="loadPayroll"
              />
            </n-form-item>
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

        <!-- Tabla de nómina -->
        <n-data-table
          :columns="columns"
          :data="payrollList"
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
  RefreshIcon, DownloadIcon, EditIcon, EyeIcon 
} from '@vicons/ionicons5'
import { debounce } from 'lodash-es'

// Reactive data
const loading = ref(false)
const payrollList = ref([])
const error = ref('')

const filters = reactive({
  period: '',
  empleado: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
})

// Mock data para desarrollo
const mockData = [
  {
    id: '1',
    empleadoId: '1',
    nombreCompleto: 'Juan Pérez García',
    numeroDocumento: '12345678',
    puesto: 'Desarrollador Senior',
    periodo: '2024-01',
    salarioBase: 5000,
    totalIngresos: 5200,
    totalDescuentos: 1200,
    netoPagar: 4000,
    estado: 'PROCESADO'
  },
  {
    id: '2',
    empleadoId: '2', 
    nombreCompleto: 'María López Martínez',
    numeroDocumento: '87654321',
    puesto: 'Diseñadora UX',
    periodo: '2024-01',
    salarioBase: 4500,
    totalIngresos: 4650,
    totalDescuentos: 1100,
    netoPagar: 3550,
    estado: 'BORRADOR'
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
    title: 'Puesto',
    key: 'puesto'
  },
  {
    title: 'Período',
    key: 'periodo'
  },
  {
    title: 'Salario Base',
    key: 'salarioBase',
    render(row) {
      return h('span', `S/. ${row.salarioBase.toFixed(2)}`)
    }
  },
  {
    title: 'Total Ingresos',
    key: 'totalIngresos',
    render(row) {
      return h('span', `S/. ${row.totalIngresos.toFixed(2)}`)
    }
  },
  {
    title: 'Total Descuentos',
    key: 'totalDescuentos',
    render(row) {
      return h('span', `S/. ${row.totalDescuentos.toFixed(2)}`)
    }
  },
  {
    title: 'Neto Pagar',
    key: 'netoPagar',
    render(row) {
      return h('span', { class: 'neto-pagar' }, `S/. ${row.netoPagar.toFixed(2)}`)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    render(row) {
      const type = row.estado === 'PROCESADO' ? 'success' : 'warning'
      return h('n-tag', { type, size: 'small' }, () => row.estado)
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    render(row) {
      return h('div', { class: 'action-buttons' }, [
        h('n-button', {
          circle: true,
          size: 'small',
          quaternary: true,
          onClick: () => viewPayroll(row.id)
        }, () => h(EyeIcon)),
        h('n-button', {
          circle: true,
          size: 'small',
          quaternary: true,
          onClick: () => editPayroll(row.id)
        }, () => h(EditIcon))
      ])
    }
  }
]

// Methods
const debouncedSearch = debounce(loadPayroll, 300)

const loadPayroll = async () => {
  loading.value = true
  
  try {
    // TODO: Implementar llamada a API real
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Filtrado local mock
    let filteredData = [...mockData]
    
    if (filters.empleado) {
      const searchTerm = filters.empleado.toLowerCase()
      filteredData = filteredData.filter(item =>
        item.nombreCompleto?.toLowerCase().includes(searchTerm) ||
        item.numeroDocumento?.includes(searchTerm)
      )
    }
    
    if (filters.period) {
      filteredData = filteredData.filter(item => item.periodo === filters.period)
    }
    
    pagination.itemCount = filteredData.length
    payrollList.value = filteredData
    
  } catch (error) {
    console.error('Error loading payroll:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadPayroll()
}

const clearFilters = () => {
  Object.assign(filters, {
    period: '',
    empleado: ''
  })
  pagination.page = 1
  loadPayroll()
}

const exportPayroll = () => {
  // TODO: Implementar exportación
  console.log('Exporting payroll...')
}

const viewPayroll = (id: string) => {
  console.log('View payroll:', id)
}

const editPayroll = (id: string) => {
  console.log('Edit payroll:', id)
}

onMounted(() => {
  loadPayroll()
})
</script>

<style scoped>
.payroll-list {
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

.neto-pagar {
  font-weight: 700;
  color: var(--success-color);
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}
</style>