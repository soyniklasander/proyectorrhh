<template>
  <AppleCard>
    <div class="module-header">
      <h3>Gestión de Desvinculaciones</h3>
      <p>Control de contratos terminados, liquidaciones y procesos de salida</p>
    </div>

    <div class="stats-row">
      <div class="stat-card red"><div class="stat-value">{{ stats.expired }}</div><div class="stat-label">Vencidos</div></div>
      <div class="stat-card orange"><div class="stat-value">{{ stats.pending }}</div><div class="stat-label">Por Liquidar</div></div>
      <div class="stat-card blue"><div class="stat-value">{{ stats.processing }}</div><div class="stat-label">En Proceso</div></div>
      <div class="stat-card green"><div class="stat-value">{{ stats.completed }}</div><div class="stat-label">Completados</div></div>
    </div>

    <div class="filters-bar">
      <AppleSearchInput v-model="search" placeholder="Buscar..." class="search-input" />
      <AppleButton variant="secondary" :icon="RefreshIcon" @click="loadData">Actualizar</AppleButton>
    </div>

    <AppleTable :columns="columns" :data="filteredList" :bordered="false" :striped="true" pagination />
  </AppleCard>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { AppleCard, AppleButton, AppleSearchInput, AppleTable, AppleTag, AppleAvatar } from '@/components/apple'
import { RefreshCw } from 'lucide-vue-next'

const RefreshIcon = RefreshCw

const search = ref('')
const stats = ref({ expired: 0, pending: 3, processing: 1, completed: 12 })

const desvinculaciones = ref([
  { id: 'DESV-001', nombre: 'Juan Pérez García', dni: '12345678', cargo: 'Analista', fechaFin: '2026-01-15', motivo: 'Renuncia', estado: 'VENCIDO' },
  { id: 'DESV-002', nombre: 'María López', dni: '87654321', cargo: 'Asistente', fechaFin: '2026-02-01', motivo: 'Despido', estado: 'PENDIENTE' }
])

const getStatusType = (status: string): 'default' | 'success' | 'warning' | 'error' | 'primary' => {
  const types: Record<string, 'default' | 'success' | 'warning' | 'error' | 'primary'> = { 'PENDIENTE': 'warning', 'PROCESO': 'primary', 'LIQUIDADO': 'success', 'VENCIDO': 'error' }
  return types[status] || 'default'
}

const columns = [
  { title: 'Empleado', key: 'empleado', render: (row: any) => h('div', { style: 'display: flex; align-items: center; gap: 10px;' }, [h(AppleAvatar, { src: '', size: 'sm', name: row.nombre }), h('div', [h('div', { style: 'font-weight: 500;' }, row.nombre), h('div', { style: 'font-size: 12px; color: var(--color-text-secondary);' }, `DNI: ${row.dni}`)])]) },
  { title: 'Cargo', key: 'cargo' },
  { title: 'Fecha Término', key: 'fechaFin', width: '130px', render: (row: any) => h('span', { style: row.estado === 'VENCIDO' ? 'color: #ef4444; font-weight: 600;' : '' }, row.fechaFin) },
  { title: 'Motivo', key: 'motivo', width: '150px' },
  { title: 'Estado', key: 'estado', width: '120px', render: (row: any) => h(AppleTag, { type: getStatusType(row.estado), label: row.estado }) },
  { title: 'Acciones', key: 'actions', width: '200px', render: (row: any) => h('div', { style: 'display: flex; gap: 8px;' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => alert('Ver') }, () => 'Ver'), h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => alert('Liquidar') }, () => 'Liquidar')]) }
]

const filteredList = computed(() => {
  let data = desvinculaciones.value
  if (search.value) data = data.filter(d => d.nombre?.toLowerCase().includes(search.value.toLowerCase()) || d.dni?.includes(search.value))
  return data
})

const loadData = () => console.log('Cargar datos')
</script>

<style scoped>
.module-header { text-align: center; margin-bottom: 24px; }
.module-header h3 { font-size: 20px; margin-bottom: 8px; }
.module-header p { color: var(--color-text-secondary); }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { padding: 16px; border-radius: 12px; text-align: center; }
.stat-card.red { background: #fee2e2; color: #991b1b; }
.stat-card.orange { background: #fef3c7; color: #92400e; }
.stat-card.blue { background: #dbeafe; color: #1e40af; }
.stat-card.green { background: #dcfce7; color: #166534; }
.stat-value { font-size: 28px; font-weight: 700; }
.stat-label { font-size: 12px; margin-top: 4px; }
.filters-bar { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
.search-input { max-width: 250px; }
</style>
