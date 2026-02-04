<template>
  <div class="documentos-table">
    <n-data-table
      :columns="columns"
      :data="documents"
      :loading="loading"
      :pagination="{ pageSize: 10 }"
      :bordered="false"
      :striped="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { NTag, NButton, NDataTable } from 'naive-ui'

const props = defineProps<{
  documents: any[]
  loading?: boolean
}>()

const emit = defineEmits(['view', 'download'])

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    'VIGENTE': 'success',
    'POR_VENCER': 'warning',
    'VENCIDO': 'error',
    'PENDIENTE': 'info'
  }
  return types[status] || 'default'
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-PE')
}

const columns = [
  {
    title: 'Empleado',
    key: 'nombreEmpleado',
    render(row: any) {
      return h('div', { class: 'empleado-info' }, [
        h('div', { style: 'font-weight: 600;' }, row.nombreEmpleado || ''),
        h('div', { style: 'font-size: 12px; color: #6b7280;' }, row.tipo || '')
      ])
    }
  },
  {
    title: 'Documento',
    key: 'nombreArchivo',
    render(row: any) {
      return h('div', { class: 'doc-info' }, [
        h('div', { style: 'font-weight: 500;' }, row.nombreArchivo || ''),
        h('div', { style: 'font-size: 12px; color: #6b7280;' }, row.tipo === 'DNI' ? 'Documento de Identidad' : row.tipo)
      ])
    }
  },
  {
    title: 'Fecha Subida',
    key: 'fechaSubida',
    width: 120,
    render(row: any) {
      return formatDate(row.fechaSubida)
    }
  },
  {
    title: 'Vencimiento',
    key: 'fechaVencimiento',
    width: 130,
    render(row: any) {
      if (!row.fechaVencimiento) return h('span', { style: 'color: #9ca3af;' }, 'Sin vencimiento')
      const isExpired = new Date(row.fechaVencimiento) < new Date()
      return h('span', { 
        style: isExpired ? 'color: #ef4444; font-weight: 600;' : 'color: #6b7280;' 
      }, formatDate(row.fechaVencimiento))
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 110,
    render(row: any) {
      return h(NTag, { 
        type: getStatusType(row.estado), 
        size: 'small', 
        round: true 
      }, () => row.estado || 'PENDIENTE')
    }
  },
  {
    title: 'Requerido',
    key: 'required',
    width: 100,
    render(row: any) {
      return h(NTag, { 
        type: row.required ? 'error' : 'default', 
        size: 'small' 
      }, () => row.required ? 'Sí' : 'No')
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 140,
    render(row: any) {
      return h('div', { class: 'actions' }, [
        h(NButton, { 
          size: 'small', 
          type: 'info',
          onClick: () => emit('view', row)
        }, () => 'Ver'),
        h(NButton, { 
          size: 'small', 
          type: 'primary',
          onClick: () => emit('download', row)
        }, () => '⬇')
      ])
    }
  }
]
</script>

<style scoped>
.documentos-table {
  padding: 16px 0;
}

.empleado-info {
  display: flex;
  flex-direction: column;
}

.doc-info {
  display: flex;
  flex-direction: column;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>