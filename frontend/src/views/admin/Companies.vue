<template>
  <div class="companies-page">
    <div class="header">
      <h1 class="page-title">Administración de Empresas</h1>
      <n-button type="primary">
        + Nueva Empresa
      </n-button>
    </div>

    <div class="card">
      <div class="table-container">
        <n-data-table
          :columns="columns"
          :data="companies"
          :loading="loading"
          :pagination="pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { api } from '@/services/api'
import { NButton, useMessage, NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface Company {
  id: string
  razon_social: string
  ruc: string
  representante_legal_nombre: string
  created_at: string
}

const companies = ref<Company[]>([])
const loading = ref(false)
const message = useMessage()

const columns: DataTableColumns<Company> = [
  {
    title: 'Razón Social',
    key: 'razon_social',
    sorter: 'default'
  },
  {
    title: 'RUC',
    key: 'ruc'
  },
  {
    title: 'Representante Legal',
    key: 'representante_legal_nombre'
  },
  {
    title: 'Fecha Registro',
    key: 'created_at',
    render(row) {
        if (!row.created_at) return '-'
        return new Date(row.created_at).toLocaleDateString()
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          onClick: () => handleManage(row)
        },
        { default: () => 'Gestionar' }
      )
    }
  }
]

const pagination = {
  pageSize: 10
}

const fetchCompanies = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/companies')
    if (response.data.success) {
      companies.value = response.data.data
    } else {
        message.error('Error al cargar empresas')
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
    message.error('Error de conexión al cargar empresas')
  } finally {
    loading.value = false
  }
}

const handleManage = (row: Company) => {
    // Placeholder for future logic (e.g. login as company or edit)
    message.info(`Gestionando: ${row.razon_social}`)
}

onMounted(() => {
  fetchCompanies()
})
</script>

<style scoped>
.companies-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
