<template>
  <div 
    class="apple-input-wrapper" 
    :class="{
      'apple-input-wrapper--focused': isFocused,
      'apple-input-wrapper--error': error,
      'apple-input-wrapper--disabled': disabled,
      'apple-input-wrapper--with-prefix': prefixIcon || $slots.prefix,
      'apple-input-wrapper--with-suffix': suffixIcon || clearable || $slots.suffix,
    }"
  >
    <div v-if="prefixIcon || $slots.prefix" class="apple-input__prefix">
      <slot name="prefix">
        <n-icon :component="prefixIcon" size="18" />
      </slot>
    </div>
    
    <input
      ref="inputRef"
      class="apple-input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup.enter="$emit('enter', $event)"
    />
    
    <div v-if="suffixIcon || clearable || $slots.suffix" class="apple-input__suffix">
      <slot name="suffix">
        <button 
          v-if="clearable && modelValue" 
          class="apple-input__clear"
          @click="handleClear"
        >
          <n-icon :component="CloseOutline" size="16" />
        </button>
        <n-icon v-else-if="suffixIcon" :component="suffixIcon" size="18" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { NIcon } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'
import type { Component } from 'vue'

interface Props {
  modelValue: string
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  maxlength?: number
  prefixIcon?: Component
  suffixIcon?: Component
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: false,
  maxlength: undefined,
  prefixIcon: undefined,
  suffixIcon: undefined,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'enter': [event: KeyboardEvent]
  'clear': []
}>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleFocus = (e: FocusEvent) => {
  isFocused.value = true
  emit('focus', e)
}

const handleBlur = (e: FocusEvent) => {
  isFocused.value = false
  emit('blur', e)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

defineExpose({
  focus,
  blur,
})
</script>

<style scoped>
.apple-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  background: #F5F5F7;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-input-wrapper:hover {
  background: #FFFFFF;
  border-color: #D2D2D7;
}

.apple-input-wrapper--focused {
  background: #FFFFFF;
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
}

.apple-input-wrapper--error {
  background: rgba(255, 59, 48, 0.04);
  border-color: #FF3B30;
}

.apple-input-wrapper--error.apple-input-wrapper--focused {
  box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.15);
}

.apple-input-wrapper--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apple-input-wrapper--disabled .apple-input {
  cursor: not-allowed;
}

.apple-input__prefix,
.apple-input__suffix {
  display: flex;
  align-items: center;
  color: #86868B;
  flex-shrink: 0;
}

.apple-input__prefix {
  margin-right: 10px;
}

.apple-input__suffix {
  margin-left: 10px;
  gap: 8px;
}

.apple-input__clear {
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

.apple-input__clear:hover {
  background: #D2D2D7;
  color: #6E6E73;
}

.apple-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  color: #1D1D1F;
  outline: none;
  padding: 10px 0;
  min-width: 0;
}

.apple-input::placeholder {
  color: #A1A1A6;
}

.apple-input-wrapper--with-prefix .apple-input {
  padding-left: 0;
}

.apple-input-wrapper--with-suffix .apple-input {
  padding-right: 0;
}
</style>
