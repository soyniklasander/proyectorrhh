<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Gestión de Personal</h1>
        <p class="subtitle">Directorio de colaboradores activos.</p>
      </div>
      <n-button type="primary" @click="$router.push('/contracts/new')">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        Nuevo Ingreso
      </n-button>
    </div>

    <n-card class="table-card" :bordered="false">
      <n-data-table
        :columns="columns"
        :data="employees"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NTag, NButton, NIcon, type DataTableColumns } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { api } from '@/services/api'

interface Employee {
  id: string
  nombreCompleto: string
  tipoDocumento: string
  numeroDocumento: string
  fechaIngreso: string
  estado: string
}

const loading = ref(false)
const employees = ref<Employee[]>([])
const pagination = { pageSize: 10 }

const columns: DataTableColumns<Employee> = [
  {
    title: 'Nombre Completo',
    key: 'nombreCompleto',
    sorter: 'default'
  },
  {
    title: 'Documento',
    key: 'numeroDocumento',
    render: (row) => `${row.tipoDocumento} ${row.numeroDocumento}`
  },
  {
    title: 'Fecha Ingreso',
    key: 'fechaIngreso'
  },
  {
    title: 'Estado',
    key: 'estado',
    render: (row) => h(
      NTag,
      { type: row.estado === 'ACTIVO' ? 'success' : 'error', bordered: false, round: true },
      { default: () => row.estado }
    )
  }
]

const fetchEmployees = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employees')
    if (data.success) {
      employees.value = data.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchEmployees)
</script>

<style scoped>
.page-container {
  padding: 0;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}
.subtitle {
  color: #6b7280;
  margin: 4px 0 0;
}
.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
