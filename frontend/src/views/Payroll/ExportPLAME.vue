<script setup lang="ts">
import { ref } from 'vue'

const selectedPeriod = ref('nov-2024')
const selectedEntity = ref('todas')

const exportHistory = ref([
  { id: 'EXP-001', period: 'Octubre 2024', entities: 3, employees: 142, status: 'completado', date: '31 Oct, 2024', file: 'PLAME_202410.zip' },
  { id: 'EXP-002', period: 'Septiembre 2024', entities: 3, employees: 140, status: 'completado', date: '30 Sep, 2024', file: 'PLAME_202409.zip' },
  { id: 'EXP-003', period: 'Agosto 2024', entities: 3, employees: 138, status: 'completado', date: '31 Ago, 2024', file: 'PLAME_202408.zip' }
])

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'pendiente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Exportacion PLAME / AFPNet / Bancos</h1>
      <p class="text-slate-500">Genere archivos electronicos para SUNAT, AFPNet y bancos de pago.</p>
    </div>

    <!-- Configuration Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-primary/50 transition-colors cursor-pointer">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-amber-600">description</span>
          </div>
          <div>
            <h3 class="font-bold">Planilla Mensual (PLAME)</h3>
            <p class="text-sm text-slate-500">Archivos para SUNAT</p>
          </div>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Genere el archivo .txt con la informacion de todos los trabajadores para la declaracion mensual.</p>
        <button class="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Generar PLAME</button>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-primary/50 transition-colors cursor-pointer">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-blue-600">account_balance</span>
          </div>
          <div>
            <h3 class="font-bold">AFPNet</h3>
            <p class="text-sm text-slate-500">Aportaciones a AFP</p>
          </div>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Genere el archivo de aportacion para cada AFP de sus trabajadores.</p>
        <button class="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">Generar AFPNet</button>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-primary/50 transition-colors cursor-pointer">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-green-600\">payments</span>
          </div>
          <div>
            <h3 class="font-bold">Pago a Bancos</h3>
            <p class="text-sm text-slate-500">Archivos de transferencia</p>
          </div>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Genere el archivo de pago para transferencia bancaria masiva.</p>
        <button class="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">Generar Archivo Banco</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-2">Periodo</label>
          <select v-model="selectedPeriod" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option value="nov-2024">Noviembre 2024</option>
            <option value="oct-2024">Octubre 2024</option>
            <option value="sep-2024">Septiembre 2024</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-2">Entidad</label>
          <select v-model="selectedEntity" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
            <option value="todas">Todas las Entidades</option>
            <option value="ruc1">NexaCorp Peru S.A.C.</option>
            <option value="ruc2">Inversiones Gastronomicas S.A.</option>
          </select>
        </div>
        <button class="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <span class="material-icons text-sm">search</span>
          Buscar
        </button>
      </div>
    </div>

    <!-- Export History -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 class="font-bold">Historial de Exportaciones</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">ID</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Periodo</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Entidades</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Colaboradores</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Archivo</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Fecha</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-6 py-3 font-semibold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="exp in exportHistory" :key="exp.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 font-medium">{{ exp.id }}</td>
              <td class="px-6 py-4">{{ exp.period }}</td>
              <td class="px-6 py-4">{{ exp.entities }}</td>
              <td class="px-6 py-4">{{ exp.employees }}</td>
              <td class="px-6 py-4 font-mono text-xs">{{ exp.file }}</td>
              <td class="px-6 py-4">{{ exp.date }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(exp.status)">
                  {{ exp.status.charAt(0).toUpperCase() + exp.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <span class="material-icons text-slate-400 hover:text-primary">download</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
