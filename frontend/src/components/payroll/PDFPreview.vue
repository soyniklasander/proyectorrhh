<template>
  <div class="pdf-preview">
    <n-modal v-model:show="showModal" preset="card" style="width: 900px; max-width: 95vw;" title="Vista Previa de Boleta">
      <div class="pdf-container" v-html="pdfContent"></div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">Cerrar</n-button>
          <n-button type="primary" @click="sendEmail" :loading="sending">
            <template #icon>
              <n-icon :component="MailOutline" />
            </template>
            Enviar por Email
          </n-button>
          <n-button type="success" @click="downloadPDF" :loading="downloading">
            <template #icon>
              <n-icon :component="DownloadOutline" />
            </template>
            Descargar PDF
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Miniatura para lista -->
    <n-button v-if="payslipId" size="small" @click="openPreview">
      <template #icon>
        <n-icon :component="EyeOutline" />
      </template>
      Ver Boleta
    </n-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { EyeOutline, DownloadOutline, MailOutline } from '@vicons/ionicons5';

const props = defineProps({
  payslipId: {
    type: String,
    required: true,
  },
  employeeEmail: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['refresh']);

const message = useMessage();
const showModal = ref(false);
const pdfContent = ref('');
const loading = ref(false);
const sending = ref(false);
const downloading = ref(false);

const openPreview = async () => {
  try {
    loading.value = true;
    const response = await fetch(`/api/v1/payroll/payslip/${props.payslipId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (response.ok) {
      pdfContent.value = await response.text();
      showModal.value = true;
    } else {
      message.error('Error al cargar la boleta');
    }
  } catch (error) {
    message.error('Error al cargar la boleta');
  } finally {
    loading.value = false;
  }
};

const downloadPDF = async () => {
  try {
    downloading.value = true;
    // Abrir en nueva pestaña para impresión/PDF
    const url = `/api/v1/payroll/payslip/${props.payslipId}/pdf`;
    window.open(url, '_blank');
    message.success('Boleta abierta para descarga');
  } catch (error) {
    message.error('Error al descargar');
  } finally {
    downloading.value = false;
  }
};

const sendEmail = async () => {
  try {
    if (!props.employeeEmail) {
      message.warning('El empleado no tiene email registrado');
      return;
    }
    
    sending.value = true;
    const response = await fetch(`/api/v1/payroll/payslip/${props.payslipId}/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    if (data.success) {
      message.success('Boleta preparada para envío por email');
    } else {
      message.error(data.error || 'Error al enviar email');
    }
  } catch (error) {
    message.error('Error al enviar email');
  } finally {
    sending.value = false;
  }
};

// Exponer método para abrir desde fuera
defineExpose({
  openPreview,
});
</script>

<style scoped>
.pdf-container {
  max-height: 600px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 20px;
}

.pdf-container :deep(.boleta-container) {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
