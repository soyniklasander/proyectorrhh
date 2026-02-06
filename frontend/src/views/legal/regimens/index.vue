<template>
  <AppleContainer>
    <ApplePageHeader title="Regímenes Laborales" subtitle="Configuración de regímenes laborales (CAS, CPP, 728, etc.)">
      <template #actions>
        <AppleButton variant="primary" @click="showModal = true">
          Nuevo Régimen
        </AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <AppleTable :columns="columns" :data="regimens" :loading="loading" :row-key="(row: Regimen) => row.id" />
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTable } from '@/components/apple'

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

const loading = ref(false)
const regimens = ref<Regimen[]>([])
const showModal = ref(false)

const columns = [
  { title: 'Código', key: 'codigo' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Essalud', key: 'essalud', render: (row: Regimen) => `${row.essalud}%` },
  { title: 'Senati', key: 'senati', render: (row: Regimen) => `${row.senati}%` },
  { title: 'EPS', key: 'eps', render: (row: Regimen) => `${row.eps}%` },
  { title: 'SCTR', key: 'scrt', render: (row: Regimen) => `${row.scrt}%` },
  { title: 'Activo', key: 'activo', render: (row: Regimen) => row.activo ? 'Sí' : 'No' },
  { title: 'Acciones', key: 'actions', render: (row: Regimen) => h('div', { style: 'display: flex; gap: 8px;' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => editRegimen(row) }, () => 'Editar')]) }
]

const loadRegimens = async () => { /* TODO */ }
const editRegimen = (row: Regimen) => { console.log('Edit:', row.id) }
onMounted(() => { loadRegimens() })
</script>
