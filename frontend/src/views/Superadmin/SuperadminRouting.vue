<script setup lang="ts">
import { ref } from 'vue'

// KPIs
const kpis = ref([
  {
    title: 'Tenants Activos',
    value: '1,248',
    change: '+5.2%',
    trend: 'up',
    icon: 'apartment',
    color: 'primary'
  },
  {
    title: 'Ingresos (MRR)',
    value: '$452.8k',
    change: '+12%',
    trend: 'up',
    icon: 'attach_money',
    color: 'emerald'
  },
  {
    title: 'Salud Sistema',
    value: '99.99%',
    change: 'Estable',
    trend: 'stable',
    icon: 'health_and_safety',
    color: 'blue'
  },
  {
    title: 'Usuarios Activos',
    value: '45.2k',
    change: '+8.4%',
    trend: 'up',
    icon: 'group',
    color: 'indigo'
  }
])

// Organizations
const organizations = ref([
  {
    id: '1',
    name: 'Acme Corp',
    subdomain: 'acme.nexa.corp',
    initial: 'A',
    color: 'bg-orange-500',
    plan: 'Enterprise',
    status: 'active',
    users: '1,420'
  },
  {
    id: '2',
    name: 'Globex Inc.',
    subdomain: 'globex.nexa.corp',
    initial: 'G',
    color: 'bg-blue-500',
    plan: 'Pro',
    status: 'active',
    users: '84'
  },
  {
    id: '3',
    name: 'Soylent Corp',
    subdomain: 'soylent.nexa.corp',
    initial: 'S',
    color: 'bg-slate-700',
    plan: 'Starter',
    status: 'suspended',
    users: '12'
  },
  {
    id: '4',
    name: 'Massive Dynamic',
    subdomain: 'massive.nexa.corp',
    initial: 'M',
    color: 'bg-indigo-500',
    plan: 'Enterprise',
    status: 'active',
    users: '3,205'
  }
])

// System Alerts
const systemAlerts = ref([
  {
    severity: 'critical',
    title: 'High CPU Load - DB Cluster 01',
    time: 'Hace 15 min',
    location: 'Node us-east-1a'
  },
  {
    severity: 'warning',
    title: 'Payment Gateway Latency',
    time: 'Hace 42 min',
    location: 'Stripe API'
  },
  {
    severity: 'info',
    title: 'New Tenant Provisioned',
    time: 'Hace 1h',
    location: 'Cyberdyne Sys'
  }
])

// Plan Distribution
const planDistribution = ref([
  { plan: 'Enterprise', percentage: 45 },
  { plan: 'Pro', percentage: 30 },
  { plan: 'Starter', percentage: 25 }
])

// Chart Data (24h)
const chartData = ref([40, 55, 70, 65, 85, 50, 60, 75, 45, 30, 55, 90])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-500'
    case 'suspended': return 'bg-red-500'
    default: return 'bg-slate-500'
  }
}

const getAlertColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'border-red-500'
    case 'warning': return 'border-orange-500'
    case 'info': return 'border-blue-500'
    default: return 'border-slate-500'
  }
}

const getPlanBadge = (plan: string) => {
  switch (plan) {
    case 'Enterprise': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    case 'Pro': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'Starter': return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    default: return 'bg-slate-500/10 text-slate-500'
  }
}
</script>

<template>
  <div class="flex-1 overflow-y-auto px-8 pb-8 scroll-smooth">
    <div class="max-w-7xl mx-auto pt-6 space-y-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Vista General</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Monitoreo en tiempo real del ecosistema NexaCorp.</p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#181b21] border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
            <span class="material-icons text-[18px]">refresh</span>
            Limpiar Cache
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
            <span class="material-icons text-[18px]">add</span>
            Nuevo Tenant
          </button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(kpi, index) in kpis" 
          :key="index"
          class="p-5 rounded-xl bg-white dark:bg-[#181b21] border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ kpi.title }}</p>
              <h3 class="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{{ kpi.value }}</h3>
            </div>
            <div 
              class="p-2 rounded-lg"
              :class="kpi.color === 'primary' ? 'bg-primary/10 text-primary' : kpi.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-indigo-500/10 text-indigo-500'"
            >
              <span class="material-icons">{{ kpi.icon }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span 
              class="flex items-center text-xs font-bold px-1.5 py-0.5 rounded"
              :class="kpi.trend === 'up' ? 'text-green-500 bg-green-500/10' : 'text-slate-500 bg-slate-500/10'"
            >
              <span v-if="kpi.trend === 'up'" class="material-icons text-[14px] mr-0.5">trending_up</span>
              <span v-else class="material-icons text-[14px] mr-0.5">remove</span>
              {{ kpi.change }}
            </span>
            <span class="text-xs text-slate-400">vs mes anterior</span>
          </div>
        </div>
      </div>

      <!-- Main Grid Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <!-- Tenant List (Takes up 2/3) -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <!-- Chart Area -->
          <div class="bg-white dark:bg-[#181b21] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-semibold text-slate-900 dark:text-white">Rendimiento Global</h3>
              <select class="bg-transparent border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1 px-2 focus:outline-none focus:border-primary text-slate-500 dark:text-slate-400">
                <option>Últimas 24 horas</option>
                <option>Últimos 7 días</option>
                <option>Últimos 30 días</option>
              </select>
            </div>
            <!-- Mock Chart Representation -->
            <div class="relative h-64 w-full flex items-end justify-between gap-2 px-2">
              <div class="absolute inset-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                <div class="w-full h-px bg-slate-100 dark:bg-white/5"></div>
                <div class="w-full h-px bg-slate-100 dark:bg-white/5"></div>
                <div class="w-full h-px bg-slate-100 dark:bg-white/5"></div>
                <div class="w-full h-px bg-slate-100 dark:bg-white/5"></div>
              </div>
              <!-- Bars -->
              <div 
                v-for="(value, index) in chartData" 
                :key="index"
                class="w-full rounded-t-sm hover:bg-primary/40 transition-all cursor-pointer relative group"
                :class="index === chartData.length - 1 ? 'bg-primary h-[90%] shadow-[0_0_15px_rgba(44,96,206,0.5)]' : 'bg-primary/20 h-[' + value + '%]'"
              >
                <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Latency: {{ value }}ms
                </div>
              </div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-slate-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </div>

          <!-- Tenant Table -->
          <div class="bg-white dark:bg-[#181b21] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex-1">
            <div class="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <h3 class="font-semibold text-slate-900 dark:text-white">Organizaciones Recientes</h3>
              <a class="text-sm text-primary hover:text-primary-light font-medium" href="#">Ver todas</a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                    <th class="px-6 py-4">Organización</th>
                    <th class="px-6 py-4">Plan</th>
                    <th class="px-6 py-4">Estado</th>
                    <th class="px-6 py-4">Usuarios</th>
                    <th class="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="text-sm divide-y divide-slate-200 dark:divide-white/5">
                  <tr 
                    v-for="org in organizations" 
                    :key="org.id" 
                    class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div 
                          class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          :class="org.color"
                        >
                          {{ org.initial }}
                        </div>
                        <div>
                          <p class="font-medium text-slate-900 dark:text-white">{{ org.name }}</p>
                          <p class="text-xs text-slate-500">{{ org.subdomain }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span 
                        class="px-2.5 py-1 rounded-full text-xs font-medium border"
                        :class="getPlanBadge(org.plan)"
                      >
                        {{ org.plan }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <div 
                          class="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          :class="getStatusColor(org.status)"
                        ></div>
                        <span class="text-slate-700 dark:text-slate-300 capitalize">{{ org.status }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-slate-500">{{ org.users }}</td>
                    <td class="px-6 py-4 text-right">
                      <button class="text-slate-400 hover:text-primary transition-colors flex items-center justify-end w-full gap-1 text-xs font-medium group-hover:opacity-100 opacity-70">
                        <span class="material-icons text-[16px]">login</span>
                        Impersonate
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar Column (Right) -->
        <div class="flex flex-col gap-6">
          <!-- System Alerts Widget -->
          <div class="bg-white dark:bg-[#181b21] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-icons text-orange-500 text-[20px]">warning_amber</span>
                Alertas de Sistema
              </h3>
              <span class="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500 font-bold">2 Critical</span>
            </div>
            <div class="space-y-4">
              <div 
                v-for="(alert, index) in systemAlerts" 
                :key="index"
                class="p-3 rounded-lg bg-background-light dark:bg-black/20 border-l-4"
                :class="getAlertColor(alert.severity)"
              >
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{{ alert.title }}</p>
                <p class="text-xs text-slate-500">{{ alert.time }} • {{ alert.location }}</p>
              </div>
            </div>
            <button class="w-full mt-4 text-xs font-medium text-slate-500 hover:text-primary transition-colors py-2 border border-dashed border-slate-300 dark:border-white/10 rounded-lg hover:border-primary">
              Ver todos los logs
            </button>
          </div>

          <!-- Quick Geo Map (Visual) -->
          <div class="bg-primary rounded-xl shadow-lg shadow-primary/20 overflow-hidden relative min-h-[200px] flex flex-col justify-between p-6 group">
            <!-- Background Image with Overlay -->
            <div class="absolute inset-0 z-0">
              <img 
                class="w-full h-full object-cover opacity-40 mix-blend-overlay" 
                alt="Abstract dark blue world map network connection background"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCejaBzryOo2nlcHY7tu1RUNoC2mXWPS7bah646vuhHks7YKYppJKZlVdCxuzPvxdC7vVtaouJuQRg283k_WYty4D6lrNily8utozQyS-rxW6c9XMoJFKPl4koFtQFJaFacX0SKrgBKWvJaTRnCTtcMNh0RxHswdB_UNGI2xM-PX401gcGXUTJEAHATzKZY5KX7kspYa1u4wHzJftyebuxxV1cf-ATDT75of556x62kWa3mp3PqitzdNSVyZOEHY5ml2bDFpEqXb08o"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-90"></div>
            </div>
            <div class="relative z-10">
              <h3 class="font-bold text-white text-lg">Tráfico Global</h3>
              <p class="text-primary-100 text-sm">Nodos activos en 14 regiones.</p>
            </div>
            <div class="relative z-10 mt-4 flex items-center justify-between">
              <div>
                <p class="text-xs text-white/70 uppercase tracking-wider">Top Region</p>
                <p class="font-bold text-white text-xl">US-East</p>
              </div>
              <div class="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                <span class="material-icons">public</span>
              </div>
            </div>
          </div>

          <!-- Mini Distribution Stat -->
          <div class="bg-white dark:bg-[#181b21] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <h3 class="font-semibold text-slate-900 dark:text-white text-sm mb-4">Planes Distribución</h3>
            <div class="space-y-3">
              <div v-for="(item, index) in planDistribution" :key="index">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">{{ item.plan }}</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ item.percentage }}%</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all"
                    :class="index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-blue-500' : 'bg-slate-400'"
                    :style="{ width: item.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
