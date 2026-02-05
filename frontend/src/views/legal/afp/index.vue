<template>
  <div class="afp-page">
    <PageHeader title="AFP - Sistema Privado de Pensiones" subtitle="Configuración de AFP y tasas">
      <template #extra>
        <n-button type="primary" @click="showModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nueva AFP
        </n-button>
      </template>
    </PageHeader>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="afps" tab="AFP">
        <n-card :bordered="false">
          <n-data-table :columns="columns" :data="afps" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="rates" tab="Tasas Vigentes">
        <n-card :bordered="false">
          <n-data-table :columns="rateColumns" :data="rates" :loading="loading" :bordered="false" />
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NIcon, NCard, NDataTable, NTabs, NTabPane, NTag, useMessage, type DataTableColumns } from 'naive-ui'
import { AddOutline, CreateOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'

interface AFP { id: string; nombre: string; sigla: string;保险公司: string; onp: boolean; }

const message = useMessage()
const loading = ref(false)
const activeTab = ref('afps')
const afps = ref<AFP[]>([])
const rates = ref<any[]>([])
const showModal = ref(false)

const columns: DataTableColumns<AFP> = [
  { title: 'Nombre', key: 'nombre', width: 200 },
  { title: 'Sigla', key: 'sigla', width: 100 },
  { title: '保险公司', key: '保险公司', width: 150 },
  { title: 'ONP', key: 'onp', width: 80, render: (row) => h(NTag, { type: row.onp ? 'warning' : 'info', size: 'small' }, () => row.onp ? 'Sí' : 'No') },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render: (row) => h(NButton, { size: 'small', secondary: true, onClick: () => editAFP(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) })
  }
]

const rateColumns: DataTableColumns<any> = [
  { title: 'AFP', key: 'afp', width: 150 },
  { title: 'Aporte', key: 'aporte', width: 100, render: (row) => `${row.aporte}%` },
  { title: 'Seguro', key: 'seguro', width: 100, render: (row) => `${row.seguro}%` },
  { title: 'Comisión', key: 'comision', width: 100, render: (row) => `${row.comision}%` },
  { title: 'Total', key: 'total', width: 100, render: (row) => h('strong', null, `${row.total}%`) },
  { title: 'Vigente desde', key: 'desde', width: 120 }
]

const loadData = async () => { /* TODO */ }
const editAFP = (row: AFP) => { console.log('Edit:', row.id) }
onMounted(() => { loadData() })
</script>

<style scoped>
.afp-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
</style>
