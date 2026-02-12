<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';
import LoanModal from '../../components/financial/LoanModal.vue';

const auth = useAuthStore();

// State
const loading = ref(false);
const showModal = ref(false);
const financials = ref<any[]>([]);
const searchQuery = ref('');
const activeTab = ref<'discounts' | 'judicial'>('discounts');

// KPIs
const kpis = computed(() => ({
  totalMes: financials.value
    .filter(f => f.status === 'ACTIVE')
    .reduce((sum, f) => sum + f.amount, 0),
  judiciales: financials.value.filter(f => f.type === 'JUDICIAL').length,
  procesados: Math.round((financials.value.filter(f => f.status === 'PAID').length / Math.max(financials.value.length, 1)) * 100),
}));

// Fetch financials
const fetchFinancials = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/v1/financials', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (response.data.success) {
      financials.value = response.data.data;
    }
  } catch (error) {
    console.error('Error fetching financials:', error);
  } finally {
    loading.value = false;
  }
};

// Filtered data
const filteredData = computed(() => {
  let data = financials.value;
  
  if (activeTab.value === 'discounts') {
    data = data.filter(f => ['LOAN', 'ADVANCE'].includes(f.type));
  } else {
    data = data.filter(f => f.type === 'JUDICIAL');
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter(f => 
      f.employee?.full_name?.toLowerCase().includes(query) ||
      f.employee?.dni?.includes(query) ||
      f.description?.toLowerCase().includes(query)
    );
  }
  
  return data;
});

const handleSave = async (data: any) => {
  try {
    const response = await axios.post('/api/v1/financials', data, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (response.data.success) {
      financials.value.unshift(response.data.data);
      showModal.value = false;
    }
  } catch (error) {
    console.error('Error saving financial:', error);
  }
};

onMounted(() => {
  fetchFinancials();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Otros Descuentos y Retenciones</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de descuentos variables (4.3) y retenciones judiciales.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importar Masivo
        </button>
        <button
          @click="showModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Registro
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'discounts'"
          class="py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors"
          :class="activeTab === 'discounts'
            ? 'border-amber-500 text-amber-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descuentos Variables
          <span class="ml-2 bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-xs">
            {{ financials.filter(f => ['LOAN', 'ADVANCE'].includes(f.type)).length }}
          </span>
        </button>
        <button
          @click="activeTab = 'judicial'"
          class="py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors"
          :class="activeTab === 'judicial'
            ? 'border-amber-500 text-amber-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          Retenciones Judiciales
          <span class="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
            {{ financials.filter(f => f.type === 'JUDICIAL').length }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- KPI Cards -->
      <div class="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="absolute right-0 top-0 h-full w-1 bg-amber-500"></div>
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Variable (Mes)</p>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">S/ {{ kpis.totalMes.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="mt-2 text-xs text-emerald-500 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>+2.4% vs mes anterior</span>
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="absolute right-0 top-0 h-full w-1 bg-orange-500"></div>
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Judiciales Activos</p>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">{{ kpis.judiciales }}</span>
            <span class="text-sm text-slate-500">Expedientes</span>
          </div>
          <div class="mt-2 text-xs text-slate-500">
            2 nuevos este mes
          </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Procesados</p>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">{{ kpis.procesados }}%</span>
          </div>
          <div class="mt-2 text-xs text-slate-500">
            Cierre de planilla: 25 Oct
          </div>
        </div>
      </div>

      <!-- Right Panel - Quick Actions -->
      <div class="space-y-6">
        <!-- Quick Judicial Form -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-white font-semibold flex items-center gap-2">
              <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Nuevo Mandato Judicial
            </h3>
            <span class="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded border border-amber-500/20">Legal</span>
          </div>
          <form class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">N° Expediente</label>
              <input class="block w-full bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-white px-3 py-2" placeholder="XP-2023-..." type="text"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Porcentaje / Monto</label>
              <div class="relative">
                <input class="block w-full bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-white px-3 py-2 text-right font-mono" placeholder="0.00" type="text"/>
              </div>
            </div>
            <button class="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-all flex justify-center items-center gap-2" type="button">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Vincular
            </button>
          </form>
        </div>

        <!-- Dropzone -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
          <div class="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h4 class="text-sm font-medium text-slate-900 dark:text-white">Carga Masiva</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Arrastra Excel o CSV aquí</p>
          <button class="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline">Descargar plantilla</button>
        </div>

        <!-- Recent Judicial Activity -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Retenciones Recientes</h3>
          </div>
          <ul class="divide-y divide-slate-200 dark:divide-slate-700">
            <li class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-200">Jorge Diaz</p>
                    <p class="text-xs text-slate-500">Exp: 992-2023 • Alimentos</p>
                  </div>
                </div>
                <span class="text-sm font-bold text-amber-600">35%</span>
              </div>
            </li>
            <li class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-200">Pedro Ruiz</p>
                    <p class="text-xs text-slate-500">Exp: 104-2023 • Embargo</p>
                  </div>
                </div>
                <span class="text-sm font-bold text-amber-600">S/ 500</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main Table -->
      <div class="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Carga de Conceptos
          </h2>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <div class="relative w-full sm:w-64">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                v-model="searchQuery"
                class="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                placeholder="Buscar por DNI o Apellido"
                type="text"
              />
            </div>
            <button class="p-2 text-slate-500 hover:text-amber-600 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Colaborador</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Concepto</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ref. / Fecha</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monto (S/)</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-if="loading" class="animate-pulse">
                <td colspan="6" class="px-6 py-8 text-center text-slate-500">Cargando...</td>
              </tr>
              <tr v-else-if="filteredData.length === 0" class="animate-pulse">
                <td colspan="6" class="px-6 py-8 text-center text-slate-500">No hay registros</td>
              </tr>
              <tr v-for="item in filteredData" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                      {{ item.employee?.full_name?.charAt(0) || '?' }}
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-slate-900 dark:text-white">{{ item.employee?.full_name || 'N/A' }}</div>
                      <div class="text-xs text-slate-500">ID: {{ item.employee?.dni || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': item.type === 'LOAN',
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300': item.type === 'ADVANCE',
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': item.type === 'JUDICIAL',
                    }"
                  >
                    {{ item.type === 'LOAN' ? 'Préstamo' : item.type === 'ADVANCE' ? 'Adelanto' : 'Ret. Judicial' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {{ item.description || 'Sin descripción' }}<br/>
                  <span class="text-xs">{{ new Date(item.start_date * 1000).toLocaleDateString('es-PE') }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white text-right font-mono">
                  S/ {{ item.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': item.status === 'PAID',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': item.status === 'ACTIVE',
                      'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300': item.status === 'CANCELLED',
                    }"
                  >
                    {{ item.status === 'PAID' ? 'Pagado' : item.status === 'ACTIVE' ? 'Activo' : 'Cancelado' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-amber-600 hover:text-amber-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-slate-50 dark:bg-slate-700 px-6 py-3 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between">
          <div class="text-xs text-slate-500 dark:text-slate-400">
            Mostrando 1-{{ filteredData.length }} de {{ financials.length }} resultados
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50">Anterior</button>
            <button class="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600">Siguiente</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loan Modal -->
    <LoanModal
      :show="showModal"
      :employees="[]"
      @close="showModal = false"
      @save="handleSave"
    />
  </div>
</template>
