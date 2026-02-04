<template>
  <div class="documentos-salida">
    <div class="list-header">
      <h4>Documentos de Desvinculación</h4>
      <div class="header-actions">
        <n-button type="info" @click="generateAllDocuments">
          📄 Generar Todos
        </n-button>
        <n-button type="primary" @click="uploadDocument">
          📤 Subir Documento
        </n-button>
      </div>
    </div>

    <div class="documents-grid">
      <div class="document-card" v-for="doc in documentos" :key="doc.id">
        <div class="doc-icon">
          <span class="icon">📄</span>
        </div>
        <div class="doc-info">
          <h5>{{ doc.nombre }}</h5>
          <p>{{ doc.descripcion }}</p>
          <n-tag :type="doc.estado === 'GENERADO' ? 'success' : 'warning'" size="small">
            {{ doc.estado }}
          </n-tag>
        </div>
        <div class="doc-actions">
          <n-button 
            v-if="doc.estado === 'GENERADO'" 
            size="small" 
            type="primary"
            @click="downloadDocument(doc)"
          >
            Descargar
          </n-button>
          <n-button 
            v-else 
            size="small" 
            type="info"
            @click="generateDocument(doc)"
          >
            Generar
          </n-button>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <n-modal v-model:show="showUploadModal" preset="card" title="Subir Documento" style="width: 500px">
      <n-upload
        action="#"
        :default-upload="false"
        @change="handleUpload"
        :max="1"
      >
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3"><CloudUploadOutline /></n-icon>
          </div>
          <n-text style="font-size: 16px">Click o arrastra el archivo aquí</n-text>
          <n-p depth="3" style="margin: 8px 0 0 0">Solo archivos PDF, DOC, DOCX</n-p>
        </n-upload-dragger>
      </n-upload>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const showUploadModal = ref(false)

const documentos = ref([
  {
    id: 'doc-1',
    nombre: 'Carta de Renuncia',
    descripcion: 'Documento donde el trabajador presenta su renuncia voluntaria',
    estado: 'PENDIENTE',
    plantilla: 'carta-renuncia'
  },
  {
    id: 'doc-2',
    nombre: 'Carta de Despido',
    descripcion: 'Comunicación de término de vínculo laboral por causa justa',
    estado: 'PENDIENTE',
    plantilla: 'carta-despido'
  },
  {
    id: 'doc-3',
    nombre: 'Liquidación de Beneficios',
    detalle: 'Resumen de CTS, vacaciones truncas y gratificación proporcional',
    estado: 'GENERADO',
    plantilla: 'liquidacion-beneficios'
  },
  {
    id: 'doc-4',
    nombre: 'Constancia de Trabajo',
    descripcion: 'Documento que certifica el tiempo laborado en la empresa',
    estado: 'GENERADO',
    plantilla: 'constancia-trabajo'
  },
  {
    id: 'doc-5',
    nombre: 'Boleta de Liquidación',
    descripcion: 'Desglose de todos los conceptos pagados en la liquidación',
    estado: 'PENDIENTE',
    plantilla: 'boleta-liquidacion'
  },
  {
    id: 'doc-6',
    nombre: 'Declaración de Renuncia',
    descripcion: 'Declaración jurada de devolución de bienes de la empresa',
    estado: 'PENDIENTE',
    plantilla: 'declaracion-devolucion'
  }
])

const generateDocument = (doc: any) => {
  console.log('Generate document:', doc)
  message.info(`Generando ${doc.nombre}...`)
}

const downloadDocument = (doc: any) => {
  console.log('Download document:', doc)
  message.success(`Descargando ${doc.nombre}`)
}

const generateAllDocuments = () => {
  message.success('Generando todos los documentos...')
}

const uploadDocument = () => {
  showUploadModal.value = true
}

const handleUpload = (options: any) => {
  console.log('Upload:', options)
  message.success('Documento subido correctamente')
  showUploadModal.value = false
}
</script>

<style scoped>
.documentos-salida {
  padding: 16px 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.list-header h4 {
  font-size: 18px;
  color: #374151;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.document-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.document-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.doc-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.doc-icon .icon {
  font-size: 24px;
}

.doc-info {
  flex: 1;
}

.doc-info h5 {
  font-size: 16px;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.doc-info p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.doc-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>