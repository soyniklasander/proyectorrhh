<script setup lang="ts">
import { ref } from 'vue'

const selectedDate = ref('2024-11-10')
const selectedVenue = ref('todas')

const venues = [
  { value: 'todas', label: 'Todas las Sedes' },
  { value: 'miraflores', label: 'Miraflores' },
  { value: 'san_isidro', label: 'San Isidro' },
  { value: 'surco', label: 'Surco' }
]

const attendanceSummary = ref({
  total: 142,
  present: 128,
  absent: 8,
  late: 6,
  permission: 0
})

const attendanceRecords = ref([
  { id: 'ATT-001', employee: 'Carlos Ruiz', dni: '45678912', position: 'Gerente de Ventas', venue: 'Miraflores', entry: '08:55', exit: '18:30', status: 'presente', hours: 8.58, tardiness: 0 },
  { id: 'ATT-002', employee: 'Maria Rodriguez', dni: '34567890', position: 'Analista de Marketing', venue: 'San Isidro', entry: '09:15', exit: '18:00', status: 'tarde', hours: 8.75, tardiness: 15 },
  { id: 'ATT-003', employee: 'Juan Perez', dni: '23456789', position: 'Desarrollador Full Stack', venue: 'Miraflores', entry: '-', exit: '-', status: 'ausente', hours: 0, tardiness: 0 },
  { id: 'ATT-004', employee: 'Sofia Flores', dni: '12345678', position: 'Practicante Admin', venue: 'Surco', entry: '08:45', exit: '17:30', status: 'presente', hours: 8.75, tardiness: 0 },
  { id: 'ATT-005', employee: 'Luis Gomez', dni: '11223344', position: 'Gerente de Marketing', venue: 'Miraflores', entry: '09:30', exit: '19:00', status: 'tarde', hours: 9.50, tardiness: 30 }
])

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'presente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'tarde': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'ausente': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'permiso': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default: return 'bg-slate-100 text-slate-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'presente': return 'check_circle'
    case 'tarde': return 'schedule'
    case 'ausente': return 'cancel'
    case 'permiso': return 'event_busy'
    default: return 'help'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold mb-2">Control de Asistencia y Turnos</h1>
        <p class="text-slate-500">Registro y seguimiento de la asistencia del personal por sede y turno.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
          <span class="material-icons text-sm">download</span>
          Exportar
        </button>
        <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-primary/20">
          <span class="material-icons text-sm">add</span>
          Registrar Manual
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Total</p>
            <p class="text-2xl font-bold mt-1">{{ attendanceSummary.total }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-primary">group</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Presentes</p>
            <p class="text-2xl font-bold mt-1 text-green-600">{{ attendanceSummary.present }}</p>
          </div>
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-green-600">check_circle</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Ausentes</p>
            <p class="text-2xl font-bold mt-1 text-red-600">{{ attendanceSummary.absent }}</p>
          </div>
          <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-red-600">cancel</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Tardanzas</p>
            <p class="text-2xl font-bold mt-1 text-amber-600">{{ attendanceSummary.late }}</p>
          </div>
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-amber-600">schedule</span>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">Permisos</p>
            <p class="text-2xl font-bold mt-1 text-blue-600">{{ attendanceSummary.permission }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <span class="material-icons text-blue-600">event_busy</span>
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
            <option v-for="venue in venues" :key="venue.value" :value="venue.value">{{ venue.label }}</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Hoy</button>
          <button class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">Ayer</button>
        </div>
        <button class="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700">Buscar</button>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">ID</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Colaborador</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Cargo / Area</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Sede</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Entrada</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Salida</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Horas</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Tardanza</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase">Estado</th>
              <th class="px-6 py-4 font-semibold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="record in attendanceRecords" :key="record.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td class="px-6 py-4 font-medium">{{ record.id }}</td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">{{ record.employee }}</p>
                  <p class="text-xs text-slate-500">DNI: {{ record.dni }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ record.position }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ record.venue }}</td>
              <td class="px-6 py-4 font-mono" :class="record.entry === '-' ? 'text-slate-400' : 'text-slate-900 dark:text-white'">{{ record.entry }}</td>
              <td class="px-6 py-4 font-mono" :class="record.exit === '-' ? 'text-slate-400' : 'text-slate-900 dark:text-white'">{{ record.exit }}</td>
              <td class="px-6 py-4 font-mono font-medium">{{ record.hours > 0 ? record.hours.toFixed(2) + 'h' : '-' }}</td>
              <td class="px-6 py-4">
                <span v-if="record.tardiness > 0" class="text-amber-600 font-medium">{{ record.tardiness }} min</span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" :class="getStatusBadge(record.status)">
                  <span class="material-icons text-xs">{{ getStatusIcon(record.status) }}</span>
                  {{ record.status.charAt(0).toUpperCase() + record.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <span class="material-icons text-slate-400 hover:text-primary">edit</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-500">Mostrando 1-5 de 142 registros</p>
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
