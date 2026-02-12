<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const tenantId = ref('');
const loading = ref(false);
const submitted = ref(false);
const resendTimer = ref(59);

const handleSubmit = async () => {
  loading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    loading.value = false;
    submitted.value = true;
    
    // Start resend timer
    const interval = setInterval(() => {
      resendTimer.value--;
      if (resendTimer.value <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }, 1500);
};

const resendToken = () => {
  resendTimer.value = 59;
};

const goToLogin = () => {
  router.push('/login');
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white">ERPRick</h2>
        </div>
        
        <h1 class="text-2xl font-bold text-white">Recuperar mi contraseña</h1>
        <p class="mt-2 text-sm text-slate-400">
          Ingresa tu correo electrónico y te enviaremos un token de recuperación seguro.
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-slate-800/70 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/50 relative overflow-hidden">
        <!-- Top highlight -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

        <!-- Success Message -->
        <div v-if="submitted" class="text-center py-4">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mb-4">
            <svg class="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">¡Enlace enviado!</h3>
          <p class="text-sm text-slate-300 mb-4">
            Hemos enviado un token de acceso temporal a <span class="font-medium text-white">{{ email }}</span>.
          </p>
          <p class="text-xs text-slate-500">
            ¿No recibiste el correo?
            <button 
              v-if="resendTimer === 0"
              @click="resendToken"
              class="font-medium text-blue-400 hover:text-blue-300"
            >
              Reenviar token
            </button>
            <span v-else class="text-slate-500">Reenviar en {{ resendTimer }}s</span>
          </p>
        </div>

        <!-- Recovery Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Tenant ID (Optional) -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              ID de Organización <span class="text-slate-500 font-normal">(Opcional)</span>
            </label>
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input
                v-model="tenantId"
                type="text"
                placeholder="Ej: mi-empresa"
                class="block w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">
              Correo Corporativo
            </label>
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                v-model="email"
                type="email"
                required
                placeholder="correo@empresa.com"
                class="block w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}</span>
            <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </form>
      </div>

      <!-- Back to Login -->
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500 mb-3">
          ¿Recordaste tu contraseña?
        </p>
        <button
          @click="goToLogin"
          class="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-slate-800 px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-slate-700 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio de sesión
        </button>
      </div>

      <!-- Footer -->
      <div class="mt-12 pt-6 border-t border-slate-800 flex justify-between items-center text-xs">
        <a href="#" class="text-slate-500 hover:text-slate-400">Términos de Servicio</a>
        <div class="flex gap-4">
          <a href="#" class="text-slate-500 hover:text-blue-400" title="Ayuda">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </a>
          <a href="#" class="text-slate-500 hover:text-blue-400" title="Soporte Técnico">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
