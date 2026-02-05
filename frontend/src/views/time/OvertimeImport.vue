<template>
  <div class="overtime-import">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Importar Horas Extras</h1>
        <p class="subtitle">Carga masiva de horas extras desde Excel.</p>
      </div>
      <div class="controls">
        <n-button @click="downloadTemplate">
          <template #icon><n-icon><DownloadOutline /></n-icon></template>
          Descargar Plantilla
        </n-button>
        <n-button type="primary" @click="showUploadModal = true">
          <template #icon><n-icon><CloudUploadOutline /></n-icon></template>
          Cargar Excel
        </n-button>
      </div>
    </div>

    <n-card :bordered="false" class="table-card">
      <template #header>
        <div class="card-header">
          <span>Historial de Cargas</span>
          <n-button size="small" quaternary @click="loadImports">
            <template #icon><n-icon><RefreshOutline /></n-icon></template>
          </n-button>
        </div>
      </template>

      <n-data-table
        :columns="columns"
        :data="imports"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :row-key="(row: Import) => row.id"
      />
    </n-card>

    <n-modal v-model:show="showUploadModal" style="width: 600px" preset="card" title="Cargar Archivo Excel">
      <div class="upload-container">
        <n-upload
          ref="uploadRef"
          :custom-request="handleCustomUpload"
          :max="1"
          accept=".xlsx,.xls,.csv"
          @change="handleFileChange"
          @remove="handleFileRemove"
        >
          <n-upload-dragger>
            <div style="margin-bottom: 12px">
              <n-icon size="48" :depth="3">
                <FolderOpenOutline />
              </n-icon>
            </div>
            <n-text style="font-size: 16px">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </n-text>
            <n-p depth="3" style="margin: 8px 0 0 0">
              Solo archivos .xlsx, .xls o .csv
            </n-p>
          </n-upload-dragger>
        </n-upload>

        <div v-if="previewData.length > 0" class="preview-section">
          <n-divider />
          <n-text strong>Vista Previa ({{ previewData.length }} registros)</n-text>
          <n-data-table
            :columns="previewColumns"
            :data="previewData.slice(0, 10)"
            :bordered="false"
            size="small"
            :pagination="false"
            max-height="300"
          />
          <n-text v-if="previewData.length > 10" depth="3" style="display: block; margin-top: 8px">
            ... y {{ previewData.length - 10 }} registros más
          </n-text>
        </div>

        <n-alert v-if="uploadError" type="error" style="margin-top: 16px">
          {{ uploadError }}
        </n-alert>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="closeUploadModal">Cancelar</n-button>
          <n-button
            type="primary"
            :loading="uploading"
            :disabled="!file || previewData.length === 0"
            @click="processUpload"
          >
            Procesar {{ previewData.length > 0 ? `(${previewData.length} registros)` : '' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetailModal" style="width: 800px" preset="card" title="Detalle de Carga">
      <div v-if="selectedImport" class="detail-container">
        <n-descriptions :column="3" label-placement="left" bordered>
          <n-descriptions-item label="Archivo">{{ selectedImport.filename }}</n-descriptions-item>
          <n-descriptions-item label="Estado">
            <n-tag :type="getStatusType(selectedImport.status)">{{ selectedImport.status }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="Registros">{{ selectedImport.total_records }}</n-descriptions-item>
          <n-descriptions-item label="Fecha">
            {{ formatDate(selectedImport.createdAt) }}
          </n-descriptions-item>
          <n-descriptions-item label="Procesados">{{ selectedImport.processed_records }}</n-descriptions-item>
          <n-descriptions-item label="Usuario">{{ selectedImport.uploaded_by }}</n-descriptions-item>
        </n-descriptions>

        <n-divider />

        <n-button type="info" @click="goToReview(selectedImport.id)">
          <template #icon><n-icon><EyeOutline /></n-icon></template>
          Revisar Registros
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NIcon, NCard, NDataTable, NUpload, NUploadDragger,
  NText, NP, NDivider, NModal, NDescriptions, NDescriptionsItem,
  NTag, NAlert, useMessage, type DataTableColumns, type UploadFileInfo
} from 'naive-ui'
import {
  DownloadOutline, CloudUploadOutline, RefreshOutline, FolderOpenOutline,
  EyeOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'
import * as XLSX from 'xlsx'

interface Import {
  id: string
  filename: string
  uploaded_by: string
  status: string
  total_records: number
  processed_records: number
  createdAt: string
}

interface PreviewRecord {
  empleado_codigo: string
  empleado_dni?: string
  fecha: string
  horas: number
  tipo: string
  motivo?: string
  proyecto_codigo?: string
}

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const uploading = ref(false)
const imports = ref<Import[]>([])
const showUploadModal = ref(false)
const showDetailModal = ref(false)
const selectedImport = ref<Import | null>(null)
const file = ref<UploadFileInfo | null>(null)
const previewData = ref<PreviewRecord[]>([])
const uploadError = ref('')
const uploadRef = ref()

const pagination = { pageSize: 10 }

const formatDate = (val: string) =>
  val ? new Date(val).toLocaleString('es-PE') : '-'

const getStatusType = (status: string) => {
  switch (status) {
    case 'PENDIENTE': return 'warning'
    case 'REVISION': return 'info'
    case 'PROCESADO': return 'success'
    case 'RECHAZADO': return 'error'
    default: return 'default'
  }
}

const columns: DataTableColumns<Import> = [
  { title: 'Archivo', key: 'filename', width: 250 },
  {
    title: 'Estado',
    key: 'status',
    width: 120,
    render: (row) => h(NTag, { type: getStatusType(row.status), size: 'small' }, () => row.status)
  },
  { title: 'Registros', key: 'total_records', width: 100 },
  { title: 'Procesados', key: 'processed_records', width: 110 },
  {
    title: 'Fecha',
    key: 'createdAt',
    width: 180,
    render: (row) => formatDate(row.createdAt)
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 120,
    render: (row) => h(
      NButton,
      { size: 'small', secondary: true, onClick: () => viewDetail(row) },
      { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }
    )
  }
]

const previewColumns: DataTableColumns<PreviewRecord> = [
  { title: 'Código', key: 'empleado_codigo', width: 100 },
  { title: 'DNI', key: 'empleado_dni', width: 100 },
  { title: 'Fecha', key: 'fecha', width: 110 },
  { title: 'Horas', key: 'horas', width: 80 },
  { title: 'Tipo', key: 'tipo', width: 120 },
  { title: 'Motivo', key: 'motivo', width: 200 }
]

const loadImports = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/overtime/imports')
    if (data.success) {
      imports.value = data.data
    }
  } catch (error) {
    console.error(error)
    message.error('Error al cargar cargas')
  } finally {
    loading.value = false
  }
}

const downloadTemplate = () => {
  const headers = ['empleado_codigo', 'empleado_dni', 'fecha', 'horas', 'tipo', 'motivo', 'proyecto_codigo']
  const example = [
    { empleado_codigo: 'EMP-001', empleado_dni: '12345678', fecha: '2024-02-15', horas: 2, tipo: 'ORDINARIA', motivo: 'Cierre de mes', proyecto_codigo: 'PRJ01' },
    { empleado_codigo: 'EMP-002', empleado_dni: '87654321', fecha: '2024-02-15', horas: 3, tipo: 'NOCTURNA', motivo: 'Mantenimiento', proyecto_codigo: '' }
  ]

  const ws = XLSX.utils.json_to_sheet(example, { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'HorasExtras')
  XLSX.writeFile(wb, 'plantilla_horas_extras.xlsx')
  message.success('Plantilla descargada')
}

const handleFileChange = (options: { file: UploadFileInfo }) => {
  file.value = options.file
  uploadError.value = ''

  if (options.file.file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet)
        previewData.value = json as PreviewRecord[]
      } catch (error) {
        uploadError.value = 'Error al leer el archivo. Verifica el formato.'
        previewData.value = []
      }
    }
    reader.readAsArrayBuffer(options.file.file)
  }
}

const handleFileRemove = () => {
  file.value = null
  previewData.value = []
  uploadError.value = ''
}

const handleCustomUpload = () => {
  return false
}

const closeUploadModal = () => {
  showUploadModal.value = false
  file.value = null
  previewData.value = []
  uploadError.value = ''
}

const processUpload = async () => {
  if (!file.value || previewData.value.length === 0) return

  uploading.value = true
  try {
    const { data } = await api.post('/overtime/import', {
      filename: file.value.name,
      records: previewData.value
    })

    if (data.success) {
      await api.post(`/overtime/import/${data.id}/process`, {
        records: previewData.value
      })

      message.success(`${previewData.value.length} registros procesados`)
      closeUploadModal()
      loadImports()
    }
  } catch (error) {
    console.error(error)
    message.error('Error al procesar archivo')
  } finally {
    uploading.value = false
  }
}

const viewDetail = (imp: Import) => {
  selectedImport.value = imp
  showDetailModal.value = true
}

const goToReview = (importId: string) => {
  showDetailModal.value = false
  router.push(`/time/overtime/review?importId=${importId}`)
}

onMounted(() => {
  loadImports()
})
</script>

<style scoped>
.overtime-import {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.controls {
  display: flex;
  gap: 12px;
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

.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.upload-container {
  padding: 10px 0;
}

.preview-section {
  margin-top: 16px;
}
</style>
