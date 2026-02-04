<template>
  <div class="contracts-list">
    <div class="list-header">
      <div class="header-left">
        <n-tag type="success">{{ activeContracts }} vigentes</n-tag>
        <n-tag type="warning">{{ expiringContracts }} por vencer</n-tag>
        <n-tag type="error">{{ expiredContracts }} vencidos</n-tag>
      </div>
      <div class="header-right">
        <n-select
          v-model:value="filterStatus"
          placeholder="Filtrar por estado"
          :options="statusOptions"
          class="filter-select"
        />
        <n-input
          v-model:value="search"
          placeholder="Buscar contrato..."
          class="search-input"
          clearable
        />
        <n-button type="primary" @click="loadContracts">
          🔄 Actualizar
        </n-button>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredContracts"
      :loading="loading"
      :pagination="pagination"
      @update:pagination="handlePagination"
      :bordered="false"
      :striped="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useMessage } from 'naive-ui'
import { NTag, NButton, NSelect, NInput, NDataTable } from 'naive-ui'

const message = useMessage()

const contracts = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const filterStatus = ref('todos')
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0
})

const statusOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Vigentes', value: 'VIGENTE' },
  { label: 'Por Vencer', value: 'POR_VENCER' },
  { label: 'Vencidos', value: 'VENCIDO' },
  { label: 'Suspendidos', value: 'SUSPENDIDO' }
]

const activeContracts = computed(() => contracts.value.filter((c: any) => c.estado === 'VIGENTE').length)
const expiringContracts = computed(() => contracts.value.filter((c: any) => c.estado === 'POR_VENCER').length)
const expiredContracts = computed(() => contracts.value.filter((c: any) => c.estado === 'VENCIDO').length)

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    'VIGENTE': 'success',
    'POR_VENCER': 'warning',
    'VENCIDO': 'error',
    'SUSPENDIDO': 'info'
  }
  return types[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'VIGENTE': 'Vigente',
    'POR_VENCER': 'Por Vencer',
    'VENCIDO': 'Vencido',
    'SUSPENDIDO': 'Suspendido'
  }
  return labels[status] || status
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Indefinido'
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const createColumns = () => [
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'employee-info' }, [
        h('div', { style: 'font-weight: 600;' }, row.nombreCompleto || ''),
        h('div', { style: 'font-size: 12px; color: #6b7280;' }, `DNI: ${row.numeroDocumento || ''}`)
      ])
    }
  },
  {
    title: 'Tipo',
    key: 'tipoContrato',
    width: 140
  },
  {
    title: 'Régimen',
    key: 'regimenLaboral',
    width: 140,
    render(row: any) {
      return h(NTag, { type: 'info', size: 'small' }, () => row.regimenLaboral || '')
    }
  },
  {
    title: 'Cargo',
    key: 'cargo',
    width: 160
  },
  {
    title: 'Período',
    key: 'periodo',
    width: 160,
    render(row: any) {
      return h('div', { class: 'periodo-info' }, [
        h('div', {}, `Inicio: ${formatDate(row.fechaInicio)}`),
        h('div', { style: 'font-size: 12px; color: #6b7280;' }, `Fin: ${formatDate(row.fechaFin)}`)
      ])
    }
  },
  {
    title: 'Sueldo',
    key: 'salarioBase',
    width: 120,
    render(row: any) {
      return h('strong', {}, `S/ ${(row.salarioBase || 0).toLocaleString()}`)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 110,
    render(row: any) {
      return h(NTag, { 
        type: getStatusType(row.estado), 
        round: true,
        size: 'small' 
      }, () => getStatusLabel(row.estado))
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 200,
    render(row: any) {
      return h('div', { class: 'actions' }, [
        h(NButton, { 
          size: 'small', 
          type: 'info',
          onClick: () => viewContract(row.id)
        }, () => 'Ver'),
        h(NButton, { 
          size: 'small', 
          type: 'warning',
          onClick: () => renewContract(row.id)
        }, () => 'Renovar'),
        h(NButton, { 
          size: 'small', 
          type: 'error',
          onClick: () => terminateContract(row.id)
        }, () => 'Terminar')
      ])
    }
  }
]

const columns = createColumns()

const filteredContracts = computed(() => {
  let data = contracts.value
  
  if (search.value) {
    const s = search.value.toLowerCase()
    data = data.filter((contract: any) => 
      contract.nombreCompleto?.toLowerCase().includes(s) ||
      contract.numeroDocumento?.includes(search.value)
    )
  }
  
  if (filterStatus.value !== 'todos') {
    data = data.filter((contract: any) => contract.estado === filterStatus.value)
  }
  
  return data
})

const handlePagination = (newPagination: any) => {
  pagination.value = newPagination
  loadContracts()
}

const loadContracts = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/contracts', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      contracts.value = data.data
      pagination.value.itemCount = data.data.length
    }
  } catch (error) {
    message.error('Error al cargar contratos')
  } finally {
    loading.value = false
  }
}

const viewContract = (id: string) => {
  console.log('View contract:', id)
}

const renewContract = (id: string) => {
  console.log('Renew contract:', id)
}

const terminateContract = (id: string) => {
  console.log('Terminate contract:', id)
}

onMounted(() => {
  loadContracts()
})
</script>

<style scoped>
.contracts-list {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  gap: 12px;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  max-width: 250px;
}

.filter-select {
  min-width: 140px;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.periodo-info {
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 6px;
}
</style>