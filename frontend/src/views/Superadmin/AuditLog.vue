<script setup lang="ts">
import { ref } from 'vue'

// Audit log entries
const auditEntries = ref([
  {
    id: '1',
    date: '24 Oct 2023',
    time: '14:35:12',
    responsible: {
      name: 'Carlos M.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxoAwlAevA69kX9Qa8We1DKyznEfNyzwm7Cwt0s07xoCQDWX3D2aSmifkzK7un-Szqm0iE-52GoeK90UFBklP_qNNLc6ZTK-QUKvQ6ha4gXsorVzLpqi0QZ1Ei0QoMmwFdaCOhDkjsJz8QBq8f5PK6_4QwnTU1xkKmJ3KRxGg9-q49rOFqrT7KhvNjJa1wgSiuiMF82AVr65WPjrkJqUIacVO2JGvWZyf-GxG_4nKDa11N8iH0nwGWBVoJZ6yAYylx-KngoMLfoCPa',
      role: 'RRHH Admin'
    },
    employee: {
      name: 'Roberto Gómez',
      id: '450912'
    },
    field: 'Bono Productividad',
    fieldType: 'bonus',
    oldValue: 'S/ 2,000.00',
    newValue: 'S/ 2,500.00',
    justification: 'Corrección basada en revisión de desempeño Q3 (Aprobado por J. Perez).'
  },
  {
    id: '2',
    date: '24 Oct 2023',
    time: '11:15:00',
    responsible: {
      name: 'Maria L.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDA2P9-iqbOmtTcUhJh-Ie0Y6vZOPlLrDiZWxzuw7cBi_p-vJdIosBd1029QGniRxt4M8nFwIlcg_kYf8e0eY4R_2zolmsRsh9mJFD5MpdD9yNf53MNIWSOY7Goi7-Gd2IQMQhfssQ4HI-n9H8XK43IOUTcxaTSquTXHKailvPD0tIKXV_D_67FX_qT6qQFUjr6JcDl_kczGuCzO7htU4GvVRXkrahDtjjrd6AXkY3l0M53v5trfohd6NK-DlDAIpaSmoi37fBd5Ues',
      role: 'Analista Planillas'
    },
    employee: {
      name: 'Ana Torres',
      id: '450933'
    },
    field: 'Días Faltas',
    fieldType: 'deduction',
    oldValue: '2 días',
    newValue: '0 días',
    justification: 'Justificación médica presentada (Ref: CITT-9921).'
  },
  {
    id: '3',
    date: '23 Oct 2023',
    time: '09:42:15',
    responsible: {
      name: 'Sistema Auto',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6qHMX-CLEvweQUOWMu8mUn0rzACMJ4wl4_fAWD827nFiHAa_BJi5BrGhsEKUoAh7w6gwOZ0FCLMf8lEZRmVpJy5uo90scLQDPdStFHB3u_jzaZbXK1LyTQA7AzHpEPytWrCSy_9PBs2Mz9xaRwSmDXTlYuX4FY2j9Zfu06fhHVaBXt-jbEL9HNOwNaXhJWKJdr5UbjDXV_F7rLs_AO2LPzY5HoAqfnpEcJ37upa5Q3iqyEvXj5N_ZAhEDBxPrHajLczP9ztFsC0iu',
      role: 'Batch Process',
      isSystem: true
    },
    employee: {
      name: 'Luis Vega',
      id: '450110'
    },
    field: 'Asignación Familiar',
    fieldType: 'bonus',
    oldValue: 'S/ 0.00',
    newValue: 'S/ 102.50',
    justification: 'Actualización automática por registro de neonato.'
  },
  {
    id: '4',
    date: '22 Oct 2023',
    time: '16:20:05',
    responsible: {
      name: 'Carlos M.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5eBjYRrpvmQpDMXfmfi14vgJLAWm8zVDZAQYABlI8zSCELF-DFRGAFEs-5Zh0MznAjo8eU8mUPVz6urJz2UoUFBOVnK_-U8f0Z_3QOiu7oBY6XRRQdnDHR8Z5J17uCiL5jHEMecb94KO0FS29HVLAbdEZ5RFxy6tABko_R0TxzKi7U3ot8HlhBNdZWNqhmqGPFGFtK5BWK_WcHBXqkw26H__CDI--R7O_cwE-v4AHOnK5wClphJL-QvKr_2ExtbtgiNspkf7xEWil',
      role: 'RRHH Admin'
    },
    employee: {
      name: 'Sofía Mendez',
      id: '451002'
    },
    field: 'Retención 5ta Cat.',
    fieldType: 'deduction',
    oldValue: 'S/ 150.00',
    newValue: 'S/ 185.00',
    justification: 'Recálculo tras ingreso de bono extraordinario.'
  },
  {
    id: '5',
    date: '22 Oct 2023',
    time: '10:05:44',
    responsible: {
      name: 'Jorge P.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_shRIU4dWHS3U-236iV_lAFUKltRRLSvHkp36jxSTv61hfV3pS4A-q98RzW18zb0O1YEfknC5Rot0UlY4_72RpXkJxmO_uvEE3Z8hrZ4bXnRDQmUHInvvY0b55ADDSiPg0Ujqrsj9-AddwyQU7ln7Xw0Zfyi_0M1fXfHbcS6_n_mbMCBMqWhZ_fU3U1bIBEvSLsq7IQaPqsjTZMyuvwgAnR5tXWUC0LAY8CmHsbHx_j7N43bPQmqncPUIGgpL9jDubAth4A8jZ3zH',
      role: 'Auditor Interno'
    },
    employee: {
      name: 'Pedro Castillo',
      id: '450888'
    },
    field: 'Cuenta Bancaria',
    fieldType: 'other',
    oldValue: '...8921',
    newValue: '...4402',
    justification: 'Solicitud de cambio de banco firmada (Carta adjunta).'
  }
])

const fieldTypes = [
  { value: '', label: 'Todos los campos' },
  { value: 'salary', label: 'Sueldo Básico' },
  { value: 'bonus', label: 'Bono de Productividad' },
  { value: 'overtime', label: 'Horas Extras' },
  { value: 'deduction', label: 'Deducciones' }
]

const getFieldBadgeColor = (fieldType: string) => {
  switch (fieldType) {
    case 'bonus': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'deduction': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
    case 'salary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
  }
}

const selectedEntry = ref<string | null>(null)

const toggleDetails = (id: string) => {
  selectedEntry.value = selectedEntry.value === id ? null : id
}
</script>

<template>
  <main class="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Title & Actions -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="material-icons text-primary text-3xl">history_edu</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Registro de Trazabilidad de Cambios</h2>
        </div>
        <p class="text-slate-500 dark:text-slate-400 max-w-2xl">
          Visualización detallada de modificaciones post-cálculo. Todos los registros son inmutables para cumplimiento con SUNAFIL.
        </p>
      </div>
      <div class="flex gap-3">
        <button class="flex items-center gap-2 px-4 py-2 bg-surface-dark dark:bg-surface-dark border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
          <span class="material-icons text-[18px]">download</span>
          Exportar XML
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-primary/25 text-sm font-medium">
          <span class="material-icons text-[18px]">picture_as_pdf</span>
          Reporte SUNAFIL
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <!-- Search Input -->
        <div class="md:col-span-4">
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Buscar Empleado o ID</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="material-icons text-slate-400 text-[20px]">search</span>
            </span>
            <input 
              class="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow" 
              placeholder="Ej: Juan Pérez o EMP-2023-001" 
              type="text"
            />
          </div>
        </div>
        <!-- Field Filter -->
        <div class="md:col-span-3">
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Campo Modificado</label>
          <select class="block w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer">
            <option v-for="field in fieldTypes" :key="field.value" :value="field.value">{{ field.label }}</option>
          </select>
        </div>
        <!-- Date Range -->
        <div class="md:col-span-3">
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Periodo</label>
          <div class="flex items-center bg-slate-50 dark:bg-background-dark border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5">
            <span class="material-icons text-slate-400 text-[18px] mr-2">calendar_today</span>
            <span class="text-sm text-slate-900 dark:text-white">Oct 01 - Oct 31, 2023</span>
          </div>
        </div>
        <!-- Action Button -->
        <div class="md:col-span-2">
          <button class="w-full py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors">
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Audit Log Table -->
    <div class="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[600px]">
      <!-- Table Header -->
      <div class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-hover/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0">
        <div class="col-span-2">Fecha / Hora</div>
        <div class="col-span-2">Responsable</div>
        <div class="col-span-2">Empleado Afectado</div>
        <div class="col-span-2">Dato Modificado</div>
        <div class="col-span-2 text-right pr-4">Cambio de Valor</div>
        <div class="col-span-2">Justificación</div>
      </div>
      
      <!-- Table Body - Scrollable -->
      <div class="overflow-y-auto flex-1">
        <div 
          v-for="entry in auditEntries" 
          :key="entry.id"
          class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-surface-hover transition-colors items-center group cursor-pointer"
          @click="toggleDetails(entry.id)"
        >
          <div class="col-span-2">
            <div class="flex items-center gap-2">
              <span class="material-icons text-slate-400 text-[16px]">schedule</span>
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ entry.date }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ entry.time }}</p>
              </div>
            </div>
          </div>
          
          <div class="col-span-2 flex items-center gap-3">
            <img 
              class="w-8 h-8 rounded-full" 
              :alt="`Avatar de ${entry.responsible.name}`" 
              :src="entry.responsible.avatar" 
            />
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ entry.responsible.name }}</p>
              <p 
                class="text-xs"
                :class="entry.responsible.isSystem ? 'text-orange-400' : 'text-primary dark:text-blue-400'"
              >
                {{ entry.responsible.role }}
              </p>
            </div>
          </div>
          
          <div class="col-span-2">
            <p class="text-sm font-medium text-slate-900 dark:text-white">{{ entry.employee.name }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">ID: {{ entry.employee.id }}</p>
          </div>
          
          <div class="col-span-2">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
              :class="getFieldBadgeColor(entry.fieldType)"
            >
              {{ entry.field }}
            </span>
          </div>
          
          <div class="col-span-2 text-right pr-4 font-mono text-sm">
            <span class="diff-removed mr-2">{{ entry.oldValue }}</span>
            <span class="material-icons text-slate-400 text-[12px] align-middle mx-1">arrow_forward</span>
            <span class="diff-added px-1.5 py-0.5 rounded font-semibold border border-green-500/20">{{ entry.newValue }}</span>
          </div>
          
          <div class="col-span-2 relative">
            <p 
              class="text-sm text-slate-600 dark:text-slate-300 truncate pr-6"
              :title="entry.justification"
            >
              {{ entry.justification }}
            </p>
            <button class="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-white hover:bg-primary p-1 rounded">
              <span class="material-icons text-[18px]">visibility</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Mostrando <span class="font-medium text-slate-900 dark:text-white">1</span> a <span class="font-medium text-slate-900 dark:text-white">5</span> de <span class="font-medium text-slate-900 dark:text-white">128</span> registros
        </p>
        <div class="flex gap-2">
          <button class="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50" disabled>Anterior</button>
          <button class="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- Legend/Info -->
    <div class="mt-4 flex flex-wrap gap-6 text-xs text-slate-500 dark:text-slate-400">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></span>
        <span>Valores Añadidos</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full border border-red-500 opacity-70 relative">
          <span class="absolute top-1/2 left-0 right-0 h-px bg-red-500 -translate-y-1/2 rotate-45"></span>
        </span>
        <span>Valores Removidos</span>
      </div>
      <div class="flex items-center gap-2 ml-auto">
        <span class="material-icons text-[14px]">lock</span>
        <span>Registro protegido por Blockchain Privado v2.4</span>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark py-6 mt-auto">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-xs text-slate-400 dark:text-slate-500 text-center md:text-left">
        © 2023 NexaCorp Perú S.A. | Todos los derechos reservados.<br/>
        Módulo de Cumplimiento Normativo Interno - Versión 4.2.0
      </p>
      <div class="flex gap-4">
        <a class="text-xs text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary" href="#">Política de Privacidad</a>
        <a class="text-xs text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary" href="#">Soporte Auditoría</a>
        <a class="text-xs text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary" href="#">Exportar Logs Completos</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.diff-added {
  background-color: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.diff-removed {
  text-decoration: line-through;
  color: #ef4444;
  opacity: 0.7;
}
</style>
