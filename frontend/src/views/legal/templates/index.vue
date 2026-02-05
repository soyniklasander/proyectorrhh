<template>
  <div class="legal-templates">
    <n-page-header title="Plantillas Legales" subtitle="Documentos según normativa peruana" />
    
    <n-card style="margin-top: 20px;">
      <n-tabs type="line">
        <n-tab-pane name="contratos" tab="Contratos Laborales">
          <n-data-table
            :columns="contratoColumns"
            :data="contratosTemplates"
            :pagination="{ pageSize: 10 }"
          />
        </n-tab-pane>
        
        <n-tab-pane name="generador" tab="Generador de Documentos">
          <n-form :model="formData" label-placement="top">
            <n-grid :cols="2" :x-gap="16">
              <n-grid-item>
                <n-form-item label="Tipo de Documento">
                  <n-select v-model:value="formData.tipoDocumento" :options="tipoOptions" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="Plantilla">
                  <n-select v-model:value="formData.plantillaId" :options="plantillaOptions" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-divider>Datos del Empleado</n-divider>
            
            <n-grid :cols="3" :x-gap="16">
              <n-grid-item>
                <n-form-item label="Nombres">
                  <n-input v-model:value="formData.empleadoNombres" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="Apellido Paterno">
                  <n-input v-model:value="formData.empleadoApellidoPaterno" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="Apellido Materno">
                  <n-input v-model:value="formData.empleadoApellidoMaterno" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-grid :cols="2" :x-gap="16">
              <n-grid-item>
                <n-form-item label="DNI">
                  <n-input v-model:value="formData.empleadoDNI" maxlength="8" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="Dirección">
                  <n-input v-model:value="formData.empleadoDireccion" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-divider>Datos del Cargo</n-divider>
            
            <n-grid :cols="3" :x-gap="16">
              <n-grid-item>
                <n-form-item label="Cargo">
                  <n-input v-model:value="formData.cargo" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="Área">
                  <n-input v-model:value="formData.area" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="Remuneración (S/)">
                  <n-input-number v-model:value="formData.remuneracion" :min="1025" style="width: 100%;" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-grid :cols="2" :x-gap="16">
              <n-grid-item>
                <n-form-item label="Fecha de Inicio">
                  <n-date-picker v-model:value="formData.fechaInicio" style="width: 100%;" />
                </n-form-item>
              </n-grid-item>
              <n-grid-item>
                <n-form-item label="Duración (meses)">
                  <n-input-number v-model:value="formData.duracionMeses" :min="1" style="width: 100%;" />
                </n-form-item>
              </n-grid-item>
            </n-grid>
            
            <n-space justify="end" style="margin-top: 20px;">
              <n-button @click="previewDocument">Vista Previa</n-button>
              <n-button type="primary" @click="generateDocument" :loading="generating">
                Generar Documento
              </n-button>
            </n-space>
          </n-form>
        </n-tab-pane>
        
        <n-tab-pane name="validacion" tab="Validación de Documentos">
          <n-card title="Validar DNI Peruano">
            <n-space align="end">
              <n-input v-model:value="dniToValidate" maxlength="8" placeholder="Ingrese DNI (8 dígitos)" />
              <n-button type="primary" @click="validateDNI" :loading="validating">Validar</n-button>
            </n-space>
            <n-alert v-if="dniValidationResult !== null" :type="dniValidationResult ? 'success' : 'error'" style="margin-top: 10px;">
              {{ dniValidationResult ? 'DNI válido' : 'DNI inválido' }}
            </n-alert>
          </n-card>
          
          <n-card title="Validar RUC Peruano" style="margin-top: 20px;">
            <n-space align="end">
              <n-input v-model:value="rucToValidate" maxlength="11" placeholder="Ingrese RUC (11 dígitos)" />
              <n-button type="primary" @click="validateRUC" :loading="validatingRUC">Validar</n-button>
            </n-space>
            <n-alert v-if="rucValidationResult !== null" :type="rucValidationResult ? 'success' : 'error'" style="margin-top: 10px;">
              {{ rucValidationResult ? 'RUC válido' : 'RUC inválido' }}
            </n-alert>
          </n-card>
        </n-tab-pane>
        
        <n-tab-pane name="feriados" tab="Feriados Peruanos">
          <n-card title="Calendario de Feriados">
            <n-space>
              <n-form-item label="Año">
                <n-select v-model:value="selectedYear" :options="yearOptions" style="width: 120px;" />
              </n-form-item>
              <n-button @click="loadFeriados" :loading="loadingFeriados">Cargar</n-button>
            </n-space>
            <n-data-table
              :columns="feriadoColumns"
              :data="feriados"
              :pagination="{ pageSize: 15 }"
              style="margin-top: 20px;"
            />
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Vista Previa Modal -->
    <n-modal v-model:show="showPreview" preset="card" style="width: 800px; max-width: 95vw;" title="Vista Previa del Documento">
      <div class="document-preview" v-html="previewContent"></div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showPreview = false">Cerrar</n-button>
          <n-button type="primary" @click="downloadDocument">
            <template #icon>
              <n-icon :component="DownloadOutline" />
            </template>
            Descargar Word
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue';
import { useMessage, NTag } from 'naive-ui';
import { DownloadOutline } from '@vicons/ionicons5';

const message = useMessage();

const contratosTemplates = ref([]);
const tipoOptions = [
  { label: 'Contrato Laboral', value: 'CONTRATO' },
  { label: 'Addendum', value: 'ADDENDUM' },
  { label: 'Carta', value: 'CARTA' },
];
const plantillaOptions = ref([]);

const formData = reactive({
  tipoDocumento: 'CONTRATO',
  plantillaId: '',
  empleadoNombres: '',
  empleadoApellidoPaterno: '',
  empleadoApellidoMaterno: '',
  empleadoDNI: '',
  empleadoDireccion: '',
  cargo: '',
  area: '',
  remuneracion: 1025,
  fechaInicio: null,
  duracionMeses: 12,
});

const generating = ref(false);
const showPreview = ref(false);
const previewContent = ref('');

const dniToValidate = ref('');
const dniValidationResult = ref(null);
const validating = ref(false);

const rucToValidate = ref('');
const rucValidationResult = ref(null);
const validatingRUC = ref(false);

const selectedYear = ref(new Date().getFullYear());
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  label: String(2024 + i),
  value: 2024 + i,
}));
const feriados = ref([]);
const loadingFeriados = ref(false);

const contratoColumns = [
  { title: 'Código', key: 'codigo', width: 150 },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Régimen', key: 'regimen' },
  { 
    title: 'Tipo', 
    key: 'id',
    render(row) {
      return h(NTag, { type: 'info', size: 'small' }, { default: () => row.subtipo });
    }
  },
];

const feriadoColumns = [
  { title: 'Fecha', key: 'fecha', width: 120 },
  { title: 'Nombre', key: 'nombre' },
  { 
    title: 'Tipo', 
    key: 'tipo',
    render(row) {
      const type = row.tipo === 'FIJO' ? 'success' : row.tipo === 'MOVIL' ? 'warning' : 'default';
      return h(NTag, { type, size: 'small' }, { default: () => row.tipo });
    }
  },
];

const fetchTemplates = async () => {
  try {
    const response = await fetch('/api/v1/peru/contratos/templates', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    if (data.success) {
      contratosTemplates.value = data.data;
      plantillaOptions.value = data.data.map(t => ({
        label: t.nombre,
        value: t.id,
      }));
    }
  } catch (error) {
    message.error('Error al cargar plantillas');
  }
};

const previewDocument = () => {
  // Simular preview con datos del formulario
  const html = `
    <div style="padding: 40px; font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">CONTRATO DE TRABAJO</h2>
      <p style="margin-top: 30px;">
        En la ciudad de Lima, entre <strong>LA EMPRESA S.A.C.</strong> y 
        <strong>${formData.empleadoNombres} ${formData.empleadoApellidoPaterno} ${formData.empleadoApellidoMaterno}</strong>,
        identificado con DNI N° ${formData.empleadoDNI}.
      </p>
      <p style="margin-top: 20px;">
        <strong>CARGO:</strong> ${formData.cargo}<br>
        <strong>ÁREA:</strong> ${formData.area}<br>
        <strong>REMUNERACIÓN:</strong> S/ ${formData.remuneracion?.toFixed(2)}<br>
        <strong>FECHA DE INICIO:</strong> ${formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleDateString('es-PE') : '-'}<br>
        <strong>DURACIÓN:</strong> ${formData.duracionMeses} meses
      </p>
      <p style="margin-top: 30px; color: #666; font-style: italic;">
        [Vista previa simplificada - El documento final incluirá todas las cláusulas legales]
      </p>
    </div>
  `;
  previewContent.value = html;
  showPreview.value = true;
};

const generateDocument = () => {
  generating.value = true;
  setTimeout(() => {
    generating.value = false;
    message.success('Documento generado exitosamente');
    previewDocument();
  }, 1000);
};

const downloadDocument = () => {
  message.info('Función de descarga en desarrollo');
};

const validateDNI = async () => {
  if (!dniToValidate.value || dniToValidate.value.length !== 8) {
    message.warning('Ingrese un DNI válido de 8 dígitos');
    return;
  }
  
  try {
    validating.value = true;
    const response = await fetch('/api/v1/peru/validar-dni', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dni: dniToValidate.value }),
    });
    const data = await response.json();
    dniValidationResult.value = data.valido;
  } catch (error) {
    message.error('Error al validar DNI');
  } finally {
    validating.value = false;
  }
};

const validateRUC = async () => {
  if (!rucToValidate.value || rucToValidate.value.length !== 11) {
    message.warning('Ingrese un RUC válido de 11 dígitos');
    return;
  }
  
  try {
    validatingRUC.value = true;
    const response = await fetch('/api/v1/peru/validar-ruc', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ruc: rucToValidate.value }),
    });
    const data = await response.json();
    rucValidationResult.value = data.valido;
  } catch (error) {
    message.error('Error al validar RUC');
  } finally {
    validatingRUC.value = false;
  }
};

const loadFeriados = async () => {
  try {
    loadingFeriados.value = true;
    const response = await fetch(`/api/v1/peru/feriados?year=${selectedYear.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    if (data.success) {
      feriados.value = data.data;
    }
  } catch (error) {
    message.error('Error al cargar feriados');
  } finally {
    loadingFeriados.value = false;
  }
};

onMounted(() => {
  fetchTemplates();
  loadFeriados();
});
</script>

<style scoped>
.legal-templates {
  padding: 20px;
}

.document-preview {
  max-height: 500px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 20px;
}

.document-preview :deep(> div) {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-height: 400px;
}
</style>
