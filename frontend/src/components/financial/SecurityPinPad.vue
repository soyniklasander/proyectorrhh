<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  maxLength?: number;
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'complete'): void;
}>();

const pin = ref(props.modelValue);
const maxLen = props.maxLength || 4;
const showPad = ref(false);

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

const pins = computed(() => {
  return [
    digits.slice(0, 9),
    [digits[9], 'CLR', digits[8], '←']
  ];
});

const addDigit = (digit: string) => {
  if (digit === 'CLR') {
    pin.value = '';
  } else if (digit === '←') {
    pin.value = pin.value.slice(0, -1);
  } else if (pin.value.length < maxLen) {
    pin.value += digit;
  }
  
  emit('update:modelValue', pin.value);
  
  if (pin.value.length === maxLen) {
    emit('complete');
  }
};

const pinArray = computed(() => {
  return Array(maxLen).fill('').map((_, i) => pin.value[i] || '');
});
</script>

<template>
  <div class="security-pin-pad">
    <!-- Button to show keypad -->
    <button
      type="button"
      @click="showPad = !showPad"
      class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      {{ title || 'Ingresar Token de Seguridad' }}
    </button>

    <!-- PIN Display & Keypad -->
    <div v-if="showPad" class="mt-4 p-4 bg-slate-900 rounded-xl">
      <!-- PIN Dots Display -->
      <div class="flex justify-center gap-3 mb-6">
        <div
          v-for="(dot, index) in pinArray"
          :key="index"
          class="w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all"
          :class="dot 
            ? 'bg-amber-500 border-amber-500 text-slate-900' 
            : 'border-slate-600 bg-slate-800'"
        >
          <span v-if="dot">●</span>
        </div>
      </div>

      <!-- Number Pad -->
      <div class="space-y-2">
        <div v-for="(row, rowIndex) in pins" :key="rowIndex" class="flex justify-center gap-2">
          <button
            v-for="digit in row"
            :key="digit"
            @click="addDigit(digit)"
            class="w-14 h-14 rounded-xl text-xl font-bold transition-all active:scale-95"
            :class="digit === 'CLR' 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : digit === '←'
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-slate-700 text-white hover:bg-slate-600'"
          >
            {{ digit === '←' ? '⌫' : digit }}
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <p class="text-center text-slate-400 text-sm mt-4">
        Ingrese {{ maxLen }} dígitos para confirmar la operación
      </p>
    </div>
  </div>
</template>
