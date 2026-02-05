<template>
  <div class="audit-page">
    <PageHeader title="Auditoría" subtitle="Historial de acciones y cambios en el sistema">
      <template #extra>
        <n-space>
          <n-date-picker v-model:value="dateRange" type="daterange" clearable />
          <n-input v-model:value="searchUser" placeholder="Buscar usuario..." style="width: 200px" clearable />
        </n-space>
      </template>
    </PageHeader>

    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="auditLogs"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :row-key="(row: Log) => row.id"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NIcon, NCard, NDataTable, NSpace, NTag, NDatePicker, NInput, useMessage, type DataTableColumns } from 'naive-ui'
import { EyeOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'

interface Log {
  id: string
  fecha: string
  usuario: string
  rol: string
  modulo: string
  accion: string
  entidad: string
  entidad_id: string
  ip: string
  detalles: string
}

const message = useMessage()
const loading = ref(false)
const auditLogs = ref<Log[]>([])
const dateRange = ref<[number, number] | null>(null)
const searchUser = ref('')
const pagination = { pageSize: 20 }

const columns: DataTableColumns<Log> = [
  { title: 'Fecha', key: 'fecha', width: 170 },
  { title: 'Usuario', key: 'usuario', width: 150 },
  { title: 'Rol', key: 'rol', width: 120 },
  { title: 'Módulo', key: 'modulo', width: 130 },
  {
    title: 'Acción',
    key: 'accion',
    width: 130,
    render: (row) => {
      const colors: Record<string, string> = {
        CREAR: 'success', ACTUALIZAR: 'warning', ELIMINAR: 'error', LOGIN: 'info', LOGOUT: 'default'
      }
      return h(NTag, { type: colors[row.accion] as any || 'default', size: 'small' }, () => row.accion)
    }
  },
  { title: 'Entidad', key: 'entidad', width: 150 },
  { title: 'IP', key: 'ip', width: 130 },
  {
    title: 'Detalles',
    key: 'detalles',
    ellipsis: { tooltip: true },
    render: (row) => row.detalles?.substring(0, 100) + (row.detalles?.length > 100 ? '...' : '')
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 80,
    render: (row) => h(NButton, { size: 'small', secondary: true, onClick: () => viewDetails(row) }, { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) })
  }
]

const loadAuditLogs = async () => { /* TODO */ }
const viewDetails = (row: Log) => { console.log('View:', row.id) }
onMounted(() => { loadAuditLogs() })
</script>

<style scoped>
.audit-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
</style>
