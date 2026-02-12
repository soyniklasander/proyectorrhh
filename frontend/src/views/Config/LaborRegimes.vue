<script setup lang="ts">
import { ref } from 'vue'

const regimes = ref([
  {
    id: 'REG-001',
    name: 'Regimen General (D.L. 728)',
    description: 'Regimen laboral de la actividad privada',
    workers: 89,
    status: 'activo',
    features: ['Gratificacion (Julio y Diciembre)', 'CTS', 'Vacaciones (30 dias)', 'ESSALUD 9%', 'AFP/ONP']
  },
  {
    id: 'REG-002',
    name: 'Microempresa (D.L. 1086)',
    description: 'Regimen para micro y pequenas empresas',
    workers: 42,
    status: 'activo',
    features: ['Gratificacion y CTS conjuntamente', 'Vacaciones (30 dias)', 'ESSALUD 9%', 'Facultad de despedir']
  },
  {
    id: 'REG-003',
    name: 'Practicantes (D.L. 1428)',
    description: 'Regimen de practicantes pre profesionales',
    workers: 11,
    status: 'activo',
    features: ['Subvencion maxima S/ 1,300', 'Sin vinculacion laboral', 'Sin beneficios laborales', 'Sin CTS ni Gratificacion']
  }
])

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'inactivo': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
    default: return 'bg-slate-100 text-slate-800'
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold mb-2">Configuracion de Regimenes Laborales</h1>
        <p class="text-slate-500">Defina los regimenes laborales disponibles en su organizacion y sus caracteristicas.</p>
      </div>
      <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-primary/20">
        <span class="material-icons text-sm">add</span>
        Nuevo Regimen
      </button>
    </div>

    <!-- Regimes Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div v-for="regime in regimes" :key="regime.id" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span class="material-icons text-primary\">gavel</span>
            </div>
            <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(regime.status)">
              {{ regime.status === 'activo' ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <h3 class="font-bold text-lg mb-1">{{ regime.name }}</h3>
          <p class="text-sm text-slate-500 mb-4">{{ regime.description }}</p>
          <div class="flex items-center gap-2 mb-4">
            <span class="material-icons text-slate-400 text-sm">group</span>
            <span class="text-sm font-medium">{{ regime.workers }} trabajadores</span>
          </div>
          <div class="space-y-2">
            <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caracteristicas:</h4>
            <ul class="space-y-1">
              <li v-for="(feature, index) in regime.features" :key="index" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span class="material-icons text-green-500 text-sm">check_circle</span>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button class="text-sm text-primary font-medium hover:text-blue-600">Ver Detalle</button>
          <div class="flex gap-2">
            <button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <span class="material-icons text-slate-400 hover:text-primary text-sm">edit</span>
            </button>
            <button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <span class="material-icons text-slate-400 hover:text-red-500 text-sm">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
      <div class="flex items-start gap-4">
        <span class="material-icons text-amber-600 dark:text-amber-400">info</span>
        <div>
          <h4 class="font-semibold text-amber-800 dark:text-amber-200">Informacion Importante</h4>
          <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Los regimenes laborales configurados aqui seran utilizados en el registro de nuevos colaboradores. 
            Cada regimen tiene beneficios y obligaciones diferentes segun la normativa laboral peruana vigente.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
