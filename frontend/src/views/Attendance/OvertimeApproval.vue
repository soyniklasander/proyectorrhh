<script setup lang="ts">
import { ref } from 'vue'

const selectedDate = ref('2024-11-10')
const selectedVenue = ref('todas')

const overtimeRequests = ref([
  {
    id: 'OT-001',
    employee: 'Carlos Ruiz',
    dni: '45678912',
    position: 'Gerente de Ventas',
    department: 'Comercial',
    date: '09 Nov, 2024',
    hours: 3,
    type: 'Horas Extra',
    reason: 'Cierre de trimestre - Informe de ventas',
    status: 'pendiente'
  },
  {
    id: 'OT-002',
    employee: 'Maria Rodriguez',
    dni: '34567890',
    position: 'Analista de Marketing',
    department: 'Marketing',
    date: '08 Nov, 2024',
    hours: 2,
    type: 'Horas Extra',
    reason: 'Campana publicitaria urgente',
    status: 'aprobado'
  },
  {
    id: 'OT-003',
    employee: 'Juan Perez',
    dni: '23456789',
    position: 'Desarrollador Full Stack',
    department: 'Tecnologia',
    date: '10 Nov, 2024',
    hours: 4,
    type: 'Horas Extra',
    reason: 'Mantenimiento de servidores',
    status: 'pendiente'
  }
])

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pendiente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'aprobado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'rechazado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-slate-100 text-slate-800'
  }
}

const formatCurrency = (hours: number) => {
  const rate = 15 // tasa por hora
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(hours * rate)
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Aprobacion Masiva de Sobretiempos</h1>
      <p class="text-slate-500">Revise y apruebe las solicitudes de horas extras y sobretiempos del personal.</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Total Solicitudes</p>
            <p class="text-2xl font-bold mt-1">24</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-primary">timer</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Pendientes</p>
            <p class="text-2xl font-bold mt-1 text-amber-600">12</p>
          </div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-amber-600">pending</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Horas Totales</p>
            <p class="text-2xl font-bold mt-1 text-purple-600">156</p>
          </div>
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-purple-600\">schedule</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Costo Estimado</p>
            <p class="text-2xl font-bold mt-1 text-green-600">S/ 2,340</p>
          </div>
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-green-600\">attach_money</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium mb-2">Fecha</label>
          <input v-model="selectedDate" type="date" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-2">Sede</label>
          <select v-model="selectedVenue" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option value="todas">Todas las Sedes</option>
            <option value="miraflores">Miraflores</option>
            <option value="san_isidro">San Isidro</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Esta Semana</button>
          <button class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Este Mes</button>
        </div>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="font-bold">Solicitudes de Sobretiempos</h2>
        <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <span class="material-icons text-sm">check</span>
          Aprobar Todos
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Solicitud</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Colaborador</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Area</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Fecha</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Horas</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Motivo</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Costo</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="request in overtimeRequests" :key="request.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 font-medium">{{ request.id }}</td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ request.employee }}</p>
                  <p class="text-xs text-slate-500">DNI: {{ request.dni }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ request.department }}</td>
              <td class="px-6 py-4">{{ request.date }}</td>
              <td class="px-6 py-4 font-bold text-primary">{{ request.hours }} hrs</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{{ request.reason }}</td>
              <td class="px-6 py-4 font-medium text-green-600">{{ formatCurrency(request.hours) }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(request.status)">
                  {{ request.status === 'pendiente' ? 'Pendiente' : request.status === 'aprobado' ? 'Aprobado' : request.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button v-if="request.status === 'pendiente'" class="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Aprobar">
                    <span class="material-icons text-green-500 hover:text-green-600">check</span>
                  </button>
                  <button v-if="request.status === 'pendiente'" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Rechazar">
                    <span class="material-icons text-red-500 hover:text-red-600">close</span>
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver Detalle">
                    <span class="material-icons text-slate-400 hover:text-primary">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-500">Mostrando 1-3 de 12 solicitudes</p>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700" disabled>Anterior</button>
          <button class="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>
