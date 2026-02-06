<template>
  <AppleContainer>
    <ApplePageHeader title="Gestión de Empresas" subtitle="Administración de Tenants y Clientes">
      <template #actions>
        <AppleButton variant="primary" @click="showModal = true">Nueva Empresa</AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <AppleTable :columns="columns" :data="companies" />
    </AppleCard>

    <AppleModal v-model:show="showModal" :title="editingId ? 'Editar Empresa' : 'Nueva Empresa'" style="width: 600px">
      <div class="form-grid">
        <div class="form-group"><label>Nombre</label><AppleInput v-model="formModel.name" placeholder="Razón Social" /></div>
        <div class="form-group"><label>RUC</label><AppleInput v-model="formModel.ruc" placeholder="20123456789" /></div>
        <div class="form-group"><label>Dirección</label><AppleInput v-model="formModel.address" placeholder="Av. Principal 123" /></div>
        <div class="form-group"><label>Dominio</label><AppleInput v-model="formModel.domain" placeholder="empresa.com" /></div>
        <div class="form-group"><label>Estado</label><AppleSelect v-model="formModel.status" :options="statusOptions" /></div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showModal = false">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="submitting" @click="handleSubmit">Guardar</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTable, AppleModal, AppleInput, AppleSelect } from '@/components/apple'
import { api } from '@/services/api'

interface Company { id: string; name: string; ruc: string; address?: string; domain?: string; status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; createdAt: string }

const companies = ref<Company[]>([])
const loading = ref(false)
const showModal = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)

const formModel = reactive({ name: '', ruc: '', address: '', domain: '', status: 'ACTIVE' })
const statusOptions = [{ label: 'Activo', value: 'ACTIVE' }, { label: 'Inactivo', value: 'INACTIVE' }, { label: 'Suspendido', value: 'SUSPENDED' }]

const columns = [
  { title: 'Empresa', key: 'name' },
  { title: 'RUC', key: 'ruc' },
  { title: 'Dominio', key: 'domain', render: (row: any) => row.domain || '-' },
  { title: 'Estado', key: 'status', render: (row: any) => row.status },
  { title: 'Acciones', key: 'actions', render: (row: any) => h('div', { style: 'display: flex; gap: 8px;' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => handleEdit(row) }, () => 'Editar'), h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => handleDelete(row) }, () => 'Eliminar')]) }
]

const fetchCompanies = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/companies')
    if (data.success) companies.value = data.data
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const handleEdit = (row: Company) => { editingId.value = row.id; Object.assign(formModel, { name: row.name, ruc: row.ruc, address: row.address || '', domain: row.domain || '', status: row.status }); showModal.value = true }

const handleDelete = async (row: Company) => {
  if (confirm('¿Eliminar?')) {
    try {
      await api.delete(`/admin/companies/${row.id}`)
      alert('Empresa eliminada')
      fetchCompanies()
    } catch (error) { console.error(error) }
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (editingId.value) { await api.patch(`/admin/companies/${editingId.value}`, formModel); alert('Empresa actualizada') }
    else { await api.post('/admin/companies', formModel); alert('Empresa creada') }
    showModal.value = false; fetchCompanies(); Object.assign(formModel, { name: '', ruc: '', address: '', domain: '', status: 'ACTIVE' }); editingId.value = null
  } catch (error) { console.error(error) }
  finally { submitting.value = false }
}

onMounted(() => fetchCompanies())
</script>

<style scoped>
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
</style>
