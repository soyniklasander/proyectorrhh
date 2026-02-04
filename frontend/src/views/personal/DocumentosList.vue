<template>
  <div class="documentos-module">
    <div class="module-header">
      <h3>Gestión de Documentos del Personal</h3>
      <p>Documentos requeridos, opcionales y vencimientos por empleado</p>
    </div>

    <div class="stats-row">
      <div class="stat-card required">
        <div class="stat-value">{{ stats.required }}</div>
        <div class="stat-label">Documentos Requeridos</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">Pendientes</div>
      </div>
      <div class="stat-card expiring">
        <div class="stat-value">{{ stats.expiring }}</div>
        <div class="stat-label">Por Vencer</div>
      </div>
      <div class="stat-card expired">
        <div class="stat-value">{{ stats.expired }}</div>
        <div class="stat-label">Vencidos</div>
      </div>
    </div>

    <div class="filters-bar">
      <n-input v-model:value="search" placeholder="Buscar empleado..." class="search-input" />
      <n-select v-model:value="filterTipo" :options="tipoOptions" placeholder="Tipo documento" />
      <n-select v-model:value="filterEstado" :options="estadoOptions" placeholder="Estado" />
      <n-button type="primary" @click="showUploadModal = true">
        📤 Subir Documento
      </n-button>
    </div>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="todos" tab="Todos los Documentos">
        <DocumentosTable :documents="filteredDocuments" @view="viewDocument" @download="downloadDocument" />
      </n-tab-pane>
      <n-tab-pane name="requeridos" tab="Documentos Requeridos">
        <DocumentosTable :documents="requiredDocuments" @view="viewDocument" @download="downloadDocument" />
      </n-tab-pane>
      <n-tab-pane name="vencidos" tab="Vencidos">
        <DocumentosTable :documents="expiredDocuments" @view="viewDocument" @download="downloadDocument" />
      </n-tab-pane>
      <n-tab-pane name="plantillas" tab="Plantillas">
        <PlantillasDocumentos />
      </n-tab-pane>
    </n-tabs>

    <!-- Upload Modal -->
    <n-modal v-model:show="showUploadModal" preset="card" title="Subir Documento" style="width: 600px">
      <n-form ref="uploadForm" :model="uploadData" label-placement="top">
        <n-form-item label="Empleado" required>
          <n-select 
            v-model:value="uploadData.empleadoId" 
            :options="empleadosOptions"
            placeholder="Seleccionar empleado"
          />
        </n-form-item>
        <n-form-item label="Tipo de Documento" required>
          <n-select 
            v-model:value="uploadData.tipo" 
            :options="documentoTipoOptions"
            placeholder="Seleccionar tipo"
          />
        </n-form-item>
        <n-form-item label="Archivo" required>
          <n-upload
            action="#"
            :default-upload="false"
            @change="handleFileChange"
            :max="1"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          >
            <n-upload-dragger>
              <div style="margin-bottom: 12px">
                <n-icon size="48" :depth="3"><CloudUploadOutline /></n-icon>
              </div>
              <n-text style="font-size: 16px">Click o arrastra el archivo aquí</n-text>
              <n-p depth="3" style="margin: 8px 0 0 0">PDF, JPG, PNG, DOC, DOCX (máx. 10MB)</n-p>
            </n-upload-dragger>
          </n-upload>
        </n-form-item>
        <n-form-item label="Fecha de Vencimiento">
          <n-date-picker v-model:value="uploadData.fechaVencimiento" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Notas">
          <n-input 
            v-model:value="uploadData.notas" 
            type="textarea" 
            :rows="2"
            placeholder="Observaciones..."
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showUploadModal = false">Cancelar</n-button>
          <n-button type="primary" @click="uploadDocument" :loading="uploading">
            📤 Subir Documento
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { NInput, NSelect, NButton, NDatePicker, NUpload, NUploadDragger, NIcon, NText, NP, NModal, NForm, NFormItem } from 'naive-ui'
import { CloudUploadOutline } from '@vicons/ionicons5'
import DocumentosTable from './DocumentosTable.vue'
import PlantillasDocumentos from './PlantillasDocumentos.vue'

const message = useMessage()
const activeTab = ref('todos')
const search = ref('')
const filterTipo = ref('')
const filterEstado = ref('')
const showUploadModal = ref(false)
const uploading = ref(false)

const uploadData = ref({
  empleadoId: '',
  tipo: '',
  file: null as File | null,
  fechaVencimiento: null as number | null,
  notas: ''
})

const stats = ref({
  required: 8,
  pending: 15,
  expiring: 3,
  expired: 2
})

const documents = ref<any[]>([
  {
    id: 'DOC-001',
    empleadoId: 'emp-1',
    nombreEmpleado: 'Juan Pérez García',
    tipo: 'DNI',
    nombreArchivo: 'dni_juan_perez.pdf',
    fechaSubida: '2026-01-10',
    fechaVencimiento: '2030-01-10',
    estado: 'VIGENTE',
    required: true
  },
  {
    id: 'DOC-002',
    empleadoId: 'emp-1',
    nombreEmpleado: 'Juan Pérez García',
    tipo: 'CV',
    nombreArchivo: 'cv_juan_perez.pdf',
    fechaSubida: '2026-01-10',
    fechaVencimiento: null,
    estado: 'VIGENTE',
    required: false
  },
  {
    id: 'DOC-003',
    empleadoId: 'emp-2',
    nombreEmpleado: 'María López Torres',
    tipo: 'DNI',
    nombreArchivo: 'dni_maria_lopez.pdf',
    fechaSubida: '2025-06-15',
    fechaVencimiento: '2026-02-15',
    estado: 'POR_VENCER',
    required: true
  }
])

const tipoOptions = [
  { label: 'DNI', value: 'DNI' },
  { label: 'CV', value: 'CV' },
  { label: 'Contrato', value: 'CONTRATO' },
  { label: 'AFP', value: 'AFP' },
  { label: 'Cuenta Bancaria', value: 'CUENTA_BANCARIA' },
  { label: 'Certificado Estudios', value: 'CERTIFICADO' }
]

const estadoOptions = [
  { label: 'Todos', value: '' },
  { label: 'Vigente', value: 'VIGENTE' },
  { label: 'Por Vencer', value: 'POR_VENCER' },
  { label: 'Vencido', value: 'VENCIDO' }
]

const documentoTipoOptions = tipoOptions

const empleadosOptions = [
  { label: 'Juan Pérez García', value: 'emp-1' },
  { label: 'María López Torres', value: 'emp-2' }
]

const filteredDocuments = computed(() => {
  let data = documents.value
  
  if (search.value) {
    const s = search.value.toLowerCase()
    data = data.filter(d => 
      d.nombreEmpleado?.toLowerCase().includes(s)
    )
  }
  
  if (filterTipo.value) {
    data = data.filter(d => d.tipo === filterTipo.value)
  }
  
  if (filterEstado.value) {
    data = data.filter(d => d.estado === filterEstado.value)
  }
  
  return data
})

const requiredDocuments = computed(() => filteredDocuments.value.filter((d: any) => d.required))
const expiredDocuments = computed(() => filteredDocuments.value.filter((d: any) => d.estado === 'VENCIDO' || d.estado === 'POR_VENCER'))

const handleFileChange = (options: any) => {
  uploadData.value.file = options.file.file
}

const uploadDocument = async () => {
  if (!uploadData.value.empleadoId || !uploadData.value.tipo || !uploadData.value.file) {
    message.warning('Por favor completar los campos requeridos')
    return
  }
  
  uploading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('Documento subido correctamente')
    showUploadModal.value = false
    uploadData.value = { empleadoId: '', tipo: '', file: null, fechaVencimiento: null, notas: '' }
  } finally {
    uploading.value = false
  }
}

const viewDocument = (doc: any) => {
  console.log('View document:', doc)
  message.info(`Abriendo ${doc.nombreArchivo}...`)
}

const downloadDocument = (doc: any) => {
  console.log('Download document:', doc)
  message.success(`Descargando ${doc.nombreArchivo}...`)
}

onMounted(() => {
  // Cargar documentos desde API
})
</script>

<style scoped>
.documentos-module {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.module-header {
  text-align: center;
  margin-bottom: 32px;
}

.module-header h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.module-header p {
  color: #6b7280;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-card.required {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.stat-card.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.stat-card.expiring {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.stat-card.expired {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #6b21a8;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  margin-top: 4px;
}

.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  max-width: 280px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>