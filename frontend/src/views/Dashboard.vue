<script setup lang="ts">
import { useUIStore } from '../stores/ui';

const ui = useUIStore();
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-slate-800">Panel Principal</h1>

      <!-- Scope Switcher -->
      <div class="flex items-center bg-white rounded-lg shadow p-1 border">
        <button
          @click="ui.setScope('HOLDING')"
          :class="['px-4 py-2 rounded text-sm font-medium transition-colors', ui.scopeMode === 'HOLDING' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-700']"
        >
          Modo Holding
        </button>
        <button
          @click="ui.setScope('FISCAL')"
          :class="['px-4 py-2 rounded text-sm font-medium transition-colors', ui.scopeMode === 'FISCAL' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-700']"
        >
          Modo Fiscal
        </button>
      </div>
    </div>

    <!-- Content Placeholder -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-slate-500 text-sm font-medium uppercase">Total Empleados</h3>
        <p class="text-3xl font-bold text-slate-900 mt-2">1,240</p>
        <span class="text-green-500 text-sm font-medium">+5 este mes</span>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-slate-500 text-sm font-medium uppercase">Planilla Neta</h3>
        <p class="text-3xl font-bold text-slate-900 mt-2">S/ 4.2M</p>
        <span class="text-slate-400 text-sm">PEN</span>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-slate-500 text-sm font-medium uppercase">Estado SUNAFIL</h3>
        <p class="text-3xl font-bold text-slate-900 mt-2">OK</p>
        <span class="text-green-500 text-sm font-medium">Cumplimiento 100%</span>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-64 flex items-center justify-center text-slate-400">
      Gráficos de Variación (Placeholder)
    </div>
  </div>
</template>
