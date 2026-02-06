<template>
  <AppleContainer>
    <ApplePageHeader title="Conceptos de Nómina" subtitle="Catálogo de ingresos y deducciones">
      <template #actions>
        <AppleButton variant="primary" @click="showModal = true">
          Nuevo Concepto
        </AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <AppleTabs v-model="activeTab" :tabs="tabs">
        <template #tab="{ tab }">
          {{ tab.label }}
        </template>
        <template #default>
          <div v-show="activeTab === 'earnings'">
            <AppleTable :columns="columns" :data="earnings" :loading="loading" />
          </div>
          <div v-show="activeTab === 'deductions'">
            <AppleTable :columns="columns" :data="deductions" :loading="loading" />
          </div>
          <div v-show="activeTab === 'contributions'">
            <AppleTable :columns="columns" :data="contributions" :loading="loading" />
          </div>
        </template>
      </AppleTabs>
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTabs, AppleTable } from '@/components/apple'

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

interface Tab { label: string; value: string }

const tabs: Tab[] = [
  { label: 'Ingresos', value: 'earnings' },
  { label: 'Deducciones', value: 'deductions' },
  { label: 'Aportaciones', value: 'contributions' }
]

const loading = ref(false)
const activeTab = ref('earnings')
const earnings = ref<Concept[]>([])
const deductions = ref<Concept[]>([])
const contributions = ref<Concept[]>([])
const showModal = ref(false)

const columns = [
  { title: 'Código', key: 'codigo' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Naturaleza', key: 'naturaleza' },
  { title: 'Porcentaje', key: 'porcentaje', render: (row: Concept) => row.porcentaje ? `${row.porcentaje}%` : '-' },
  { title: 'Orden', key: 'orden' },
  { title: 'Activo', key: 'activo', render: (row: Concept) => row.activo ? 'Sí' : 'No' },
  { title: 'Acciones', key: 'actions', render: (row: Concept) => h('div', { style: 'display: flex; gap: 8px;' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => editConcept(row) }, () => 'Editar')]) }
]

const loadConcepts = async () => { /* TODO */ }
const editConcept = (row: Concept) => { console.log('Edit:', row.id) }
onMounted(() => { loadConcepts() })
</script>
