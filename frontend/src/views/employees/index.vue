<template>
  <AppleContainer>
    <ApplePageHeader title="Empleados" subtitle="Directorio de colaboradores activos">
      <template #actions>
        <AppleButton variant="primary">Nuevo Ingreso</AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <AppleTable :columns="columns" :data="employees" />
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTable, AppleTag, AppleAvatar } from '@/components/apple'
import { api } from '@/services/api'

interface Employee {
  id: string
  nombreCompleto: string
  tipoDocumento: string
  numeroDocumento: string
  fechaIngreso: string
  estado: string
  email?: string
  cargo?: string
  areaTrabajo?: string
}

const loading = ref(false)
const employees = ref<Employee[]>([])

const columns = [
  { title: 'Foto', key: 'avatar', render: (row: Employee) => h('div', { style: 'display: flex; justify-content: center;' }, [h(AppleAvatar, { src: '', size: 'sm', name: row.nombreCompleto })]) },
  { title: 'Nombre', key: 'nombreCompleto', render: (row: Employee) => h('div', {}, [h('div', { style: 'font-weight: 500;' }, row.nombreCompleto), h('div', { style: 'font-size: 12px; color: #666;' }, row.email || '')]) },
  { title: 'Documento', key: 'numeroDocumento', render: (row: Employee) => `${row.tipoDocumento} ${row.numeroDocumento}` },
  { title: 'Cargo', key: 'cargo', render: (row: Employee) => row.cargo || '-' },
  { title: 'Área', key: 'areaTrabajo', render: (row: Employee) => row.areaTrabajo || '-' },
  { title: 'Estado', key: 'estado', render: (row: Employee) => row.estado },
  { title: 'Acciones', key: 'actions', render: (row: Employee) => h(AppleButton, { variant: 'ghost', size: 'small' }, () => 'Ver') }
]

const fetchEmployees = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employees')
    if (data.success) employees.value = data.data
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

onMounted(() => fetchEmployees())
</script>
