<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();
const error = ref('');

const handleLogin = async () => {
  error.value = '';
  const success = await auth.login(email.value, password.value);
  if (success) {
    router.push('/');
  } else {
    error.value = 'Credenciales inválidas';
  }
};
</script>

<template>
  <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Bienvenido a ERPRick</h1>
      <p class="text-slate-500">Inicia sesión para continuar</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input v-model="email" type="email" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
        <input v-model="password" type="password" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>

      <button type="submit" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
        Ingresar
      </button>
    </form>
  </div>
</template>
