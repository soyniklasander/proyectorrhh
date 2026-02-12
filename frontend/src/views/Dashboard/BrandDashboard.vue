<template>
  <MainLayout>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Resumen Ejecutivo</h1>
          <span class="bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Vista Consolidada
          </span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Datos agregados de {{ entities.length }} entidades fiscales activas.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
          <span class="material-icons-outlined text-gray-400">download</span>
          Exportar PDF
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/30">
          <span class="material-icons-outlined">add</span>
          Nuevo Reporte
        </button>
      </div>
    </div>

    <!-- KPI Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- KPI 1: Payroll -->
      <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-all"></div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Nómina Total (Mensual)</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ formatCurrency(kpis.payroll) }}</h3>
          </div>
          <span class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span class="material-icons-outlined text-[10px]">arrow_upward</span> 4.2%
          </span>
        </div>
        <div class="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div class="bg-primary h-full rounded-full" style="width: 78%"></div>
        </div>
        <p class="text-xs text-gray-400 mt-2">78% del presupuesto anual ejecutado</p>
      </div>

      <!-- KPI 2: Headcount -->
      <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-all"></div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Colaboradores Activos</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ formatNumber(kpis.headcount) }}</h3>
          </div>
          <span class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span class="material-icons-outlined text-[10px]">arrow_upward</span> +120
          </span>
        </div>
        <!-- Mini Sparkline -->
        <div class="flex items-end gap-1 h-8">
          <div class="w-1/6 bg-primary/20 h-3 rounded-t"></div>
          <div class="w-1/6 bg-primary/30 h-4 rounded-t"></div>
          <div class="w-1/6 bg-primary/40 h-3 rounded-t"></div>
          <div class="w-1/6 bg-primary/60 h-5 rounded-t"></div>
          <div class="w-1/6 bg-primary/80 h-6 rounded-t"></div>
          <div class="w-1/6 bg-primary h-8 rounded-t"></div>
        </div>
        <p class="text-xs text-gray-400 mt-2">Distribuidos en {{ entities.length }} RUCs</p>
      </div>

      <!-- KPI 3: Compliance -->
      <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-green-500/10 transition-all"></div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Score de Cumplimiento</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ kpis.compliance }}%</h3>
          </div>
          <span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span class="material-icons-outlined text-[10px]">remove</span> 0.0%
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="flex h-3 w-3 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <p class="text-xs text-green-500 font-medium">Todas las obligaciones al día</p>
        </div>
      </div>

      <!-- KPI 4: eNPS -->
      <div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-yellow-500/10 transition-all"></div>
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">eNPS Global</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">+{{ kpis.enps }}</h3>
          </div>
          <span class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span class="material-icons-outlined text-[10px]">arrow_downward</span> 2 pts
          </span>
        </div>
        <div class="flex -space-x-2">
          <img v-for="i in 3" :key="i" alt="Avatar" class="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark object-cover" :src="`https://lh3.googleusercontent.com/aida-public/AB6AXuAwsP0yIvqCNCR0UmncFZvKzN3Yl5e0GPrQVG5Hg8jZKHBNG2HbmHjOFvUmUNqmczHKFVCBeAU0BvD4UmZEnBI7crTgOqWeqXSGVbU6g0Dv4knsXh1f9RscKd-pTFlmPKRPngGrGNPAhVJW0T5r81uGFaHplxMfkbyghtdVcGRC0Lm7TDFeU2HZ5EpavrLDc0My61LOLGfzR4_mdf9mP2Z21F7aMVYq5Ae_0pEcjyOzCUkehh_tD8QQMrDgrDMwA-mFoJKl6vV2INz-${i}`" />
          <div class="h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">+4k</div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-96 mb-6">
      <!-- Main Chart: Payroll Evolution -->
      <div class="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Evolución de Gasto de Nómina (Global)</h3>
          <select v-model="chartPeriod" class="bg-gray-50 dark:bg-background-dark border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 py-1 pl-3 pr-8 focus:ring-primary focus:border-primary">
            <option value="12">Últimos 12 meses</option>
            <option value="ytd">Año Fiscal Actual</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        <!-- Bar Chart -->
        <div class="flex-1 w-full relative flex items-end justify-between gap-2 px-2 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pr-2">
            <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50 h-0"></div>
            <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50 h-0"></div>
            <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50 h-0"></div>
            <div class="w-full border-t border-dashed border-gray-200 dark:border-gray-700/50 h-0"></div>
          </div>
          <div v-for="(month, index) in payrollEvolution" :key="index" class="w-full relative group cursor-pointer">
            <div 
              :class="[
                month.isProjection 
                  ? 'bg-primary/50 border-2 border-dashed border-primary/30' 
                  : 'bg-primary hover:bg-blue-600 shadow-lg shadow-primary/30'
              ]"
              :style="{ height: month.percentage + '%' }"
              class="rounded-t-sm transition-all relative"
            >
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {{ month.value }}
              </div>
            </div>
          </div>
        </div>
        <!-- X Axis Labels -->
        <div class="flex justify-between mt-4 text-xs text-gray-400 font-mono">
          <span v-for="month in months" :key="month">{{ month }}</span>
        </div>
      </div>

      <!-- Secondary Chart: Headcount Donut -->
      <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Headcount por Entidad</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-6">Distribución actual de colaboradores</p>
        <div class="flex-1 flex items-center justify-center relative">
          <div class="w-48 h-48 rounded-full relative" :style="donutStyle">
            <div class="absolute inset-0 m-auto w-32 h-32 bg-white dark:bg-surface-dark rounded-full flex flex-col items-center justify-center">
              <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ formatNumber(kpis.headcount) }}</span>
              <span class="text-xs text-gray-500 uppercase tracking-wide">Total</span>
            </div>
          </div>
        </div>
        <div class="mt-6 space-y-3">
          <div v-for="entity in entities" :key="entity.id" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: entity.color }"></span>
              <span class="text-gray-600 dark:text-gray-300">{{ entity.name }}</span>
            </div>
            <span class="font-medium text-gray-900 dark:text-white">{{ entity.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Grid: Entity Table & Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Table Section -->
      <div class="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Resumen por Entidad</h3>
          <button class="text-primary text-sm font-medium hover:underline">Ver todo</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-background-dark">
              <tr>
                <th class="px-6 py-3 font-medium">Entidad (RUC)</th>
                <th class="px-6 py-3 font-medium">Headcount</th>
                <th class="px-6 py-3 font-medium">Gasto Mensual</th>
                <th class="px-6 py-3 font-medium">Estado</th>
                <th class="px-6 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="entity in entities" :key="entity.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                  <div class="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs" :style="{ backgroundColor: entity.color }">
                    {{ entity.initials }}
                  </div>
                  {{ entity.name }}
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono">{{ formatNumber(entity.headcount) }}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono">{{ formatCurrency(entity.monthlySpend) }}</td>
                <td class="px-6 py-4">
                  <span :class="getStatusClass(entity.status)" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <span class="w-1.5 h-1.5 rounded-full" :class="entity.status === 'ok' ? 'bg-green-500' : entity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'"></span>
                    {{ entity.statusLabel }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button class="text-gray-400 hover:text-primary transition-colors">
                    <span class="material-icons-outlined text-lg">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alerts Feed -->
      <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Actividad Reciente</h3>
        <div class="space-y-6 overflow-y-auto max-h-[400px] pr-2">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <div :class="activity.iconBg" class="w-8 h-8 rounded-full flex items-center justify-center">
                <span :class="activity.icon" class="material-icons-outlined text-sm">{{ activity.iconName }}</span>
              </div>
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">{{ activity.message }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'

// State
const chartPeriod = ref('12')

const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

const kpis = ref({
  payroll: 12450230,
  headcount: 4520,
  compliance: 98.5,
  enps: 42
})

const entities = ref([
  { id: 1, name: 'Nexa Tech S.A.', initials: 'NT', color: '#2c60ce', headcount: 2034, monthlySpend: 5420000, percentage: 45, status: 'ok', statusLabel: 'Al día' },
  { id: 2, name: 'Nexa Services Ltd.', initials: 'NS', color: '#60a5fa', headcount: 1120, monthlySpend: 3150000, percentage: 25, status: 'warning', statusLabel: 'Pendiente' },
  { id: 3, name: 'Nexa Ventures', initials: 'NV', color: '#a78bfa', headcount: 678, monthlySpend: 1890000, percentage: 15, status: 'ok', statusLabel: 'Al día' },
  { id: 4, name: 'Retail Group', initials: 'NR', color: '#fbbf24', headcount: 688, monthlySpend: 1990000, percentage: 15, status: 'alert', statusLabel: 'Alerta' }
])

const payrollEvolution = ref([
  { value: '$8.2M', percentage: 40, isProjection: false },
  { value: '$8.9M', percentage: 45, isProjection: false },
  { value: '$7.5M', percentage: 35, isProjection: false },
  { value: '$9.5M', percentage: 50, isProjection: false },
  { value: '$10.2M', percentage: 55, isProjection: false },
  { value: '$11.0M', percentage: 60, isProjection: false },
  { value: '$11.8M', percentage: 65, isProjection: false },
  { value: '$11.5M', percentage: 62, isProjection: false },
  { value: '$12.5M', percentage: 70, isProjection: false },
  { value: '$13.1M', percentage: 75, isProjection: false },
  { value: '$14.2M', percentage: 85, isProjection: false },
  { value: 'Proyección', percentage: 80, isProjection: true }
])

const recentActivity = ref([
  { id: 1, message: 'Nueva incorporación en Nexa Tech S.A.', icon: 'person_add', iconBg: 'bg-green-100 dark:bg-green-900/30', iconName: 'person_add', time: 'Hace 5 minutos' },
  { id: 2, message: 'Cierre de planilla completado - Octubre 2023', icon: 'check_circle', iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconName: 'check_circle', time: 'Hace 2 horas' },
  { id: 3, message: 'Alerta: Vencimiento de contrato - 5 empleados', icon: 'warning', iconBg: 'bg-yellow-100 dark:bg-yellow-900/30', iconName: 'warning', time: 'Hace 4 horas' },
  { id: 4, message: 'Reporte SUNAT generado exitosamente', icon: 'upload_file', iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconName: 'upload_file', time: 'Hace 1 día' },
  { id: 5, message: 'Actualización de régimen laboral - 12 colaboradores', icon: 'sync', iconBg: 'bg-gray-100 dark:bg-gray-800', iconName: 'sync', time: 'Hace 2 días' }
])

// Computed
const donutStyle = computed(() => {
  const colors = entities.value.map(e => e.color).join(' ')
  const percentages = entities.value.map(e => `${e.percentage}%`).join(' ')
  return {
    background: `conic-gradient(${colors} ${percentages})`
  }
})

// Methods
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    ok: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    alert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return classes[status] || classes.ok
}
</script>
