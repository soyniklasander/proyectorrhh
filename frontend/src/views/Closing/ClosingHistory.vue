<script setup lang="ts">
import { ref } from 'vue'

const closingHistory = ref([
  { id: 'CIERRE-001', period: 'Octubre 2024', entities: 3, employees: 142, totalPayroll: 892450.50, status: 'cerrado', closedBy: 'Admin RRHH', closeDate: '31 Oct, 2024', observations: '' },
  { id: 'CIERRE-002', period: 'Septiembre 2024', entities: 3, employees: 140, totalPayroll: 875230.00, status: 'cerrado', closedBy: 'Admin RRHH', closeDate: '30 Sep, 2024', observations: 'Sin incidencias' },
  { id: 'CIERRE-003', period: 'Agosto 2024', entities: 3, employees: 138, totalPayroll: 860150.75, status: 'cerrado', closedBy: 'Admin RRHH', closeDate: '31 Ago, 2024', observations: 'Se realizo ajuste por CTS' }
])

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'cerrado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'abierto': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    default: return 'bg-slate-100 text-slate-800'
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Historial de Cierres Inmutables</h1>
      <p class="text-slate-500">Registro historico de cierres de planilla. Los cierres son inmutables una vez confirmados.</p>
    </div>

    <!-- Info Card -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
      <div class="flex items-start gap-4">
        <span class="material-icons text-blue-600 dark:text-blue-400 text-2xl">security</span>
        <div>
          <h4 class="font-semibold text-blue-800 dark:text-blue-200">Cierres Inmutables</h4>
          <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Una vez que un periodo de planilla es cerrado, sus datos quedan almacenados de forma inmutable. 
            No es posible modificar Boletas de Pago, Planillas niPDT una vez confirmado el cierre.
            Solo es posible generar anexos de regularizacion para periodos posteriores.
          </p>
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 class="font-bold">Historico de Cierres</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Cierre ID</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Periodo</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Entidades</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Colaboradores</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-right">Total Planilla</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Cerrado Por</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Fecha Cierre</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="close in closingHistory" :key="close.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 font-medium">{{ close.id }}</td>
              <td class="px-6 py-4 font-bold">{{ close.period }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ close.entities }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ close.employees }}</td>
              <td class="px-6 py-4 text-right font-medium text-green-600">{{ formatCurrency(close.totalPayroll) }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ close.closedBy }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ close.closeDate }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(close.status)">
                  {{ close.status === 'cerrado' ? 'Cerrado' : 'Abierto' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver Detalle">
                    <span class="material-icons text-slate-400 hover:text-primary">visibility</span>
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Descargar PDF">
                    <span class="material-icons text-slate-400 hover:text-primary">picture_as_pdf</span>
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Generar Anexo">
                    <span class="material-icons text-slate-400 hover:text-primary\">add_circle</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Security Info -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="material-icons text-primary">verified_user</span>
          <h3 class="font-bold text-white">Firma Digital</h3>
        </div>
        <p class="text-sm text-slate-400">
          Todos los cierres requieren firma digital del responsable de RRHH para confirmar la validez del proceso.
        </p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="material-icons text-primary">history</span>
          <h3 class="font-bold text-white">Trazabilidad</h3>
        </div>
        <p class="text-sm text-slate-400">
          Cada accion queda registrada en el log de auditoria con usuario, fecha, hora y IP de origen.
        </p>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="material-icons text-primary">lock</span>
          <h3 class="font-bold text-white">Inmutabilidad</h3>
        </div>
        <p class="text-sm text-slate-400">
          Los datos de periodos cerrados no pueden ser modificados. Solo se permiten anexos de regularizacion.
        </p>
      </div>
    </div>
  </div>
</template>
