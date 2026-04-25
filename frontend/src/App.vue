<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';

const auth = useAuthStore();
const route = useRoute();

const isAuthPage = computed(() => {
  return route.path === '/login';
});
</script>

<template>
  <!-- Auth Pages (Login) -->
  <div v-if="isAuthPage" class="min-h-screen bg-slate-100">
    <router-view></router-view>
  </div>

  <!-- Main Application with Layout -->
  <MainLayout v-else-if="auth.token">
    <router-view></router-view>
  </MainLayout>

  <!-- Loading State -->
  <div v-else class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
      <p class="mt-4 text-slate-500">Cargando...</p>
    </div>
  </div>
</template>
