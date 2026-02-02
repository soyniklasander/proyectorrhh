<template>
  <div class="page-container">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Configuración</h1>
        <p class="subtitle">Preferencias de la empresa y sistema.</p>
      </div>
      <n-button type="primary" :loading="saving" @click="saveSettings">
        <template #icon><n-icon><SaveOutline /></n-icon></template>
        Guardar Cambios
      </n-button>
    </div>

    <div class="settings-grid">
      <!-- General Company Settings -->
      <n-card title="Información de la Empresa" :bordered="false" class="settings-card">
        <n-form ref="companyFormRef" :model="formState" :rules="rules" label-placement="top">
          <n-grid :cols="2" :x-gap="24">
            <n-form-item-gi label="Nombre Comercial" path="companyName">
              <n-input v-model:value="formState.companyName" placeholder="Mi Empresa S.A.C." />
            </n-form-item-gi>
            <n-form-item-gi label="RUC" path="ruc">
              <n-input v-model:value="formState.ruc" placeholder="20100000001" :disabled="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="2" label="Dirección Fiscal" path="address">
              <n-input v-model:value="formState.address" placeholder="Av. Los Ruiseñores 123, Lima" />
            </n-form-item-gi>
            <n-form-item-gi label="Teléfono de Contacto" path="phone">
              <n-input v-model:value="formState.phone" placeholder="+51 999 999 999" />
            </n-form-item-gi>
            <n-form-item-gi label="Email de Contacto" path="email">
              <n-input v-model:value="formState.email" placeholder="contacto@empresa.com" />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-card>

      <!-- Branding -->
      <n-card title="Marca y Apariencia" :bordered="false" class="settings-card">
        <n-form-item label="Logo URL (Público)" path="logoUrl">
          <n-input v-model:value="formState.logoUrl" placeholder="https://..." />
        </n-form-item>
        <div class="logo-preview" v-if="formState.logoUrl">
           <img :src="formState.logoUrl" alt="Logo Preview" />
        </div>
      </n-card>

      <!-- Payroll Configuration -->
      <n-card title="Configuración de Nómina" :bordered="false" class="settings-card">
        <n-grid :cols="2" :x-gap="24">
          <n-form-item-gi label="Día de Pago (Mensual)" path="payrollDay">
             <n-input-number v-model:value="formState.payrollDay" :min="1" :max="31" />
          </n-form-item-gi>
          <n-form-item-gi label="Banco Principal (Desembolsos)" path="primaryBank">
             <n-input v-model:value="formState.primaryBank" placeholder="BCP, BBVA, Interbank..." />
          </n-form-item-gi>
        </n-grid>
        <n-divider />
        <n-alert title="Configuración Avanzada" type="info">
           Los porcentajes de AFP y ONP se actualizan automáticamente desde la base de datos central de la SBS.
        </n-alert>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NButton, NIcon, NCard, NForm, NFormItem, NFormItemGi, NInput, NInputNumber, NGrid, NDivider, NAlert, useMessage, type FormRules } from 'naive-ui'
import { SaveOutline } from '@vicons/ionicons5'
import { api } from '@/services/api'

interface SettingsFormState {
  companyName: string
  ruc: string
  address: string
  phone: string
  email: string
  logoUrl: string
  payrollDay: number
  primaryBank: string
}

const message = useMessage()
const saving = ref(false)
const formState = reactive<SettingsFormState>({
  companyName: '',
  ruc: '',
  address: '',
  phone: '',
  email: '',
  logoUrl: '',
  payrollDay: 30,
  primaryBank: ''
})

const rules: FormRules = {
  companyName: { required: true, message: 'Requerido', trigger: 'blur' },
  email: { type: 'email', message: 'Email inválido', trigger: 'blur' }
}

const fetchSettings = async () => {
  try {
    const { data } = await api.get('/settings')
    if (data.success) {
      Object.assign(formState, data.data)
    }
  } catch (error) {
    message.error('Error al cargar configuración')
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await api.patch('/settings', formState)
    message.success('Configuración guardada exitosamente')
  } catch (error) {
    message.error('Error al guardar configuración')
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.page-container {
  padding: 0;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}
.settings-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
}
.logo-preview {
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  text-align: center;
}
.logo-preview img {
  max-height: 100px;
  max-width: 100%;
}
</style>
