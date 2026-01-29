<template>
  <div class="loans-list">
    <n-card title="Gestión de Préstamos">
      <template #header-extra>
        <n-space>
          <n-button @click="refreshData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
          </n-button>
          <n-button type="primary" @click="$router.push('/prestamos/nuevo')">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            Nuevo Préstamo
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

        <!-- Tabla de préstamos -->
        <n-data-table
          :columns="columns"
          :data="loansList"
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
const loansList = ref([])
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
const mockLoans = [
  {
    id: '1',
    nombreCompleto: 'Juan Pérez García',
    numeroDocumento: '12345678',
    tipoPrestamo: 'LIQUIDACION',
    montoAprobado: 5000,
    cuotaMensual: 500,
    cantidadCuotas: 12,
    cuotasPagadas: 3,
    saldoPendiente: 3500,
    estado: 'ACTIVO',
    fechaOtorgamiento: '2024-01-15'
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
    key: 'tipoPrestamo'
  },
  {
    title: 'Monto',
    key: 'montoAprobado',
    render(row) {
      return h('span', `S/. ${row.montoAprobado.toFixed(2)}`)
    }
  },
  {
    title: 'Cuota',
    key: 'cuotaMensual',
    render(row) {
      return h('span', `S/. ${row.cuotaMensual.toFixed(2)}`)
    }
  },
  {
    title: 'Saldo',
    key: 'saldoPendiente',
    render(row) {
      return h('span', `S/. ${row.saldoPendiente.toFixed(2)}`)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    render(row) {
      const type = row.estado === 'ACTIVO' ? 'success' : 'default'
      return h('n-tag', { type, size: 'small' }, () => row.estado)
    }
  }
]

// Methods
const debouncedSearch = debounce(loadLoans, 300)

const loadLoans = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filteredLoans = [...mockLoans]
    
    if (filters.empleado) {
      const searchTerm = filters.empleado.toLowerCase()
      filteredLoans = filteredLoans.filter(loan =>
        loan.nombreCompleto?.toLowerCase().includes(searchTerm) ||
        loan.numeroDocumento?.includes(searchTerm)
      )
    }
    
    pagination.itemCount = filteredLoans.length
    loansList.value = filteredLoans
    
  } catch (error) {
    console.error('Error loading loans:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadLoans()
}

const clearFilters = () => {
  filters.empleado = ''
  pagination.page = 1
  loadLoans()
}

onMounted(() => {
  loadLoans()
})
</script>

<style scoped>
.loans-list {
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