<template>
  <div class="apple-search-input-wrapper">
    <n-icon class="apple-search-input__icon" :component="Search" size="18" />
    <input
      ref="inputRef"
      :value="modelValue"
      type="text"
      class="apple-search-input"
      :placeholder="placeholder"
      @input="handleInput"
      @keyup.enter="$emit('search', modelValue)"
    >
    <button v-if="modelValue" class="apple-search-input__clear" @click="clear">
      <n-icon :component="CloseOutline" size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NIcon } from 'naive-ui'
import { Search, CloseOutline } from '@vicons/ionicons5'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [value: string]
}>()

const inputRef = ref<HTMLInputElement>()

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const clear = () => {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}
</script>

<style scoped>
.apple-search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.apple-search-input {
  width: 100%;
  height: 44px;
  background: #F5F5F7;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0 40px;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  color: #1D1D1F;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-search-input:hover {
  background: #FFFFFF;
  border-color: #D2D2D7;
}

.apple-search-input:focus {
  background: #FFFFFF;
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
}

.apple-search-input::placeholder {
  color: #A1A1A6;
}

.apple-search-input__icon {
  position: absolute;
  left: 14px;
  color: #86868B;
  pointer-events: none;
}

.apple-search-input__clear {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: #E8E8ED;
  border-radius: 50%;
  cursor: pointer;
  color: #86868B;
  padding: 0;
  transition: all 0.15s ease;
}

.apple-search-input__clear:hover {
  background: #D2D2D7;
  color: #6E6E73;
}
</style>
