<script setup lang="ts">
import { ref } from 'vue'

const selectedPeriod = ref('2024')
const currentTab = ref('pendientes')

const tabs = [
  { id: 'pendientes', label: 'Pendientes (8)', icon: 'schedule' },
  { id: 'aprobacion', label: 'Por Aprobar (12)', icon: 'pending_actions' },
  { id: 'historico', label: 'Historico', icon: 'history' }
]

const vacationRequests = ref([
  {
    id: 'VAC-001',
    employee: 'Carlos Ruiz',
    dni: '45678912',
    position: 'Gerente de Ventas',
    department: 'Comercial',
    startDate: '15 Dic, 2024',
    endDate: '30 Dic, 2024',
    days: 12,
    status: 'pendiente',
    requestedDate: '10 Nov, 2024',
    substitute: 'Maria Rodriguez'
  },
  {
    id: 'VAC-002',
    employee: 'Maria Rodriguez',
    dni: '34567890',
    position: 'Analista de Marketing',
    department: 'Marketing',
    startDate: '01 Dic, 2024',
    endDate: '10 Dic, 2024',
    days: 8,
    status: 'pendiente',
    requestedDate: '08 Nov, 2024',
    substitute: 'Juan Perez'
  },
  {
    id: 'VAC-003',
    employee: 'Juan Perez',
    dni: '23456789',
    position: 'Desarrollador Full Stack',
    department: 'Tecnologia',
    startDate: '20 Nov, 2024',
    endDate: '30 Nov, 2024',
    days: 7,
    status: 'aprobacion',
    requestedDate: '05 Nov, 2024',
    substitute: 'Sofia Flores'
  }
])

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pendiente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'aprobacion': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'aprobado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'rechazado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pendiente': return 'schedule'
    case 'aprobacion': return 'pending_actions'
    case 'aprobado': return 'check_circle'
    case 'rechazado': return 'cancel'
    default: return 'help'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold mb-2">Control de Vacaciones</h1>
        <p class="text-slate-500">Gestion y aprobacion de solicitudes de vacaciones del personal.</p>
      </div>
      <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-primary/20">
        <span class="material-icons text-sm">add</span>
        Nueva Solicitud
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Total Personal</p>
            <p class="text-2xl font-bold mt-1">142</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-primary">group</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Dias Disponibles</p>
            <p class="text-2xl font-bold mt-1 text-green-600">2,450</p>
          </div>
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-green-600\">beach_access</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">En Proceso</p>
            <p class="text-2xl font-bold mt-1 text-amber-600">12</p>
          </div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-amber-600">pending_actions</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Programados</p>
            <p class="text-2xl font-bold mt-1 text-purple-600">25</p>
          </div>
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-purple-600\">event</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Tabs -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="p-6 border-b border-slate-200 dark:border-slate-800">
        <div class="flex flex-col md:flex-row gap-4 justify-between">
          <div class="flex gap-2">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="currentTab = tab.id"
              class="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              :class="currentTab === tab.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
            >
              <span class="material-icons text-sm">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </div>
          <div class="flex gap-3">
            <select v-model="selectedPeriod" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
              <span class="material-icons text-sm">filter_list</span>
              Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Solicitud</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Colaborador</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Periodo</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Dias</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Sustituto</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="vacation in vacationRequests" :key="vacation.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ vacation.id }}</p>
                  <p class="text-xs text-slate-500">Solicitado: {{ vacation.requestedDate }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ vacation.employee }}</p>
                  <p class="text-xs text-slate-500">{{ vacation.position }} - {{ vacation.department }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium">{{ vacation.startDate }} - {{ vacation.endDate }}</p>
                </div>
              </td>
              <td class="px-6 py-4 font-bold text-primary">{{ vacation.days }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ vacation.substitute }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(vacation.status)">
                  <span class="material-icons text-xs">{{ getStatusIcon(vacation.status) }}</span>
                  {{ vacation.status === 'pendiente' ? 'Pendiente' : vacation.status === 'aprobacion' ? 'Por Aprobar' : vacation.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver Detalle">
                    <span class="material-icons text-slate-400 hover:text-primary">visibility</span>
                  </button>
                  <button v-if="vacation.status === 'aprobacion'" class="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Aprobar">
                    <span class="material-icons text-green-500 hover:text-green-600">check</span>
                  </button>
                  <button v-if="vacation.status === 'aprobacion'" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Rechazar">
                    <span class="material-icons text-red-500 hover:text-red-600">close</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-500">Mostrando 1-3 de 20 solicitudes</p>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700" disabled>Anterior</button>
          <button class="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">2</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>
