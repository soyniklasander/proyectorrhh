<script setup lang="ts">
import { ref } from 'vue'

const selectedEmployee = ref('')
const currentTab = ref('todos')

const tabs = [
  { id: 'todos', label: 'Todos' },
  { id: 'contratos', label: 'Contratos' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'recibos', label: 'Recibos' }
]

const documents = ref([
  {
    id: 'DOC-001',
    employee: 'Carlos Ruiz',
    dni: '45678912',
    type: 'Contrato',
    name: 'Contrato de Trabajo - Indefinido',
    date: '15 Ene, 2022',
    status: 'firmado',
    file: 'contrato_carlos_ruiz.pdf'
  },
  {
    id: 'DOC-002',
    employee: 'Carlos Ruiz',
    dni: '45678912',
    type: 'Documento',
    name: 'Copia DNI',
    date: '15 Ene, 2022',
    status: 'pendiente',
    file: 'dni_carlos_ruiz.pdf'
  },
  {
    id: 'DOC-003',
    employee: 'Maria Rodriguez',
    dni: '34567890',
    type: 'Recibo',
    name: 'Boleta de Pago - Noviembre 2024',
    date: '30 Nov, 2024',
    status: 'firmado',
    file: 'boleta_maria_rodriguez_202411.pdf'
  },
  {
    id: 'DOC-004',
    employee: 'Juan Perez',
    dni: '23456789',
    type: 'Contrato',
    name: 'Adenda de Renovacion',
    date: '01 Mar, 2024',
    status: 'pendiente',
    file: 'adenda_juan_perez.pdf'
  }
])

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'firmado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'pendiente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    default: return 'bg-slate-100 text-slate-800'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'contrato': return 'description'
    case 'documento': return 'article'
    case 'recibo': return 'receipt'
    default: return 'insert_drive_file'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold mb-2">Centro de Documentos</h1>
        <p class="text-slate-500">Gestion centralizada de documentos y expedientes de colaboradores.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
          <span class="material-icons text-sm">upload</span>
          Subir Documento
        </button>
        <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-primary/20">
          <span class="material-icons text-sm\">download</span>
          Exportar Todo
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-2">Buscar Colaborador</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-icons text-lg">search</span>
            <input v-model="selectedEmployee" type="text" placeholder="Buscar por nombre o DNI..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
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
      </div>
    </div>

    <!-- Documents Grid -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Documento</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Colaborador</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Tipo</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Fecha</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="doc in documents" :key="doc.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-slate-500">{{ getTypeIcon(doc.type) }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">{{ doc.name }}</p>
                    <p class="text-xs text-slate-500">{{ doc.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ doc.employee }}</p>
                  <p class="text-xs text-slate-500">DNI: {{ doc.dni }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400 capitalize">{{ doc.type }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ doc.date }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(doc.status)">
                  {{ doc.status === 'firmado' ? 'Firmado' : 'Pendiente' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Ver">
                    <span class="material-icons text-slate-400 hover:text-primary">visibility</span>
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Descargar">
                    <span class="material-icons text-slate-400 hover:text-primary">download</span>
                  </button>
                  <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Firmar">
                    <span class="material-icons text-slate-400 hover:text-primary">draw</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-500">Mostrando 1-4 de 156 documentos</p>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700" disabled>Anterior</button>
          <button class="px-3 py-1 bg-primary text-white rounded text-sm">1</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">2</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">3</button>
          <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-700">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center">
        <p class="text-3xl font-bold text-primary">156</p>
        <p class="text-sm text-slate-500">Total Documentos</p>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center">
        <p class="text-3xl font-bold text-green-600">142</p>
        <p class="text-sm text-slate-500">Firmados</p>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center">
        <p class="text-3xl font-bold text-amber-600">14</p>
        <p class="text-sm text-slate-500">Pendientes</p>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center">
        <p class="text-3xl font-bold text-blue-600">89%</p>
        <p class="text-sm text-slate-500">Firmados Digitalmente</p>
      </div>
    </div>
  </div>
</template>
