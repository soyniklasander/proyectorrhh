<template>
  <div class="contract-form">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-placement="top"
      :size="isMobile ? 'medium' : 'large'"
      :show-label="!isMobile"
    >
      <!-- Datos básicos -->
      <n-grid cols="1 s:2 m:3" responsive="screen" :x-gap="24" :y-gap="16">
        <n-grid-item>
          <n-form-item label="Empleado" path="empleadoId">
            <n-select
              v-model:value="formData.empleadoId"
              :options="employeeOptions"
              placeholder="Seleccionar empleado"
              filterable
              :disabled="loading"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="Tipo Contrato" path="tipoContrato">
            <n-select
              v-model:value="formData.tipoContrato"
              :options="TIPO_CONTRATO_OPTIONS"
              placeholder="Seleccionar tipo"
              :disabled="loading"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="Régimen Laboral" path="regimenLaboral">
            <n-select
              v-model:value="formData.regimenLaboral"
              :options="REGIMEN_LABORAL_OPTIONS"
              placeholder="Seleccionar régimen"
              :disabled="loading"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="Fecha Inicio" path="fechaInicio">
            <n-date-picker
              v-model:value="formData.fechaInicio"
              type="date"
              format="dd/MM/yyyy"
              :disabled="loading"
              style="width: 100%"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="Cargo" path="cargo">
            <n-input
              v-model:value="formData.cargo"
              placeholder="Desarrollador Senior"
              :disabled="loading"
            />
          </n-form-item>
        </n-grid-item>
        
        <n-grid-item>
          <n-form-item label="Salario Base" path="salarioBase">
            <n-input-number
              v-model:value="formData.salarioBase"
              :min="0"
              :precision="2"
              style="width: 100%"
              :disabled="loading"
            />
          </n-form-item>
        </n-grid-item>
      </n-grid>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { TIPO_CONTRATO, REGIMEN_LABORAL } from '@/types/employee.types'

const props = defineProps<{
  contract?: any
  isEditing?: boolean
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

// Reactive data
const formRef = ref(null)
const loading = ref(false)
const isMobile = ref(false)

const formData = reactive({
  empleadoId: '',
  tipoContrato: '',
  regimenLaboral: '',
  fechaInicio: null,
  cargo: '',
  salarioBase: 0
})

// Mock options
const employeeOptions = [
  { label: 'Juan Pérez García', value: '1' },
  { label: 'María López Martínez', value: '2' }
]

const TIPO_CONTRATO_OPTIONS = [
  { label: 'Indeterminado', value: 'INDETERMINADO' },
  { label: 'Plazo Fijo', value: 'PLAZO_FIJO' },
  { label: 'Tiempo Parcial', value: 'TIEMPO_PARCIAL' }
]

const REGIMEN_LABORAL_OPTIONS = [
  { label: 'General', value: 'GENERAL' },
  { label: 'Microempresa', value: 'MICROEMPRESA' }
]

// Form rules
const formRules = {
  empleadoId: [
    { required: true, message: 'Por favor selecciona un empleado' }
  ],
  tipoContrato: [
    { required: true, message: 'Por favor selecciona el tipo de contrato' }
  ],
  regimenLaboral: [
    { required: true, message: 'Por favor selecciona el régimen laboral' }
  ],
  fechaInicio: [
    { required: true, message: 'Por favor selecciona la fecha de inicio' }
  ],
  cargo: [
    { required: true, message: 'Por favor ingresa el cargo' }
  ],
  salarioBase: [
    { required: true, message: 'Por favor ingresa el salario base' }
  ]
}

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('submit', { ...formData })
  } catch (error) {
    console.error('Validation error:', error)
  } finally {
    loading.value = false
  }
}

// Expose methods for parent
defineExpose({
  handleSubmit,
  formRef,
  formData
})
</script>

<style scoped>
.contract-form {
  padding: 0;
}

:deep(.n-form-item-label) {
  font-weight: 500;
  color: var(--text-primary);
}

:deep(.n-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.n-grid-item) {
  display: flex;
  align-items: flex-end;
}

@media (max-width: 768px) {
  :deep(.n-grid) {
    grid-template-columns: 1fr !important;
  }
}
</style>