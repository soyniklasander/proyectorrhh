<script setup lang="ts">
import { ref } from 'vue'

// Summary stats
const stats = ref([
  { label: 'Total Vigentes', value: 142, change: '4%', trend: 'up', icon: 'verified_user', color: 'green', action: '' },
  { label: 'Por Vencer (30 dias)', value: 8, change: '', trend: '', icon: 'warning', color: 'amber', action: 'Revisar renovaciones' },
  { label: 'Contratos Vencidos', value: 2, change: '', trend: '', icon: 'error', color: 'red', action: 'Regularizar inmediatamente' }
])

// Contracts data
const contracts = ref([
  {
    id: 'NX-8821',
    name: 'Carlos Ruiz',
    initials: 'CR',
    position: 'Disenador UX Senior',
    startDate: '20 Sep, 2022',
    endDate: '20 Sep, 2023',
    status: 'expired',
    avatar: null
  },
  {
    id: 'NX-9002',
    name: 'Maria Rodriguez',
    initials: 'MR',
    position: 'Analista QA',
    startDate: '01 Oct, 2022',
    endDate: '15 Nov, 2023',
    status: 'expiring',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXiMgDBu_KZ1m2klXnTTIGe9gO4-rjvD0YFmjzMzgHzKwADsq1MWu0bvw3HRwiL6S0wKszfIG6Gaf8tduiKVLvEPBqG4O4zjVcAkmjAOEv9SEFXRhD6DSSsX5yeVoQudVC5VeMsK13JRvJ6ZwdoxieLQdAjPbmUNupi2bSCPOhXXH05ChQ8oDSqjk_lBPyoP6dts8-cmK7n2YvX17joCwuu3slIE1xfAZgsj4zlbIe5uzZKgfYwJdKsJnD2gaXYMF7-t9KL5KRZgTT'
  },
  {
    id: 'NX-7210',
    name: 'Juan Perez',
    initials: 'JP',
    position: 'Desarrollador Full Stack',
    startDate: '15 Mar, 2024',
    endDate: '15 Mar, 2025',
    status: 'active',
    avatar: null
  },
  {
    id: 'NX-7331',
    name: 'Luis Gomez',
    initials: 'LG',
    position: 'Gerente de Marketing',
    startDate: '10 Ene, 2023',
    endDate: 'Indefinido',
    status: 'active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHOwmaEeVR9hFvUFsx37gHWEFL-Kd6T31Qv0abXvoEU3qXGXYFkANcpikwqgcpW7yUpaIkHhZiA9WNQEq0H6dzsRspmiiGYNyoVZEHVXvrLmIWzlBKLQlVgzQUOfQo_hXIUmJrkc6d6Dsynn_oUKpPkGu84LyCRtAV3lf0omSgGq9LuAuZQ9rQucbCY4NGXCn8bgXbMj43MM_9H3EcRnqtuc3qJuncxlgzGTaXg9ItrA4p_0dQAn1j5NgK3p8SJ7INY6tyzs3gpdcG'
  },
  {
    id: 'NX-8105',
    name: 'Sofia Flores',
    initials: 'SF',
    position: 'Asistente Administrativo',
    startDate: '05 Nov, 2023',
    endDate: '05 Nov, 2024',
    status: 'expiring',
    avatar: null
  }
])

const departments = ['Todos los departamentos', 'Tecnologia', 'Recursos humanos', 'Marketing']
const statuses = ['Todos los estados', 'Vigente', 'Por Vencer', 'Vencido']

const selectedDepartment = ref(departments[0])
const selectedStatus = ref(statuses[0])
const searchQuery = ref('')

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', pulse: false }
    case 'expiring': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', pulse: false }
    case 'expired': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', pulse: true }
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20', pulse: false }
  }
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active': return 'Vigente'
    case 'expiring': return 'Por Vencer'
    case 'expired': return 'Vencido'
    default: return status
  }
}

const getCardBorderColor = (color: string) => {
  switch (color) {
    case 'amber': return 'border-amber-500/20 hover:border-amber-500/40'
    case 'red': return 'border-red-500/20 hover:border-red-500/40'
    default: return 'border-white/5 hover:border-primary/30'
  }
}

const getAvatarBg = (status: string) => {
  switch (status) {
    case 'active': return 'bg-primary/20 text-primary-light border-primary/20'
    case 'expiring': return 'bg-amber-500/20 text-amber-500 border-amber-500/20'
    default: return 'bg-gradient-to-br from-gray-700 to-gray-800'
  }
}
</script>

<template>
  <div class="p-8 space-y-8">
    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="(stat, index) in stats" 
        :key="index"
        class="bg-surface-dark border p-6 rounded-xl relative overflow-hidden group transition-colors"
        :class="getCardBorderColor(stat.color)"
      >
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span class="material-icons-round text-6xl" :class="stat.color === 'green' ? 'text-green-500' : stat.color === 'amber' ? 'text-amber-500' : 'text-red-500'">{{ stat.icon }}</span>
        </div>
        <div class="relative z-10">
          <p class="text-gray-400 text-sm font-medium mb-1">{{ stat.label }}</p>
          <h3 class="text-3xl font-bold" :class="stat.color === 'green' ? 'text-white' : stat.color === 'amber' ? 'text-amber-500' : 'text-red-500'">{{ stat.value }}</h3>
          <div class="flex items-center gap-2 mt-4" :class="stat.color === 'green' ? 'text-xs text-green-400' : 'text-xs text-gray-400'">
            <template v-if="stat.trend === 'up'">
              <span class="bg-green-500/20 px-1.5 py-0.5 rounded flex items-center">
                <span class="material-icons-round text-sm">trending_up</span> {{ stat.change }}
              </span>
              <span class="text-gray-500">vs mes anterior</span>
            </template>
            <template v-else>
              <span :class="stat.color === 'amber' ? 'text-amber-400 font-medium' : 'text-red-400 font-medium'">
                Accion requerida:
              </span>
              {{ stat.action }}
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full md:w-96 group">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors material-icons-round">search</span>
        <input 
          v-model="searchQuery"
          class="w-full bg-surface-dark border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
          placeholder="Buscar por nombre, cargo o ID..." 
          type="text"
        />
      </div>
      <div class="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <select 
          v-model="selectedDepartment"
          class="bg-surface-dark border border-white/10 text-gray-300 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer"
        >
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
        <select 
          v-model="selectedStatus"
          class="bg-surface-dark border border-white/10 text-gray-300 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer"
        >
          <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-surface-dark rounded-xl border border-white/5 shadow-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/5 border-b border-white/5 text-xs uppercase text-gray-400 tracking-wider font-semibold">
              <th class="p-4 rounded-tl-xl">Empleado</th>
              <th class="p-4">Cargo</th>
              <th class="p-4">Inicio Contrato</th>
              <th class="p-4">Fin Contrato</th>
              <th class="p-4">Estado</th>
              <th class="p-4 rounded-tr-xl text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm">
            <tr 
              v-for="contract in contracts" 
              :key="contract.id" 
              class="hover:bg-white/[0.02] transition-colors group"
            >
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border border-white/10 shadow-sm relative"
                    :class="getAvatarBg(contract.status)"
                  >
                    {{ contract.initials }}
                    <div 
                      v-if="contract.status === 'expired'"
                      class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-2 border-surface-dark rounded-full"
                    ></div>
                  </div>
                  <div>
                    <p class="font-medium text-white">{{ contract.name }}</p>
                    <p class="text-xs text-gray-500">ID: {{ contract.id }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 text-gray-300">{{ contract.position }}</td>
              <td class="p-4 text-gray-400">{{ contract.startDate }}</td>
              <td 
                class="p-4 font-medium"
                :class="contract.status === 'expired' ? 'text-red-300' : contract.status === 'expiring' ? 'text-amber-300' : 'text-gray-300'"
              >
                {{ contract.endDate }}
              </td>
              <td class="p-4">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit"
                  :class="[getStatusColor(contract.status).bg, getStatusColor(contract.status).text, getStatusColor(contract.status).border]"
                >
                  <span 
                    class="w-1.5 h-1.5 rounded-full"
                    :class="getStatusColor(contract.status).pulse ? 'bg-red-500 animate-pulse' : getStatusColor(contract.status).text.replace('text-', 'bg-')"
                  ></span>
                  {{ getStatusLabel(contract.status) }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    class="p-2 rounded-lg bg-surface-darker text-gray-400 hover:text-white hover:bg-primary/20 border border-transparent transition-colors" 
                    title="Generar PDF"
                  >
                    <span class="material-icons-round text-lg">picture_as_pdf</span>
                  </button>
                  <button 
                    class="p-2 rounded-lg bg-surface-darker text-primary-light hover:text-white hover:bg-primary border border-primary/20 transition-colors" 
                    title="Crear Adenda"
                  >
                    <span class="material-icons-round text-lg">edit_document</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-white/5 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          Mostrando <span class="text-white font-medium">1-5</span> de <span class="text-white font-medium">142</span> resultados
        </p>
        <div class="flex gap-2">
          <button class="px-3 py-1 rounded bg-surface-darker border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm disabled:opacity-50" disabled>Anterior</button>
          <button class="px-3 py-1 rounded bg-primary text-white text-sm">1</button>
          <button class="px-3 py-1 rounded bg-surface-darker border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm">2</button>
          <button class="px-3 py-1 rounded bg-surface-darker border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm">3</button>
          <button class="px-3 py-1 rounded bg-surface-darker border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>
