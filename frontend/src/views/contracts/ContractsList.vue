<template>
  <div class="contracts-container">
    <n-card title="Gestión de Contratos">
      <template #header-extra>
        <n-space>
          <n-button @click="refreshData" :loading="loading">
            <template #icon>
              <n-icon><RefreshIcon /></n-icon>
            </template>
          </n-button>
          
          <n-button type="primary" @click="showNewContractModal = true">
            <template #icon>
              <n-icon><AddIcon /></n-icon>
            </template>
            Nuevo Contrato
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
                placeholder="Buscar por nombre o DNI"
                clearable
                @input="debouncedSearch"
              />
            </n-form-item>
            
            <n-form-item label="Tipo Contrato">
              <n-select
                v-model:value="filters.tipoContrato"
                :options="TIPO_CONTRATO_OPTIONS"
                placeholder="Todos los tipos"
                clearable
                @update:value="loadContracts"
              />
            </n-form-item>
            
            <n-form-item label="Régimen">
              <n-select
                v-model:value="filters.regimenLaboral"
                :options="REGIMEN_LABORAL_OPTIONS"
                placeholder="Todos los regímenes"
                clearable
                @update:value="loadContracts"
              />
            </n-form-item>
            
            <n-form-item label="Estado">
              <n-select
                v-model:value="filters.estado"
                :options="CONTRATO_ESTADOS"
                placeholder="Todos los estados"
                clearable
                @update:value="loadContracts"
              />
            </n-form-item>
            
            <n-form-item>
              <n-button @click="clearFilters">Limpiar</n-button>
            </n-form-item>
          </n-form>
        </n-card>

        <!-- Tabla de contratos -->
        <n-data-table
          :columns="columns"
          :data="contracts"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row) => row.id"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-space>
    </n-card>

    <!-- Modal Nuevo Contrato -->
    <n-modal
      v-model:show="showNewContractModal"
      preset="dialog"
      title="Nuevo Contrato"
      style="width: 800px; max-height: 90vh; overflow-y: auto;"
    >
      <contract-form
        v-if="showNewContractModal"
        @submit="handleCreateContract"
        @cancel="showNewContractModal = false"
      />
    </n-modal>

    <!-- Modal Editar Contrato -->
    <n-modal
      v-model:show="showEditModal"
      preset="dialog"
      title="Editar Contrato"
      style="width: 800px; max-height: 90vh; overflow-y: auto;"
    >
      <contract-form
        v-if="showEditModal && editingContract"
        :contract="editingContract"
        :is-editing="true"
        @submit="handleUpdateContract"
        @cancel="showEditModal = false"
      />
    </n-modal>
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
  TIPO_CONTRATO, REGIMEN_LABORAL, CONTRATO_ESTADOS
} from '@/types/employee.types'
import type { DataTableColumns } from 'naive-ui'
import type { Contract } from '@/types/contract.types'
import ContractForm from '@/components/forms/ContractForm.vue'
import { debounce } from 'lodash-es'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

// Reactive data
const loading = ref(false)
const contracts = ref<Contract[]>([])
const showNewContractModal = ref(false)
const showEditModal = ref(false)
const editingContract = ref<Contract | null>(null)

const filters = reactive({
  empleado: '',
  tipoContrato: '',
  regimenLaboral: '',
  estado: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100]
})

// Columnas de la tabla
const columns: DataTableColumns<Contract> = [
  {
    title: 'Empleado',
    key: 'employee',
    width: 200,
    render(row) {
      return h('div', { class: 'employee-info' }, [
        h('div', { class: 'employee-name' }, row.employee?.nombreCompleto || 'N/A'),
        h('div', { class: 'employee-dni' }, `DNI: ${row.employee?.numeroDocumento || 'N/A'}`)
      ])
    }
  },
  {
    title: 'Tipo',
    key: 'tipoContrato',
    width: 120
  },
  {
    title: 'Régimen',
    key: 'regimenLaboral',
    width: 120
  },
  {
    title: 'Cargo',
    key: 'cargo',
    width: 150
  },
  {
    title: 'Salario',
    key: 'salarioBase',
    width: 100,
    render(row) {
      return h('span', `${row.tipoMoneda} ${row.salarioBase.toFixed(2)}`)
    }
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
    title: 'Estado',
    key: 'estado',
    width: 100,
    render(row) {
      const type = getContractStatusType(row.estado)
      return h('n-tag', {
        type,
        size: 'small'
      }, () => row.estado)
    }
  },
  {
    title: 'Días Restantes',
    key: 'diasRestantes',
    width: 120,
    render(row) {
      if (!row.fechaFin || row.estado !== 'VIGENTE') {
        return h('span', { class: 'text-gray-500' }, 'N/A')
      }
      const dias = getDaysUntilExpiry(row.fechaFin)
      const type = dias <= 30 ? 'error' : dias <= 90 ? 'warning' : 'success'
      return h('n-tag', {
        type,
        size: 'small'
      }, () => `${dias} días`)
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
          onClick: () => viewContract(row)
        }, () => h(EyeIcon)),
        h('n-button', {
          circle: true,
          size: 'small',
          quaternary: true,
          onClick: () => editContract(row)
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
  return new Date(date).toLocaleDateString('es-PE')
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

const getDaysUntilExpiry = (endDate: string) => {
  const today = new Date()
  const expiry = new Date(endDate)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const loadContracts = async () => {
  loading.value = true
  
  try {
    // TODO: Implementar llamada a API real
    // const response = await api.get('/contracts', { params: filters })
    
    // Mock data para demostración
    contracts.value = [
      {
        id: '1',
        empleadoId: '1',
        tipoContrato: 'INDETERMINADO',
        regimenLaboral: 'GENERAL',
        fechaInicio: '2024-01-15',
        fechaFin: null,
        cargo: 'Desarrollador Senior',
        salarioBase: 5000,
        tipoMoneda: 'PEN',
        estado: 'VIGENTE',
        diasTrabajo: 6,
        horasSemanales: 48,
        asignacionFamiliar: 93.00,
        tieneCTS: true,
        tieneVacaciones: true,
        tieneGratificaciones: true,
        tieneUtilidades: true,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        employee: {
          nombreCompleto: 'Juan Pérez García',
          numeroDocumento: '12345678'
        }
      } as any
    ]
    
    // TODO: Implementar filtros en el cliente
    let filteredContracts = [...contracts.value]
    
    if (filters.empleado) {
      const searchTerm = filters.empleado.toLowerCase()
      filteredContracts = filteredContracts.filter(contract =>
        contract.employee?.nombreCompleto?.toLowerCase().includes(searchTerm) ||
        contract.employee?.numeroDocumento?.includes(searchTerm)
      )
    }
    
    if (filters.tipoContrato) {
      filteredContracts = filteredContracts.filter(c => c.tipoContrato === filters.tipoContrato)
    }
    
    if (filters.regimenLaboral) {
      filteredContracts = filteredContracts.filter(c => c.regimenLaboral === filters.regimenLaboral)
    }
    
    if (filters.estado) {
      filteredContracts = filteredContracts.filter(c => c.estado === filters.estado)
    }
    
    pagination.itemCount = filteredContracts.length
    
  } catch (error) {
    message.error('Error al cargar contratos')
    console.error('Load contracts error:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(loadContracts, 300)

const refreshData = () => {
  loadContracts()
}

const clearFilters = () => {
  Object.assign(filters, {
    empleado: '',
    tipoContrato: '',
    regimenLaboral: '',
    estado: ''
  })
  pagination.page = 1
  loadContracts()
}

const viewContract = (contract: Contract) => {
  router.push(`/contratos/${contract.id}`)
}

const editContract = (contract: Contract) => {
  editingContract.value = contract
  showEditModal.value = true
}

const confirmDelete = (contract: Contract) => {
  dialog.warning({
    title: 'Eliminar Contrato',
    content: `¿Estás seguro de que deseas eliminar el contrato de ${contract.employee?.nombreCompleto}?`,
    positiveText: 'Eliminar',
    negativeText: 'Cancelar',
    onPositiveClick: async () => {
      try {
        // TODO: Implementar llamada a API
        // await api.delete(`/contracts/${contract.id}`)
        
        message.success('Contrato eliminado exitosamente')
        loadContracts()
      } catch (error) {
        message.error('Error al eliminar contrato')
      }
    }
  })
}

const handleCreateContract = async (contractData: any) => {
  try {
    // TODO: Implementar llamada a API
    // await api.post('/contracts', contractData)
    
    message.success('Contrato creado exitosamente')
    showNewContractModal.value = false
    loadContracts()
  } catch (error) {
    message.error('Error al crear contrato')
  }
}

const handleUpdateContract = async (contractData: any) => {
  if (!editingContract.value) return
  
  try {
    // TODO: Implementar llamada a API
    // await api.patch(`/contracts/${editingContract.value.id}`, contractData)
    
    message.success('Contrato actualizado exitosamente')
    showEditModal.value = false
    editingContract.value = null
    loadContracts()
  } catch (error) {
    message.error('Error al actualizar contrato')
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadContracts()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadContracts()
}

// Load initial data
loadContracts()
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

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.text-gray-500 {
  color: var(--text-secondary);
}

:deep(.n-data-table-th) {
  font-weight: 600;
}

:deep(.n-data-table-td) {
  vertical-align: middle;
}
</style>