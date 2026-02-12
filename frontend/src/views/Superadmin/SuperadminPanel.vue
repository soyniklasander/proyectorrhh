<script setup lang="ts">
import { ref } from 'vue'

// KPIs
const kpis = ref([
  {
    title: 'Ingresos Recurrentes (MRR)',
    value: '$124,500',
    change: '+12.5%',
    trend: 'up',
    icon: 'attach_money',
    color: 'primary'
  },
  {
    title: 'Tenants Activos',
    value: '45',
    change: '3 nuevos esta semana',
    trend: 'neutral',
    icon: 'domain',
    color: 'blue'
  },
  {
    title: 'Total Empleados',
    value: '12,403',
    change: '+850 usuarios nuevos',
    trend: 'up',
    icon: 'groups',
    color: 'purple'
  },
  {
    title: 'Estado del Sistema',
    value: '99.98%',
    change: 'Todos los sistemas operativos',
    trend: 'stable',
    icon: 'health_and_safety',
    color: 'emerald'
  }
])

// Tenants
const tenants = ref([
  {
    id: '1',
    name: 'KFC Peru',
    subdomain: 'kfc.nexacorp.com',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaH3uSgXHne1itgm9Aw60Xn1udXGJ2XSzHJ0NchqA6m6DV570YEq6s7VJSyFfmEKcisgJNibTOPXTqZ1_tz05xof1DFhcclnyMLrhtSGqNBML3OEpzW10xKWzGU_mCrdZV28AVA7mpqQy2909H8Z-aHt3XDuc8sGRi7mdU8dkPifBk0imqleQBmKSTiK73XHP71SjctFGahRsWcrVV-TsbLpZo4gsbsRGMGHp2U8E4y1vxsoKENpRhstCpwm6OUcWkCj0M4_ArYLVK',
    plan: 'Enterprise',
    users: 450,
    maxUsers: 500,
    status: 'active',
    billing: '$2,500/mes',
    nextBilling: '15 Oct 2023'
  },
  {
    id: '2',
    name: 'La Lucha',
    subdomain: 'lalucha.nexacorp.com',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxp0t0HmTWUTBDZMUBW_HExCOD5QGaBiPj4bw3yPjLX7XyT9fe7ycljSW4KAYRGB-FRmnq9z0JfiUmz34cyeBZwvsAZpb11mUmDiWPAzubjhBPPP8cuJlmSOyLQs3DlSl0o_NvcVZGKhjqnm1XeF62CJYDlHDWxUE_lepQgpaQHKAkgGjxTtEMbQSyyjVDFbmYNm6nfpbYK337PUOGcMVDVcNBJdWOoKDT2Zm2wZeJPvwgbEUvyUc4w61ChidPtcS3H5bv9LZE_sDk',
    plan: 'Pro',
    users: 85,
    maxUsers: 100,
    status: 'payment_pending',
    billing: '$850/mes',
    nextBilling: '01 Oct 2023',
    overdue: true
  },
  {
    id: '3',
    name: 'Bembos',
    subdomain: 'bembos.nexacorp.com',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMKtNeST3iy_tx-qJty2jMF09lINqOqq-EIOBF9fqN8WdLEIUaiTBRV5xMQpOicNWl0JGktRWg5s8Ql1B7JlumnUFvu-lpUcqg3RJZgFLykb4JcXpPNm90VbKDhhRk6qBh95jDF-K1t3Vjsju3FzMvsIHdBulf7XULtTLSy57gn9-1PoEZ9gYFrXJY2ztwLds0f-eZNwJyu0u5aDFDTp3bgkb30b9O1l5uxUdC9tIZ37Oq6T2nxVIbe-ckWm89tlxEK6Do8CbcCavh',
    plan: 'Enterprise',
    users: 320,
    maxUsers: 500,
    status: 'active',
    billing: '$2,500/mes',
    nextBilling: '22 Oct 2023'
  },
  {
    id: '4',
    name: 'Pardos Chicken',
    subdomain: 'pardos.nexacorp.com',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ciXZqu8yZ5CHhZhhs4KMoI1mmH6e-h_SNQVHWgfRmfgegg6wX4AA1tmbzPxSdd99OB_uK6BdkjDj6sDhoIUj23Vbjv4d8CPHlhnYdD6GLlfVBVjNa4cTjqvS4dj496IDbIF3fLW1kAtS2CAT9vWbaeD2O6wPrgHd4MT1NFgJcDxRJCHRQuTfFwDVWuBrjIXYpHmOF_Ztc3iU5KqRpST0JN31UHLDrlb3iFcbsEB4dMVyT9MCnWWMLG1xN4Qp1HAAY-ZwKZaKYZwf',
    plan: 'Basic',
    users: 42,
    maxUsers: 50,
    status: 'active',
    billing: '$299/mes',
    nextBilling: '05 Nov 2023'
  }
])

// Alerts
const alerts = ref([
  {
    type: 'warning',
    icon: 'warning',
    title: 'Límite de almacenamiento',
    message: 'Tenant KFC Peru al 95% de capacidad.',
    time: 'Hace 2 horas'
  },
  {
    type: 'error',
    icon: 'error',
    title: 'Pago fallido',
    message: 'La Lucha: Tarjeta rechazada.',
    time: 'Hace 5 horas'
  },
  {
    type: 'info',
    icon: 'info',
    title: 'Nuevo Tenant Creado',
    message: 'Cineplanet activado exitosamente.',
    time: 'Hace 1 día'
  }
])

const chartMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const chartData = ref([30, 45, 40, 60, 55, 75, 65, 80, 85, 95, 90, 100])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-500'
    case 'payment_pending': return 'bg-red-500'
    default: return 'bg-slate-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Activo'
    case 'payment_pending': return 'Pago Pendiente'
    default: return status
  }
}

const getPlanColor = (plan: string) => {
  switch (plan) {
    case 'Enterprise': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'Pro': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'Basic': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    default: return 'bg-slate-500/10 text-slate-400'
  }
}

const getAlertColor = (type: string) => {
  switch (type) {
    case 'warning': return 'bg-yellow-500/10 text-yellow-500'
    case 'error': return 'bg-red-500/10 text-red-500'
    case 'info': return 'bg-blue-500/10 text-blue-500'
    default: return 'bg-slate-500/10 text-slate-500'
  }
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
    <!-- Global Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="(kpi, index) in kpis" 
        :key="index"
        class="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors"
      >
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span class="material-icons text-6xl text-primary">{{ kpi.icon }}</span>
        </div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{{ kpi.title }}</p>
        <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ kpi.value }}</h3>
        <div 
          class="flex items-center mt-4 text-xs font-medium w-fit px-2 py-1 rounded-full"
          :class="kpi.trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : kpi.trend === 'stable' ? 'text-slate-400' : 'text-blue-400 bg-blue-400/10'"
        >
          <span v-if="kpi.trend === 'up'" class="material-icons text-sm mr-1">trending_up</span>
          <span v-else-if="kpi.trend === 'stable'" class="material-icons text-sm mr-1">remove</span>
          <span v-else class="material-icons text-sm mr-1">add_circle</span>
          {{ kpi.change }}
        </div>
      </div>
    </div>

    <!-- Charts & Alerts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Chart -->
      <div class="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Crecimiento de Marcas</h3>
          <select class="bg-slate-50 dark:bg-slate-800 border-none text-xs rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer">
            <option>Últimos 12 meses</option>
            <option>Últimos 30 días</option>
            <option>Este año</option>
          </select>
        </div>
        <!-- Simulated Bars Chart -->
        <div class="h-64 w-full bg-gradient-to-b from-primary/10 to-transparent rounded-lg relative overflow-hidden flex items-end justify-between px-4 pb-0 pt-8 gap-2">
          <div 
            v-for="(value, index) in chartData" 
            :key="index"
            class="w-full rounded-t transition-all hover:bg-primary/40"
            :class="index === chartData.length - 1 ? 'bg-primary/60 hover:bg-primary h-[100%] shadow-[0_0_15px_rgba(44,96,206,0.5)]' : 'bg-primary/20 h-[' + value + '%]'"
          ></div>
        </div>
        <div class="flex justify-between mt-4 text-xs text-slate-400 uppercase tracking-wider font-semibold">
          <span v-for="month in chartMonths" :key="month">{{ month }}</span>
        </div>
      </div>

      <!-- Recent Activities / Alerts -->
      <div class="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Alertas Recientes</h3>
        <div class="space-y-6">
          <div v-for="(alert, index) in alerts" :key="index" class="flex gap-4">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getAlertColor(alert.type)"
            >
              <span class="material-icons text-sm">{{ alert.icon }}</span>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-200">{{ alert.title }}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {{ alert.message }}
              </p>
              <span class="text-[10px] text-slate-500 mt-2 block">{{ alert.time }}</span>
            </div>
          </div>
        </div>
        <button class="w-full mt-6 py-2 text-xs font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          Ver todo el historial
        </button>
      </div>
    </div>

    <!-- Tenants Table Section -->
    <div class="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Gestión de Marcas (Tenants)</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Administra el acceso y facturación de tus clientes.</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <span class="material-icons text-sm">filter_list</span>
            Filtros
          </button>
          <button class="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <span class="material-icons text-sm">download</span>
            Exportar
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-500 dark:text-slate-400">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
            <tr>
              <th class="px-6 py-4" scope="col">Marca / Tenant</th>
              <th class="px-6 py-4" scope="col">Plan Actual</th>
              <th class="px-6 py-4 text-center" scope="col">Usuarios</th>
              <th class="px-6 py-4" scope="col">Estado</th>
              <th class="px-6 py-4" scope="col">Facturación</th>
              <th class="px-6 py-4 text-right" scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700/50">
            <tr 
              v-for="tenant in tenants" 
              :key="tenant.id" 
              class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden shadow-sm">
                    <img :alt="`Logo ${tenant.name}`" class="w-full h-full rounded-full object-cover" :src="tenant.logo" />
                  </div>
                  <div>
                    <div class="font-medium text-slate-900 dark:text-white">{{ tenant.name }}</div>
                    <div class="text-xs text-slate-500">{{ tenant.subdomain }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span 
                    class="px-2.5 py-1 rounded-md text-xs font-semibold border"
                    :class="getPlanColor(tenant.plan)"
                  >
                    {{ tenant.plan }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="font-medium text-slate-900 dark:text-white">{{ tenant.users }}</span>
                <span class="text-slate-500 text-xs"> / {{ tenant.maxUsers }}</span>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    class="h-1.5 rounded-full" 
                    :class="tenant.status === 'active' ? 'bg-primary' : 'bg-blue-400'"
                    :style="{ width: (tenant.users / tenant.maxUsers * 100) + '%' }"
                  ></div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusColor(tenant.status)"></span>
                  {{ getStatusText(tenant.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-slate-900 dark:text-white font-medium">{{ tenant.billing }}</div>
                <div 
                  class="text-xs"
                  :class="tenant.overdue ? 'text-red-400 font-medium' : 'text-slate-500'"
                >
                  {{ tenant.overdue ? `Vencido: ${tenant.nextBilling}` : `Próx: ${tenant.nextBilling}` }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-2 text-slate-400 hover:text-primary dark:hover:text-white transition-colors" title="Editar">
                    <span class="material-icons text-lg">edit</span>
                  </button>
                  <button class="p-2 text-slate-400 hover:text-emerald-400 dark:hover:text-emerald-400 transition-colors" title="Login as Tenant">
                    <span class="material-icons text-lg">login</span>
                  </button>
                  <button class="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Suspender">
                    <span class="material-icons text-lg">block</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
        <span class="text-xs text-slate-500 dark:text-slate-400">
          Mostrando <span class="font-medium text-slate-900 dark:text-white">1-4</span> de <span class="font-medium text-slate-900 dark:text-white">45</span> tenants
        </span>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50" disabled>
            Anterior
          </button>
          <button class="px-3 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
