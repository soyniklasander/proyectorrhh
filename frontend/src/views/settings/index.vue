<template>
  <div class="settings-page">
    <div class="header-container">
      <h1 class="page-title">Configuración del Sistema</h1>
      <n-button type="primary" :loading="loading" @click="handleSave">
        <template #icon><n-icon><SaveOutline /></n-icon></template>
        Guardar Cambios
      </n-button>
    </div>

    <n-spin :show="loading && !formData.ruc">
      <n-card>
        <n-tabs type="line" animated>
          <!-- EMPRESA -->
          <n-tab-pane name="general" tab="Datos de Empresa">
            <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
              <n-grid :cols="2" :x-gap="24">
                <n-form-item-gi label="RUC" path="ruc">
                  <n-input v-model:value="formData.ruc" placeholder="11 dígitos" />
                </n-form-item-gi>
                <n-form-item-gi label="Razón Social" path="razonSocial">
                  <n-input v-model:value="formData.razonSocial" />
                </n-form-item-gi>
              </n-grid>

              <n-divider title-placement="left">Domicilio Fiscal</n-divider>

              <n-grid :cols="2" :x-gap="24">
                <n-form-item-gi :span="2" label="Dirección" path="direccionFiscal.direccion">
                  <n-input v-model:value="formData.direccionFiscal.direccion" />
                </n-form-item-gi>
                <n-form-item-gi label="Distrito" path="direccionFiscal.distrito">
                  <n-input v-model:value="formData.direccionFiscal.distrito" />
                </n-form-item-gi>
                <n-form-item-gi label="Provincia" path="direccionFiscal.provincia">
                  <n-input v-model:value="formData.direccionFiscal.provincia" />
                </n-form-item-gi>
              </n-grid>

              <n-divider title-placement="left">Representante Legal</n-divider>

              <n-grid :cols="2" :x-gap="24">
                <n-form-item-gi label="Nombre Completo" path="representanteLegal.nombre">
                  <n-input v-model:value="formData.representanteLegal.nombre" />
                </n-form-item-gi>
                <n-form-item-gi label="DNI" path="representanteLegal.dni">
                  <n-input v-model:value="formData.representanteLegal.dni" />
                </n-form-item-gi>
              </n-grid>
            </n-form>
          </n-tab-pane>

          <!-- PLANILLA -->
          <n-tab-pane name="payroll" tab="Configuración de Nómina">
             <n-form :model="formData" label-placement="top">
               <n-alert type="info" class="mb-4">
                 Valores por defecto utilizados para el cálculo de planillas y contratos.
               </n-alert>

               <n-grid :cols="3" :x-gap="24">
                 <n-form-item-gi label="Valor UIT (Anual)" path="config.payroll.uit">
                   <n-input-number v-model:value="formData.config.payroll.uit" show-button :min="0">
                     <template #prefix>S/</template>
                   </n-input-number>
                 </n-form-item-gi>
                 <n-form-item-gi label="Remuneración Mínima (RMV)" path="config.payroll.rmv">
                   <n-input-number v-model:value="formData.config.payroll.rmv" show-button :min="0">
                     <template #prefix>S/</template>
                   </n-input-number>
                 </n-form-item-gi>
                 <n-form-item-gi label="Moneda Principal" path="config.payroll.currency">
                   <n-select v-model:value="formData.config.payroll.currency" :options="currencyOptions" />
                 </n-form-item-gi>
               </n-grid>
             </n-form>
          </n-tab-pane>

          <!-- SISTEMA -->
          <n-tab-pane name="system" tab="Apariencia y Sistema">
            <n-form :model="formData" label-placement="top">
              <n-grid :cols="2" :x-gap="24">
                <n-form-item-gi label="URL del Logo" path="config.logoUrl">
                  <n-input v-model:value="formData.config.logoUrl" placeholder="https://..." />
                </n-form-item-gi>
                 <n-form-item-gi label="URL de Firma Digital (Rep. Legal)" path="config.firmaUrl">
                  <n-input v-model:value="formData.config.firmaUrl" placeholder="https://..." />
                </n-form-item-gi>
              </n-grid>
            </n-form>
          </n-tab-pane>

        </n-tabs>
      </n-card>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useSettingsStore } from '@/store/settings';
import { useMessage } from 'naive-ui';
import { SaveOutline } from '@vicons/ionicons5';
import { storeToRefs } from 'pinia';

const message = useMessage();
const settingsStore = useSettingsStore();
const { loading } = storeToRefs(settingsStore);

interface SettingsFormState {
  ruc: string;
  razonSocial: string;
  direccionFiscal: {
    direccion: string;
    distrito?: string;
    provincia?: string;
    departamento?: string;
  };
  representanteLegal: {
    nombre: string;
    dni: string;
  };
  config: {
    logoUrl?: string;
    firmaUrl?: string;
    theme?: 'light' | 'dark';
    payroll: {
      uit: number;
      rmv: number;
      currency: 'PEN' | 'USD';
    };
  };
}

// Initial State matches interface
const formData = reactive<SettingsFormState>({
  ruc: '',
  razonSocial: '',
  direccionFiscal: { direccion: '' },
  representanteLegal: { nombre: '', dni: '' },
  config: {
    payroll: { uit: 5150, rmv: 1025, currency: 'PEN' },
    theme: 'light'
  }
});

const currencyOptions = [
  { label: 'Soles (PEN)', value: 'PEN' },
  { label: 'Dólares (USD)', value: 'USD' }
];

const rules = {
  ruc: { required: true, message: 'Requerido', trigger: 'blur' },
  razonSocial: { required: true, message: 'Requerido', trigger: 'blur' }
};

onMounted(async () => {
  await settingsStore.fetchSettings();
  if (settingsStore.settings) {
    // Deep merge or simple assign carefully
    Object.assign(formData, settingsStore.settings);

    // Ensure nested objects exist if API returns partial
    if (!formData.config) formData.config = { payroll: { uit: 5150, rmv: 1025, currency: 'PEN' } };
    if (!formData.config.payroll) formData.config.payroll = { uit: 5150, rmv: 1025, currency: 'PEN' };
    if (!formData.direccionFiscal) formData.direccionFiscal = { direccion: '' };
    if (!formData.representanteLegal) formData.representanteLegal = { nombre: '', dni: '' };
  }
});

const handleSave = async () => {
  const success = await settingsStore.updateSettings(formData);
  if (success) {
    message.success('Configuración guardada correctamente');
  } else {
    message.error(settingsStore.error || 'Error al guardar');
  }
};
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
