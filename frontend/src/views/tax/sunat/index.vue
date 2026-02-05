<template>
  <div class="sunat-page">
    <PageHeader title="SUNAT" subtitle="Declaraciones y pagos tributarios">
      <template #extra>
        <n-button type="primary" @click="showModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nueva Declaración
        </n-button>
      </template>
    </PageHeader>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="plame" tab="PLAME">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="plameData" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="pdt" tab="PDT 621">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="pdtData" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="retenciones" tab="Retenciones 4ta">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="retenciones" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NIcon, NCard, NDataTable, NTabs, NTabPane, NTag, useMessage, type DataTableColumns } from 'naive-ui'
import { AddOutline, DownloadOutline, EyeOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'

interface Declaration {
  id: string
  tipo: string
  periodo: string
  fecha_presentacion: string
  monto: number
  estado: string
  archivo: string
}

const message = useMessage()
const loading = ref(false)
const activeTab = ref('plame')
const plameData = ref<Declaration[]>([])
const pdtData = ref<Declaration[]>([])
const retenciones = ref<Declaration[]>([])
const showModal = ref(false)

const columns: DataTableColumns<Declaration> = [
  { title: 'Tipo', key: 'tipo', width: 120 },
  { title: 'Período', key: 'periodo', width: 100 },
  { title: 'Presentación', key: 'fecha_presentacion', width: 120 },
  { title: 'Monto', key: 'monto', width: 130, render: (row) => `S/ ${row.monto.toLocaleString()}` },
  {
    title: 'Estado',
    key: 'estado',
    width: 120,
    render: (row) => {
      const colors: Record<string, string> = { PAGADO: 'success', PENDIENTE: 'warning', VENCIDO: 'error' }
      return h(NTag, { type: colors[row.estado] as any || 'default', size: 'small' }, () => row.estado)
    }
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
const viewDetails = (row: Declaration) => { console.log('View:', row.id) }
const downloadFile = (row: Declaration) => { message.info('Descargando...') }
onMounted(() => { loadData() })
</script>

<style scoped>
.sunat-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
</style>
