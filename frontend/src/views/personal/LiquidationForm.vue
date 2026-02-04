<template>
  <div class="liquidation-form">
    <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="180px">
      
      <!-- Datos del Empleado -->
      <n-divider title-placement="left">Datos del Empleado</n-divider>
      
      <div class="employee-summary">
        <div class="summary-item">
          <span class="label">Nombre:</span>
          <span class="value">{{ contract?.nombre || '-' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">DNI:</span>
          <span class="value">{{ contract?.dni || '-' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Cargo:</span>
          <span class="value">{{ contract?.cargo || '-' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Fecha Ingreso:</span>
          <span class="value">{{ formatDate(contract?.fechaInicio) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Fecha Término:</span>
          <span class="value">{{ formatDate(contract?.fechaFin) }}</span>
        </div>
      </div>

      <!-- Conceptos de Liquidación -->
      <n-divider title-placement="left">Conceptos de Liquidación</n-divider>

      <div class="concepts-grid">
        <div class="concept-group ingresos">
          <h5>🟢 Ingresos</h5>
          <n-form-item label="Sueldo Base (último)">
            <n-input-number 
              v-model:value="formData.sueldoBase" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="Gratificación pendiente">
            <n-input-number 
              v-model:value="formData.gratificacion" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="CTS pendiente">
            <n-input-number 
              v-model:value="formData.cts" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="Vacaciones truncas">
            <n-input-number 
              v-model:value="formData.vacaciones" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="Horas extras">
            <n-input-number 
              v-model:value="formData.horasExtras" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="Otros ingresos">
            <n-input-number 
              v-model:value="formData.otrosIngresos" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
        </div>

        <div class="concept-group descuentos">
          <h5>🔴 Descuentos</h5>
          <n-form-item label="AFP / ONP">
            <n-input-number 
              v-model:value="formData.descuentoAFP" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="Préstamos">
            <n-input-number 
              v-model:value="formData.descuentoPrestamo" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="Adelantos">
            <n-input-number 
              v-model:value="formData.descuentoAdelanto" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
          <n-form-item label="Otros descuentos">
            <n-input-number 
              v-model:value="formData.otrosDescuentos" 
              :min="0" 
              :precision="2"
              style="width: 100%"
            />
          </n-form-item>
        </div>
      </div>

      <!-- Resumen -->
      <n-divider title-placement="left">Resumen de Liquidación</n-divider>

      <div class="summary-section">
        <div class="summary-row">
          <span>Total Ingresos:</span>
          <span class="total-ingresos">S/ {{ totalIngresos.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Total Descuentos:</span>
          <span class="total-descuentos">- S/ {{ totalDescuentos.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>LÍQUIDO A PAGAR:</span>
          <span class="total-neto">S/ {{ totalNeto.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Datos de Pago -->
      <n-divider title-placement="left">Datos de Pago</n-divider>

      <n-form-item label="Fecha de Pago" required>
        <n-date-picker v-model:value="formData.fechaPago" type="date" style="width: 100%" />
      </n-form-item>

      <n-form-item label="Método de Pago">
        <n-radio-group v-model:value="formData.metodoPago">
          <n-radio value="EFECTIVO">Efectivo</n-radio>
          <n-radio value="DEPOSITO">Depósito Bancario</n-radio>
          <n-radio value="CHEQUE">Cheque</n-radio>
        </n-radio-group>
      </n-form-item>

      <n-form-item label="Observaciones">
        <n-input 
          v-model:value="formData.observaciones" 
          type="textarea" 
          :rows="3"
          placeholder="Notas adicionales..."
        />
      </n-form-item>

    </n-form>

    <div class="form-actions">
      <n-button @click="cancelar">Cancelar</n-button>
      <n-button type="info" @click="previewPDF">👁️ Vista Previa</n-button>
      <n-button type="primary" @click="saveLiquidation" :loading="saving">
        💾 Guardar Liquidación
      </n-button>
      <n-button type="success" @click="generateAndSend" :loading="generating">
        ✅ Generar y Enviar
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'

const props = defineProps<{
  contract?: any
}>()

const emit = defineEmits(['saved', 'cancel'])

const message = useMessage()
const saving = ref(false)
const generating = ref(false)

const formData = ref({
  sueldoBase: 0,
  gratificacion: 0,
  cts: 0,
  vacaciones: 0,
  horasExtras: 0,
  otrosIngresos: 0,
  descuentoAFP: 0,
  descuentoPrestamo: 0,
  descuentoAdelanto: 0,
  otrosDescuentos: 0,
  fechaPago: Date.now(),
  metodoPago: 'DEPOSITO',
  observaciones: ''
})

const rules = {
  fechaPago: { required: true, message: 'Seleccionar fecha de pago' }
}

const totalIngresos = computed(() => {
  return (formData.value.sueldoBase || 0) +
         (formData.value.gratificacion || 0) +
         (formData.value.cts || 0) +
         (formData.value.vacaciones || 0) +
         (formData.value.horasExtras || 0) +
         (formData.value.otrosIngresos || 0)
})

const totalDescuentos = computed(() => {
  return (formData.value.descuentoAFP || 0) +
         (formData.value.descuentoPrestamo || 0) +
         (formData.value.descuentoAdelanto || 0) +
         (formData.value.otrosDescuentos || 0)
})

const totalNeto = computed(() => totalIngresos.value - totalDescuentos.value)

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-PE')
}

const previewPDF = () => {
  message.info('Generando vista previa...')
}

const saveLiquidation = async () => {
  saving.value = true
  try {
    // Guardar en API
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('Liquidación guardada')
    emit('saved')
  } finally {
    saving.value = false
  }
}

const generateAndSend = async () => {
  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    message.success('Liquidación generada y enviada')
    emit('saved')
  } finally {
    generating.value = false
  }
}

const cancelar = () => {
  emit('cancel')
}
</script>

<style scoped>
.liquidation-form {
  padding: 16px 0;
}

.employee-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-item .label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.summary-item .value {
  font-weight: 600;
  color: #1f2937;
}

.concepts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.concept-group h5 {
  font-size: 16px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.ingresos h5 {
  color: #059669;
  border-color: #059669;
}

.descuentos h5 {
  color: #dc2626;
  border-color: #dc2626;
}

.summary-section {
  background: #f9fafb;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-row.total {
  border-top: 2px solid #e5e7eb;
  margin-top: 16px;
  padding-top: 16px;
  font-size: 18px;
  font-weight: 700;
}

.total-ingresos {
  color: #059669;
  font-weight: 600;
}

.total-descuentos {
  color: #dc2626;
}

.total-neto {
  color: #1d4ed8;
  font-size: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 1024px) {
  .employee-summary {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .concepts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .employee-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>