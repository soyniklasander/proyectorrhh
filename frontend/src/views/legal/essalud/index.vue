<template>
  <div class="essalud-page">
    <PageHeader title="ESSALUD" subtitle="Configuración de ESSALUD y entidades">
      <template #extra>
        <n-button type="primary" @click="showModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nueva Entidad
        </n-button>
      </template>
    </PageHeader>

    <n-grid :cols="24" :x-gap="24">
      <n-gi :span="16">
        <n-card title="ESSALUD" :bordered="false" class="config-card">
          <n-form :model="essaludConfig" label-placement="top">
            <n-form-item label="Aportación Empleador (%)">
              <n-input-number v-model:value="essaludConfig.aportacion" :min="0" :max="100" :precision="2" />
            </n-form-item>
            <n-form-item label="ESSALUD Vida (%)">
              <n-input-number v-model:value="essaludConfig.essalud_vida" :min="0" :max="100" :precision="2" />
            </n-form-item>
            <n-form-item label="EPS Activo">
              <n-switch v-model:value="essaludConfig.eps_activo" />
            </n-form-item>
            <n-button type="primary" @click="saveConfig">Guardar</n-button>
          </n-form>
        </n-card>
      </n-gi>
      <n-gi :span="8">
        <n-card title="Entidades" :bordered="false" class="table-card">
          <n-data-table :columns="columns" :data="entities" :loading="loading" :bordered="false" :pagination="false" />
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NIcon, NCard, NForm, NFormItem, NInputNumber, NSwitch, NGrid, NGi, NTag, useMessage, type DataTableColumns } from 'naive-ui'
import { AddOutline, CreateOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'

interface Entity { id: string; nombre: string; tipo: string; activa: boolean; }

const message = useMessage()
const loading = ref(false)
const showModal = ref(false)
const essaludConfig = ref({ aportacion: 9, essalud_vida: 0.53, eps_activo: true })
const entities = ref<Entity[]>([])

const columns: DataTableColumns<Entity> = [
  { title: 'Nombre', key: 'nombre', width: 200 },
  { title: 'Tipo', key: 'tipo', width: 100 },
  { title: 'Activa', key: 'activa', width: 80, render: (row) => h(NTag, { type: row.activa ? 'success' : 'default', size: 'small' }, () => row.activa ? 'Sí' : 'No') }
]

const loadData = async () => { /* TODO */ }
const saveConfig = () => { message.success('Configuración guardada') }
onMounted(() => { loadData() })
</script>

<style scoped>
.essalud-page { padding: 0; }
.config-card, .table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); margin-bottom: 16px; }
</style>
