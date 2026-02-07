<template>
  <AppleCard>
    <div class="module-header">
      <h3>Gestión de Documentos del Personal</h3>
      <p>Documentos requeridos, opcionales y vencimientos por empleado</p>
    </div>

    <div class="stats-row">
      <div class="stat-card blue"><div class="stat-value">{{ stats.required }}</div><div class="stat-label">Requeridos</div></div>
      <div class="stat-card orange"><div class="stat-value">{{ stats.pending }}</div><div class="stat-label">Pendientes</div></div>
      <div class="stat-card red"><div class="stat-value">{{ stats.expiring }}</div><div class="stat-label">Por Vencer</div></div>
      <div class="stat-card purple"><div class="stat-value">{{ stats.expired }}</div><div class="stat-label">Vencidos</div></div>
    </div>

    <div class="filters-bar">
      <AppleSearchInput v-model="search" placeholder="Buscar..." class="search-input" />
      <AppleButton variant="primary" :icon="UploadIcon" @click="showUploadModal = true">Subir</AppleButton>
    </div>

    <AppleTable :columns="columns" :data="filteredDocuments" :bordered="false" :striped="true" pagination />
  </AppleCard>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { AppleCard, AppleButton, AppleSearchInput, AppleTable, AppleTag } from '@/components/apple'
import { Upload, File } from 'lucide-vue-next'

const UploadIcon = Upload

const search = ref('')
const showUploadModal = ref(false)
const stats = ref({ required: 12, pending: 8, expiring: 5, expired: 2 })

const documents = ref([
  { id: 'DOC-001', nombreEmpleado: 'Juan Carlos Pérez García', tipo: 'DNI', nombreArchivo: 'dni_47856321.pdf', fechaSubida: '2025-01-10', estado: 'VIGENTE' },
  { id: 'DOC-002', nombreEmpleado: 'María Elena López Mendoza', tipo: 'CV', nombreArchivo: 'cv_maria_lopez.pdf', fechaSubida: '2025-01-12', estado: 'VIGENTE' },
  { id: 'DOC-003', nombreEmpleado: 'Roberto Carlos Mendoza Silva', tipo: 'Contrato', nombreArchivo: 'contrato_roberto.pdf', fechaSubida: '2024-06-01', estado: 'VIGENTE' },
  { id: 'DOC-004', nombreEmpleado: 'Ana Sofía Torres Ruiz', tipo: 'Certificado de Estudios', nombreArchivo: 'cert_ana_torres.pdf', fechaSubida: '2024-11-15', estado: 'VENCIDO' },
  { id: 'DOC-005', nombreEmpleado: 'Pedro Andrés Fernández Díaz', tipo: 'Recibo de Haberes', nombreArchivo: 'recibo_pedro_ene2026.pdf', fechaSubida: '2026-01-05', estado: 'VIGENTE' },
  { id: 'DOC-006', nombreEmpleado: 'Carmen Rosa Vásquez López', tipo: 'AFP', nombreArchivo: 'afp_carmen.pdf', fechaSubida: '2025-08-20', estado: 'VIGENTE' },
  { id: 'DOC-007', nombreEmpleado: 'Juan Carlos Pérez García', tipo: 'Certificado de Trabajo', nombreArchivo: 'cert_trabajo_juan.pdf', fechaSubida: '2025-03-10', estado: 'VIGENTE' },
  { id: 'DOC-008', nombreEmpleado: 'María Elena López Mendoza', tipo: 'Licencia de Conducir', nombreArchivo: 'licencia_maria.pdf', fechaSubida: '2024-02-28', estado: 'POR_VENCER' }
])

const columns = [
  { title: 'Empleado', key: 'nombreEmpleado', render: (row: any) => h('div', { style: 'font-weight: 500;' }, row.nombreEmpleado) },
  { title: 'Tipo', key: 'tipo', width: '120px' },
  { title: 'Archivo', key: 'nombreArchivo', render: (row: any) => h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [h(File, { size: 16 }), row.nombreArchivo]) },
  { title: 'Estado', key: 'estado', width: '120px', render: (row: any) => h(AppleTag, { type: row.estado === 'VIGENTE' ? 'success' : 'warning', label: row.estado }) },
  { title: 'Acciones', key: 'actions', width: '150px', render: (row: any) => h('div', { style: 'display: flex; gap: 8px;' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => alert('Ver') }, () => 'Ver'), h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => alert('Descargar') }, () => 'Descargar')]) }
]

const filteredDocuments = computed(() => {
  let data = documents.value
  if (search.value) data = data.filter(d => d.nombreEmpleado?.toLowerCase().includes(search.value.toLowerCase()))
  return data
})
</script>

<style scoped>
.module-header { text-align: center; margin-bottom: 24px; }
.module-header h3 { font-size: 20px; margin-bottom: 8px; }
.module-header p { color: var(--color-text-secondary); }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { padding: 16px; border-radius: 12px; text-align: center; }
.stat-card.blue { background: #dbeafe; color: #1e40af; }
.stat-card.orange { background: #fef3c7; color: #92400e; }
.stat-card.red { background: #fee2e2; color: #991b1b; }
.stat-card.purple { background: #f3e8ff; color: #6b21a8; }
.stat-value { font-size: 28px; font-weight: 700; }
.stat-label { font-size: 12px; margin-top: 4px; }
.filters-bar { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
.search-input { max-width: 250px; }
</style>
