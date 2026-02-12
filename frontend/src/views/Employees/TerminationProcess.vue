<script setup lang="ts">
import { ref } from 'vue'

const currentStep = ref(1)
const totalSteps = 4

const formData = ref({
  employeeSearch: '',
  lastWorkDay: '',
  terminationReason: '',
  notes: ''
})

const reasons = [
  { value: '', label: 'Seleccione un motivo', disabled: true },
  { value: 'renuncia', label: 'Renuncia Voluntaria' },
  { value: 'despido', label: 'Despido' },
  { value: 'fin_contrato', label: 'Fin de Contrato' },
  { value: 'mutuo_disenso', label: 'Mutuo Disenso' },
  { value: 'otros', label: 'Otros' }
]

const steps = [
  { number: 1, title: 'REGISTRO' },
  { number: 2, title: 'DOCUMENTACION' },
  { number: 3, title: 'LIQUIDACION' },
  { number: 4, title: 'EGRESO' }
]

const isStepActive = (step: number) => step === currentStep.value
const isStepCompleted = (step: number) => step < currentStep.value
</script>

<template>
  <main class="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-primary text-sm font-medium mb-2">
        <span class="material-icons-round text-sm">arrow_back</span>
        <span>Volver al Dashboard</span>
      </div>
      <h1 class="text-3xl font-bold tracking-tight mb-2">Modulo de Desvinculacion (Offboarding)</h1>
      <p class="text-slate-500 dark:text-slate-400">Inicie el proceso de registro formal para el cese de funciones de un colaborador.</p>
    </div>

    <!-- Progress Steps -->
    <div class="mb-12">
      <div class="relative flex justify-between">
        <div class="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>
        <div class="absolute top-5 left-0 h-0.5 bg-primary -z-0" :style="{ width: ((currentStep - 1) / (totalSteps - 1)) * 100 + '%' }"></div>
        
        <template v-for="step in steps" :key="step.number">
          <div class="relative z-10 flex flex-col items-center group">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-background-light dark:ring-background-dark"
              :class="isStepCompleted(step.number) ? 'bg-primary text-white' : isStepActive(step.number) ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'"
            >
              <span v-if="isStepCompleted(step.number)" class="material-icons text-sm">check</span>
              <span v-else>{{ step.number }}</span>
            </div>
            <span class="mt-2 text-xs font-medium" :class="isStepActive(step.number) ? 'text-primary' : 'text-slate-500'">{{ step.title }}</span>
          </div>
        </template>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Form Card -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
          <div class="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <h2 class="text-xl font-bold flex items-center gap-2">
              <span class="material-icons-round text-primary">person_remove</span>
              Informacion del Cese
            </h2>
          </div>
          
          <form class="space-y-6">
            <!-- Collaborator Selector -->
            <div>
              <label class="block text-sm font-semibold mb-2">Colaborador</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span class="material-icons-round text-lg">search</span>
                </span>
                <input 
                  v-model="formData.employeeSearch"
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm" 
                  placeholder="Buscar por nombre, DNI o ID..." 
                  type="text"
                />
              </div>
              <p class="mt-2 text-xs text-slate-400">Ingrese el nombre del colaborador para cargar su ficha actual.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Exit Date -->
              <div>
                <label class="block text-sm font-semibold mb-2">Ultimo dia laborado</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span class="material-icons-round text-lg">calendar_today</span>
                  </span>
                  <input 
                    v-model="formData.lastWorkDay"
                    class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm" 
                    type="date"
                  />
                </div>
              </div>
              
              <!-- Reason Select -->
              <div>
                <label class="block text-sm font-semibold mb-2">Motivo de Cese</label>
                <select 
                  v-model="formData.terminationReason"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm appearance-none"
                >
                  <option v-for="reason in reasons" :key="reason.value" :value="reason.value" :disabled="reason.disabled">
                    {{ reason.label }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Notes -->
            <div>
              <label class="block text-sm font-semibold mb-2">Observaciones Adicionales</label>
              <textarea 
                v-model="formData.notes"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm resize-none" 
                placeholder="Detalles adicionales sobre el proceso de salida..." 
                rows="4"
              ></textarea>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-4 pt-4">
              <button class="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" type="button">
                Cancelar
              </button>
              <button 
                class="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2" 
                type="submit"
              >
                Continuar Proceso
                <span class="material-icons-round text-sm">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Side Information Panel -->
      <div class="space-y-6">
        <!-- Legal Alert Box -->
        <div class="bg-primary/10 border border-primary/30 rounded-xl p-6 relative overflow-hidden">
          <div class="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <span class="material-icons-round text-white">gavel</span>
              </div>
              <h3 class="font-bold text-primary">Plazo Legal Peru</h3>
            </div>
            <p class="text-sm leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
              De acuerdo al <strong>D.L. N 728</strong> y la normativa laboral vigente, el empleador tiene un plazo maximo de:
            </p>
            <div class="bg-white/50 dark:bg-slate-900/50 rounded-lg p-4 border border-primary/20 mb-4">
              <div class="text-3xl font-extrabold text-primary text-center">48 HORAS</div>
              <div class="text-[10px] uppercase tracking-widest text-center mt-1 font-bold text-slate-500">Posteriores al cese</div>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 italic">
              * El incumplimiento de este plazo para el pago de beneficios sociales genera intereses legales y posibles multas por parte de SUNAFIL.
            </p>
          </div>
        </div>
        
        <!-- Guidance Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <span class="material-icons-round text-xs">info</span>
            Guia de Proceso
          </h3>
          <ul class="space-y-4">
            <li class="flex gap-3">
              <span class="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">1</span>
              <p class="text-xs text-slate-400">Asegurese de contar con la carta de renuncia firmada o el documento de mutuo disenso digitalizado.</p>
            </li>
            <li class="flex gap-3">
              <span class="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">2</span>
              <p class="text-xs text-slate-400">El sistema notificara automaticamente a IT para la baja de accesos el dia de salida.</p>
            </li>
            <li class="flex gap-3">
              <span class="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">3</span>
              <p class="text-xs text-slate-400">Verifique si el colaborador tiene activos asignados (laptop, tarjetas, etc.) antes de finalizar.</p>
            </li>
          </ul>
        </div>
        
        <!-- Illustration -->
        <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-48 relative group">
          <img 
            alt="Workspace" 
            class="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAByeXRycSSvhGw9O0Kwz-WE6301b2G866W8T-tisDuarEdqcig_IyZEzTtD3CYZPvQ9a8znP-jAgLzZEyv-cT-fa6yGdgCvhV3DgQGLR15Fpu1p6BHX4CN-s8341yqqqefxrJKjSEApk2q_TOUigiOeMP_iTx6lDqbpI9kWxHvbLs5VDUzviw11BVR0FeXmTahaI186NdbIwJJ9ARZ3u9cn-vONwnoVOiM4139pyaJtirrBrshQyVNPTHMbcl8MdFYFMU4c-vtwKf0"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <span class="text-[10px] font-bold text-primary uppercase tracking-widest">Compromiso NexaCorp</span>
            <p class="text-xs text-white/80 mt-1">Garantizamos una salida digna y profesional para todo nuestro talento.</p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer Meta -->
  <footer class="max-w-7xl mx-auto px-4 py-8 border-t border-slate-200 dark:border-slate-800 mt-12">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-xs text-slate-500">© 2024 NexaCorp Peru S.A.C. Todos los derechos reservados.</p>
      <div class="flex gap-6">
        <a class="text-xs text-slate-500 hover:text-primary transition-colors" href="#">Politicas de Privacidad</a>
        <a class="text-xs text-slate-500 hover:text-primary transition-colors" href="#">Soporte Tecnico</a>
        <a class="text-xs text-slate-500 hover:text-primary transition-colors" href="#">Legislacion Laboral</a>
      </div>
    </div>
  </footer>
</template>
