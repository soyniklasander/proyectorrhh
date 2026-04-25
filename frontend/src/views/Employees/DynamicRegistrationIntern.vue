<script setup lang="ts">
import { ref } from 'vue'

const currentStep = ref(1)
const totalSteps = 4

const formData = ref({
  documentType: 'dni',
  documentNumber: '',
  fullName: '',
  birthDate: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  university: '',
  career: '',
  startDate: '',
  endDate: '',
  monthlyStipend: '',
  hoursPerWeek: 30,
  supervisor: '',
  activities: ''
})

const universities = [
  'Universidad Nacional Mayor de San Marcos',
  'Universidad de Lima',
  'Pontificia Universidad Catolica del Peru',
  'Universidad San Ignacio de Loyola',
  'Universidad Peruana Cayetano Heredia',
  'Otra'
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
      <div class="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <span class="material-icons text-sm">arrow_back</span>
        <span>Volver al Dashboard</span>
      </div>
      <h1 class="text-2xl font-bold mb-2">Alta Dinamica - Practicante Pre Profesional</h1>
      <p class="text-slate-500">Convenio de practicantes para formacion profesional (D.L. N 1428).</p>
    </div>

    <!-- Progress -->
    <div class="mb-8">
      <div class="flex items-center justify-between text-sm mb-2">
        <span>Paso {{ currentStep }} de {{ totalSteps }}</span>
        <span class="text-primary font-medium">{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
      </div>
      <div class="h-2 w-full bg-slate-200 rounded-full">
        <div class="h-full bg-primary rounded-full transition-all" :style="{ width: (currentStep / totalSteps) * 100 + '%' }"></div>
      </div>
    </div>

    <!-- Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 overflow-hidden">
      <!-- Step 1: Identidad -->
      <div v-show="currentStep === 1" class="p-8">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <span class="material-icons text-primary">badge</span>
          Datos del Practicante
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-2">Nombres Completos</label>
            <input v-model="formData.fullName" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Ruiz Gallino Mateo Alejandro" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
            <input v-model="formData.birthDate" type="date" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Correo Electronico</label>
            <input v-model="formData.email" type="email" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="correo@uni.edu.pe" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Telefono / Celular</label>
            <input v-model="formData.phone" type="tel" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="999-999-999" />
          </div>
        </div>
      </div>

      <!-- Step 2: Educacion -->
      <div v-show="currentStep === 2" class="p-8">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <span class="material-icons text-primary\">school</span>
          Formacion Academica
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-2">Universidad / Instituto</label>
            <select v-model="formData.university" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
              <option v-for="uni in universities" :key="uni" :value="uni">{{ uni }}</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-2">Carrera / Especialidad</label>
            <input v-model="formData.career" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Ingenieria de Sistemas, Administracion, etc." />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-2">Ciclo Actual</label>
            <select class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
              <option value="">Seleccionar</option>
              <option value="5">5to Ciclo</option>
              <option value="6">6to Ciclo</option>
              <option value="7">7mo Ciclo</option>
              <option value="8">8vo Ciclo</option>
              <option value="9">9no Ciclo</option>
              <option value="10">10mo Ciclo</option>
              <option value="egresado">Egresado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Step 3: Practica -->
      <div v-show="currentStep === 3" class="p-8">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <span class="material-icons text-primary\">work</span>
          Datos de la Practica
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Cargo / Area</label>
            <input v-model="formData.position" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Practicante de Sistemas" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Departamento</label>
            <input v-model="formData.department" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Tecnologia" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Supervisor Asignado</label>
            <input v-model="formData.supervisor" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="Nombre del supervisor" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha de Inicio</label>
            <input v-model="formData.startDate" type="date" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Fecha de Termino</label>
            <input v-model="formData.endDate" type="date" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Horas Semanales</label>
            <select v-model="formData.hoursPerWeek" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
              <option value="20">20 horas</option>
              <option value="30">30 horas</option>
              <option value="40">40 horas</option>
            </select>
          </div>
        </div>

        <div class="mt-6">
          <label class="block text-sm font-medium mb-2">Actividades Principales</label>
          <textarea v-model="formData.activities" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary resize-none" rows="4" placeholder="Describa las actividades que realizara el practicante..."></textarea>
        </div>
      </div>

      <!-- Step 4: Subvencion -->
      <div v-show="currentStep === 4" class="p-8 bg-slate-50/50 dark:bg-black/20">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <span class="material-icons text-primary">payments</span>
          Subvencion y Condiciones
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2">Subvencion Mensual (PEN)</label>
            <input v-model="formData.monthlyStipend" type="number" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary" placeholder="0.00" />
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <div class="flex items-start gap-3">
            <span class="material-icons text-blue-600 dark:text-blue-400">info</span>
            <div>
              <h4 class="font-semibold text-blue-800 dark:text-blue-200">Informacion Importante</h4>
              <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                El practicante pre profesional recibe una subvencion maxima de S/ 1,300.00 mensuales (30 horas/semana) o S/ 930.00 (20 horas/semana). No existe vinculacion laboral.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-4 mt-6">
          <div class="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <input type="checkbox" id="eps" class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" />
            <label for="eps" class="text-sm">El practicante cuenta con EPS (Emergencias)?</label>
          </div>
          <div class="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <input type="checkbox" id="safe" class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" />
            <label for="safe" class="text-sm">Cuenta con seguro de vida ley y SCTR?</label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button @click="prevStep" class="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800" :disabled="currentStep === 1" :class="{ 'opacity-50 cursor-not-allowed': currentStep === 1 }">
          Atras
        </button>
        <div class="flex gap-4">
          <button class="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">Guardar y salir</button>
          <button @click="nextStep" class="px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            {{ currentStep === totalSteps ? 'Registrar Practicante' : 'Continuar' }}
            <span class="material-icons text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
