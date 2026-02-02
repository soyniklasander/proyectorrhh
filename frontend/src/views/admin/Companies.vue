<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Gestión de Empresas</h1>
        <p class="subtitle">Administración de Tenants y Clientes.</p>
      </div>
      <n-button type="primary" @click="showModal = true">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        Nueva Empresa
      </n-button>
    </div>

    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="companies"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
      />
    </n-card>

    <!-- Modal Form -->
    <n-modal v-model:show="showModal" preset="card" :title="editingId ? 'Editar Empresa' : 'Nueva Empresa'" style="width: 600px">
      <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="120" require-mark-placement="right-hanging">
        <n-form-item label="Nombre" path="name">
          <n-input v-model:value="formModel.name" placeholder="Razón Social" />
        </n-form-item>
        <n-form-item label="RUC" path="ruc">
          <n-input v-model:value="formModel.ruc" placeholder="20123456789" />
        </n-form-item>
        <n-form-item label="Dirección" path="address">
          <n-input v-model:value="formModel.address" placeholder="Av. Principal 123" />
        </n-form-item>
        <n-form-item label="Dominio" path="domain">
          <n-input v-model:value="formModel.domain" placeholder="empresa.com" />
        </n-form-item>
        <n-form-item label="Estado" path="status">
          <n-select v-model:value="formModel.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showModal = false">Cancelar</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">Guardar</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, reactive } from 'vue'
import { NButton, NIcon, NTag, useMessage, type DataTableColumns, type FormRules } from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { api } from '@/services/api'

interface Company {
  id: string
  name: string
  ruc: string
  address?: string
  domain?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
}

const message = useMessage()
const companies = ref<Company[]>([])
const loading = ref(false)
const showModal = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)

const pagination = { pageSize: 10 }

const formModel = reactive({
  name: '',
  ruc: '',
  address: '',
  domain: '',
  status: 'ACTIVE'
})

const rules: FormRules = {
  name: { required: true, message: 'Nombre es requerido', trigger: 'blur' },
  ruc: { required: true, message: 'RUC es requerido', trigger: 'blur', min: 11, max: 11 },
  status: { required: true, message: 'Estado es requerido', trigger: 'blur' }
}

const statusOptions = [
  { label: 'Activo', value: 'ACTIVE' },
  { label: 'Inactivo', value: 'INACTIVE' },
  { label: 'Suspendido', value: 'SUSPENDED' }
]

const columns: DataTableColumns<Company> = [
  { title: 'Empresa', key: 'name', sorter: 'default' },
  { title: 'RUC', key: 'ruc' },
  { title: 'Dominio', key: 'domain' },
  {
    title: 'Estado',
    key: 'status',
    render: (row) => h(
      NTag,
      { type: row.status === 'ACTIVE' ? 'success' : 'error', bordered: false, round: true },
      { default: () => row.status }
    )
  },
  {
    title: 'Acciones',
    key: 'actions',
    render: (row) => h(
      'div',
      { style: { display: 'flex', gap: '8px' } },
      [
        h(NButton, { size: 'small', quaternary: true, onClick: () => handleEdit(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
        h(NButton, { size: 'small', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
      ]
    )
  }
]

const fetchCompanies = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/companies')
    if (data.success) {
      companies.value = data.data
    }
  } catch (error) {
    message.error('Error al cargar empresas')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: Company) => {
  editingId.value = row.id
  Object.assign(formModel, {
    name: row.name,
    ruc: row.ruc,
    address: row.address || '',
    domain: row.domain || '',
    status: row.status
  })
  showModal.value = true
}

const handleDelete = async (row: Company) => {
  if (!confirm('¿Estás seguro de eliminar esta empresa? Esta acción no se puede deshacer.')) return

  try {
    const { data } = await api.delete(`/admin/companies/${row.id}`)
    if (data.success) {
      message.success('Empresa eliminada')
      fetchCompanies()
    }
  } catch (error) {
    message.error('Error al eliminar')
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (editingId.value) {
      await api.patch(`/admin/companies/${editingId.value}`, formModel)
      message.success('Empresa actualizada')
    } else {
      await api.post('/admin/companies', formModel)
      message.success('Empresa creada')
    }
    showModal.value = false
    fetchCompanies()
    // Reset form
    Object.assign(formModel, { name: '', ruc: '', address: '', domain: '', status: 'ACTIVE' })
    editingId.value = null
  } catch (error) {
    message.error('Error al guardar')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchCompanies)
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
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
