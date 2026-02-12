<script setup lang="ts">
import { ref, computed } from 'vue'

// Period selection
const selectedPeriod = ref('nov-2024')
const periods = [
  { value: 'nov-2024', label: 'Noviembre 2024' },
  { value: 'oct-2024', label: 'Octubre 2024' },
  { value: 'sep-2024', label: 'Septiembre 2024' }
]

const selectedEntity = ref('todas')
const entities = [
  { value: 'todas', label: 'Todas las Entidades' },
  { value: 'ruc1', label: 'NexaCorp Peru S.A.C.' },
  { value: 'ruc2', label: 'Inversiones Gastronomicas S.A.' },
  { value: 'ruc3', label: 'Servicios Corporativos ABC' }
]

// Tab selection
const currentTab = ref('resumen')
const tabs = [
  { id: 'resumen', label: 'Resumen General' },
  { id: 'detalle', label: 'Detalle por Empleado' },
  { id: 'provisiones', label: 'Provisiones' },
  { id: 'conceptos', label: 'Conceptos' }
]

// Employee data
const employees = ref([
  {
    id: 'EMP-001',
    name: 'Carlos Ruiz',
    dni: '45678912',
    position: 'Gerente de Ventas',
    regime: 'general',
    basicSalary: 15000,
    bonuses: 2500,
    hoursExtra: 12,
    amountExtra: 450,
    absences: 0,
    tardiness: 0,
    loan: 0,
    judicial: 0,
    advance: 500,
    pension: 1650,
    gross: 17950,
    net: 15150,
    employer: 3150
  },
  {
    id: 'EMP-002',
    name: 'Maria Rodriguez',
    dni: '34567890',
    position: 'Analista de Marketing',
    regime: 'mype',
    basicSalary: 5500,
    bonuses: 800,
    hoursExtra: 0,
    amountExtra: 0,
    absences: 1,
    tardiness: 30,
    loan: 200,
    judicial: 0,
    advance: 0,
    pension: 605,
    gross: 6300,
    net: 4965,
    employer: 1102.50
  },
  {
    id: 'EMP-003',
    name: 'Juan Perez',
    dni: '23456789',
    position: 'Desarrollador Full Stack',
    regime: 'general',
    basicSalary: 12000,
    bonuses: 1500,
    hoursExtra: 8,
    amountExtra: 300,
    absences: 0,
    tardiness: 0,
    loan: 500,
    judicial: 800,
    advance: 0,
    pension: 1320,
    gross: 13800,
    net: 10680,
    employer: 2415
  },
  {
    id: 'EMP-004',
    name: 'Sofia Flores',
    dni: '12345678',
    position: 'Practicante Admin',
    regime: 'practicante',
    basicSalary: 0,
    bonuses: 0,
    hoursExtra: 0,
    amountExtra: 0,
    absences: 0,
    tardiness: 0,
    loan: 0,
    judicial: 0,
    advance: 0,
    pension: 0,
    gross: 1025,
    net: 1025,
    employer: 179.38
  }
])

// Computed totals
const totalEmployees = computed(() => employees.value.length)
const totalGross = computed(() => employees.value.reduce((sum, e) => sum + e.gross, 0))
const totalNet = computed(() => employees.value.reduce((sum, e) => sum + e.net, 0))
const totalEmployer = computed(() => employees.value.reduce((sum, e) => sum + e.employer, 0))

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}

const getRegimeBadge = (regime: string) => {
  switch (regime) {
    case 'general': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'mype': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'practicante': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    default: return 'bg-slate-100 text-slate-800'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <span class="material-icons text-sm">arrow_back</span>
        <span>Volver al Dashboard</span>
      </div>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Calculo y Consolidacion de Planilla</h1>
          <p class="text-slate-500">Procesamiento masivo de remuneraciones y beneficios sociales.</p>
        </div>
        <div class="flex gap-3">
          <select v-model="selectedPeriod" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
            <option v-for="period in periods" :key="period.value" :value="period.value">{{ period.label }}</option>
          </select>
          <select v-model="selectedEntity" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
            <option v-for="entity in entities" :key="entity.value" :value="entity.value">{{ entity.label }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Colaboradores</p>
            <p class="text-2xl font-bold mt-1">{{ totalEmployees }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-primary">group</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Bruto Total</p>
            <p class="text-xl font-bold mt-1 text-green-600">{{ formatCurrency(totalGross) }}</p>
          </div>
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-green-600">payments</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Descuentos</p>
            <p class="text-xl font-bold mt-1 text-red-600">{{ formatCurrency(124560.80) }}</p>
          </div>
          <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-red-600">remove_circle</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Neto a Pagar</p>
            <p class="text-xl font-bold mt-1 text-primary">{{ formatCurrency(totalNet) }}</p>
          </div>
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span class="material-icons text-primary">account_balance_wallet</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-medium">Aporte Employer</p>
            <p class="text-xl font-bold mt-1 text-purple-600">{{ formatCurrency(totalEmployer) }}</p>
          </div>
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-purple-600">business</span>
          </div>
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

    <!-- Actions Bar -->
    <div class="flex flex-col md:flex-row gap-4 justify-between mb-6">
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
          <span class="material-icons text-sm">filter_list</span>
          Filtros
        </button>
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
          <span class="material-icons text-sm">sort</span>
          Ordenar
        </button>
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
          <span class="material-icons text-sm">download</span>
          Exportar
        </button>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg dark:hover:bg-slate-700 flex-slate-200 items-center gap-2">
          <span class="material-icons text-sm">visibility</span>
          Ver Detalle
        </button>
        <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-primary/20">
          <span class="material-icons text-sm">play_arrow</span>
          Procesar Planilla
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">ID</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Colaborador</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Cargo</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Regimen</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Basico</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Bonif.</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Hrs. Ext.</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Total Desc.</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Neto</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Aporte Emp.</th>
              <th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="employee in employees" :key="employee.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ employee.id }}</td>
              <td class="px-4 py-3">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ employee.name }}</p>
                  <p class="text-xs text-slate-500">DNI: {{ employee.dni }}</p>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ employee.position }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getRegimeBadge(employee.regime)">
                  {{ employee.regime === 'general' ? 'General' : employee.regime === 'mype' ? 'MYPE' : 'Practicante' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-medium">{{ formatCurrency(employee.basicSalary) }}</td>
              <td class="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{{ formatCurrency(employee.bonuses) }}</td>
              <td class="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{{ formatCurrency(employee.amountExtra) }}</td>
              <td class="px-4 py-3 text-right text-red-600">{{ formatCurrency(employee.loan + employee.judicial + employee.advance + employee.pension) }}</td>
              <td class="px-4 py-3 text-right font-bold text-green-600">{{ formatCurrency(employee.net) }}</td>
              <td class="px-4 py-3 text-right text-purple-600">{{ formatCurrency(employee.employer) }}</td>
              <td class="px-4 py-3 text-center">
                <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <span class="material-icons text-slate-400 hover:text-primary text-lg">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 dark:bg-slate-800 font-semibold">
            <tr>
              <td class="px-4 py-3" colspan="4">TOTALES</td>
              <td class="px-4 py-3 text-right">{{ formatCurrency(employees.reduce((s, e) => s + e.basicSalary, 0)) }}</td>
              <td class="px-4 py-3 text-right">{{ formatCurrency(employees.reduce((s, e) => s + e.bonuses, 0)) }}</td>
              <td class="px-4 py-3 text-right">{{ formatCurrency(employees.reduce((s, e) => s + e.amountExtra, 0)) }}</td>
              <td class="px-4 py-3 text-right text-red-600">{{ formatCurrency(employees.reduce((s, e) => s + e.loan + e.judicial + e.advance + e.pension, 0)) }}</td>
              <td class="px-4 py-3 text-right text-green-600">{{ formatCurrency(totalNet) }}</td>
              <td class="px-4 py-3 text-right text-purple-600">{{ formatCurrency(totalEmployer) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-500">Mostrando 1-4 de 142 colaboradores</p>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700" disabled>Anterior</button>
          <button class="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">2</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">3</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>
