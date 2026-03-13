<script setup lang="ts">
import { ref } from 'vue'

const selectedPeriod1 = ref('nov-2024')
const selectedPeriod2 = ref('oct-2024')
const selectedEntity = ref('todas')

const periods = [
  { value: 'nov-2024', label: 'Noviembre 2024' },
  { value: 'oct-2024', label: 'Octubre 2024' },
  { value: 'sep-2024', label: 'Septiembre 2024' }
]

const entities = [
  { value: 'todas', label: 'Todas las Entidades' },
  { value: 'ruc1', label: 'NexaCorp Peru S.A.C.' },
  { value: 'ruc2', label: 'Inversiones Gastronomicas S.A.' }
]

const comparisonData = ref({
  employees: { current: 142, previous: 140, change: 2, percent: 1.43 },
  payroll: { current: 892450.50, previous: 875230.00, change: 17220.50, percent: 1.97 },
  avgSalary: { current: 6286.27, previous: 6251.64, change: 34.63, percent: 0.55 },
  provisions: { current: 416250.00, previous: 398500.00, change: 17750.00, percent: 4.45 }
})

const detailedComparison = ref([
  { category: 'Sueldos y Salarios', current: 650000.00, previous: 638000.00, change: 12000.00, percent: 1.88 },
  { category: 'Horas Extras', current: 45200.00, previous: 42800.00, change: 2400.00, percent: 5.61 },
  { category: 'Bonificaciones', current: 78500.00, previous: 77200.00, change: 1300.00, percent: 1.68 },
  { category: 'Asignaciones Familiares', current: 45200.00, previous: 44800.00, change: 400.00, percent: 0.89 },
  { category: 'Vacaciones', current: 52000.00, previous: 51000.00, change: 1000.00, percent: 1.96 },
  { category: 'ESSALUD', current: 80320.55, previous: 78770.70, change: 1549.85, percent: 1.97 }
])

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}

const getChangeClass = (percent: number) => {
  if (percent > 0) return 'text-green-600'
  if (percent < 0) return 'text-red-600'
  return 'text-slate-500'
}

const getChangeIcon = (percent: number) => {
  if (percent > 0) return 'trending_up'
  if (percent < 0) return 'trending_down'
  return 'trending_flat'
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Analisis Comparativo Multi-Entidad</h1>
      <p class="text-slate-500">Compare indicadores de nomina entre diferentes periodos y entidades del grupo empresarial.</p>
    </div>

    <!-- Period Selection -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-2">Periodo Actual</label>
          <select v-model="selectedPeriod1" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option v-for="period in periods" :key="period.value" :value="period.value">{{ period.label }}</option>
          </select>
        </div>
        <div class="flex items-center pb-3">
          <span class="material-icons text-slate-400">compare_arrows</span>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-2">Periodo Anterior</label>
          <select v-model="selectedPeriod2" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option v-for="period in periods" :key="period.value" :value="period.value">{{ period.label }}</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-2">Entidad</label>
          <select v-model="selectedEntity" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option v-for="entity in entities" :key="entity.value" :value="entity.value">{{ entity.label }}</option>
          </select>
        </div>
        <button class="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700">Comparar</button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs text-slate-500 uppercase tracking-wider">Colaboradores</span>
          <span class="material-icons text-blue-500">group</span>
        </div>
        <p class="text-2xl font-bold">{{ comparisonData.employees.current }}</p>
        <div class="flex items-center gap-1 mt-2" :class="getChangeClass(comparisonData.employees.percent)">
          <span class="material-icons text-sm">{{ getChangeIcon(comparisonData.employees.percent) }}</span>
          <span class="text-sm font-medium">{{ comparisonData.employees.percent > 0 ? '+' : '' }}{{ comparisonData.employees.percent }}%</span>
          <span class="text-xs text-slate-400">vs {{ comparisonData.employees.previous }}</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs text-slate-500 uppercase tracking-wider">Total Planilla</span>
          <span class="material-icons text-green-500">payments</span>
        </div>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(comparisonData.payroll.current) }}</p>
        <div class="flex items-center gap-1 mt-2" :class="getChangeClass(comparisonData.payroll.percent)">
          <span class="material-icons text-sm">{{ getChangeIcon(comparisonData.payroll.percent) }}</span>
          <span class="text-sm font-medium">{{ comparisonData.payroll.percent > 0 ? '+' : '' }}{{ comparisonData.payroll.percent }}%</span>
          <span class="text-xs text-slate-400">vs {{ formatCurrency(comparisonData.payroll.previous) }}</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs text-slate-500 uppercase tracking-wider">Salario Promedio</span>
          <span class="material-icons text-purple-500\">account_balance_wallet</span>
        </div>
        <p class="text-2xl font-bold">{{ formatCurrency(comparisonData.avgSalary.current) }}</p>
        <div class="flex items-center gap-1 mt-2" :class="getChangeClass(comparisonData.avgSalary.percent)">
          <span class="material-icons text-sm">{{ getChangeIcon(comparisonData.avgSalary.percent) }}</span>
          <span class="text-sm font-medium">{{ comparisonData.avgSalary.percent > 0 ? '+' : '' }}{{ comparisonData.avgSalary.percent }}%</span>
          <span class="text-xs text-slate-400">vs {{ formatCurrency(comparisonData.avgSalary.previous) }}</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs text-slate-500 uppercase tracking-wider">Provisiones</span>
          <span class="material-icons text-amber-500">savings</span>
        </div>
        <p class="text-2xl font-bold text-amber-600">{{ formatCurrency(comparisonData.provisions.current) }}</p>
        <div class="flex items-center gap-1 mt-2" :class="getChangeClass(comparisonData.provisions.percent)">
          <span class="material-icons text-sm">{{ getChangeIcon(comparisonData.provisions.percent) }}</span>
          <span class="text-sm font-medium">{{ comparisonData.provisions.percent > 0 ? '+' : '' }}{{ comparisonData.provisions.percent }}%</span>
          <span class="text-xs text-slate-400">vs {{ formatCurrency(comparisonData.provisions.previous) }}</span>
        </div>
      </div>
    </div>

    <!-- Detailed Comparison Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 class="font-bold">Detalle por Categoria</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Categoria</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-right">Periodo Actual</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-right">Periodo Anterior</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-right">Variacion</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-right">% Cambio</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="item in detailedComparison" :key="item.category" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ item.category }}</td>
              <td class="px-6 py-4 text-right">{{ formatCurrency(item.current) }}</td>
              <td class="px-6 py-4 text-right text-slate-500">{{ formatCurrency(item.previous) }}</td>
              <td class="px-6 py-4 text-right font-medium" :class="item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-slate-500'">
                {{ item.change > 0 ? '+' : '' }}{{ formatCurrency(item.change) }}
              </td>
              <td class="px-6 py-4 text-right">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" :class="item.percent > 0 ? 'bg-green-100 text-green-800' : item.percent < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'">
                  <span class="material-icons text-xs">{{ getChangeIcon(item.percent) }}</span>
                  {{ item.percent > 0 ? '+' : '' }}{{ item.percent.toFixed(2) }}%
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 dark:bg-slate-800 font-bold">
            <tr>
              <td class="px-6 py-4">TOTAL</td>
              <td class="px-6 py-4 text-right text-green-600">{{ formatCurrency(detailedComparison.reduce((s, i) => s + i.current, 0)) }}</td>
              <td class="px-6 py-4 text-right text-slate-500">{{ formatCurrency(detailedComparison.reduce((s, i) => s + i.previous, 0)) }}</td>
              <td class="px-6 py-4 text-right text-green-600">{{ formatCurrency(detailedComparison.reduce((s, i) => s + i.change, 0)) }}</td>
              <td class="px-6 py-4 text-right">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  +{{ (detailedComparison.reduce((s, i) => s + i.change, 0) / detailedComparison.reduce((s, i) => s + i.previous, 0) * 100).toFixed(2) }}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>
