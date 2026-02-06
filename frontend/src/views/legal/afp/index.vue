<template>
  <AppleContainer>
    <ApplePageHeader title="AFP - Sistema Privado de Pensiones" subtitle="Configuración de AFP y tasas">
      <template #actions>
        <AppleButton variant="primary" @click="showModal = true">
          Nueva AFP
        </AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <AppleTabs v-model="activeTab" :tabs="tabs">
        <template #tab="{ tab }">
          {{ tab.label }}
        </template>
        <template #default>
          <div v-show="activeTab === 'afps'">
            <AppleTable :columns="columns" :data="afps" :loading="loading" />
          </div>
          <div v-show="activeTab === 'rates'">
            <AppleTable :columns="rateColumns" :data="rates" :loading="loading" />
          </div>
        </template>
      </AppleTabs>
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTabs, AppleTable } from '@/components/apple'

interface AFP { id: string; nombre: string; sigla: string;保险公司: string; onp: boolean; }

interface Tab { label: string; value: string }

const tabs: Tab[] = [
  { label: 'AFP', value: 'afps' },
  { label: 'Tasas Vigentes', value: 'rates' }
]

const loading = ref(false)
const activeTab = ref('afps')
const afps = ref<AFP[]>([])
const rates = ref<any[]>([])
const showModal = ref(false)

const columns = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Sigla', key: 'sigla' },
  { title: '保险公司', key: '保险公司' },
  { title: 'ONP', key: 'onp', render: (row: AFP) => row.onp ? 'Sí' : 'No' },
  { title: 'Acciones', key: 'actions', render: (row: AFP) => h('div', { style: 'display: flex; gap: 8px;' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => editAFP(row) }, () => 'Editar')]) }
]

const rateColumns = [
  { title: 'AFP', key: 'afp' },
  { title: 'Aporte', key: 'aporte', render: (row: any) => `${row.aporte}%` },
  { title: 'Seguro', key: 'seguro', render: (row: any) => `${row.seguro}%` },
  { title: 'Comisión', key: 'comision', render: (row: any) => `${row.comision}%` },
  { title: 'Total', key: 'total', render: (row: any) => `${row.total}%` },
  { title: 'Vigente desde', key: 'desde' }
]

const loadData = async () => { /* TODO */ }
const editAFP = (row: AFP) => { console.log('Edit:', row.id) }
onMounted(() => { loadData() })
</script>
