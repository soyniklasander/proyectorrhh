<template>
  <AppleContainer>
    <ApplePageHeader title="ESSALUD" subtitle="Configuración de ESSALUD y entidades">
      <template #actions>
        <AppleButton variant="primary" @click="showModal = true">
          Nueva Entidad
        </AppleButton>
      </template>
    </ApplePageHeader>

    <AppleGrid :cols="2" :x-gap="24">
      <AppleCard title="ESSALUD">
        <AppleFormItem label="Aportación Empleador (%)">
          <n-input-number v-model:value="essaludConfig.aportacion" :min="0" :max="100" :precision="2" style="width: 100%;" />
        </AppleFormItem>
        <AppleFormItem label="ESSALUD Vida (%)">
          <n-input-number v-model:value="essaludConfig.essalud_vida" :min="0" :max="100" :precision="2" style="width: 100%;" />
        </AppleFormItem>
        <AppleFormItem label="EPS Activo">
          <AppleSwitch v-model="essaludConfig.eps_activo" />
        </AppleFormItem>
        <AppleButton variant="primary" @click="saveConfig">Guardar</AppleButton>
      </AppleCard>

      <AppleCard title="Entidades">
        <AppleTable :columns="columns" :data="entities" :loading="loading" :pagination="false" />
      </AppleCard>
    </AppleGrid>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NInputNumber } from 'naive-ui'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleGrid, AppleFormItem, AppleSwitch, AppleTable } from '@/components/apple'

interface Entity { id: string; nombre: string; tipo: string; activa: boolean; }

const loading = ref(false)
const showModal = ref(false)
const essaludConfig = ref({ aportacion: 9, essalud_vida: 0.53, eps_activo: true })
const entities = ref<Entity[]>([])

const columns = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Activa', key: 'activa', render: (row: Entity) => row.activa ? 'Sí' : 'No' }
]

const loadData = async () => { /* TODO */ }
const saveConfig = () => { alert('Configuración guardada') }
onMounted(() => { loadData() })
</script>
