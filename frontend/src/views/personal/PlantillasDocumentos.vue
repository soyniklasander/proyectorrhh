<template>
  <div class="plantillas-documentos">
    <div class="list-header">
      <h4>Plantillas de Documentos</h4>
      <n-button type="primary" @click="showAddTemplate = true">
        ➕ Nueva Plantilla
      </n-button>
    </div>

    <div class="plantillas-grid">
      <div class="plantilla-card" v-for="plantilla in plantillas" :key="plantilla.id">
        <div class="plantilla-icon">
          <span class="icon">📄</span>
        </div>
        <div class="plantilla-info">
          <h5>{{ plantilla.nombre }}</h5>
          <p>{{ plantilla.descripcion }}</p>
          <div class="plantilla-tags">
            <n-tag size="small" type="info">{{ plantilla.categoria }}</n-tag>
            <n-tag size="small">{{ plantilla.variablesCount }} variables</n-tag>
          </div>
        </div>
        <div class="plantilla-actions">
          <n-button size="small" type="info" @click="previewTemplate(plantilla)">
            Vista Previa
          </n-button>
          <n-button size="small" type="primary" @click="editTemplate(plantilla)">
            Editar
          </n-button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <n-modal v-model:show="showPreview" preset="card" :title="previewTemplateData?.nombre" style="width: 800px">
      <div class="template-preview">
        <pre>{{ previewTemplateData?.contenido }}</pre>
      </div>
      <template #footer>
        <n-button @click="showPreview = false">Cerrar</n-button>
        <n-button type="primary" @click="downloadTemplate">Descargar</n-button>
      </template>
    </n-modal>

    <!-- Add/Edit Template Modal -->
    <n-modal v-model:show="showAddTemplate" preset="card" :title="editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'" style="width: 800px">
      <n-form :model="templateForm" label-placement="top">
        <n-form-item label="Nombre de la Plantilla">
          <n-input v-model:value="templateForm.nombre" placeholder="Ej: Carta de Renuncia" />
        </n-form-item>
        <n-form-item label="Descripción">
          <n-input v-model:value="templateForm.descripcion" type="textarea" :rows="2" placeholder="Breve descripción..." />
        </n-form-item>
        <n-form-item label="Categoría">
          <n-select v-model:value="templateForm.categoria" :options="categoriaOptions" />
        </n-form-item>
        <n-form-item label="Contenido de la Plantilla">
          <n-input 
            v-model:value="templateForm.contenido" 
            type="textarea" 
            :rows="12"
            placeholder="Escribe la plantilla con variables como {{NOMBRE}}, {{DNI}}, etc."
          />
        </n-form-item>
        <n-form-item label="Variables Disponibles">
          <div class="variables-help">
            <n-tag 
              v-for="variable in variablesComunes" 
              :key="variable.value"
              class="variable-tag"
              @click="insertVariable(variable.value)"
            >
              {{ variable.label }}
            </n-tag>
          </div>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button @click="showAddTemplate = false">Cancelar</n-button>
        <n-button type="info" @click="previewTemplateFromForm">Vista Previa</n-button>
        <n-button type="primary" @click="saveTemplate">Guardar</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const showPreview = ref(false)
const showAddTemplate = ref(false)
const editingTemplate = ref(false)

const previewTemplateData = ref<any>(null)

const plantillas = ref([
  {
    id: 'PLT-001',
    nombre: 'Carta de Renuncia',
    descripcion: 'Plantilla estándar para renuncia voluntaria',
    categoria: 'DESVINCULACION',
    contenido: 'Carta de Renuncia\n\nPor medio de la presente, yo {{NOMBRE_COMPLETO}}, con DNI {{NUMERO_DOCUMENTO}}, trabajador de {{NOMBRE_EMPRESA}}, presento mi renuncia voluntaria al cargo de {{CARGO}}, con efectos a partir del {{FECHA_TERMINO}}.\n\nAtentamente,\n{{NOMBRE_COMPLETO}}\nDNI: {{NUMERO_DOCUMENTO}}',
    variablesCount: 6
  },
  {
    id: 'PLT-002',
    nombre: 'Carta de Despido',
    descripcion: 'Comunicación de despido por causa justa',
    categoria: 'DESVINCULACION',
    contenido: 'Carta de Despido\n\nEstimado/a {{NOMBRE_COMPLETO}}:\n\nPor medio de la presente, le comunicamos el término de su contrato de trabajo por causa justa conforme al artículo 25 del Decreto Legislativo 728.\n\nMotivo: {{MOTIVO_DESPIDO}}\n\nAtentamente,\n{{NOMBRE_EMPRESA}}',
    variablesCount: 4
  },
  {
    id: 'PLT-003',
    nombre: 'Constancia de Trabajo',
    descripcion: 'Certificado de tiempo de servicios',
    categoria: 'CONSTANCIAS',
    contenido: 'CONSTANCIA DE TRABAJO\n\nPor medio de la presente, {{NOMBRE_EMPRESA}} CERTIFICA que {{NOMBRE_COMPLETO}}, con DNI {{NUMERO_DOCUMENTO}}, ha laborado en nuestra empresa desde el {{FECHA_INICIO}} hasta el {{FECHA_TERMINO}} desempeñando el cargo de {{CARGO}}.\n\nEmitido para los fines que estime conveniente.\n\n{{NOMBRE_EMPRESA}}',
    variablesCount: 7
  },
  {
    id: 'PLT-004',
    nombre: 'Liquidación de Beneficios',
    detalle: 'Desglose de beneficios sociales al término de la relación laboral',
    categoria: 'LIQUIDACIONES',
    contenido: 'LIQUIDACIÓN DE BENEFICIOS SOCIALES\n\nEmpleado: {{NOMBRE_COMPLETO}}\nDNI: {{NUMERO_DOCUMENTO}}\nCargo: {{CARGO}}\nFecha Ingreso: {{FECHA_INICIO}}\nFecha Cese: {{FECHA_TERMINO}}\n\n1. Sueldo Base: S/ {{SUELDO_BASE}}\n2. Vacaciones Truncas: S/ {{VACACIONES_TRUNCAS}}\n3. Gratificación Proporcional: S/ {{GRATIFICACION}}\n4. CTS: S/ {{CTS}}\n5. Total Haberes: S/ {{TOTAL_HABERES}}\n6. Descuentos: S/ {{DESCUENTOS}}\n7. LÍQUIDO A PAGAR: S/ {{LIQUIDO_PAGAR}}',
    variablesCount: 12
  }
])

const categoriaOptions = [
  { label: 'Desvinculación', value: 'DESVINCULACION' },
  { label: 'Constancias', value: 'CONSTANCIAS' },
  { label: 'Liquidaciones', value: 'LIQUIDACIONES' },
  { label: 'Contratos', value: 'CONTRATOS' },
  { label: 'Otros', value: 'OTROS' }
]

const variablesComunes = [
  { label: '{{NOMBRE_COMPLETO}}', value: '{{NOMBRE_COMPLETO}}' },
  { label: '{{NUMERO_DOCUMENTO}}', value: '{{NUMERO_DOCUMENTO}}' },
  { label: '{{NOMBRE_EMPRESA}}', value: '{{NOMBRE_EMPRESA}}' },
  { label: '{{CARGO}}', value: '{{CARGO}}' },
  { label: '{{FECHA_INICIO}}', value: '{{FECHA_INICIO}}' },
  { label: '{{FECHA_TERMINO}}', value: '{{FECHA_TERMINO}}' },
  { label: '{{SUELDO_BASE}}', value: '{{SUELDO_BASE}}' },
  { label: '{{AREA_TRABAJO}}', value: '{{AREA_TRABAJO}}' }
]

const templateForm = ref({
  nombre: '',
  descripcion: '',
  categoria: 'OTROS',
  contenido: ''
})

const previewTemplate = (plantilla: any) => {
  previewTemplateData.value = plantilla
  showPreview.value = true
}

const editTemplate = (plantilla: any) => {
  editingTemplate.value = true
  templateForm.value = {
    nombre: plantilla.nombre,
    descripcion: plantilla.descripcion,
    categoria: plantilla.categoria,
    contenido: plantilla.contenido
  }
  showAddTemplate.value = true
}

const insertVariable = (variable: string) => {
  templateForm.value.contenido += variable
}

const previewTemplateFromForm = () => {
  previewTemplateData.value = templateForm.value
  showPreview.value = true
}

const downloadTemplate = () => {
  message.success('Plantilla descargada')
  showPreview.value = false
}

const saveTemplate = () => {
  message.success('Plantilla guardada')
  showAddTemplate.value = false
  templateForm.value = { nombre: '', descripcion: '', categoria: 'OTROS', contenido: '' }
}
</script>

<style scoped>
.plantillas-documentos {
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

.plantillas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.plantilla-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.plantilla-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.plantilla-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
}

.plantilla-icon .icon {
  font-size: 24px;
}

.plantilla-info h5 {
  font-size: 16px;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.plantilla-info p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.plantilla-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.plantilla-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.template-preview {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.template-preview pre {
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  margin: 0;
}

.variables-help {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variable-tag {
  cursor: pointer;
}

.variable-tag:hover {
  background: #dbeafe;
}
</style>