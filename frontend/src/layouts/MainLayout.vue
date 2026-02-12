<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

// Scope Switcher
const scopeMode = ref<'holding' | 'ruc'>('holding');
const selectedRuc = ref<string>('');
const showRucDropdown = ref(false);

const isActive = (path: string) => route.path === path;

// Navigation items
const navItems = [
  { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Nómina', path: '/payroll', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { name: 'Descuentos', path: '/financials', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Configuración', path: '/config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

// Mock RUC list for dropdown
const rucList = [
  { ruc: '20100123456', name: 'NexaCorp Perú S.A.C.' },
  { ruc: '20100567890', name: 'Inversiones Gastronómicas S.A.' },
  { ruc: '20100987654', name: 'Servicios Corporativos del Norte' },
];
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar (Estilo NexaCorp - Oscuro) -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-800">
        <svg class="w-8 h-8 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span class="font-bold text-xl tracking-tight">ERPRick</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 rounded-lg transition-all duration-200"
          :class="isActive(item.path) 
            ? 'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
          <span class="font-medium">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- Tenant Info -->
      <div class="p-4 border-t border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
            {{ auth.user?.tenantId?.charAt(0).toUpperCase() || 'T' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ auth.user?.email }}</p>
            <p class="text-xs text-slate-500 truncate">{{ auth.user?.role }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-6">
        <!-- Page Title -->
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ route.name?.toString() || 'Dashboard' }}
          </h2>
        </div>

        <!-- Scope Switcher -->
        <div class="flex items-center gap-4">
          <!-- Mode Toggle -->
          <div class="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              @click="scopeMode = 'holding'"
              class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              :class="scopeMode === 'holding' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'"
            >
              Vista Holding
            </button>
            <button
              @click="scopeMode = 'ruc'"
              class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              :class="scopeMode === 'ruc' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'"
            >
              Por RUC
            </button>
          </div>

          <!-- RUC Dropdown (only in RUC mode) -->
          <div v-if="scopeMode === 'ruc'" class="relative">
            <button
              @click="showRucDropdown = !showRucDropdown"
              class="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="text-sm font-medium">
                {{ selectedRuc || 'Seleccionar RUC' }}
              </span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showRucDropdown"
              class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-slate-100">
                <p class="text-xs font-medium text-slate-500 uppercase">Razones Sociales</p>
              </div>
              <button
                v-for="ruc in rucList"
                :key="ruc.ruc"
                @click="selectedRuc = ruc.ruc; showRucDropdown = false"
                class="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <p class="text-sm font-medium text-slate-900">{{ruc.ruc}}</p>
                <p class="text-xs text-slate-500 truncate">{{ruc.name}}</p>
              </button>
            </div>
          </div>

          <!-- User Menu -->
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="text-sm font-medium">Salir</span>
          </button>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-6">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
