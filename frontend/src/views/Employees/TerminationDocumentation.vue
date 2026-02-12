<script setup lang="ts">
import { ref } from 'vue'

const currentTab = ref('todos')

const tabs = [
  { id: 'todos', label: 'Todos' },
  { id: 'renuncia', label: 'Renuncia' },
  { id: 'despido', label: 'Despido' },
  { id: 'cese', label: 'Cese' }
]

const documents = ref([
  {
    id: 'DOC-2024-001',
    employee: 'Carlos Ruiz',
    dni: '45678912',
    type: 'Renuncia Voluntaria',
    status: 'pendiente',
    date: '15 Nov, 2024',
    requiredDocs: ['Carta de Renuncia', 'Informe de Labores', 'Entrega de Activos']
  },
  {
    id: 'DOC-2024-002',
    employee: 'Maria Rodriguez',
    dni: '34567890',
    type: 'Despido',
    status: 'firma',
    date: '12 Nov, 2024',
    requiredDocs: ['Carta de Despido', 'Boleta de Pago Final', 'Liquidacion de Beneficios']
  },
  {
    id: 'DOC-2024-003',
    employee: 'Juan Perez',
    dni: '23456789',
    type: 'Cese - Fin de Contrato',
    status: 'completo',
    date: '10 Nov, 2024',
    requiredDocs: ['Carta de Cese', 'Constancia de No Deuda', 'Certificado de Trabajo']
  }
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'firma': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'pendiente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completo': return 'check_circle'
    case 'firma': return 'draw'
    case 'pendiente': return 'schedule'
    default: return 'help'
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Documentacion Legal de Salida</h1>
      <p class="text-slate-500">Gestion y seguimiento de documentos de cese laboral. Garantice el cumplimiento legal en todas las desvinculaciones.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">Total Procesos</p>
            <p class="text-2xl font-bold">24</p>
          </div>
          <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <span class="material-icons text-primary\">folder</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">Pendientes</p>
            <p class="text-2xl font-bold text-amber-500">8</p>
          </div>
          <div class="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <span class="material-icons text-amber-500\">schedule</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">En Firma</p>
            <p class="text-2xl font-bold text-blue-500">5</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <span class="material-icons text-blue-500\">draw</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">Completados</p>
            <p class="text-2xl font-bold text-green-500">11</p>
          </div>
          <div class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
            <span class="material-icons text-green-500\">check_circle</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 overflow-hidden">
      <!-- Toolbar -->
      <div class="p-6 border-b border-slate-200 dark:border-slate-800">
        <div class="flex flex-col md:flex-row gap-4 justify-between">
          <div class="flex gap-2">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="currentTab = tab.id"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="currentTab === tab.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="flex gap-3">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons text-lg">search</span>
              <input type="text" placeholder="Buscar documento..." class="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <span class="material-icons text-sm">add</span>
              Nuevo Proceso
            </button>
          </div>
        </div>
      </div>

      <!-- Documents Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documento</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Colaborador</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documentos Requeridos</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr v-for="doc in documents" :key="doc.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-primary text-lg">description</span>
                  </div>
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">{{ doc.id }}</p>
                    <p class="text-xs text-slate-500">DNI: {{ doc.dni }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ doc.employee }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ doc.type }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(req, idx) in doc.requiredDocs" :key="idx" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">{{ req }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{{ doc.date }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" :class="getStatusColor(doc.status)">
                  <span class="material-icons text-xs">{{ getStatusIcon(doc.status) }}</span>
                  {{ doc.status.charAt(0).toUpperCase() + doc.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver Detalle">
                    <span class="material-icons text-slate-400 hover:text-primary">visibility</span>
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Firmar">
                    <span class="material-icons text-slate-400 hover:text-primary">draw</span>
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Descargar">
                    <span class="material-icons text-slate-400 hover:text-primary">download</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <p class="text-sm text-slate-500">Mostrando 1-3 de 24 resultados</p>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700" disabled>Anterior</button>
          <button class="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">2</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">3</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
      <div class="flex items-start gap-4">
        <span class="material-icons text-blue-600 dark:text-blue-400">info</span>
        <div>
          <h4 class="font-semibold text-blue-800 dark:text-blue-200">Informacion del Sistema</h4>
          <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Todos los documentos de salida son generados automaticamente y firmados digitalmente. El sistema asegura la trazabilidad completa del proceso de desvinculacion y cumple con los plazos legales establecidos por la normativa laboral peruana.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
