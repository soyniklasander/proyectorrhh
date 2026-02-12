<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <nav class="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 bg-primary/20 rounded flex items-center justify-center text-primary">
          <span class="material-icons">fingerprint</span>
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Nexa<span class="text-primary">Corp</span></span>
      </div>
      <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div class="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-slate-700">
          <span class="material-icons text-green-500 text-base">lock</span>
          <span>Conexión Segura TLS 1.3</span>
        </div>
        <div class="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
          <img 
            alt="User Avatar" 
            class="w-full h-full object-cover" 
            :src="userAvatar"
          />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <!-- Abstract Background Pattern -->
      <div class="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div class="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <div class="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left Column: Context & Progress -->
        <div class="lg:col-span-5 flex flex-col gap-6 pt-4">
          <div>
            <span class="text-primary font-semibold text-sm tracking-wider uppercase mb-2 block">Paso {{ currentStep }} de {{ totalSteps }}</span>
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">{{ stepTitle }}</h1>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              {{ stepDescription }}
            </p>
          </div>
          
          <!-- Progress Steps -->
          <div class="space-y-0 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
            <!-- Step 1 Done -->
            <div class="mb-8 relative">
              <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background-light dark:ring-background-dark"></div>
              <h3 class="text-slate-900 dark:text-slate-300 font-medium">Revisión de Boleta</h3>
              <p class="text-xs text-slate-500 mt-1">Completado - {{ formatDate(completedSteps.step1) }}</p>
            </div>
            
            <!-- Step 2 Done -->
            <div class="mb-8 relative">
              <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background-light dark:ring-background-dark"></div>
              <h3 class="text-slate-900 dark:text-slate-300 font-medium">Acuerdo de Conformidad</h3>
              <p class="text-xs text-slate-500 mt-1">Completado - {{ formatDate(completedSteps.step2) }}</p>
            </div>
            
            <!-- Step 3 Active -->
            <div class="mb-8 relative">
              <div :class="currentStep === 3 ? 'animate-pulse' : ''" class="absolute -left-[23px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background-light dark:ring-background-dark"></div>
              <h3 :class="currentStep === 3 ? 'text-primary font-bold' : 'text-slate-900 dark:text-slate-300 font-medium'">
                Autenticación ({{ authMethod === 'otp' ? 'OTP/PIN' : 'Firma Digital' }})
              </h3>
              <p v-if="currentStep === 3" class="text-xs text-primary/80 mt-1">En progreso...</p>
              <p v-else class="text-xs text-slate-500 mt-1">Pendiente</p>
            </div>
            
            <!-- Step 4 Pending -->
            <div class="relative opacity-50">
              <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-background-light dark:ring-background-dark"></div>
              <h3 class="text-slate-900 dark:text-slate-400 font-medium">Confirmación y Recibo</h3>
            </div>
          </div>
          
          <!-- Legal Info Card -->
          <div class="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4 flex items-start gap-3">
            <span class="material-icons text-primary mt-0.5">verified_user</span>
            <div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white">Cumplimiento Legal</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Este proceso cumple con la Ley N° 27269 de Firmas y Certificados Digitales del Perú. Sus datos están encriptados.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Right Column: Authentication Card -->
        <div class="lg:col-span-7">
          <div class="glass-panel rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden border border-slate-700/50">
            <!-- Auth Method Selector -->
            <div class="flex p-1 bg-surface-dark dark:bg-black/40 rounded-lg mb-8 border border-slate-700/50">
              <button 
                @click="authMethod = 'otp'"
                :class="authMethod === 'otp' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'"
                class="flex-1 py-2 px-4 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span class="material-icons text-base">sms</span>
                Código OTP (SMS)
              </button>
              <button 
                @click="authMethod = 'pin'"
                :class="authMethod === 'pin' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'"
                class="flex-1 py-2 px-4 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span class="material-icons text-base">pin</span>
                PIN Personal
              </button>
            </div>
            
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 text-primary">
                <span class="material-icons text-3xl">{{ authMethod === 'otp' ? 'phonelink_lock' : 'lock' }}</span>
              </div>
              <h2 class="text-xl font-bold text-white mb-2">{{ authMethod === 'otp' ? 'Código de Verificación' : 'Ingrese su PIN' }}</h2>
              <p v-if="authMethod === 'otp'" class="text-slate-400 text-sm max-w-md mx-auto">
                Hemos enviado un código de 6 dígitos a su celular registrado terminando en <span class="text-white font-mono">**89</span>.
              </p>
              <p v-else class="text-slate-400 text-sm max-w-md mx-auto">
                Ingrese su PIN personal de 4 dígitos para confirmar la operación.
              </p>
            </div>
            
            <!-- OTP Input Display -->
            <div v-if="authMethod === 'otp'" class="flex justify-center gap-2 md:gap-4 mb-8">
              <input
                v-for="(_, index) in otpDigits"
                :key="index"
                ref="otpInputs"
                v-model="otpDigits[index]"
                @input="handleOtpInput($event, index)"
                @keydown="handleOtpKeydown($event, index)"
                @paste="handleOtpPaste"
                class="w-12 h-14 md:w-14 md:h-16 border-2 focus:border-primary bg-background-dark rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_15px_rgba(37,175,244,0.3)] text-center outline-none transition-all"
                maxlength="1"
                type="text"
                inputmode="numeric"
              />
            </div>
            
            <!-- PIN Input Display -->
            <div v-else class="flex justify-center gap-3 mb-8">
              <div 
                v-for="(digit, index) in pinDigits" 
                :key="index"
                class="w-14 h-14 border-2 focus:border-primary bg-background-dark rounded-lg flex items-center justify-center"
              >
                <span class="text-2xl font-bold text-white">{{ digit !== null ? '•' : '' }}</span>
              </div>
            </div>
            
            <!-- Virtual Keypad & Actions -->
            <div class="bg-surface-dark rounded-xl p-4 md:p-6 border border-slate-700/50">
              <div class="flex flex-col md:flex-row gap-6">
                <!-- Keypad -->
                <div class="flex-1 grid grid-cols-3 gap-3 max-w-[280px] mx-auto md:mx-0">
                  <button 
                    v-for="num in keypadNumbers" 
                    :key="num"
                    @click="handleKeypadPress(num)"
                    class="h-12 rounded bg-slate-800 hover:bg-slate-700 active:bg-primary active:text-white border border-slate-700 text-white font-semibold text-lg transition-colors"
                  >
                    {{ num }}
                  </button>
                  <button 
                    @click="clearLastDigit"
                    class="h-12 rounded bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 flex items-center justify-center transition-colors"
                  >
                    <span class="material-icons text-sm">close</span>
                  </button>
                  <button 
                    @click="handleKeypadPress(0)"
                    class="h-12 rounded bg-slate-800 hover:bg-slate-700 active:bg-primary active:text-white border border-slate-700 text-white font-semibold text-lg transition-colors"
                  >
                    0
                  </button>
                  <button 
                    @click="confirmSignature"
                    class="h-12 rounded bg-green-700 hover:bg-green-600 border border-green-600 text-white flex items-center justify-center transition-colors"
                  >
                    <span class="material-icons text-sm">check</span>
                  </button>
                </div>
                
                <!-- Actions & Info -->
                <div class="flex-1 flex flex-col justify-between pt-2">
                  <div class="text-sm text-slate-400 mb-6 bg-slate-800/50 p-3 rounded border border-slate-700">
                    <div class="flex items-center gap-2 mb-2 text-primary">
                      <span class="material-icons text-sm">security</span>
                      <span class="font-bold text-xs uppercase tracking-wide">Teclado Seguro</span>
                    </div>
                    <p class="text-xs leading-5">Los números cambian de posición aleatoriamente para evitar el rastreo de pulsaciones.</p>
                  </div>
                  <div class="space-y-3">
                    <button 
                      @click="confirmSignature"
                      :disabled="!isAuthComplete"
                      class="w-full py-3 px-4 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-all"
                      :class="isAuthComplete ? 'bg-primary hover:bg-blue-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'"
                    >
                      <span class="material-icons text-sm">draw</span>
                      {{ authMethod === 'otp' ? 'VERIFICAR CÓDIGO' : 'FIRMAR BOLETA' }}
                    </button>
                    <div class="text-center">
                      <button 
                        v-if="resendCooldown === 0"
                        @click="resendCode"
                        class="text-primary text-xs font-medium hover:underline hover:text-primary-dark transition-colors"
                      >
                        ¿No recibiste el código? Reenviar
                      </button>
                      <span v-else class="text-slate-500 text-xs">
                        Reenviar en {{ resendCooldown }}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-between text-slate-500 text-xs px-2">
            <button @click="goBack" class="hover:text-slate-300 flex items-center gap-1">
              <span class="material-icons text-sm">arrow_back</span>
              Volver al paso anterior
            </button>
            <div class="flex gap-4">
              <a class="hover:text-slate-300" href="#">Términos</a>
              <a class="hover:text-slate-300" href="#">Ayuda</a>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="border-t border-slate-800 bg-background-dark py-6 text-center">
      <p class="text-slate-500 text-xs">© 2023 NexaCorp Perú S.A. Todos los derechos reservados.</p>
      <p class="text-slate-600 text-[10px] mt-1">Sistema auditado bajo normas ISO/IEC 27001</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
interface Props {
  documentId?: string
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  documentId: '',
  step: 3
})

// State
const currentStep = ref(props.step)
const totalSteps = 4
const authMethod = ref<'otp' | 'pin'>('otp')
const userAvatar = ref('https://lh3.googleusercontent.com/aida-public/AB6AXuDeEe1VOSPPIRcavx4drH5AKahg7hTT1smcpbXBhTLayG7AQRdYii4gdsw8SdIYqo-TfvunX1J5QeaizRVMyMKbReGV2ybg7GNQ7e-WYxAThTtC3ogPZMaorF3SLVJ7LGWwgJgvf5GaSL0-GBcX9XPuEXrAChQT-CYHUF9s2IsZaQpqSuTCo9Wq2DgodkyIGAsvxIczaIgIDtC7d8FblwGJJXBid_OsPtFG0hwfUVBtl8n_7lVaIBbIpU3XN195LrfgGogJEYwa91wG')

const completedSteps = ref({
  step1: new Date(),
  step2: new Date()
})

const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const pinDigits = ref<(number | null)[]>([null, null, null, null])
const otpInputs = ref<HTMLInputElement[]>([])
const resendCooldown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

// Computed
const stepTitle = computed(() => {
  const titles = [
    'Revisión de Documento',
    'Acuerdo de Conformidad',
    'Autenticación de Identidad',
    'Confirmación y Recibo'
  ]
  return titles[currentStep.value - 1] || titles[0]
})

const stepDescription = computed(() => {
  const descriptions = [
    'Revise cuidadosamente los detalles de su boleta de pago antes de proceder con la firma.',
    'Está usted de acuerdo con los conceptos y montos detallados en su boleta de pago.',
    'Para garantizar la validez legal en Perú de su firma digital, necesitamos verificar su identidad mediante un segundo factor de autenticación.',
    'Su documento ha sido firmado exitosamente. Descargue su copia de respaldo.'
  ]
  return descriptions[currentStep.value - 1] || descriptions[0]
})

const keypadNumbers = computed(() => {
  // Shuffle numbers for security (simulated)
  return [7, 2, 9, 4, 1, 6, 5, 8, 3]
})

const isAuthComplete = computed(() => {
  if (authMethod.value === 'otp') {
    return otpDigits.value.every(d => d !== '')
  } else {
    return pinDigits.value.every(d => d !== null)
  }
})

// Methods
function formatDate(date: Date): string {
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleOtpInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const value = input.value
  
  if (value.length === 1 && index < otpDigits.value.length - 1) {
    otpInputs.value[index + 1]?.focus()
  }
  
  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    otpDigits.value[index] = ''
  }
}

function handleOtpKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace' && otpDigits.value[index] === '' && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
}

function handleOtpPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')
  const digits = pastedData?.replace(/\D/g, '').slice(0, 6).split('')
  
  if (digits) {
    digits.forEach((digit, i) => {
      if (i < otpDigits.value.length) {
        otpDigits.value[i] = digit
      }
    })
    
    // Focus on next empty input
    const nextIndex = digits.length < otpDigits.value.length ? digits.length : otpDigits.value.length - 1
    otpInputs.value[nextIndex]?.focus()
  }
}

function handleKeypadPress(num: number) {
  if (authMethod.value === 'pin') {
    const emptyIndex = pinDigits.value.findIndex(d => d === null)
    if (emptyIndex !== -1) {
      pinDigits.value[emptyIndex] = num
    }
  }
}

function clearLastDigit() {
  for (let i = pinDigits.value.length - 1; i >= 0; i--) {
    if (pinDigits.value[i] !== null) {
      pinDigits.value[i] = null
      break
    }
  }
}

function confirmSignature() {
  if (!isAuthComplete.value) return
  
  // In production, this would call the backend to verify OTP/PIN and sign the document
  console.log('Confirming signature with method:', authMethod.value)
  console.log('OTP:', otpDigits.value.join(''))
  console.log('PIN:', pinDigits.value.join(''))
  
  // Move to next step
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function resendCode() {
  // Start cooldown
  resendCooldown.value = 30
  
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
  }, 1000)
  
  // In production, this would call the backend to resend OTP
  console.log('Resending OTP...')
}

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    router.back()
  }
}

// Lifecycle
onMounted(() => {
  // Start resend cooldown
  resendCode()
})

onUnmounted(() => {
  if (resendTimer) {
    clearInterval(resendTimer)
  }
})
</script>

<style scoped>
.glass-panel {
  background: rgba(26, 38, 46, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(37, 175, 244, 0.1);
}

.input-glow:focus-within {
  box-shadow: 0 0 15px rgba(37, 175, 244, 0.15);
  border-color: #25aff4;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
