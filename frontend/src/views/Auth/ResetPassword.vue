<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const passwordStrength = ref(0);
const showPassword = ref(false);

const passwordRules = [
  { label: 'Mínimo 8 caracteres', valid: () => password.value.length >= 8 },
  { label: 'Una letra mayúscula', valid: () => /[A-Z]/.test(password.value) },
  { label: 'Una letra minúscula', valid: () => /[a-z]/.test(password.value) },
  { label: 'Un número', valid: () => /[0-9]/.test(password.value) },
  { label: 'Un carácter especial', valid: () => /[!@#$%^&*(),.?":{}|<>]/.test(password.value) },
];

const checkPasswordStrength = () => {
  const validRules = passwordRules.filter(rule => rule.valid()).length;
  passwordStrength.value = validRules;
};

const handleSubmit = async () => {
  error.value = '';
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  
  if (passwordStrength.value < 4) {
    error.value = 'La contraseña no cumple con los requisitos mínimos de seguridad';
    return;
  }
  
  loading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    loading.value = false;
    router.push('/login');
  }, 1500);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-900">
    <!-- Background Decorative Elements -->
    <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
      <div class="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]"></div>
      <div class="absolute bottom-0 left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[80px]"></div>
    </div>

    <!-- Main Card -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2 mb-6">
          <div class="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white">ERPRick</h2>
        </div>
        
        <h1 class="text-2xl font-bold text-white">Renovar contraseña</h1>
        <p class="mt-2 text-sm text-slate-400">
          Por seguridad, debes cambiar tu contraseña periódicamente.
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-slate-800/70 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/50 relative overflow-hidden">
        <!-- Top highlight -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p class="text-sm text-red-400 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              Nueva Contraseña
            </label>
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                v-model="password"
                @input="checkPasswordStrength"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-300" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
            </div>
            
            <!-- Password Strength Indicator -->
            <div class="mt-3 space-y-2">
              <div class="flex gap-1">
                <div 
                  v-for="i in 5" 
                  :key="i"
                  class="h-1 flex-1 rounded-full transition-colors duration-300"
                  :class="i <= passwordStrength ? 'bg-green-500' : 'bg-slate-700'"
                ></div>
              </div>
              <div class="grid grid-cols-2 gap-1 text-xs">
                <div 
                  v-for="(rule, idx) in passwordRules" 
                  :key="idx"
                  class="flex items-center gap-1"
                  :class="rule.valid() ? 'text-green-500' : 'text-slate-500'"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="rule.valid()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {{ rule.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              Confirmar Contraseña
            </label>
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}</span>
          </button>
        </form>
      </div>

      <!-- Help -->
      <div class="mt-8 text-center">
        <p class="text-xs text-slate-500">
          ¿Necesitas ayuda? Contacta a tu administrador de sistema.
        </p>
      </div>
    </div>
  </div>
</template>
