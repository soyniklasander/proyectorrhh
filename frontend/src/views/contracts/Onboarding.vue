<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Onboarding & Contratos</h1>
      <p class="page-subtitle">Registro de personal y generación de documentación legal.</p>
    </div>

    <n-card class="form-card" size="huge">
      <n-steps :current="currentStep" status="process" class="mb-6">
        <n-step title="Identidad" description="Datos Personales" />
        <n-step title="Laboral" description="Puesto y Condiciones" />
        <n-step title="Financiero" description="Pagos y AFP" />
        <n-step title="Confirmar" description="Generar" />
      </n-steps>

      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="top"
        size="medium"
        class="mt-6"
      >

        <!-- STEP 1: IDENTITY -->
        <div v-show="currentStep === 1">
           <div class="form-grid">
             <n-form-item label="Tipo Documento" path="tipoDocumento">
               <n-select v-model:value="formValue.tipoDocumento" :options="options.docs" />
             </n-form-item>
             <n-form-item label="Número Documento" path="numeroDocumento">
               <n-input v-model:value="formValue.numeroDocumento" placeholder="8 dígitos DNI" />
             </n-form-item>
             <n-form-item label="Nombres" path="nombres">
               <n-input v-model:value="formValue.nombres" />
             </n-form-item>
             <n-form-item label="Apellido Paterno" path="apellidoPaterno">
               <n-input v-model:value="formValue.apellidoPaterno" />
             </n-form-item>
             <n-form-item label="Apellido Materno" path="apellidoMaterno">
               <n-input v-model:value="formValue.apellidoMaterno" />
             </n-form-item>
             <n-form-item label="Ubigeo (INEI)" path="ubigeo">
               <n-input v-model:value="formValue.ubigeo" placeholder="000000" maxlength="6" />
             </n-form-item>
             <n-form-item label="Dirección Completa" path="direccion" class="col-span-2">
               <n-input v-model:value="formValue.direccion" placeholder="Av. Calle, Distrito, Provincia" />
             </n-form-item>
           </div>
        </div>

        <!-- STEP 2: LABOR -->
        <div v-show="currentStep === 2">
          <div class="form-grid">
            <n-form-item label="Cargo / Puesto" path="cargo">
               <n-input v-model:value="formValue.cargo" placeholder="Ej. Analista Senior" />
             </n-form-item>
             <n-form-item label="Régimen Laboral" path="regimenLaboral">
               <n-select v-model:value="formValue.regimenLaboral" :options="options.regimenes" />
             </n-form-item>
             <n-form-item label="Tipo Contrato" path="tipoContrato">
               <n-select v-model:value="formValue.tipoContrato" :options="options.contratos" />
             </n-form-item>
             <n-form-item label="Fecha Inicio" path="fechaInicio">
               <n-date-picker
                 v-model:formatted-value="formValue.fechaInicio"
                 value-format="yyyy-MM-dd"
                 type="date"
                 class="w-full"
               />
             </n-form-item>
             <n-form-item label="Salario Base (S/)" path="salarioBase">
               <n-input-number
                  v-model:value="formValue.salarioBase"
                  :show-button="false"
                  :precision="2"
                  class="w-full"
               >
                 <template #prefix>S/</template>
               </n-input-number>
             </n-form-item>
             <n-form-item label="Asignación Familiar (+S/ 102.50)" path="asignacionFamiliar">
               <n-switch v-model:value="formValue.asignacionFamiliar" />
             </n-form-item>
          </div>
        </div>

        <!-- STEP 3: FINANCIAL -->
        <div v-show="currentStep === 3">
           <div class="form-grid">
             <n-form-item label="Banco" path="banco">
               <n-select v-model:value="formValue.banco" :options="options.bancos" />
             </n-form-item>
             <n-form-item label="Tipo Cuenta" path="tipoCuenta">
               <n-select v-model:value="formValue.tipoCuenta" :options="options.cuentas" />
             </n-form-item>
             <n-form-item label="Número Cuenta" path="numeroCuenta">
               <n-input v-model:value="formValue.numeroCuenta" />
             </n-form-item>
             <n-form-item label="CCI (20 dígitos)" path="numeroCCI">
               <n-input v-model:value="formValue.numeroCCI" placeholder="002..." maxlength="20" />
             </n-form-item>
             <n-form-item label="Sistema Pensiones" path="sistemaPensiones">
               <n-select v-model:value="formValue.sistemaPensiones" :options="options.pensiones" />
             </n-form-item>
             <n-form-item label="CUSPP" path="cuspp">
               <n-input v-model:value="formValue.cuspp" placeholder="Si aplica" />
             </n-form-item>
           </div>
        </div>

        <!-- STEP 4: CONFIRM -->
        <div v-show="currentStep === 4">
          <n-alert type="info" title="Confirmación de Datos" class="mb-6" show-icon>
             Se generará el contrato y se registrará al empleado en la base de datos de la empresa.
          </n-alert>

          <n-descriptions bordered label-placement="left" title="Resumen">
            <n-descriptions-item label="Colaborador">
              {{ formValue.nombres }} {{ formValue.apellidoPaterno }} {{ formValue.apellidoMaterno }}
            </n-descriptions-item>
            <n-descriptions-item label="Documento">
              {{ formValue.tipoDocumento }} - {{ formValue.numeroDocumento }}
            </n-descriptions-item>
            <n-descriptions-item label="Cargo">
              {{ formValue.cargo }}
            </n-descriptions-item>
            <n-descriptions-item label="Régimen">
              {{ formValue.regimenLaboral }}
            </n-descriptions-item>
            <n-descriptions-item label="Remuneración">
              S/ {{ formValue.salarioBase }}
            </n-descriptions-item>
            <n-descriptions-item label="Pensiones">
              {{ formValue.sistemaPensiones }}
            </n-descriptions-item>
          </n-descriptions>
        </div>

      </n-form>

      <div class="actions">
        <n-button v-if="currentStep > 1" @click="prevStep" secondary>Atrás</n-button>
        <div class="spacer"></div>
        <n-button v-if="currentStep < 4" type="primary" @click="nextStep">Siguiente</n-button>
        <n-button v-if="currentStep === 4" type="success" @click="submitForm" :loading="loading">
          Finalizar y Generar
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage, type FormInst } from 'naive-ui'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const currentStep = ref(1)
const loading = ref(false)

const formValue = reactive({
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  ubigeo: '',
  direccion: '',
  cargo: '',
  regimenLaboral: 'GENERAL',
  tipoContrato: 'PLAZO_FIJO',
  fechaInicio: null,
  salarioBase: 1025,
  asignacionFamiliar: false,
  banco: 'BCP',
  tipoCuenta: 'AHORROS',
  numeroCuenta: '',
  numeroCCI: '',
  sistemaPensiones: 'ONP',
  cuspp: ''
})

const options = {
  docs: [
    { label: 'DNI', value: 'DNI' },
    { label: 'Carnet Extranjería', value: 'CE' }
  ],
  regimenes: [
    { label: 'General (DL 728)', value: 'GENERAL' },
    { label: 'Microempresa', value: 'MICROEMPRESA' },
    { label: 'Pequeña Empresa', value: 'PEQUENA_EMPRESA' },
    { label: 'Agrario', value: 'AGRARIO' }
  ],
  contratos: [
    { label: 'Indeterminado', value: 'INDETERMINADO' },
    { label: 'Plazo Fijo', value: 'PLAZO_FIJO' },
    { label: 'Tiempo Parcial', value: 'TIEMPO_PARCIAL' }
  ],
  bancos: [
    { label: 'BCP', value: 'BCP' },
    { label: 'BBVA', value: 'BBVA' },
    { label: 'Interbank', value: 'INTERBANK' },
    { label: 'Scotiabank', value: 'SCOTIABANK' }
  ],
  cuentas: [
    { label: 'Ahorros', value: 'AHORROS' },
    { label: 'Corriente', value: 'CORRIENTE' }
  ],
  pensiones: [
    { label: 'ONP', value: 'ONP' },
    { label: 'AFP Integra', value: 'AFP_INTEGRA' },
    { label: 'AFP Prima', value: 'AFP_PRIMA' },
    { label: 'AFP Profuturo', value: 'AFP_PROFUTURO' },
    { label: 'AFP Habitat', value: 'AFP_HABITAT' }
  ]
}

const rules = {
  nombres: { required: true, message: 'Requerido', trigger: 'blur' },
  numeroDocumento: { required: true, min: 8, message: 'Mínimo 8 dígitos', trigger: 'blur' },
  ubigeo: { required: true, len: 6, message: 'Debe ser 6 dígitos', trigger: 'blur' },
  cargo: { required: true, message: 'Requerido', trigger: 'blur' },
  fechaInicio: { required: true, message: 'Requerido', trigger: ['blur', 'change'] },
  numeroCCI: { min: 20, max: 20, message: 'Debe tener 20 dígitos', trigger: 'blur' }
}

const nextStep = async () => {
  if (currentStep.value < 4) {
    // Validate current step fields if needed, simplified here
    if (formRef.value) {
        await formRef.value.validate() // Validates all, ideal would be per-step validation
    }
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const submitForm = async () => {
  try {
    loading.value = true
    const response = await api.post('/contracts/onboarding', formValue)
    if (response.data.success) {
      message.success('Contrato generado exitosamente')
      router.push('/employees')
    }
  } catch (error) {
    message.error('Error al generar contrato. Verifica los datos.')
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}
.page-subtitle {
  color: #6b7280;
}
.form-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.mb-6 { margin-bottom: 24px; }
.mt-6 { margin-top: 24px; }
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
.col-span-2 {
  grid-column: span 2;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}
.spacer { flex: 1; }
.w-full { width: 100%; }

@media (max-width: 640px) {
  .col-span-2 { grid-column: span 1; }
}
</style>
