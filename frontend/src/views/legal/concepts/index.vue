<template>
  <div class="concepts-page">
    <PageHeader title="Conceptos de Nómina" subtitle="Catálogo de ingresos y deducciones">
      <template #extra>
        <n-button type="primary" @click="showModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nuevo Concepto
        </n-button>
      </template>
    </PageHeader>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="earnings" tab="Ingresos">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="earnings" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="deductions" tab="Deducciones">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="deductions" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="contributions" tab="Aportaciones">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="contributions" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NIcon, NCard, NDataTable, NTabs, NTabPane, NTag, NSelect, useMessage, type DataTableColumns } from 'naive-ui'
import { AddOutline, CreateOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'

interface Concept {
  id: string
  codigo: string
  nombre: string
  tipo: string
  naturaleza: string
  afecto: boolean
  fijo: boolean
  porcentaje: number
  orden: number
  activo: boolean
}

const message = useMessage()
const loading = ref(false)
const activeTab = ref('earnings')
const earnings = ref<Concept[]>([])
const deductions = ref<Concept[]>([])
const contributions = ref<Concept[]>([])
const showModal = ref(false)

const columns: DataTableColumns<Concept> = [
  { title: 'Código', key: 'codigo', width: 100 },
  { title: 'Nombre', key: 'nombre', width: 200 },
  { title: 'Tipo', key: 'tipo', width: 120 },
  { title: 'Naturaleza', key: 'naturaleza', width: 120 },
  { title: 'Porcentaje', key: 'porcentaje', width: 80, render: (row) => row.porcentaje ? `${row.porcentaje}%` : '-' },
  { title: 'Orden', key: 'orden', width: 70 },
  {
    title: 'Activo',
    key: 'activo',
    width: 80,
    render: (row) => h(NTag, { type: row.activo ? 'success' : 'default', size: 'small' }, () => row.activo ? 'Sí' : 'No')
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render: (row) => h(NButton, { size: 'small', secondary: true, onClick: () => editConcept(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) })
  }
]

const loadConcepts = async () => { /* TODO */ }
const editConcept = (row: Concept) => { console.log('Edit:', row.id) }
onMounted(() => { loadConcepts() })
</script>

<style scoped>
.concepts-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
</style>
