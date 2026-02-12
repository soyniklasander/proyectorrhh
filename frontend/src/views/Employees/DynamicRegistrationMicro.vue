<script setup lang="ts">
import { ref } from 'vue'

const currentStep = ref(1)
const totalSteps = 3

const formData = ref({
  documentType: 'dni',
  documentNumber: '',
  fullName: '',
  birthDate: '',
  gender: '',
  position: '',
  department: '',
  startDate: '',
  salary: '',
  workDays: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  morningEntry: '09:00',
  morningExit: '13:00',
  afternoonEntry: '14:00',
  afternoonExit: '18:00',
  hasChildren: false
})

const workDaysOptions = [
  { value: 'lunes', label: 'Lun' },
  { value: 'martes', label: 'Mar' },
  { value: 'miercoles', label: 'Mie' },
  { value: 'jueves', label: 'Jue' },
  { value: 'viernes', label: 'Vie' },
  { value: 'sabado', label: 'Sab' },
  { value: 'domingo', label: 'Dom' }
]

const nextStep = () => {
  if (currentStep.value < totalSteps) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Alta Dinamica - Microempresa / Pequeña Empresa</h1>
      <p class="text-slate-500">Regimen laboral especial para pequenas y microempresas (D.L. N 1086).</p>
    </div>

    <!-- Progress -->
    <div class="mb-8">
      <div class="flex items-center justify-between text-sm">
        <span>Paso {{ currentStep }} de {{ totalSteps }}</span>
        <span class="text-primary font-medium">{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
      </div>
      <div class="h-2 w-full bg-slate-200 rounded-full mt-2">
        <div class="h-full bg-primary rounded-full transition-all" :style="{ width: (currentStep / totalSteps) * 100 + '%' }"></div>
      </div>
    </div>

    <!-- Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 overflow-hidden">
      <!-- Step 1: Datos Basicos -->
      <div v-show="currentStep === 1" class="p-8">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <span class="material-icons text-primary">person</span>
          Datos del Trabajador
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2">Tipo de Documento</label>
            <select v-model="formData.documentType" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
              <option value="dni">DNI</option>
              <option value="ce">Carnet de Extranjeria</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Numero de Documento</label>
            <input v-model="formData.documentNumber" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="72881920" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Nombres Completos</label>
            <input v-model="formData.fullName" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Ruiz Gallino Mateo Alejandro" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
            <input v-model="formData.birthDate" type="date" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Sexo</label>
            <select v-model="formData.gender" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
              <option value="">Seleccionar</option>
              <option value="m">Masculino</option>
              <option value="f">Femenino</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Step 2: Condiciones Laborales -->
      <div v-show="currentStep === 2" class="p-8">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <span class="material-icons text-primary">work</span>
          Condiciones del Contrato
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2">Cargo / Puesto</label>
            <input v-model="formData.position" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Asistente General" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Area</label>
            <input v-model="formData.department" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Operaciones" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha de Inicio</label>
            <input v-model="formData.startDate" type="date" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Sueldo Basico (PEN)</label>
            <input v-model="formData.salary" type="number" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="0.00" />
          </div>
        </div>

        <!-- Horario -->
        <div class="mt-8">
          <h3 class="text-lg font-semibold mb-4">Jornada Laboral</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="day in workDaysOptions" :key="day.value" class="text-center">
              <input type="checkbox" :id="day.value" :value="day.value" v-model="formData.workDays" class="sr-only peer" />
              <label :for="day.value" class="block py-3 px-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all text-sm font-medium">
                {{ day.label }}
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <div>
            <label class="block text-sm font-medium mb-2">Entrada Mañana</label>
            <input v-model="formData.morningEntry" type="time" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Salida Mañana</label>
            <input v-model="formData.morningExit" type="time" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Entrada Tarde</label>
            <input v-model="formData.afternoonEntry" type="time" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Salida Tarde</label>
            <input v-model="formData.afternoonExit" type="time" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      </div>

      <!-- Step 3: Beneficios -->
      <div v-show="currentStep === 3" class="p-8 bg-slate-50/50 dark:bg-black/20">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <span class="material-icons text-primary">card_giftcard</span>
          Beneficios y Condiciones Especiales
        </h2>

        <div class="space-y-6">
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <span class="material-icons text-amber-600 dark:text-amber-400">info</span>
              <div>
                <h4 class="font-semibold text-amber-800 dark:text-amber-200">Regimen Especial MYPE</h4>
                <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  En empresas con menos de 10 trabajadores, la gratificacion y CTS se pagan conjuntamente con la remuneracion mensual. El trabajador puede optar por el regimen general.
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
            <div>
              <h4 class="font-medium">Hijos menores / Estudios superiores</h4>
              <p class="text-sm text-slate-500">Otorga derecho a Asignacion Familiar (10% RMV)</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="formData.hasChildren" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-8 py-6 bg-white dark:bg border-t border-slate-200 dark:border-slate-slate-900-800 flex items-center justify-between">
        <button @click="prevStep" class="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800" :disabled="currentStep === 1" :class="{ 'opacity-50 cursor-not-allowed': currentStep === 1 }">
          Atras
        </button>
        <div class="flex gap-4">
          <button class="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">Guardar y salir</button>
          <button @click="nextStep" class="px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            {{ currentStep === totalSteps ? 'Registrar' : 'Continuar' }}
            <span class="material-icons text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
