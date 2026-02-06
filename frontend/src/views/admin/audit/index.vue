<template>
  <AppleContainer>
    <ApplePageHeader title="Auditoría" subtitle="Historial de acciones y cambios en el sistema">
      <template #actions>
        <AppleSearchInput v-model="searchUser" placeholder="Buscar usuario..." />
      </template>
    </ApplePageHeader>

    <AppleCard>
      <AppleTable :columns="columns" :data="auditLogs" />
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleTable, AppleSearchInput, AppleButton } from '@/components/apple'

interface Log { id: string; fecha: string; usuario: string; rol: string; modulo: string; accion: string; entidad: string; ip: string; detalles: string }

const loading = ref(false)
const auditLogs = ref<Log[]>([])
const searchUser = ref('')

const columns = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Usuario', key: 'usuario' },
  { title: 'Rol', key: 'rol' },
  { title: 'Módulo', key: 'modulo' },
  { title: 'Acción', key: 'accion', render: (row: any) => row.accion },
  { title: 'Entidad', key: 'entidad' },
  { title: 'IP', key: 'ip' },
  { title: 'Detalles', key: 'detalles', render: (row: any) => row.detalles?.substring(0, 100) + (row.detalles?.length > 100 ? '...' : '') },
  { title: 'Acciones', key: 'actions', render: (row: any) => h(AppleButton, { variant: 'ghost', size: 'small' }, () => 'Ver') }
]

const loadAuditLogs = async () => { /* TODO */ }
const viewDetails = (row: Log) => { console.log('View:', row.id) }
onMounted(() => { loadAuditLogs() })
</script>
