<script setup lang="ts">
import { ref } from 'vue'

const selectedEmployee = ref('')
const selectedPeriod = ref('2024')

const soldVacationRequests = ref([
  {
    id: 'VS-001',
    employee: 'Carlos Ruiz',
    dni: '45678912',
    position: 'Gerente de Ventas',
    department: 'Comercial',
    requestedDays: 5,
    reason: 'Necesidades personales urgentes',
    status: 'pendiente',
    requestedDate: '10 Nov, 2024'
  },
  {
    id: 'VS-002',
    employee: 'Maria Rodriguez',
    dni: '34567890',
    position: 'Analista de Marketing',
    department: 'Marketing',
    requestedDays: 3,
    reason: 'Tramites personales',
    status: 'aprobado',
    approvedDate: '08 Nov, 2024',
    requestedDate: '05 Nov, 2024'
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
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Venta de Dias de Vacaciones</h1>
      <p class="text-slate-500">Gestion de solicitudes de venta de dias de vacaciones (Convenio Colectivo).</p>
    </div>

    <!-- Info Card -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
      <div class="flex items-start gap-4">
        <span class="material-icons text-blue-600 dark:text-blue-400 text-2xl">info</span>
        <div>
          <h4 class="font-semibold text-blue-800 dark:text-blue-200">Informacion Importante</h4>
          <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
            La venta de dias de vacaciones esta sujeta al Art. 22 del D.L. N 713 y el articulo 56 de la LPCL. 
            El trabajador puede vender hasta un maximo de 30 dias de sus vacaciones acumuladas por ano. 
            Requiere aprobacion del area de RRHH y Gerencia.
          </p>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
      <h2 class="text-lg font-bold mb-4">Nueva Solicitud de Venta</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium mb-2">Colaborador</label>
          <select v-model="selectedEmployee" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option value="">Seleccionar colaborador</option>
            <option value="1">Carlos Ruiz - DNI 45678912</option>
            <option value="2">Maria Rodriguez - DNI 34567890</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Dias a Vender</label>
          <input type="number" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="0" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Periodo Vacacional</label>
          <select v-model="selectedPeriod" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div class="md:col-span-3">
          <label class="block text-sm font-medium mb-2">Motivo / Justificacion</label>
          <textarea class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary resize-none" rows="3" placeholder="Describa el motivo de la solicitud..."></textarea>
        </div>
      </div>
      <div class="flex justify-end gap-4 mt-6">
        <button class="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
        <button class="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700">Enviar Solicitud</button>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 class="font-bold">Solicitudes de Venta de Vacaciones</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Solicitud</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Colaborador</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Cargo / Area</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Dias</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Motivo</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Fecha Solicitud</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="request in soldVacationRequests" :key="request.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 font-medium">{{ request.id }}</td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ request.employee }}</p>
                  <p class="text-xs text-slate-500">DNI: {{ request.dni }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ request.position }} - {{ request.department }}</td>
              <td class="px-6 py-4 font-bold text-primary">{{ request.requestedDays }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{{ request.reason }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ request.requestedDate }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(request.status)">
                  {{ request.status === 'pendiente' ? 'Pendiente' : request.status === 'aprobado' ? 'Aprobado' : request.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <span class="material-icons text-slate-400 hover:text-primary">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
