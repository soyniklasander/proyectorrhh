<script setup lang="ts">
import { ref } from 'vue'

const selectedPeriod = ref('nov-2024')
const currentTab = ref('provisiones')

const tabs = [
  { id: 'provisiones', label: 'Provisiones' },
  { id: 'cierre', label: 'Cierre de Periodo' },
  { id: 'historico', label: 'Historico' }
]

const periods = [
  { value: 'nov-2024', label: 'Noviembre 2024', status: 'abierto' },
  { value: 'oct-2024', label: 'Octubre 2024', status: 'cerrado' },
  { value: 'sep-2024', label: 'Septiembre 2024', status: 'cerrado' }
]

const provisions = ref([
  { id: 'PROV-001', concept: 'Vacaciones Truncas', amount: 45250.00, employees: 8, status: 'calculado' },
  { id: 'PROV-002', concept: 'Gratificacion Trunca', amount: 125800.00, employees: 12, status: 'calculado' },
  { id: 'PROV-003', concept: 'CTS Trunca', amount: 89200.00, employees: 6, status: 'calculado' },
  { id: 'PROV-004', concept: 'Indemnizacion por Tiempo de Servicios', amount: 245000.00, employees: 3, status: 'pendiente' },
  { id: 'PROV-005', concept: 'Compensacion por Tiempo de Servicios (CTS)', amount: 156000.00, employees: 142, status: 'calculado' }
])

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'calculado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'pendiente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'cerrado': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
    default: return 'bg-slate-100 text-slate-800'
  }
}

const totalProvisions = () => {
  return provisions.value.reduce((sum, p) => sum + p.amount, 0)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold mb-2">Cierre y Provisiones</h1>
        <p class="text-slate-500">Gestion de provisiones laborales y cierre de periodos contables.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
          <span class="material-icons text-sm">download</span>
          Exportar Reporte
        </button>
        <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-primary/20">
          <span class="material-icons text-sm\">lock</span>
          Cerrar Periodo
        </button>
      </div>
    </div>

    <!-- Period Selector -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-2">Periodo</label>
          <select v-model="selectedPeriod" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option v-for="period in periods" :key="period.value" :value="period.value">{{ period.label }}</option>
          </select>
        </div>
        <div class="flex gap-2 mt-6">
          <span class="px-3 py-1 rounded-full text-xs font-medium" :class="periods.find(p => p.value === selectedPeriod)?.status === 'abierto' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'">
            {{ periods.find(p => p.value === selectedPeriod)?.status === 'abierto' ? 'ABIERTO' : 'CERRADO' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-slate-200 dark:border-slate-700">
      <div class="flex gap-6 overflow-x-auto">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="currentTab = tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="currentTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Vacaciones</p>
            <p class="text-xl font-bold mt-1 text-blue-600">{{ formatCurrency(45250.00) }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-blue-600\">beach_access</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Gratificacion</p>
            <p class="text-xl font-bold mt-1 text-purple-600">{{ formatCurrency(125800.00) }}</p>
          </div>
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-purple-600\">card_giftcard</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">CTS</p>
            <p class="text-xl font-bold mt-1 text-amber-600">{{ formatCurrency(245200.00) }}</p>
          </div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-amber-600\">account_balance</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Total Provisiones</p>
            <p class="text-xl font-bold mt-1 text-green-600">{{ formatCurrency(totalProvisions()) }}</p>
          </div>
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-green-600\">summarize</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Provisiones Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Concepto</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Colaboradores</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-right">Monto (PEN)</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="prov in provisions" :key="prov.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ prov.concept }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ prov.employees }}</td>
              <td class="px-6 py-4 text-right font-medium">{{ formatCurrency(prov.amount) }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(prov.status)">
                  {{ prov.status === 'calculado' ? 'Calculado' : prov.status === 'pendiente' ? 'Pendiente' : prov.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver Detalle">
                    <span class="material-icons text-slate-400 hover:text-primary">visibility</span>
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Recalcular">
                    <span class="material-icons text-slate-400 hover:text-primary">refresh</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 dark:bg-slate-800 font-bold">
            <tr>
              <td class="px-6 py-4">TOTAL</td>
              <td class="px-6 py-4">{{ provisions.reduce((s, p) => s + p.employees, 0) }}</td>
              <td class="px-6 py-4 text-right text-green-600">{{ formatCurrency(totalProvisions()) }}</td>
              <td class="px-6 py-4" colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>
