<template>
  <div class="regimens-page">
    <PageHeader title="Regímenes Laborales" subtitle="Configuración de regímenes laborales (CAS, CPP, 728, etc.)">
      <template #extra>
        <n-button type="primary" @click="showModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nuevo Régimen
        </n-button>
      </template>
    </PageHeader>

    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="regimens"
        :loading="loading"
        :bordered="false"
        :row-key="(row: Regimen) => row.id"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NIcon, NCard, NDataTable, NTag, useMessage, type DataTableColumns } from 'naive-ui'
import { AddOutline, CreateOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'

interface Regimen {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  essalud: number
  senati: number
  eps: number
  scrt: number
  activo: boolean
}

const message = useMessage()
const loading = ref(false)
const regimens = ref<Regimen[]>([])
const showModal = ref(false)

const columns: DataTableColumns<Regimen> = [
  { title: 'Código', key: 'codigo', width: 100 },
  { title: 'Nombre', key: 'nombre', width: 200 },
  { title: 'Essalud', key: 'essalud', width: 80, render: (row) => `${row.essalud}%` },
  { title: 'Senati', key: 'senati', width: 80, render: (row) => `${row.senati}%` },
  { title: 'EPS', key: 'eps', width: 80, render: (row) => `${row.eps}%` },
  { title: 'SCTR', key: 'scrt', width: 80, render: (row) => `${row.scrt}%` },
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
    render: (row) => h(NButton, { size: 'small', secondary: true, onClick: () => editRegimen(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) })
  }
]

const loadRegimens = async () => { /* TODO */ }
const editRegimen = (row: Regimen) => { console.log('Edit:', row.id) }
onMounted(() => { loadRegimens() })
</script>

<style scoped>
.regimens-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
</style>
