<template>
  <div class="overtime-settings">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Configuración de Horas Extras</h1>
        <p class="subtitle">Reglas, tipos y parámetros del sistema.</p>
      </div>
    </div>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="rules" tab="📊 Reglas Generales">
        <n-card :bordered="false" class="settings-card">
          <n-form :model="rules" label-placement="top">
            <n-grid :cols="2" :x-gap="24">
              <n-gi>
                <n-form-item label="Promedio de Referencia (horas)" tooltip="Horas promedio mensual usado como base para alertas">
                  <n-input-number
                    v-model:value="rules.promedio_referencia"
                    :min="1"
                    :max="200"
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Límite Legal (horas)" tooltip="Límite legal mensual (50 horas en Perú)">
                  <n-input-number
                    v-model:value="rules.limite_legal"
                    :min="1"
                    :max="500"
                    style="width: 100%"
                  />
                </n-form-item>
              </n-gi>
            </n-grid>

            <n-divider>Porcentajes de Alerta</n-divider>

            <n-grid :cols="3" :x-gap="16">
              <n-gi>
                <n-form-item label="Alerta Amarilla (> %)">
                  <n-input-number
                    v-model:value="rules.alerta_amarilla"
                    :min="1"
                    :max="100"
                    style="width: 100%"
                  >
                    <template #suffix>%</template>
                  </n-input-number>
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Alerta Naranja (> %)">
                  <n-input-number
                    v-model:value="rules.alerta_naranja"
                    :min="1"
                    :max="100"
                    style="width: 100%"
                  >
                    <template #suffix>%</template>
                  </n-input-number>
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="Alerta Roja (> %)">
                  <n-input-number
                    v-model:value="rules.alerta_roja"
                    :min="1"
                    :max="100"
                    style="width: 100%"
                  >
                    <template #suffix>%</template>
                  </n-input-number>
                </n-form-item>
              </n-gi>
            </n-grid>

            <n-divider>Opciones</n-divider>

            <n-space vertical>
              <n-checkbox v-model:checked="rules.requiere_aprobacion_ci">
                Requiere aprobación de Control Interno
              </n-checkbox>
              <n-checkbox v-model:checked="rules.ver_proyectos_en_reporte">
                Mostrar proyectos en reportes
              </n-checkbox>
            </n-space>

            <n-divider />

            <n-button type="primary" size="large" :loading="saving" @click="saveRules">
              <template #icon><n-icon><SaveOutline /></n-icon></template>
              Guardar Configuración
            </n-button>
          </n-form>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="types" tab="💰 Tipos de Hora Extra">
        <n-card :bordered="false" class="settings-card">
          <template #header>
            <div class="card-header">
              <span>Tipos de Hora Extra</span>
              <n-button type="primary" size="small" @click="showAddType = true">
                <template #icon><n-icon><AddOutline /></n-icon></template>
                Nuevo Tipo
              </n-button>
            </div>
          </template>

          <n-data-table
            :columns="typeColumns"
            :data="tipos"
            :loading="loadingTypes"
            :bordered="false"
            :row-key="(row: Tipo) => row.id"
          />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="summary" tab="📈 Resumen Mensual">
        <n-card :bordered="false" class="settings-card">
          <template #header>
            <div class="card-header">
              <span>Resumen de {{ currentMonth }}</span>
              <n-date-picker
                v-model:value="summaryMonth"
                type="month"
                @update:value="loadSummary"
              />
            </div>
          </template>

          <n-spin :show="loadingSummary">
            <n-grid :cols="4" :x-gap="16" style="margin-bottom: 24px">
              <n-gi>
                <n-statistic label="Total Registros" :value="summary?.total?.total_registros || 0" />
              </n-gi>
              <n-gi>
                <n-statistic label="Total Horas" :value="summary?.total?.total_horas || 0">
                  <template #suffix>h</template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Pendientes" :value="summary?.total?.pending || 0">
                  <template #suffix>
                    <n-tag type="warning" size="small">{{ summary?.total?.pending || 0 }}</n-tag>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Aprobados CI" :value="summary?.total?.approved_ci || 0">
                  <template #suffix>
                    <n-tag type="success" size="small">{{ summary?.total?.approved_ci || 0 }}</n-tag>
                  </template>
                </n-statistic>
              </n-gi>
            </n-grid>

            <n-divider>Por Departamento</n-divider>

            <n-data-table
              :columns="deptColumns"
              :data="summary?.por_departamento || []"
              :bordered="false"
              size="small"
              :pagination="false"
            />

            <n-divider>Por Tipo</n-divider>

            <n-data-table
              :columns="typeSummaryColumns"
              :data="summary?.por_tipo || []"
              :bordered="false"
              size="small"
              :pagination="false"
            />
          </n-spin>
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showAddType" style="width: 500px" preset="card" title="Nuevo Tipo de Hora Extra">
      <n-form :model="newType" label-placement="top">
        <n-form-item label="Nombre" required>
          <n-input v-model:value="newType.nombre" placeholder="Ej: ORDINARIA, NOCTURNA, FERIADOS" />
        </n-form-item>
        <n-form-item label="Multiplicador" required>
          <n-input-number
            v-model:value="newType.multiplicador"
            :min="0.5"
            :max="5"
            :step="0.25"
            :precision="2"
            style="width: 100%"
          >
            <template #suffix>x</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="Orden">
          <n-input-number v-model:value="newType.orden" :min="0" style="width: 100%" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="showAddType = false">Cancelar</n-button>
          <n-button type="primary" :loading="savingType" @click="saveType">
            Crear Tipo
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NTabs, NTabPane, NForm, NFormItem,
  NInputNumber, NCheckbox, NDataTable, NSpace, NDivider, NStatistic,
  NGrid, NGi, NModal, NInput, NTag, NSpin, useMessage, type DataTableColumns
} from 'naive-ui'
import {
  SaveOutline, AddOutline, TrashOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'
import dayjs from 'dayjs'

interface Tipo {
  id: string
  nombre: string
  multiplicador: number
  orden: number
}

interface Rules {
  promedio_referencia: number
  limite_legal: number
  alerta_amarilla: number
  alerta_naranja: number
  alerta_roja: number
  requiere_aprobacion_ci: boolean
  ver_proyectos_en_reporte: boolean
}

const message = useMessage()
const activeTab = ref('rules')
const saving = ref(false)
const savingType = ref(false)
const loadingTypes = ref(false)
const loadingSummary = ref(false)

const rules = ref<Rules>({
  promedio_referencia: 20,
  limite_legal: 50,
  alerta_amarilla: 10,
  alerta_naranja: 20,
  alerta_roja: 30,
  requiere_aprobacion_ci: true,
  ver_proyectos_en_reporte: false
})

const tipos = ref<Tipo[]>([])
const showAddType = ref(false)
const newType = ref({ nombre: '', multiplicador: 1.0, orden: 0 })

const summaryMonth = ref(Date.now())
const summary = ref<any>(null)

const currentMonth = computed(() =>
  dayjs(summaryMonth.value).format('MMMM YYYY').toUpperCase()
)

const typeColumns: DataTableColumns<Tipo> = [
  { title: 'Nombre', key: 'nombre', width: 200 },
  {
    title: 'Multiplicador',
    key: 'multiplicador',
    width: 150,
    render: (row) => `${row.multiplicador}x`
  },
  { title: 'Orden', key: 'orden', width: 100 },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render: (row) => h(
      NButton,
      { size: 'small', type: 'error', secondary: true, onClick: () => deleteType(row) },
      { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) }
    )
  }
]

const deptColumns = [
  { title: 'Departamento', key: 'departamento', width: 200 },
  { title: 'Horas', key: 'horas', width: 120 },
  { title: 'Registros', key: 'registros', width: 100 }
]

const typeSummaryColumns = [
  { title: 'Tipo', key: 'tipo', width: 200 },
  { title: 'Horas', key: 'horas', width: 120 },
  { title: 'Registros', key: 'registros', width: 100 }
]

const loadRules = async () => {
  try {
    const { data } = await api.get('/overtime/rules')
    if (data.success && data.data) {
      rules.value = {
        promedio_referencia: data.data.promedio_referencia || 20,
        limite_legal: data.data.limite_legal || 50,
        alerta_amarilla: data.data.alerta_amarilla || 10,
        alerta_naranja: data.data.alerta_naranja || 20,
        alerta_roja: data.data.alerta_roja || 30,
        requiere_aprobacion_ci: data.data.requiere_aprobacion_ci !== false,
        ver_proyectos_en_reporte: data.data.ver_proyectos_en_reporte || false
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const saveRules = async () => {
  saving.value = true
  try {
    const { data } = await api.put('/overtime/rules', rules.value)
    if (data.success) {
      message.success('Configuración guardada')
    }
  } catch (error) {
    console.error(error)
    message.error('Error al guardar')
  } finally {
    saving.value = false
  }
}

const loadTipos = async () => {
  loadingTypes.value = true
  try {
    const { data } = await api.get('/overtime/tipos')
    if (data.success) {
      tipos.value = data.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loadingTypes.value = false
  }
}

const saveType = async () => {
  if (!newType.value.nombre) {
    message.error('Ingrese un nombre')
    return
  }

  savingType.value = true
  try {
    const { data } = await api.post('/overtime/tipos', newType.value)
    if (data.success) {
      message.success('Tipo creado')
      showAddType.value = false
      newType.value = { nombre: '', multiplicador: 1.0, orden: 0 }
      loadTipos()
    }
  } catch (error) {
    console.error(error)
    message.error('Error al crear tipo')
  } finally {
    savingType.value = false
  }
}

const deleteType = async (tipo: Tipo) => {
  try {
    const { data } = await api.delete(`/overtime/tipos/${tipo.id}`)
    if (data.success) {
      message.success('Tipo desactivado')
      loadTipos()
    }
  } catch (error) {
    console.error(error)
    message.error('Error al eliminar')
  }
}

const loadSummary = async () => {
  loadingSummary.value = true
  const mes = dayjs(summaryMonth.value).format('YYYY-MM')
  try {
    const { data } = await api.get(`/overtime/reports/summary?mes=${mes}`)
    if (data.success) {
      summary.value = data.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loadingSummary.value = false
  }
}

onMounted(() => {
  loadRules()
  loadTipos()
  loadSummary()
})
</script>

<style scoped>
.overtime-settings {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
  margin: 4px 0 0;
}

.settings-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
