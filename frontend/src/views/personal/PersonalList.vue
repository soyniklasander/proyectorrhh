<template>
  <div class="personal-list">
    <div class="list-header">
      <div class="header-left">
        <n-tag type="info">{{ (employees || []).length }} empleados</n-tag>
        <n-tag type="success">{{ activeCount }} activos</n-tag>
        <n-tag type="warning">{{ inactiveCount }} inactivos</n-tag>
      </div>
      <div class="header-right">
        <n-input
          v-model:value="search"
          placeholder="Buscar por nombre, DNI, email..."
          class="search-input"
          clearable
        />
        <n-select
          v-model:value="filterStatus"
          placeholder="Todos los estados"
          :options="statusOptions"
          class="filter-select"
        />
        <n-button type="primary" @click="loadEmployees">
          🔄 Actualizar
        </n-button>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="filteredEmployees"
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
import { NAvatar, NTag, NButton, NInput, NSelect, NDataTable } from 'naive-ui'
import { api } from '@/services/api'

const message = useMessage()

const employees = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const filterStatus = ref('todos')
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0
})

const activeCount = computed(() => employees.value.filter((e: any) => e.estado === 'ACTIVO').length)
const inactiveCount = computed(() => employees.value.filter((e: any) => e.estado === 'INACTIVO').length)

const statusOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Activos', value: 'ACTIVO' },
  { label: 'Inactivos', value: 'INACTIVO' },
  { label: 'Suspendidos', value: 'SUSPENDIDO' }
]

const getStatusType = (status: string) => {
  switch (status) {
    case 'ACTIVO': return 'success'
    case 'INACTIVO': return 'default'
    case 'SUSPENDIDO': return 'warning'
    default: return 'info'
  }
}

const createColumns = () => [
  {
    title: 'Foto',
    key: 'avatar',
    width: 60,
    render(row: any) {
      return h('div', { class: 'avatar' }, [
        h(NAvatar, {
          size: 'medium',
          src: row.foto || '',
          round: true
        }, () => row.nombreCompleto?.slice(0, 2)?.toUpperCase() || '')
      ])
    }
  },
  {
    title: 'Nombre Completo',
    key: 'nombreCompleto',
    render(row: any) {
      return h('div', {}, [
        h('div', { style: 'font-weight: 600;' }, row.nombreCompleto || ''),
        h('div', { style: 'font-size: 12px; color: #6b7280;' }, row.email || '')
      ])
    }
  },
  {
    title: 'DNI',
    key: 'numeroDocumento',
    width: 120
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
    width: 140,
    render(row: any) {
      return h(NTag, { type: 'info', size: 'small' }, () => row.regimenLaboral || '')
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
      }, () => row.estado || '')
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
          onClick: () => editEmployee(row.id)
        }, () => 'Editar'),
        h(NButton, { 
          size: 'small', 
          type: 'error',
          onClick: () => toggleStatus(row.id, row.estado)
        }, () => row.estado === 'ACTIVO' ? 'Inactivar' : 'Activar')
      ])
    }
  }
]

const columns = createColumns()

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

const handlePagination = (newPagination: any) => {
  pagination.value = newPagination
  loadEmployees()
}

const loadEmployees = async () => {
  loading.value = true
  try {
    const response = await api.get('/employees')
    if (response.data.success) {
      employees.value = response.data.data
      pagination.value.itemCount = response.data.data.length
    }
  } catch (error) {
    message.error('Error al cargar empleados: ' + (error as any)?.message)
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
.personal-list {
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
  max-width: 280px;
}

.filter-select {
  min-width: 140px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>