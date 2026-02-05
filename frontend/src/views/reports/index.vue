<template>
  <div class="reports-dashboard">
    <n-page-header title="Reportes y Análisis" subtitle="Dashboard de métricas de RRHH" />
    
    <n-grid :cols="4" :x-gap="16" :y-gap="16" style="margin-top: 20px;">
      <!-- KPI Cards -->
      <n-grid-item>
        <n-card>
          <n-statistic label="Empleados Activos" :value="metrics.empleadosActivos">
            <template #prefix>
              <n-icon :component="PeopleOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card>
          <n-statistic label="Costo Total Mensual" :value="formatCurrency(metrics.costoTotalMensual)">
            <template #prefix>
              <n-icon :component="CashOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card>
          <n-statistic label="% Ausentismo" :value="metrics.ausentismo?.toFixed(2) + '%'">
            <template #prefix>
              <n-icon :component="TrendingDownOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card>
          <n-statistic label="% Rotación" :value="metrics.rotacion?.toFixed(2) + '%'">
            <template #prefix>
              <n-icon :component="SwapHorizontalOutline" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- Gráficos -->
    <n-grid :cols="2" :x-gap="16" :y-gap="16" style="margin-top: 20px;">
      <n-grid-item>
        <n-card title="Distribución por Departamento">
          <div ref="deptChartRef" style="height: 300px;"></div>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card title="Costo Promedio por Empleado">
          <n-statistic :value="formatCurrency(metrics.costoPromedioPorEmpleado)" />
          <div style="margin-top: 20px;">
            <n-descriptions bordered :column="1">
              <n-descriptions-item label="Nuevos este mes">
                {{ metrics.empleadosNuevosMes || 0 }}
              </n-descriptions-item>
              <n-descriptions-item label="Retirados este mes">
                {{ metrics.empleadosRetiradosMes || 0 }}
              </n-descriptions-item>
            </n-descriptions>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- Reportes PLAME -->
    <n-card title="Reportes SUNAT" style="margin-top: 20px;">
      <n-space>
        <n-form-item label="Período">
          <n-date-picker v-model:value="selectedPeriod" type="month" clearable />
        </n-form-item>
        <n-button type="primary" @click="generatePLAME" :loading="loading">
          <template #icon>
            <n-icon :component="DocumentTextOutline" />
          </template>
          Generar PLAME
        </n-button>
        <n-button @click="exportPLAME" :loading="loading">
          <template #icon>
            <n-icon :component="DownloadOutline" />
          </template>
          Exportar CSV
        </n-button>
      </n-space>
    </n-card>

    <!-- Archivo Bancario -->
    <n-card title="Archivos Bancarios" style="margin-top: 20px;">
      <n-space align="end">
        <n-form-item label="Banco">
          <n-select v-model:value="bankForm.banco" :options="bankOptions" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="Fecha de Pago">
          <n-date-picker v-model:value="bankForm.fechaPago" clearable />
        </n-form-item>
        <n-form-item label="Período">
          <n-date-picker v-model:value="bankForm.periodo" type="month" clearable />
        </n-form-item>
        <n-button type="primary" @click="generateBankFile" :loading="loading">
          <template #icon>
            <n-icon :component="CardOutline" />
          </template>
          Generar Archivo
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useMessage } from 'naive-ui';
import {
  PeopleOutline,
  CashOutline,
  TrendingDownOutline,
  SwapHorizontalOutline,
  DocumentTextOutline,
  DownloadOutline,
  CardOutline,
} from '@vicons/ionicons5';

const message = useMessage();
const loading = ref(false);
const metrics = ref({});
const selectedPeriod = ref(null);
const deptChartRef = ref(null);

const bankForm = reactive({
  banco: 'BCP',
  fechaPago: null,
  periodo: null,
});

const bankOptions = [
  { label: 'BCP', value: 'BCP' },
  { label: 'Interbank', value: 'INTERBANK' },
  { label: 'BBVA', value: 'BBVA' },
  { label: 'Scotiabank', value: 'SCOTIABANK' },
];

const formatCurrency = (value) => {
  if (!value) return 'S/ 0.00';
  return 'S/ ' + value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fetchDashboardMetrics = async () => {
  try {
    loading.value = true;
    const response = await fetch('/api/v1/reports/dashboard', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    if (data.success) {
      metrics.value = data.data;
    }
  } catch (error) {
    message.error('Error al cargar métricas');
  } finally {
    loading.value = false;
  }
};

const generatePLAME = async () => {
  try {
    loading.value = true;
    const period = selectedPeriod.value ? new Date(selectedPeriod.value).toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7);
    const response = await fetch(`/api/v1/reports/plame?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    if (data.success) {
      message.success('Reporte PLAME generado exitosamente');
      console.log('PLAME Data:', data.data);
    }
  } catch (error) {
    message.error('Error al generar PLAME');
  } finally {
    loading.value = false;
  }
};

const exportPLAME = async () => {
  try {
    loading.value = true;
    const period = selectedPeriod.value ? new Date(selectedPeriod.value).toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7);
    const response = await fetch(`/api/v1/reports/plame/export?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PLAME_${period}.csv`;
      a.click();
      message.success('PLAME descargado exitosamente');
    }
  } catch (error) {
    message.error('Error al exportar PLAME');
  } finally {
    loading.value = false;
  }
};

const generateBankFile = async () => {
  try {
    loading.value = true;
    const period = bankForm.periodo ? new Date(bankForm.periodo).toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7);
    const fechaPago = bankForm.fechaPago ? new Date(bankForm.fechaPago).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    const response = await fetch('/api/v1/payroll/export-bank-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        banco: bankForm.banco,
        fechaPago,
        periodo: period,
      }),
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pago_${bankForm.banco}_${period}.txt`;
      a.click();
      message.success('Archivo bancario generado exitosamente');
    }
  } catch (error) {
    message.error('Error al generar archivo bancario');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardMetrics();
});
</script>

<style scoped>
.reports-dashboard {
  padding: 20px;
}
</style>
