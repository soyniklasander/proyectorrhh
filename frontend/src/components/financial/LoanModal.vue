<script setup lang="ts">
import { ref, computed } from 'vue';
import SecurityPinPad from './SecurityPinPad.vue';

defineProps<{
  show: boolean;
  employees: Array<{ id: string; full_name: string; dni: string }>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: any): void;
}>();

const form = ref({
  employee_id: '',
  type: 'LOAN' as 'LOAN' | 'JUDICIAL' | 'ADVANCE',
  description: '',
  amount: 0,
  installments_total: 1,
  start_date: new Date().toISOString().split('T')[0],
});

const securityPin = ref('');
const pinComplete = ref(false);

const typeOptions = [
  { value: 'LOAN', label: 'Préstamo', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: 'ADVANCE', label: 'Adelanto', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { value: 'JUDICIAL', label: 'Retención Judicial', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
];

const installmentOptions = [
  { value: 1, label: '1 cuota' },
  { value: 2, label: '2 cuotas' },
  { value: 3, label: '3 cuotas' },
  { value: 4, label: '4 cuotas' },
  { value: 6, label: '6 cuotas' },
  { value: 12, label: '12 cuotas' },
  { value: 24, label: '24 cuotas' },
  { value: 36, label: '36 cuotas' },
];

const installmentAmount = computed(() => {
  if (form.value.installments_total > 0) {
    return Math.round(form.value.amount / form.value.installments_total);
  }
  return 0;
});

const handlePinComplete = () => {
  pinComplete.value = true;
};

const handleSubmit = () => {
  if (!pinComplete.value) return;
  
  emit('save', {
    ...form.value,
    security_pin: securityPin.value,
  });
};
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 class="text-xl font-bold text-slate-900">Nuevo Descuento / Retención</h3>
            <p class="text-sm text-slate-500">Configure los detalles del descuento para el trabajador</p>
          </div>
          <button
            @click="emit('close')"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-6">
          <!-- Employee Selection -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Seleccionar Colaborador</label>
            <select
              v-model="form.employee_id"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">-- Seleccionar --</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.full_name }} - DNI: {{ emp.dni }}
              </option>
            </select>
          </div>

          <!-- Operation Type -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Tipo de Operación</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="type in typeOptions"
                :key="type.value"
                @click="form.type = type.value as any"
                type="button"
                class="flex flex-col items-center p-4 rounded-xl border-2 transition-all"
                :class="form.type === type.value 
                  ? 'border-amber-500 bg-amber-50 text-amber-700' 
                  : 'border-slate-200 hover:border-slate-300'"
              >
                <svg class="w-8 h-8 mb-2" :class="form.type === type.value ? 'text-amber-500' : 'text-slate-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon" />
                </svg>
                <span class="text-sm font-medium">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Descripción / Motivo</label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Ej: Préstamo empresarial - Fecha límite de pago..."
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <!-- Amount & Installments -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Monto Total (S/)</label>
              <input
                v-model.number="form.amount"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Número de Cuotas</label>
              <select
                v-model.number="form.installments_total"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option v-for="opt in installmentOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Installment Amount Preview -->
          <div v-if="form.amount > 0 && form.installments_total > 1" class="p-4 bg-slate-50 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Monto por cuota:</span>
              <span class="text-xl font-bold text-amber-600">S/ {{ installmentAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Fecha de Inicio</label>
            <input
              v-model="form.start_date"
              type="date"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <!-- Security Pin -->
          <div class="border-t border-slate-200 pt-6">
            <SecurityPinPad
              v-model="securityPin"
              title="Token de Seguridad para Confirmar"
              @complete="handlePinComplete"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            @click="emit('close')"
            class="px-6 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="!pinComplete || !form.employee_id || form.amount <= 0"
            class="px-6 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Guardar Operación
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
