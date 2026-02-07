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
const stats = ref({ expired: 4, pending: 8, processing: 3, completed: 45 })

const desvinculaciones = ref([
  { id: 'DESV-001', nombre: 'Luis Miguel Herrera Gálvez', dni: '10293847', cargo: 'Analista de Sistemas', fechaFin: '2026-01-15', motivo: 'Renuncia voluntaria', estado: 'LIQUIDADO' },
  { id: 'DESV-002', nombre: 'Patricia Elena Quispe Mamani', dni: '38475612', cargo: 'Asistente de Ventas', fechaFin: '2026-02-01', motivo: 'Despido justificado', estado: 'PENDIENTE' },
  { id: 'DESV-003', nombre: 'Jorge Alberto Núñez Ortiz', dni: '91827364', cargo: 'Técnico de Mantenimiento', fechaFin: '2025-12-20', motivo: 'Fin de contrato', estado: 'PROCESO' },
  { id: 'DESV-004', nombre: 'Rosa Marina Flores Delgado', dni: '56473829', cargo: 'Secretaria', fechaFin: '2025-11-30', motivo: 'Renuncia voluntaria', estado: 'LIQUIDADO' },
  { id: 'DESV-005', nombre: 'Walter Raúl Chávez Vega', dni: '73649281', cargo: 'Chofer', fechaFin: '2026-02-10', motivo: 'Mutuo acuerdo', estado: 'PENDIENTE' },
  { id: 'DESV-006', nombre: 'Sofía Isabella Paz García', dni: '12837465', cargo: 'Practicante de Marketing', fechaFin: '2025-08-15', motivo: 'Fin de prácticas', estado: 'LIQUIDADO' },
  { id: 'DESV-007', nombre: 'Marco Antonio López Ruiz', dni: '92736451', cargo: 'Vendedor', fechaFin: '2025-07-22', motivo: 'Despido injustificado', estado: 'VENCIDO' },
  { id: 'DESV-008', nombre: 'Elena Carmen Torres Mendoza', dni: '45126378', cargo: 'Contadora', fechaFin: '2025-06-10', motivo: 'Renuncia voluntaria', estado: 'LIQUIDADO' }
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
