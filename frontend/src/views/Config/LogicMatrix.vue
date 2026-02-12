<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();

// State
const loading = ref(false);
const matrix = ref<any[]>([]);
const venues = ref<any[]>([]);
const legalEntities = ref<any[]>([]);
const showForm = ref(false);

const form = ref({
  venue_id: '',
  shift: 'MORNING' as 'MORNING' | 'NIGHT',
  target_legal_entity_id: '',
});

const shiftOptions = [
  { value: 'MORNING', label: 'Mañana', icon: '🌅' },
  { value: 'NIGHT', label: 'Noche', icon: '🌙' },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const [matrixRes, venuesRes, entitiesRes] = await Promise.all([
      axios.get('/api/v1/config/matrix', { headers: { Authorization: `Bearer ${auth.token}` } }),
      axios.get('/api/v1/venues', { headers: { Authorization: `Bearer ${auth.token}` } }),
      axios.get('/api/v1/legal-entities', { headers: { Authorization: `Bearer ${auth.token}` } }),
    ]);
    
    if (matrixRes.data.success) matrix.value = matrixRes.data.data;
    if (venuesRes.data.success) venues.value = venuesRes.data.data;
    if (entitiesRes.data.success) legalEntities.value = entitiesRes.data.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  try {
    const response = await axios.post('/api/v1/config/matrix', form.value, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (response.data.success) {
      matrix.value.unshift(response.data.data);
      showForm.value = false;
      resetForm();
    }
  } catch (error) {
    console.error('Error saving matrix:', error);
  }
};

const handleDelete = async (id: string) => {
  if (!confirm('¿Eliminar esta configuración?')) return;
  
  try {
    await axios.delete(`/api/v1/config/matrix/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    matrix.value = matrix.value.filter(m => m.id !== id);
  } catch (error) {
    console.error('Error deleting matrix:', error);
  }
};

const resetForm = () => {
  form.value = { venue_id: '', shift: 'MORNING', target_legal_entity_id: '' };
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Matriz Lógica de Costos</h1>
        <p class="text-sm text-slate-500 mt-1">Configure la asignación automática de costos por Sede + Turno → RUC.</p>
      </div>
      <button
        @click="showForm = true"
        class="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Regla
      </button>
    </div>

    <!-- Info Card -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">Cómo funciona la matriz</h3>
          <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Esta matriz define qué RUC será cargado cuando un trabajador labore en una sede específica durante un turno determinado.
            <br/><strong>Ejemplo:</strong> "Si estoy en Miraflores + Turno Noche → Asignar a RUC Inversiones Gastronómicas"
          </p>
        </div>
      </div>
    </div>

    <!-- Matrix Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Main Table -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Reglas de Asignación</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sede</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Turno</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">RUC Destino</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Régimen</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-if="loading" class="animate-pulse">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500">Cargando...</td>
              </tr>
              <tr v-else-if="matrix.length === 0" class="animate-pulse">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500">No hay reglas configuradas</td>
              </tr>
              <tr v-for="item in matrix" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-slate-900 dark:text-white">{{ item.venue?.name || 'N/A' }}</div>
                      <div class="text-xs text-slate-500">{{ item.venue?.cost_center_code || 'Sin CC' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300': item.shift === 'MORNING',
                      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300': item.shift === 'NIGHT',
                    }"
                  >
                    {{ item.shift === 'MORNING' ? '🌅 Mañana' : '🌙 Noche' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900 dark:text-white">{{ item.targetLegalEntity?.ruc || 'N/A' }}</div>
                  <div class="text-xs text-slate-500 truncate max-w-xs">{{ item.targetLegalEntity?.business_name || '' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': item.targetLegalEntity?.regime === 'GENERAL_728',
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300': item.targetLegalEntity?.regime === 'MYPE_PEQUENA',
                    }"
                  >
                    {{ item.targetLegalEntity?.regime === 'GENERAL_728' ? 'Régimen General' : 'MYPE' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="handleDelete(item.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Rule Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="showForm = false"></div>
        
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Nueva Regla de Asignación</h3>
            <button @click="showForm = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sede</label>
              <select
                v-model="form.venue_id"
                required
                class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Seleccionar sede...</option>
                <option v-for="venue in venues" :key="venue.id" :value="venue.id">
                  {{ venue.name }} ({{ venue.cost_center_code }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Turno</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="shift in shiftOptions"
                  :key="shift.value"
                  type="button"
                  @click="form.shift = shift.value as any"
                  class="flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all"
                  :class="form.shift === shift.value
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'"
                >
                  <span class="text-xl">{{ shift.icon }}</span>
                  <span class="font-medium">{{ shift.label }}</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">RUC Destino</label>
              <select
                v-model="form.target_legal_entity_id"
                required
                class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Seleccionar RUC...</option>
                <option v-for="entity in legalEntities" :key="entity.id" :value="entity.id">
                  {{ entity.ruc }} - {{ entity.business_name }} ({{ entity.regime }})
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="showForm = false"
                class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Guardar Regla
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
