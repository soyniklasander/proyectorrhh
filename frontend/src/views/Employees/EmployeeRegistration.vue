<script setup lang="ts">
import { ref, computed } from 'vue'

// Step state
const currentStep = ref(1)
const totalSteps = 5

// Form data
const formData = ref({
  // Step 1: Identidad
  documentType: 'dni',
  documentNumber: '',
  fullName: '',
  birthDate: '',
  gender: '',
  nationality: 'peru',
  email: '',
  phone: '',
  // Step 2: Contrato
  contractType: '',
  position: '',
  department: '',
  startDate: '',
  salary: '',
  paymentFrequency: 'monthly',
  // Step 3: Ubicacion
  region: '',
  province: '',
  district: '',
  address: '',
  // Step 4: Seguridad Social
  pensionSystem: 'afp',
  afp: 'AFP Integra',
  cuspp: '',
  commissionType: 'flow',
  hasChildren: true,
  // Step 5: Derechohabientes
  beneficiaries: [
    {
      relationship: 'hijo',
      document: '72881920',
      fullName: 'Mateo Alejandro Ruiz',
      birthDate: '2015-05-12'
    }
  ]
})

// Options
const afpOptions = ['AFP Integra', 'Prima AFP', 'Profuturo AFP', 'AFP Habitat']
const documentTypes = [
  { value: 'dni', label: 'DNI' },
  { value: 'ce', label: 'Carnet de Extranjeria' },
  { value: 'pasaporte', label: 'Pasaporte' }
]
const contractTypes = [
  { value: 'plazo_indefinido', label: 'Plazo Indeterminado' },
  { value: 'plazo_fijo', label: 'Plazo Fijo' },
  { value: 'locacion', label: 'Locacion de Servicios' },
  { value: 'practicante', label: 'Practicante' }
]
const regions = [
  { value: 'lima', label: 'Lima' },
  { value: 'callao', label: 'Callao' },
  { value: 'arequipa', label: 'Arequipa' },
  { value: 'cusco', label: 'Cusco' }
]

// Wizard steps
const steps = [
  { number: 1, title: 'Identidad', completed: false },
  { number: 2, title: 'Contrato', completed: false },
  { number: 3, title: 'Ubicacion', completed: false },
  { number: 4, title: 'Seguridad Social', completed: false },
  { number: 5, title: 'Derechohabientes', completed: false }
]

const progress = computed(() => (currentStep.value / totalSteps) * 100)

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    steps[currentStep.value - 1].completed = true
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    steps[currentStep.value - 1].completed = false
  }
}

const goToStep = (step: number) => {
  if (step <= currentStep.value || steps[step - 2]?.completed) {
    currentStep.value = step
  }
}
</script>

<template>
  <div class="flex-grow container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-primary text-sm font-medium mb-2">
        <span class="material-icons-round text-sm">arrow_back</span>
        <span>Volver al Dashboard</span>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Alta de Nuevo Colaborador (T-Registro)</h1>
      <p class="text-slate-500 dark:text-slate-400">Complete la informacion requerida para registrar al colaborador en la planilla electronica.</p>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
        <span>Paso {{ currentStep }} de {{ totalSteps }}</span>
        <span class="text-primary font-medium">{{ Math.round(progress) }}% Completado</span>
      </div>
      <div class="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div class="h-full bg-primary transition-all duration-300" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <!-- Wizard Steps -->
    <div class="mb-8">
      <div class="hidden md:flex w-full rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
        <template v-for="step in steps" :key="step.number">
          <button 
            @click="goToStep(step.number)"
            class="flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all"
            :class="[
              step.completed || step.number === currentStep ? 'bg-primary/10 dark:bg-primary/20' : 'bg-slate-100 dark:bg-slate-800/50',
              step.number === currentStep ? 'bg-white dark:bg-slate-900 relative overflow-hidden' : '',
              step.number > currentStep ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'
            ]"
            :disabled="step.number > currentStep"
          >
            <template v-if="step.completed">
              <div class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                <span class="material-icons text-sm">check</span>
              </div>
              <span class="text-sm font-medium text-primary dark:text-blue-300">{{ step.title }}</span>
            </template>
            <template v-else-if="step.number === currentStep">
              <div class="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
              <div class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold z-10">{{ step.number }}</div>
              <span class="text-sm font-bold text-slate-900 dark:text-white z-10">{{ step.title }}</span>
            </template>
            <template v-else>
              <div class="w-6 h-6 rounded-full border-2 border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-bold">{{ step.number }}</div>
              <span class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ step.title }}</span>
            </template>
          </button>
        </template>
      </div>
    </div>

    <!-- Wizard Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <!-- STEP 1: IDENTIDAD -->
      <div v-show="currentStep === 1" class="p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-primary/10 rounded-lg text-primary">
            <span class="material-icons-round">badge</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Datos de Identidad</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Tipo de Documento</label>
            <select v-model="formData.documentType" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option v-for="doc in documentTypes" :key="doc.value" :value="doc.value">{{ doc.label }}</option>
            </select>
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Numero de Documento</label>
            <input v-model="formData.documentNumber" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="72881920" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-2">Nombres Completos</label>
            <input v-model="formData.fullName" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Ruiz Gallino Mateo Alejandro" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
            <input v-model="formData.birthDate" type="date" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Sexo</label>
            <select v-model="formData.gender" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Seleccionar</option>
              <option value="m">Masculino</option>
              <option value="f">Femenino</option>
            </select>
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Nacionalidad</label>
            <select v-model="formData.nationality" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="peru">Peruana</option>
              <option value="extranjera">Extranjera</option>
            </select>
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Correo Electronico</label>
            <input v-model="formData.email" type="email" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="mateo@email.com" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Telefono / Celular</label>
            <input v-model="formData.phone" type="tel" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="999-999-999" />
          </div>
        </div>
      </div>

      <!-- STEP 2: CONTRATO -->
      <div v-show="currentStep === 2" class="p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-primary/10 rounded-lg text-primary">
            <span class="material-icons-round">description</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Informacion del Contrato</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Tipo de Contrato</label>
            <select v-model="formData.contractType" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option v-for="contract in contractTypes" :key="contract.value" :value="contract.value">{{ contract.label }}</option>
            </select>
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Cargo / Puesto</label>
            <input v-model="formData.position" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Analista de Nomina" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Area / Departamento</label>
            <input v-model="formData.department" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Recursos Humanos" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Fecha de Inicio</label>
            <input v-model="formData.startDate" type="date" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Sueldo Base (PEN)</label>
            <input v-model="formData.salary" type="number" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="0.00" />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Frecuencia de Pago</label>
            <select v-model="formData.paymentFrequency" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="monthly">Mensual</option>
              <option value="biweekly">Quincenal</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
        </div>
      </div>

      <!-- STEP 3: UBICACION -->
      <div v-show="currentStep === 3" class="p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-primary/10 rounded-lg text-primary">
            <span class="material-icons-round">location_on</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Ubicacion del Colaborador</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Region</label>
            <select v-model="formData.region" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option v-for="region in regions" :key="region.value" :value="region.value">{{ region.label }}</option>
            </select>
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Provincia</label>
            <select class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Seleccionar</option>
              <option value="lima">Lima</option>
              <option value="barranca">Barranca</option>
              <option value="cajatambo">Cajatambo</option>
            </select>
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-medium mb-2">Distrito</label>
            <select class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Seleccionar</option>
              <option value="miraflores">Miraflores</option>
              <option value="san_isidro">San Isidro</option>
              <option value="surco">Surco</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-2">Direccion</label>
            <input v-model="formData.address" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Av. Jose Larco 1234, Miraflores" />
          </div>
        </div>
      </div>

      <!-- STEP 4: SEGURIDAD SOCIAL -->
      <div v-show="currentStep === 4" class="p-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-primary/10 rounded-lg text-primary">
            <span class="material-icons-round">security</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Regimen Pensionario</h2>
        </div>

        <!-- ONP vs AFP -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <label class="relative cursor-pointer group">
            <input v-model="formData.pensionSystem" value="onp" class="peer sr-only" name="pension_system" type="radio" />
            <div class="p-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/50 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs tracking-wider">ONP</div>
                <div class="w-5 h-5 rounded-full border-2 border-slate-400 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
                </div>
              </div>
              <h3 class="font-bold text-slate-900 dark:text-white mb-1">Sistema Nacional (ONP)</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Decreto Ley N 19990. Aporte obligatorio al fondo comun.</p>
            </div>
          </label>

          <label class="relative cursor-pointer group">
            <input v-model="formData.pensionSystem" value="afp" class="peer sr-only" name="pension_system" type="radio" />
            <div class="p-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/50 transition-all peer-checked:border-primary peer-checked:bg-primary/5">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs tracking-wider">AFP</div>
                <div class="w-5 h-5 rounded-full border-2 border-slate-400 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100"></div>
                </div>
              </div>
              <h3 class="font-bold text-slate-900 dark:text-white mb-1">Sistema Privado (SPP)</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Cuenta Individual de Capitalizacion administrada por una AFP.</p>
            </div>
          </label>
        </div>

        <!-- AFP Conditional Fields -->
        <div v-if="formData.pensionSystem === 'afp'" class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-dashed border-slate-300 dark:border-slate-700 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1">
              <label class="block text-sm font-medium">Administradora de Fondos (AFP)</label>
              <select v-model="formData.afp" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary">
                <option v-for="afp in afpOptions" :key="afp" :value="afp">{{ afp }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="block text-sm font-medium flex justify-between">
                Codigo CUSPP
                <a class="text-xs text-primary hover:underline" href="#">Consulta SBS?</a>
              </label>
              <input v-model="formData.cuspp" type="text" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 focus:ring-2 focus:ring-primary uppercase placeholder-slate-400" placeholder="Ej: 567890JYZTM0" />
            </div>
            <div class="space-y-3 md:col-span-2">
              <span class="block text-sm font-medium">Tipo de Comision</span>
              <div class="flex gap-6">
                <label class="inline-flex items-center">
                  <input v-model="formData.commissionType" value="flow" class="form-radio text-primary bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary" name="commission_type" type="radio" />
                  <span class="ml-2 text-sm">Comision sobre Flujo (Sueldo)</span>
                </label>
                <label class="inline-flex items-center">
                  <input v-model="formData.commissionType" value="mixed" class="form-radio text-primary bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary" name="commission_type" type="radio" />
                  <span class="ml-2 text-sm">Comision Mixta (Flujo + Saldo)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 5: DERECHOHABIENTES -->
      <div v-show="currentStep === 5" class="p-8 bg-slate-50/50 dark:bg-black/20">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg text-primary">
              <span class="material-icons-round">family_restroom</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">Derechohabientes</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Gestion de familiares para Asignacion Familiar y cobertura de salud.</p>
            </div>
          </div>
          <button class="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary" type="button">
            <span class="material-icons text-base mr-2">add</span>
            Agregar Familiar
          </button>
        </div>

        <!-- Asignacion Familiar Toggle -->
        <div class="flex items-center justify-between bg-blue-50 dark:bg-primary/10 border border-blue-100 dark:border-primary/20 p-4 rounded-lg mb-6">
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">Asignacion Familiar (10% RMV)</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Se activa automaticamente si el colaborador tiene hijos menores o cursando estudios superiores.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="formData.hasChildren" class="sr-only peer" type="checkbox" />
            <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            <span class="ml-3 text-sm font-bold" :class="formData.hasChildren ? 'text-primary' : 'text-slate-500'">{{ formData.hasChildren ? 'ACTIVO' : 'INACTIVO' }}</span>
          </label>
        </div>

        <!-- Beneficiaries Table -->
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            <thead class="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Parentesco</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documento</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombres Completos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha Nac.</th>
                <th class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-for="(beneficiary, idx) in formData.beneficiaries" :key="idx">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{{ beneficiary.relationship }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{{ beneficiary.document }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{{ beneficiary.fullName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{{ beneficiary.birthDate }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-primary hover:text-blue-400 mr-3"><span class="material-icons text-base">edit</span></button>
                  <button class="text-red-500 hover:text-red-400"><span class="material-icons text-base">delete</span></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button @click="prevStep" class="inline-flex items-center px-6 py-3 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary" :disabled="currentStep === 1" :class="{ 'opacity-50 cursor-not-allowed': currentStep === 1 }">
          <span class="material-icons text-sm mr-2">arrow_back</span>
          Atras
        </button>
        <div class="flex items-center gap-4">
          <button class="hidden sm:inline-block text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" type="button">Guardar y salir</button>
          <button @click="nextStep" class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary">
            {{ currentStep === totalSteps ? 'Finalizar' : 'Continuar' }}
            <span class="material-icons text-sm ml-2">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
