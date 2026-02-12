<template>
  <div class="min-h-screen flex">
    <!-- Left Panel: Branding & Context -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-surface-dark items-center justify-center p-12 overflow-hidden">
      <!-- Abstract Background Pattern -->
      <div class="absolute inset-0 z-0 opacity-20">
        <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px] opacity-40 mix-blend-screen"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/60 rounded-full blur-[100px] opacity-30 mix-blend-screen"></div>
        <div class="absolute top-[40%] left-[30%] w-[200px] h-[200px] bg-blue-400 rounded-full blur-[80px] opacity-20"></div>
      </div>
      <div class="relative z-10 max-w-lg">
        <div class="mb-8 flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <span class="material-icons text-white text-2xl">security</span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-white">NexaCorp</h2>
        </div>
        <h1 class="text-4xl font-extrabold text-white mb-6 leading-tight">
          Seguridad empresarial de <span class="text-primary">Clase Mundial</span>
        </h1>
        <p class="text-gray-400 text-lg leading-relaxed mb-8">
          Estás a un paso de acceder al módulo de administración multi-tenancy. Configura tu acceso seguro para gestionar los recursos de tu organización con total confianza.
        </p>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-surface-dark/50 backdrop-blur-sm border border-white/5 p-4 rounded-xl">
            <span class="material-icons text-primary mb-2">shield</span>
            <h3 class="font-semibold text-white">Encriptación E2E</h3>
            <p class="text-xs text-gray-500 mt-1">Tus datos viajan siempre seguros.</p>
          </div>
          <div class="bg-surface-dark/50 backdrop-blur-sm border border-white/5 p-4 rounded-xl">
            <span class="material-icons text-primary mb-2">fingerprint</span>
            <h3 class="font-semibold text-white">Acceso Biométrico</h3>
            <p class="text-xs text-gray-500 mt-1">Compatible con llaves de seguridad.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Activation Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto bg-background-light dark:bg-background-dark">
      <div class="w-full max-w-md space-y-8">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex justify-center mb-6">
          <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <span class="material-icons text-white text-3xl">security</span>
          </div>
        </div>
        
        <div class="text-center lg:text-left">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bienvenido a NexaCorp</h2>
          <p class="text-gray-600 dark:text-gray-400">Activa tu cuenta corporativa definiendo tu primera contraseña de acceso.</p>
        </div>
        
        <form @submit.prevent="activateAccount" class="mt-8 space-y-6">
          <!-- Read-only Email Field -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo Electrónico Corporativo
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-icons text-gray-400 text-lg">mail</span>
              </div>
              <input 
                v-model="email"
                class="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-surface-dark text-gray-500 dark:text-gray-400 cursor-not-allowed focus:ring-0 focus:border-gray-300 sm:text-sm py-3" 
                disabled 
                readonly 
                type="email"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="material-icons text-green-500 text-lg">check_circle</span>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Este correo ha sido verificado previamente.</p>
          </div>

          <!-- Password Field -->
          <div class="space-y-1 relative group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nueva Contraseña
            </label>
            <div class="relative">
              <input 
                v-model="password"
                @input="checkPasswordStrength"
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-3 px-4 transition-all duration-200" 
                id="password"
                placeholder="••••••••••••" 
                required 
                type="password"
              />
              <button 
                @click="togglePasswordVisibility('password')"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none" 
                type="button"
              >
                <span class="material-icons text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <!-- Password Strength Meter -->
          <div class="space-y-2">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Seguridad de la clave</span>
              <span :class="strengthColor" class="text-xs font-bold capitalize">{{ strengthLabel }}</span>
            </div>
            <div class="flex space-x-1 h-1.5 w-full">
              <div :class="strengthBars[0]" class="flex-1 rounded-full transition-all duration-300"></div>
              <div :class="strengthBars[1]" class="flex-1 rounded-full transition-all duration-300"></div>
              <div :class="strengthBars[2]" class="flex-1 rounded-full transition-all duration-300"></div>
              <div :class="strengthBars[3]" class="flex-1 rounded-full transition-all duration-300"></div>
            </div>
          </div>

          <!-- Requirements Checklist -->
          <div class="bg-gray-50 dark:bg-surface-dark/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700/50">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Requisitos mínimos
            </h4>
            <ul class="space-y-2">
              <li :class="requirements.minLength.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'" class="flex items-center text-sm">
                <span class="material-icons text-base mr-2">{{ requirements.minLength.valid ? 'check' : 'radio_button_unchecked' }}</span>
                Mínimo 8 caracteres
              </li>
              <li :class="requirements.hasNumber.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'" class="flex items-center text-sm">
                <span class="material-icons text-base mr-2">{{ requirements.hasNumber.valid ? 'check' : 'radio_button_unchecked' }}</span>
                Al menos un número
              </li>
              <li :class="requirements.hasUppercase.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'" class="flex items-center text-sm">
                <span class="material-icons text-base mr-2">{{ requirements.hasUppercase.valid ? 'check' : 'radio_button_unchecked' }}</span>
                Una mayúscula
              </li>
              <li :class="requirements.hasSymbol.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'" class="flex items-center text-sm">
                <span class="material-icons text-base mr-2">{{ requirements.hasSymbol.valid ? 'check' : 'radio_button_unchecked' }}</span>
                Un símbolo especial (!@#$%)
              </li>
            </ul>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmar Contraseña
            </label>
            <div class="relative">
              <input 
                v-model="confirmPassword"
                class="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-3 px-4 transition-all duration-200" 
                id="confirm-password"
                placeholder="••••••••••••" 
                required 
                type="password"
              />
            </div>
            <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
          </div>

          <!-- Action Button -->
          <button 
            :disabled="!isFormValid || isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-gray-900 transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed" 
            type="submit"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <span class="material-icons text-blue-300 group-hover:text-blue-100 transition-colors">lock_open</span>
            </span>
            {{ isLoading ? 'Activando...' : 'Activar Cuenta' }}
          </button>
          
          <p class="mt-4 text-center text-xs text-gray-500">
            Al activar tu cuenta, aceptas los 
            <a class="font-medium text-primary hover:text-blue-400 underline decoration-primary/30 underline-offset-2" href="#">Términos de Servicio</a> 
            y la 
            <a class="font-medium text-primary hover:text-blue-400 underline decoration-primary/30 underline-offset-2" href="#">Política de Privacidad</a>.
          </p>
        </form>

        <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div class="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>¿Problemas para activar?</span>
            <a class="font-medium text-primary hover:text-blue-400 flex items-center" href="#">
              Contactar Soporte
              <span class="material-icons text-sm ml-1">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const email = ref('gerencia@empresa-cliente.com')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

interface PasswordRequirements {
  minLength: { valid: boolean }
  hasNumber: { valid: boolean }
  hasUppercase: { valid: boolean }
  hasSymbol: { valid: boolean }
}

const requirements = ref<PasswordRequirements>({
  minLength: { valid: false },
  hasNumber: { valid: false },
  hasUppercase: { valid: false },
  hasSymbol: { valid: false }
})

// Computed
const passwordMismatch = computed(() => {
  return confirmPassword.value.length > 0 && password.value !== confirmPassword.value
})

const isFormValid = computed(() => {
  const req = requirements.value
  return req.minLength.valid && 
         req.hasNumber.valid && 
         req.hasUppercase.valid && 
         req.hasSymbol.valid && 
         !passwordMismatch.value &&
         password.value.length > 0
})

const strengthLevel = computed(() => {
  let level = 0
  if (requirements.value.minLength.valid) level++
  if (requirements.value.hasNumber.valid) level++
  if (requirements.value.hasUppercase.valid) level++
  if (requirements.value.hasSymbol.valid) level++
  return level
})

const strengthLabel = computed(() => {
  const labels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte']
  return labels[Math.min(strengthLevel.value, 4)]
})

const strengthColor = computed(() => {
  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500']
  return colors[Math.min(strengthLevel.value, 4)]
})

const strengthBars = computed(() => {
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const bars = ['', '', 'bg-gray-200 dark:bg-gray-700', 'bg-gray-200 dark:bg-gray-700']
  
  for (let i = 0; i < 4; i++) {
    bars[i] = i < strengthLevel.value ? colors[strengthLevel.value] : 'bg-gray-200 dark:bg-gray-700'
  }
  return bars
})

// Methods
function checkPasswordStrength() {
  const pwd = password.value
  requirements.value.minLength.valid = pwd.length >= 8
  requirements.value.hasNumber.valid = /\d/.test(pwd)
  requirements.value.hasUppercase.valid = /[A-Z]/.test(pwd)
  requirements.value.hasSymbol.valid = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
}

function togglePasswordVisibility(field: string) {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  }
}

async function activateAccount() {
  if (!isFormValid.value) return
  
  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In production, this would call the backend activation endpoint
    console.log('Account activated for:', email.value)
    
    router.push('/login?activated=true')
  } catch (error) {
    console.error('Activation failed:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Get email from route query if available
  const routeEmail = router.currentRoute.value.query.email
  if (routeEmail) {
    email.value = routeEmail as string
  }
})
</script>
