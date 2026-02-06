<template>
  <AppleContainer>
    <ApplePageHeader title="Plantillas Legales" subtitle="Documentos según normativa peruana" />

    <AppleCard style="margin-top: 20px;">
      <AppleTabs v-model="activeTab" :tabs="tabs">
        <template #tab="{ tab }">
          {{ tab.label }}
        </template>
        <template #default>
          <div v-show="activeTab === 'contratos'">
            <AppleTable :columns="contratoColumns" :data="contratosTemplates" />
          </div>
          
          <div v-show="activeTab === 'generador'">
            <AppleGrid :cols="2" :x-gap="16">
              <AppleFormItem label="Tipo de Documento">
                <AppleSelect v-model="tipoDocumento" :options="tipoOptions" />
              </AppleFormItem>
              <AppleFormItem label="Plantilla">
                <AppleSelect v-model="plantillaId" :options="plantillaOptions" />
              </AppleFormItem>
            </AppleGrid>
            
            <AppleDivider />
            
            <h4 style="margin-bottom: 16px;">Datos del Empleado</h4>
            
            <AppleGrid :cols="3" :x-gap="16">
              <AppleFormItem label="Nombres">
                <AppleInput v-model="empleadoNombres" />
              </AppleFormItem>
              <AppleFormItem label="Apellido Paterno">
                <AppleInput v-model="empleadoApellidoPaterno" />
              </AppleFormItem>
              <AppleFormItem label="Apellido Materno">
                <AppleInput v-model="empleadoApellidoMaterno" />
              </AppleFormItem>
            </AppleGrid>
            
            <AppleGrid :cols="2" :x-gap="16">
              <AppleFormItem label="DNI">
                <AppleInput v-model="empleadoDNI" maxlength="8" />
              </AppleFormItem>
              <AppleFormItem label="Dirección">
                <AppleInput v-model="empleadoDireccion" />
              </AppleFormItem>
            </AppleGrid>
            
            <AppleDivider />
            
            <h4 style="margin-bottom: 16px;">Datos del Cargo</h4>
            
            <AppleGrid :cols="3" :x-gap="16">
              <AppleFormItem label="Cargo">
                <AppleInput v-model="cargo" />
              </AppleFormItem>
              <AppleFormItem label="Área">
                <AppleInput v-model="area" />
              </AppleFormItem>
              <AppleFormItem label="Remuneración (S/)">
                <n-input-number v-model="remuneracion" :min="1025" :precision="2" style="width: 100%;" />
              </AppleFormItem>
            </AppleGrid>
            
            <AppleGrid :cols="2" :x-gap="16">
              <AppleFormItem label="Fecha de Inicio">
                <AppleDatePicker v-model="fechaInicio" style="width: 100%;" />
              </AppleFormItem>
              <AppleFormItem label="Duración (meses)">
                <n-input-number v-model="duracionMeses" :min="1" style="width: 100%;" />
              </AppleFormItem>
            </AppleGrid>
            
            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px;">
              <AppleButton @click="previewDocument">Vista Previa</AppleButton>
              <AppleButton variant="primary" @click="generateDocument" :loading="generating">
                Generar Documento
              </AppleButton>
            </div>
          </div>
          
          <div v-show="activeTab === 'validacion'">
            <AppleCard title="Validar DNI Peruano">
              <AppleGrid :cols="2" :x-gap="16">
                <AppleFormItem label="DNI">
                  <AppleInput v-model="dniToValidate" maxlength="8" placeholder="Ingrese DNI (8 dígitos)" />
                </AppleFormItem>
                <AppleFormItem>
                  <AppleButton variant="primary" @click="validateDNI" :loading="validating">Validar</AppleButton>
                </AppleFormItem>
              </AppleGrid>
              <AppleAlert v-if="dniValidationResult !== null" :type="dniValidationResult ? 'success' : 'error'">
                {{ dniValidationResult ? 'DNI válido' : 'DNI inválido' }}
              </AppleAlert>
            </AppleCard>
            
            <AppleCard title="Validar RUC Peruano" style="margin-top: 20px;">
              <AppleGrid :cols="2" :x-gap="16">
                <AppleFormItem label="RUC">
                  <AppleInput v-model="rucToValidate" maxlength="11" placeholder="Ingrese RUC (11 dígitos)" />
                </AppleFormItem>
                <AppleFormItem>
                  <AppleButton variant="primary" @click="validateRUC" :loading="validatingRUC">Validar</AppleButton>
                </AppleFormItem>
              </AppleGrid>
              <AppleAlert v-if="rucValidationResult !== null" :type="rucValidationResult ? 'success' : 'error'">
                {{ rucValidationResult ? 'RUC válido' : 'RUC inválido' }}
              </AppleAlert>
            </AppleCard>
          </div>
          
          <div v-show="activeTab === 'feriados'">
            <AppleCard title="Calendario de Feriados">
              <AppleGrid :cols="3" :x-gap="16" style="margin-bottom: 16px;">
                <AppleFormItem label="Año">
                  <AppleSelect v-model="selectedYear" :options="yearOptions" style="width: 120px;" />
                </AppleFormItem>
                <AppleFormItem>
                  <AppleButton @click="loadFeriados" :loading="loadingFeriados">Cargar</AppleButton>
                </AppleFormItem>
              </AppleGrid>
              <AppleTable :columns="feriadoColumns" :data="feriados" />
            </AppleCard>
          </div>
        </template>
      </AppleTabs>
    </AppleCard>

    <!-- Vista Previa Modal -->
    <AppleModal v-model:show="showPreview" title="Vista Previa del Documento" style="width: 800px; max-width: 95vw;">
      <div class="document-preview" v-html="previewContent"></div>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <AppleButton @click="showPreview = false">Cerrar</AppleButton>
          <AppleButton variant="primary" @click="downloadDocument">Descargar Word</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NInputNumber } from 'naive-ui'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTabs, AppleTable, AppleGrid, AppleFormItem, AppleInput, AppleSelect, AppleDatePicker, AppleDivider, AppleAlert, AppleModal } from '@/components/apple'

interface Tab { label: string; value: string }
interface Option { label: string; value: string | number }

const tabs: Tab[] = [
  { label: 'Contratos Laborales', value: 'contratos' },
  { label: 'Generador de Documentos', value: 'generador' },
  { label: 'Validación de Documentos', value: 'validacion' },
  { label: 'Feriados Peruanos', value: 'feriados' }
]

const activeTab = ref('contratos')
const contratosTemplates = ref([])
const tipoOptions: Option[] = [
  { label: 'Contrato Laboral', value: 'CONTRATO' },
  { label: 'Addendum', value: 'ADDENDUM' },
  { label: 'Carta', value: 'CARTA' },
]
const plantillaOptions = ref<Option[]>([])

// Form refs
const tipoDocumento = ref('CONTRATO')
const plantillaId = ref('')
const empleadoNombres = ref('')
const empleadoApellidoPaterno = ref('')
const empleadoApellidoMaterno = ref('')
const empleadoDNI = ref('')
const empleadoDireccion = ref('')
const cargo = ref('')
const area = ref('')
const remuneracion = ref(1025)
const fechaInicio = ref<Date | null>(null)
const duracionMeses = ref(12)

const generating = ref(false)
const showPreview = ref(false)
const previewContent = ref('')

const dniToValidate = ref('')
const dniValidationResult = ref<boolean | null>(null)
const validating = ref(false)

const rucToValidate = ref('')
const rucValidationResult = ref<boolean | null>(null)
const validatingRUC = ref(false)

const selectedYear = ref(2024)
const yearOptions: Option[] = Array.from({ length: 5 }, (_, i) => ({
  label: String(2024 + i),
  value: 2024 + i,
}))
const feriados = ref([])
const loadingFeriados = ref(false)

const contratoColumns = [
  { title: 'Código', key: 'codigo' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Régimen', key: 'regimen' },
  { title: 'Tipo', key: 'subtipo' },
]

const feriadoColumns = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Tipo', key: 'tipo' },
]

const fetchTemplates = async () => {
  try {
    const response = await fetch('/api/v1/peru/contratos/templates', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = await response.json()
    if (data.success) {
      contratosTemplates.value = data.data
      plantillaOptions.value = data.data.map((t: any) => ({
        label: t.nombre,
        value: t.id,
      }))
    }
  } catch (error) {
    alert('Error al cargar plantillas')
  }
}

const previewDocument = () => {
  const html = `
    <div style="padding: 40px; font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">CONTRATO DE TRABAJO</h2>
      <p style="margin-top: 30px;">
        En la ciudad de Lima, entre <strong>LA EMPRESA S.A.C.</strong> y 
        <strong>${empleadoNombres.value} ${empleadoApellidoPaterno.value} ${empleadoApellidoMaterno.value}</strong>,
        identificado con DNI N° ${empleadoDNI.value}.
      </p>
      <p style="margin-top: 20px;">
        <strong>CARGO:</strong> ${cargo.value}<br>
        <strong>ÁREA:</strong> ${area.value}<br>
        <strong>REMUNERACIÓN:</strong> S/ ${remuneracion.value?.toFixed(2)}<br>
        <strong>FECHA DE INICIO:</strong> ${fechaInicio.value ? fechaInicio.value.toLocaleDateString('es-PE') : '-'}<br>
        <strong>DURACIÓN:</strong> ${duracionMeses.value} meses
      </p>
      <p style="margin-top: 30px; color: #666; font-style: italic;">
        [Vista previa simplificada - El documento final incluirá todas las cláusulas legales]
      </p>
    </div>
  `
  previewContent.value = html
  showPreview.value = true
}

const generateDocument = () => {
  generating.value = true
  setTimeout(() => {
    generating.value = false
    alert('Documento generado exitosamente')
    previewDocument()
  }, 1000)
}

const downloadDocument = () => {
  alert('Función de descarga en desarrollo')
}

const validateDNI = async () => {
  if (!dniToValidate.value || dniToValidate.value.length !== 8) {
    alert('Ingrese un DNI válido de 8 dígitos')
    return
  }
  
  try {
    validating.value = true
    const response = await fetch('/api/v1/peru/validar-dni', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dni: dniToValidate.value }),
    })
    const data = await response.json()
    dniValidationResult.value = data.valido
  } catch (error) {
    alert('Error al validar DNI')
  } finally {
    validating.value = false
  }
}

const validateRUC = async () => {
  if (!rucToValidate.value || rucToValidate.value.length !== 11) {
    alert('Ingrese un RUC válido de 11 dígitos')
    return
  }
  
  try {
    validatingRUC.value = true
    const response = await fetch('/api/v1/peru/validar-ruc', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ruc: rucToValidate.value }),
    })
    const data = await response.json()
    rucValidationResult.value = data.valido
  } catch (error) {
    alert('Error al validar RUC')
  } finally {
    validatingRUC.value = false
  }
}

const loadFeriados = async () => {
  try {
    loadingFeriados.value = true
    const response = await fetch(`/api/v1/peru/feriados?year=${selectedYear.value}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = await response.json()
    if (data.success) {
      feriados.value = data.data
    }
  } catch (error) {
    alert('Error al cargar feriados')
  } finally {
    loadingFeriados.value = false
  }
}

onMounted(() => {
  fetchTemplates()
  loadFeriados()
})
</script>

<style scoped>
.legal-templates {
  padding: 0;
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
