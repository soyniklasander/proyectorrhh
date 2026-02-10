<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <div v-if="auth.token" class="min-h-screen flex bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col">
      <div class="h-16 flex items-center justify-center font-bold text-xl border-b border-slate-800">
        ERPRick
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <router-link to="/" class="block px-4 py-2 rounded hover:bg-slate-800 transition-colors">
          Dashboard
        </router-link>
        <!-- Add more links here -->
      </nav>
      <div class="p-4 border-t border-slate-800">
        <button @click="handleLogout" class="w-full px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6">
        <h2 class="text-lg font-semibold text-slate-800">Dashboard</h2>
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-600">{{ auth.user?.email }}</span>
        </div>
      </header>

      <main class="flex-1 p-6 overflow-auto">
        <router-view></router-view>
      </main>
    </div>
  </div>

  <div v-else class="min-h-screen bg-slate-100 flex items-center justify-center">
    <router-view></router-view>
  </div>
</template>
