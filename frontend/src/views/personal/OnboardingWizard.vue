<template>
  <div class="onboarding-wizard">
    <div class="wizard-header">
      <h3>Nuevo Ingreso al Personal</h3>
      <p>Incorporación completa: Datos personales → Contrato → Régimen → Banco → Resumen</p>
    </div>

    <n-steps :current="currentStep" size="large" status="process">
      <n-step title="Datos Personales" />
      <n-step title="Datos Laborales" />
      <n-step title="Régimen y AFP" />
      <n-step title="Cuenta Bancaria" />
      <n-step title="Resumen" />
    </n-steps>

    <div class="wizard-content">
      <!-- Step 1: Datos Personales -->
      <div v-if="currentStep === 0" class="step-content">
        <h4>Datos Personales del Empleado</h4>
        <div class="form-grid">
          <n-form-item label="Nombres" required>
            <n-input v-model:value="formData.nombres" placeholder="Nombres completos" />
          </n-form-item>
          <n-form-item label="Apellido Paterno" required>
            <n-input v-model:value="formData.apellidoPaterno" placeholder="Apellido paterno" />
          </n-form-item>
          <n-form-item label="Apellido Materno" required>
            <n-input v-model:value="formData.apellidoMaterno" placeholder="Apellido materno" />
          </n-form-item>
          <n-form-item label="Tipo Documento" required>
            <n-select v-model:value="formData.tipoDocumento" :options="tipoDocOptions" />
          </n-form-item>
          <n-form-item label="Número Documento" required>
            <n-input v-model:value="formData.numeroDocumento" placeholder="DNI/CE/Pasaporte" />
          </n-form-item>
          <n-form-item label="Fecha Nacimiento" required>
            <n-date-picker v-model:value="formData.fechaNacimiento" type="date" style="width: 100%" />
          </n-form-item>
          <n-form-item label="Sexo" required>
            <n-radio-group v-model:value="formData.sexo">
              <n-radio value="M">Masculino</n-radio>
              <n-radio value="F">Femenino</n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="Estado Civil">
            <n-select v-model:value="formData.estadoCivil" :options="estadoCivilOptions" placeholder="Seleccionar" />
          </n-form-item>
          <n-form-item label="Nacionalidad">
            <n-input v-model:value="formData.nacionalidad" placeholder="Peruana" />
          </n-form-item>
          <n-form-item label="Email Personal" required>
            <n-input v-model:value="formData.email" placeholder="correo@personal.com" />
          </n-form-item>
          <n-form-item label="Teléfono">
            <n-input v-model:value="formData.telefono" placeholder="999-888-777" />
          </n-form-item>
          <n-form-item label="Dirección" class="full-width">
            <n-input v-model:value="formData.direccion" placeholder="Av. Calle Número, Distrito" />
          </n-form-item>
        </div>
      </div>

      <!-- Step 2: Datos Laborales -->
      <div v-if="currentStep === 1" class="step-content">
        <h4>Datos del Contrato de Trabajo</h4>
        <div class="form-grid">
          <n-form-item label="Tipo de Contrato" required>
            <n-select v-model:value="formData.tipoContrato" :options="tipoContratoOptions" />
          </n-form-item>
          <n-form-item label="Régimen Laboral" required>
            <n-select v-model:value="formData.regimenLaboral" :options="regimenOptions" />
          </n-form-item>
          <n-form-item label="Cargo" required>
            <n-input v-model:value="formData.cargo" placeholder="Cargo que ocupará" />
          </n-form-item>
          <n-form-item label="Área de Trabajo">
            <n-input v-model:value="formData.areaTrabajo" placeholder="Departamento/Área" />
          </n-form-item>
          <n-form-item label="Fecha Inicio" required>
            <n-date-picker v-model:value="formData.fechaInicio" type="date" style="width: 100%" />
          </n-form-item>
          <n-form-item label="Fecha Fin (plazo fijo)">
            <n-date-picker v-model:value="formData.fechaFin" type="date" style="width: 100%" />
          </n-form-item>
          <n-form-item label="Sueldo Base (S/)" required>
            <n-input-number v-model:value="formData.salarioBase" :min="0" :precision="2" style="width: 100%" />
          </n-form-item>
          <n-form-item label="Jornada Semanal (horas)">
            <n-input-number v-model:value="formData.horasSemanales" :min="0" :max="48" style="width: 100%" />
          </n-form-item>
          <n-form-item label="Días Laborales">
            <n-input-number v-model:value="formData.diasLaborales" :min="1" :max="7" style="width: 100%" />
          </n-form-item>
          <n-form-item label="Modalidad" required>
            <n-select v-model:value="formData.modalidadContrato" :options="modalidadOptions" />
          </n-form-item>
          <n-form-item label="Centro de Costos">
            <n-input v-model:value="formData.centroCostos" placeholder="Código de centro de costos" />
          </n-form-item>
        </div>
      </div>

      <!-- Step 3: Régimen y AFP -->
      <div v-if="currentStep === 2" class="step-content">
        <h4>Sistema de Pensiones y Beneficios</h4>
        <div class="form-grid">
          <n-form-item label="Sistema Pensionario" required>
            <n-select v-model:value="formData.sistemaPension" :options="afpOptions" />
          </n-form-item>
          <n-form-item label="CUSPP (AFP)" v-if="formData.sistemaPension === 'AFP'">
            <n-input v-model:value="formData.cuspp" placeholder="Código CUSPP de 12 dígitos" />
          </n-form-item>
          <n-form-item label="Tipo de Comisión AFP" v-if="formData.sistemaPension === 'AFP'">
            <n-radio-group v-model:value="formData.tipoComision">
              <n-radio value="MIxta">Comisión Mixta</n-radio>
              <n-radio value="Flujo">Comisión por Flujo</n-radio>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="Essalud">
            <n-tag type="success">Automático (9%)</n-tag>
          </n-form-item>
          <n-form-item label="Asignación Familiar">
            <n-switch v-model:value="formData.asignacionFamiliar" />
            <span style="margin-left: 8px">¿Tiene hijos menores de 18 años?</span>
          </n-form-item>
          <n-form-item label="Régimen 5ta Categoría">
            <n-switch v-model:value="formData.quintaCategoria" />
            <span style="margin-left: 8px">¿Renta de 5ta categoría?</span>
          </n-form-item>
        </div>
      </div>

      <!-- Step 4: Cuenta Bancaria -->
      <div v-if="currentStep === 3" class="step-content">
        <h4>Datos Bancarios para Pagos</h4>
        <div class="form-grid">
          <n-form-item label="Banco" required>
            <n-select v-model:value="formData.banco" :options="bancoOptions" placeholder="Seleccionar banco" />
          </n-form-item>
          <n-form-item label="Tipo de Cuenta" required>
            <n-select v-model:value="formData.tipoCuenta" :options="tipoCuentaOptions" />
          </n-form-item>
          <n-form-item label="Número de Cuenta" required>
            <n-input v-model:value="formData.numeroCuenta" placeholder="Número de cuenta" />
          </n-form-item>
          <n-form-item label="CCI (Código Cuenta Interbancaria)">
            <n-input v-model:value="formData.cci" placeholder="20 dígitos" />
          </n-form-item>
        </div>
      </div>

      <!-- Step 5: Resumen -->
      <div v-if="currentStep === 4" class="step-content">
        <h4>Resumen del Nuevo Ingreso</h4>
        <n-descriptions label-placement="left" bordered :column="1">
          <n-descriptions-item label="Nombre Completo">
            {{ formData.nombres }} {{ formData.apellidoPaterno }} {{ formData.apellidoMaterno }}
          </n-descriptions-item>
          <n-descriptions-item label="Documento">
            {{ formData.tipoDocumento }}: {{ formData.numeroDocumento }}
          </n-descriptions-item>
          <n-descriptions-item label="Email">
            {{ formData.email }}
          </n-descriptions-item>
          <n-descriptions-item label="Cargo">
            {{ formData.cargo }} - {{ formData.areaTrabajo }}
          </n-descriptions-item>
          <n-descriptions-item label="Régimen">
            {{ formData.regimenLaboral }} - {{ formData.tipoContrato }}
          </n-descriptions-item>
          <n-descriptions-item label="Fecha Inicio">
            {{ formatDate(formData.fechaInicio) }}
          </n-descriptions-item>
          <n-descriptions-item label="Sueldo Base">
            S/ {{ formData.salarioBase?.toLocaleString() }}
          </n-descriptions-item>
          <n-descriptions-item label="Sistema Pensionario">
            {{ formData.sistemaPension }} {{ formData.cuspp ? '- CUSPP: ' + formData.cuspp : '' }}
          </n-descriptions-item>
          <n-descriptions-item label="Banco">
            {{ formData.banco }} - {{ formData.numeroCuenta }}
          </n-descriptions-item>
        </n-descriptions>

        <div class="summary-actions">
          <n-checkbox v-model:checked="terminosAceptados">
            Acepto los términos y condiciones del contrato laboral
          </n-checkbox>
        </div>
      </div>
    </div>

    <div class="wizard-footer">
      <n-button v-if="currentStep > 0" @click="prevStep">Anterior</n-button>
      <div class="footer-spacer"></div>
      <n-button v-if="currentStep < 4" type="primary" @click="nextStep" :disabled="!canProceed">
        Siguiente
      </n-button>
      <n-button v-if="currentStep === 4" type="success" @click="submitOnboarding" :loading="submitting" :disabled="!terminosAceptados">
        ✅ Registrar Empleado
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()

const currentStep = ref(0)
const submitting = ref(false)
const terminosAceptados = ref(false)

const formData = ref({
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  fechaNacimiento: null as number | null,
  sexo: 'M',
  estadoCivil: null as string | null,
  nacionalidad: 'PERUANA',
  email: '',
  telefono: '',
  direccion: '',
  tipoContrato: 'PLAZO_FIJO',
  regimenLaboral: 'GENERAL',
  cargo: '',
  areaTrabajo: '',
  fechaInicio: null as number | null,
  fechaFin: null as number | null,
  salarioBase: 0,
  horasSemanales: 48,
  diasLaborales: 6,
  modalidadContrato: 'Presencial',
  centroCostos: '',
  sistemaPension: 'AFP',
  cuspp: '',
  tipoComision: 'Mixta',
  asignacionFamiliar: false,
  quintaCategoria: false,
  banco: '',
  tipoCuenta: '',
  numeroCuenta: '',
  cci: ''
})

const tipoDocOptions = [
  { label: 'DNI', value: 'DNI' },
  { label: 'Carnet de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PASAPORTE' }
]

const estadoCivilOptions = [
  { label: 'Soltero(a)', value: 'SOLTERO' },
  { label: 'Casado(a)', value: 'CASADO' },
  { label: 'Divorciado(a)', value: 'DIVORCIADO' },
  { label: 'Viudo(a)', value: 'VIUDO' },
  { label: 'Conviviente', value: 'CONVIVIENTE' }
]

const tipoContratoOptions = [
  { label: 'Plazo Fijo', value: 'PLAZO_FIJO' },
  { label: 'Plazo Indeterminado', value: 'INDETERMINADO' },
  { label: 'Temporal', value: 'TEMPORAL' },
  { label: 'Por Obra o Servicio', value: 'OBRA_SERVICIO' }
]

const regimenOptions = [
  { label: 'Régimen General (DL 728)', value: 'GENERAL' },
  { label: 'Microempresa (DL 1276)', value: 'MICROEMPRESA' },
  { label: 'Pequeña Empresa (DL 1448)', value: 'PEQUENA' },
  { label: 'CAS (DL 1057)', value: 'CAS' },
  { label: 'Régimen Agrario (DL 1053)', value: 'AGRARIO' }
]

const modalidadOptions = [
  { label: 'Presencial', value: 'Presencial' },
  { label: 'Remoto', value: 'Remoto' },
  { label: 'Híbrido', value: 'Hibrido' }
]

const afpOptions = [
  { label: 'AFP Prima', value: 'AFP Prima' },
  { label: 'AFP Habitat', value: 'AFP Habitat' },
  { label: 'AFP Integra', value: 'AFP Integra' },
  { label: 'AFP Protecta', value: 'AFP Protecta' },
  { label: 'ONP', value: 'ONP' }
]

const bancoOptions = [
  { label: 'Banco de Crédito del Perú (BCP)', value: 'BCP' },
  { label: 'BBVA', value: 'BBVA' },
  { label: 'Interbank', value: 'Interbank' },
  { label: 'Scotiabank', value: 'Scotiabank' },
  { label: 'Banco de la Nación', value: 'BN' },
  { label: 'Otro', value: 'OTRO' }
]

const tipoCuentaOptions = [
  { label: 'Cuenta de Ahorros', value: 'AHORROS' },
  { label: 'Cuenta Corriente', value: 'CORRIENTE' },
  { label: 'Cuenta Sueldo', value: 'SUELDO' }
]

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return formData.value.nombres && 
             formData.value.apellidoPaterno && 
             formData.value.numeroDocumento && 
             formData.value.email
    case 1:
      return formData.value.cargo && 
             formData.value.salarioBase && 
             formData.value.fechaInicio
    case 2:
      return formData.value.sistemaPension
    case 3:
      return formData.value.banco && 
             formData.value.numeroCuenta
    default:
      return true
  }
})

const formatDate = (timestamp: number | null) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('es-PE')
}

const nextStep = () => {
  if (currentStep.value < 4) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const submitOnboarding = async () => {
  submitting.value = true
  try {
    const payload = {
      employee: {
        nombres: formData.value.nombres,
        apellidoPaterno: formData.value.apellidoPaterno,
        apellidoMaterno: formData.value.apellidoMaterno,
        tipoDocumento: formData.value.tipoDocumento,
        numeroDocumento: formData.value.numeroDocumento,
        fechaNacimiento: formData.value.fechaNacimiento ? new Date(formData.value.fechaNacimiento).toISOString() : null,
        sexo: formData.value.sexo,
        estadoCivil: formData.value.estadoCivil,
        nacionalidad: formData.value.nacionalidad,
        email: formData.value.email,
        emailCorporativo: formData.value.email.split('@')[0] + '@empresa.com',
        telefono: formData.value.telefono,
        direccion: formData.value.direccion
      },
      contract: {
        tipoContrato: formData.value.tipoContrato,
        regimenLaboral: formData.value.regimenLaboral,
        cargo: formData.value.cargo,
        areaTrabajo: formData.value.areaTrabajo,
        fechaInicio: formData.value.fechaInicio ? new Date(formData.value.fechaInicio).toISOString() : null,
        fechaFin: formData.value.fechaFin ? new Date(formData.value.fechaFin).toISOString() : null,
        salarioBase: formData.value.salarioBase,
        horasSemanales: formData.value.horasSemanales,
        diasLaborales: formData.value.diasLaborales,
        modalidadContrato: formData.value.modalidadContrato,
        centroCostos: formData.value.centroCostos,
        sistemaPension: formData.value.sistemaPension,
        cuspp: formData.value.cuspp,
        tipoComision: formData.value.tipoComision,
        asignacionFamiliar: formData.value.asignacionFamiliar,
        quintaCategoria: formData.value.quintaCategoria,
        banco: formData.value.banco,
        tipoCuenta: formData.value.tipoCuenta,
        numeroCuenta: formData.value.numeroCuenta,
        cci: formData.value.cci
      }
    }

    const response = await fetch('/api/v1/contracts/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (data.success) {
      message.success('Empleado registrado correctamente!')
      router.push('/personal')
    } else {
      message.error(data.message || 'Error al registrar empleado')
    }
  } catch (error) {
    message.error('Error de conexión')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.onboarding-wizard {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.wizard-header {
  text-align: center;
  margin-bottom: 32px;
}

.wizard-header h3 {
  font-size: 28px;
  margin-bottom: 8px;
  color: #1f2937;
}

.wizard-header p {
  color: #6b7280;
}

.wizard-content {
  margin: 40px 0;
  min-height: 400px;
}

.step-content h4 {
  font-size: 18px;
  margin-bottom: 24px;
  color: #374151;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.form-grid :deep(.n-form-item) {
  margin-bottom: 0;
}

.full-width {
  grid-column: span 3;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.footer-spacer {
  flex: 1;
}

.summary-actions {
  margin-top: 32px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .full-width {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: span 1;
  }
}
</style>