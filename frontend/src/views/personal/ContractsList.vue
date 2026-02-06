<template>
  <AppleCard>
    <div class="list-header">
      <div class="header-left">
        <AppleBadge type="success" :label="`${activeContracts} vigentes`" />
        <AppleBadge type="warning" :label="`${expiringContracts} por vencer`" />
        <AppleBadge type="error" :label="`${expiredContracts} vencidos`" />
      </div>
      <div class="header-right">
        <AppleSelect
          v-model="filterStatus"
          placeholder="Filtrar por estado"
          :options="statusOptions"
          class="filter-select"
        />
        <AppleSearchInput
          v-model="search"
          placeholder="Buscar contrato..."
          class="search-input"
        />
        <AppleButton variant="secondary" :icon="RefreshIcon" @click="loadContracts">
          Actualizar
        </AppleButton>
      </div>
    </div>

    <AppleTable
      :columns="columns"
      :data="filteredContracts"
      :loading="loading"
      :bordered="false"
      :striped="true"
      pagination
    />
  </AppleCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  AppleCard,
  AppleButton,
  AppleBadge,
  AppleTable,
  AppleTag,
  AppleSearchInput,
  AppleSelect,
  AppleAvatar
} from '@/components/apple'
import { RefreshCw } from 'lucide-vue-next'

const RefreshIcon = RefreshCw

const contracts = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const filterStatus = ref('todos')

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

const getStatusType = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  const types: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
    'VIGENTE': 'success',
    'POR_VENCER': 'warning',
    'VENCIDO': 'error',
    'SUSPENDIDO': 'primary'
  }
  return types[status] || 'default'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Indefinido'
  return new Date(dateStr).toLocaleDateString('es-PE')
}

const columns = [
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'employee-info' }, [
        h(AppleAvatar, { src: '', size: 'sm', name: row.nombreCompleto || '' }),
        h('div', { style: 'margin-left: 10px;' }, [
          h('div', { style: 'font-weight: 500;' }, row.nombreCompleto || ''),
          h('div', { style: 'font-size: 12px; color: var(--color-text-secondary);' }, `DNI: ${row.numeroDocumento || ''}`)
        ])
      ])
    }
  },
  { title: 'Tipo', key: 'tipoContrato', width: '140px' },
  { title: 'Régimen', key: 'regimenLaboral', width: '140px', render: (row: any) => h(AppleTag, { type: 'primary', label: row.regimenLaboral || '' }) },
  { title: 'Cargo', key: 'cargo', width: '160px' },
  {
    title: 'Período',
    key: 'periodo',
    width: '160px',
    render(row: any) {
      return h('div', { class: 'periodo-info' }, [
        h('div', {}, `Inicio: ${formatDate(row.fechaInicio)}`),
        h('div', { style: 'font-size: 12px;' }, `Fin: ${formatDate(row.fechaFin)}`)
      ])
    }
  },
  { title: 'Sueldo', key: 'salarioBase', width: '120px', render: (row: any) => h('strong', {}, `S/ ${(row.salarioBase || 0).toLocaleString()}`) },
  {
    title: 'Estado',
    key: 'estado',
    width: '110px',
    render(row: any) {
      const labels: Record<string, string> = { 'VIGENTE': 'Vigente', 'POR_VENCER': 'Por Vencer', 'VENCIDO': 'Vencido', 'SUSPENDIDO': 'Suspendido' }
      return h(AppleTag, { type: getStatusType(row.estado), label: labels[row.estado] || row.estado })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: '200px',
    render(row: any) {
      return h('div', { class: 'actions' }, [
        h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => viewContract(row.id) }, () => 'Ver'),
        h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => renewContract(row.id) }, () => 'Renovar'),
        h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => terminateContract(row.id) }, () => 'Terminar')
      ])
    }
  }
]

const filteredContracts = computed(() => {
  let data = contracts.value
  if (search.value) {
    const s = search.value.toLowerCase()
    data = data.filter((c: any) => c.nombreCompleto?.toLowerCase().includes(s) || c.numeroDocumento?.includes(search.value))
  }
  if (filterStatus.value !== 'todos') {
    data = data.filter((c: any) => c.estado === filterStatus.value)
  }
  return data
})

const loadContracts = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/contracts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } })
    const data = await response.json()
    if (data.success) contracts.value = data.data
  } catch (error) {
    console.error(error)
  } finally { loading.value = false }
}

const viewContract = (id: string) => console.log('View:', id)
const renewContract = (id: string) => console.log('Renew:', id)
const terminateContract = (id: string) => console.log('Terminate:', id)

onMounted(() => loadContracts())
</script>

<style scoped>
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.header-left, .header-right { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.search-input { max-width: 250px; }
.filter-select { min-width: 140px; }
.employee-info { display: flex; align-items: center; }
.periodo-info { font-size: 13px; }
.actions { display: flex; gap: 6px; }
</style>
