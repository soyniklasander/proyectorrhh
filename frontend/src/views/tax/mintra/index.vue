<template>
  <div class="mintra-page">
    <PageHeader title="MINTRA" subtitle="Reportes y trámites ante Ministerio de Trabajo">
      <template #extra>
        <n-button type="primary" @click="showModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nuevo Reporte
        </n-button>
      </template>
    </PageHeader>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="t-registro" tab="T-Registro">
        <n-card :bordered="false">
          <n-alert type="info" style="margin-bottom: 16px">
            El T-Registro es el registro de trabajadores sujetos al régimen de trabajo agrario.
          </n-alert>
          <n-data-table :columns="columns" :data="tRegistro" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="t-libreta" tab="T-Libreta">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="tLibreta" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="constancias" tab="Constancias">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="constancias" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NIcon, NCard, NDataTable, NTabs, NTabPane, NTag, NAlert, useMessage, type DataTableColumns } from 'naive-ui'
import { AddOutline, DownloadOutline, EyeOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'

interface Report {
  id: string
  tipo: string
  periodo: string
  trabajadores: number
  fecha_generacion: string
  estado: string
}

const message = useMessage()
const loading = ref(false)
const activeTab = ref('t-registro')
const tRegistro = ref<Report[]>([])
const tLibreta = ref<Report[]>([])
const constancias = ref<Report[]>([])
const showModal = ref(false)

const columns: DataTableColumns<Report> = [
  { title: 'Período', key: 'periodo', width: 100 },
  { title: 'Generación', key: 'fecha_generacion', width: 120 },
  { title: 'Trabajadores', key: 'trabajadores', width: 120 },
  {
    title: 'Estado',
    key: 'estado',
    width: 120,
    render: (row) => h(NTag, { type: row.estado === 'ENVIADO' ? 'success' : 'warning', size: 'small' }, () => row.estado)
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 150,
    render: (row) => h(NSpace, { size: 'small' }, () => [
      h(NButton, { size: 'small', secondary: true, onClick: () => viewDetails(row) }, { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }),
      h(NButton, { size: 'small', secondary: true, type: 'info', onClick: () => downloadFile(row) }, { icon: () => h(NIcon, null, { default: () => h(DownloadOutline) }) })
    ])
  }
]

const loadData = async () => { /* TODO */ }
const viewDetails = (row: Report) => { console.log('View:', row.id) }
const downloadFile = (row: Report) => { message.info('Descargando...') }
onMounted(() => { loadData() })
</script>

<style scoped>
.mintra-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
</style>
