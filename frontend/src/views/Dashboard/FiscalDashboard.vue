<template>
  <MainLayout>
    <!-- Context Banner -->
    <div class="bg-primary/10 dark:bg-primary/5 border-b border-primary/10 mb-6">
      <div class="flex items-center justify-between flex-wrap gap-2 px-4 py-3">
        <div class="flex items-center gap-2 text-primary text-sm font-medium">
          <span class="material-icons-outlined text-base">info</span>
          <span>Visualizando datos fiscales estrictos para la entidad seleccionada.</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Última sincronización SUNAT: Hace 15 min</span>
          <button class="text-primary hover:underline flex items-center gap-1">
            <span class="material-icons-outlined text-sm">refresh</span> Actualizar
          </button>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Resumen Fiscal Mensual</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Periodo: {{ currentPeriod }} • {{ currentRegime }}</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
          <span class="material-icons-outlined text-base">download</span> Exportar PLE
        </button>
        <button class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
          <span class="material-icons-outlined text-base">add</span> Nueva Declaración
        </button>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- KPI 1: Gasto Operativo -->
      <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span class="material-icons-outlined text-6xl text-primary">account_balance_wallet</span>
        </div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gasto Total (RUC)</p>
        <div class="mt-2 flex items-baseline gap-2">
          <h3 class="text-3xl font-bold text-slate-900 dark:text-white font-mono">{{ formatCurrency(kpis.gastoOperativo) }}</h3>
          <span class="text-xs font-medium text-emerald-500 flex items-center">
            <span class="material-icons text-sm">arrow_upward</span> 2.4%
          </span>
        </div>
        <div class="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-primary w-[75%] rounded-full"></div>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">vs. Presupuesto asignado</p>
      </div>

      <!-- KPI 2: Provisión PLAME -->
      <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span class="material-icons-outlined text-6xl text-indigo-500">groups</span>
        </div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Provisión PLAME</p>
        <div class="mt-2 flex items-baseline gap-2">
          <h3 class="text-3xl font-bold text-slate-900 dark:text-white font-mono">{{ formatCurrency(kpis.provisionPlame) }}</h3>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Vencimiento: {{ kpis.vencimientoPlame }}</p>
        <div class="flex -space-x-2 overflow-hidden">
          <img v-for="i in 3" :key="i" alt="Employee" class="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark object-cover" :src="`https://lh3.googleusercontent.com/aida-public/AB6AXuAW0G0B_m_JIikHSuxCozFAAVkSrdA3yAFOHD_4_0UWgOdukBE4an6wTQc57Z3Fp1l1LqoS-jFHgs0M4weFNw3BPr6lfi70q_XeF68DNhbS4VuXl1ayoj8GTOUEaBNdyn_HZXQdJzDsa_WXOdOJcTnjs3SHJic1qdNV0m2jECT4kVMPzqU7NlWGkIaQJYgGGkxF5E1ZQj5yC6Bu93JaMoZacsfzAnUthogAGuwI_XFijCLT-Lz511GTvAVmF0Nkn2umCOgwAmNSyCDj${i}`" />
          <div class="h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-medium">+42</div>
        </div>
      </div>

      <!-- KPI 3: Alertas SUNAFIL -->
      <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-red-200 dark:border-red-900/30 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span class="material-icons-outlined text-6xl text-red-500">warning_amber</span>
        </div>
        <p class="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
          <span class="material-icons text-base">gavel</span> Estado SUNAFIL
        </p>
        <div class="mt-2 flex items-baseline gap-2">
          <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ kpis.alertasSunafil.critica }}</h3>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium">{{ kpis.alertasSunafil.titulo }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ kpis.alertasSunafil.descripcion }}</p>
        <button class="mt-4 w-full py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors uppercase tracking-wide">
          Ver Buzón
        </button>
      </div>

      <!-- KPI 4: Retenciones IGV -->
      <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span class="material-icons-outlined text-6xl text-emerald-500">receipt_long</span>
        </div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Crédito Fiscal</p>
        <div class="mt-2 flex items-baseline gap-2">
          <h3 class="text-3xl font-bold text-slate-900 dark:text-white font-mono">{{ formatCurrency(kpis.creditoFiscal) }}</h3>
        </div>
        <div class="mt-4 flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div> IGV Compras
          </div>
          <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div> Detracciones
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area: Charts & Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Chart & PLAME Table (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Chart Section -->
        <div class="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Evolución de Gasto por Centro de Costos</h3>
            <select v-model="chartPeriod" class="bg-slate-50 dark:bg-slate-800 border-none text-xs rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary">
              <option value="6">Últimos 6 meses</option>
              <option value="12">Últimos 12 meses</option>
              <option value="ytd">Anual 2023</option>
            </select>
          </div>
          <!-- CSS Bar Chart -->
          <div class="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
            <div v-for="(month, index) in costEvolution" :key="index" class="flex flex-col items-center gap-2 group w-full">
              <div class="relative w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm h-full flex items-end">
                <div class="w-full bg-primary/40 group-hover:bg-primary/60 transition-all rounded-t-sm" :style="{ height: month.servicesPercentage + '%' }"></div>
                <div class="absolute bottom-0 w-full bg-primary group-hover:bg-primary-dark transition-all rounded-t-sm" :style="{ height: month.payrollPercentage + '%' }"></div>
              </div>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ month.name }}</span>
            </div>
          </div>
          <div class="flex justify-center gap-6 mt-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-primary rounded-sm"></div>
              <span class="text-xs text-slate-500 dark:text-slate-400">Planilla (Remunerativo)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-primary/40 rounded-sm"></div>
              <span class="text-xs text-slate-500 dark:text-slate-400">Servicios Terceros</span>
            </div>
          </div>
        </div>

        <!-- PLAME Detail Table -->
        <div class="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Detalle de Conceptos (PLAME)</h3>
            <button class="text-primary text-sm font-medium hover:underline">Ver reporte completo</button>
          </div>
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th class="px-6 py-3">Código</th>
                  <th class="px-6 py-3">Concepto</th>
                  <th class="px-6 py-3">Base Imponible</th>
                  <th class="px-6 py-3 text-right">Monto (S/)</th>
                  <th class="px-6 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                <tr v-for="item in plameItems" :key="item.codigo" class="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td class="px-6 py-4 font-mono text-slate-500">{{ item.codigo }}</td>
                  <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ item.concepto }}</td>
                  <td class="px-6 py-4 text-slate-500">{{ formatCurrency(item.baseImponible) }}</td>
                  <td class="px-6 py-4 text-right font-mono font-medium">{{ formatCurrency(item.monto) }}</td>
                  <td class="px-6 py-4 text-center">
                    <span :class="getStatusClass(item.estado)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ item.estadoLabel }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Sidebar Widgets (1/3) -->
      <div class="space-y-6">
        <!-- SUNAFIL Notifications -->
        <div class="bg-surface-dark rounded-xl border border-slate-700 shadow-sm p-6 relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="flex items-center gap-3 mb-6 relative z-10">
            <div class="p-2 bg-slate-800 rounded-lg border border-slate-700">
              <span class="material-icons-outlined text-slate-300">notifications_active</span>
            </div>
            <div>
              <h3 class="font-bold text-white">Buzón SUNAFIL</h3>
              <p class="text-xs text-slate-400">Entidad: {{ currentEntity }}</p>
            </div>
          </div>
          <div class="space-y-4 relative z-10">
            <div v-for="alert in sunafilAlerts" :key="alert.id" class="flex gap-3 items-start p-3" :class="alert.tipo === 'critico' ? 'bg-red-900/10 border border-red-900/30 rounded-lg' : 'bg-slate-800/50 border border-slate-700 rounded-lg'">
              <div class="mt-0.5" :class="alert.tipo === 'critico' ? 'text-red-400' : 'text-blue-400'">
                <span class="material-icons text-sm">{{ alert.tipo === 'critico' ? 'priority_high' : 'mail' }}</span>
              </div>
              <div>
                <h4 class="text-sm font-semibold" :class="alert.tipo === 'critico' ? 'text-red-200' : 'text-slate-200'">{{ alert.titulo }}</h4>
                <p class="text-xs text-slate-400 mt-1">{{ alert.descripcion }}</p>
                <button v-if="alert.accion" class="mt-2 text-xs" :class="alert.tipo === 'critico' ? 'text-red-400 font-medium hover:text-red-300' : 'text-slate-400 hover:text-slate-300'">
                  {{ alert.accion }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Deadlines -->
        <div class="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 class="font-bold text-slate-900 dark:text-white mb-4">Vencimientos Próximos</h3>
          <div class="relative pl-4 border-l border-slate-200 dark:border-slate-700 space-y-6">
            <div v-for="deadline in upcomingDeadlines" :key="deadline.id" class="relative">
              <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full" :class="deadline.completed ? 'bg-primary ring-4 ring-white dark:ring-surface-dark' : 'bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-surface-dark'"></div>
              <p class="text-xs text-slate-500 font-semibold mb-1">{{ deadline.fecha }}</p>
              <h4 class="text-sm font-medium text-slate-900 dark:text-white">{{ deadline.titulo }}</h4>
              <p class="text-xs text-slate-500 mt-1">{{ deadline.descripcion }}</p>
            </div>
          </div>
          <button class="w-full mt-6 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Ver Calendario Fiscal
          </button>
        </div>

        <!-- Quick Actions Card -->
        <div class="bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-10">
            <span class="material-icons text-8xl">bolt</span>
          </div>
          <h3 class="font-bold text-lg mb-2 relative z-10">Acciones Rápidas</h3>
          <p class="text-primary-100 text-sm mb-4 relative z-10">Gestiona la entidad actual sin salir del dashboard.</p>
          <div class="space-y-2 relative z-10">
            <button class="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-2">
              <span class="material-icons text-base">file_upload</span> Subir T-Registro
            </button>
            <button class="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-2">
              <span class="material-icons text-base">settings</span> Configurar Centros de Costo
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'

// State
const currentEntity = 'Inversiones A SAC'
const currentPeriod = 'Octubre 2023'
const currentRegime = 'Régimen General'
const chartPeriod = ref('6')

const kpis = ref({
  gastoOperativo: 145230,
  provisionPlame: 12400,
  vencimientoPlame: '14 Noviembre',
  creditoFiscal: 3850,
  alertasSunafil: {
    critica: '1 Crítica',
    titulo: 'Casilla Electrónica',
    descripcion: 'Requerimiento de Info. pendiente.'
  }
})

const costEvolution = ref([
  { name: 'MAY', payrollPercentage: 30, servicesPercentage: 45 },
  { name: 'JUN', payrollPercentage: 35, servicesPercentage: 55 },
  { name: 'JUL', payrollPercentage: 48, servicesPercentage: 60 },
  { name: 'AGO', payrollPercentage: 25, servicesPercentage: 40 },
  { name: 'SEP', payrollPercentage: 55, servicesPercentage: 75 },
  { name: 'OCT', payrollPercentage: 50, servicesPercentage: 65 }
])

const plameItems = ref([
  { codigo: '0601', concepto: 'EsSalud - Seguro Regular', baseImponible: 45200, monto: 4068, estado: 'ok', estadoLabel: 'Calculado' },
  { codigo: '0605', concepto: 'Renta 5ta Categoría', baseImponible: 12800, monto: 1450.50, estado: 'warning', estadoLabel: 'Revisión' },
  { codigo: '0804', concepto: 'ONP - SNP', baseImponible: 28400, monto: 3692, estado: 'ok', estadoLabel: 'Calculado' },
  { codigo: '0809', concepto: 'SCTR Salud', baseImponible: 45200, monto: 587.60, estado: 'ok', estadoLabel: 'Calculado' }
])

const sunafilAlerts = ref([
  { id: 1, tipo: 'critico', titulo: 'Requerimiento de Información', descripcion: 'Expediente No. 2390-2023. Plazo vence en 48 horas.', accion: 'Ver Documento' },
  { id: 2, tipo: 'info', titulo: 'Notificación de Cierre', descripcion: 'Orden de inspección 002 finalizada sin sanciones.' }
])

const upcomingDeadlines = ref([
  { id: 1, fecha: '14 NOV 2023', titulo: 'Declaración PLAME', descripcion: 'Planilla Electrónica Mensual', completed: true },
  { id: 2, fecha: '18 NOV 2023', titulo: 'Pago AFP', descripcion: 'Aportes Previsionales', completed: false },
  { id: 3, fecha: '20 NOV 2023', titulo: 'Impuesto a la Renta', descripcion: 'Pago a cuenta mensual', completed: false }
])

// Methods
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(value)
}

function getStatusClass(estado: string): string {
  const classes: Record<string, string> = {
    ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return classes[estado] || classes.ok
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1e232e;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
