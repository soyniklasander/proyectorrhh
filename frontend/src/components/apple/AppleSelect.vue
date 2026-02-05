<template>
  <div class="apple-select-wrapper" :class="{ 'apple-select-wrapper--open': isOpen }">
    <div 
      class="apple-select" 
      :class="{ 
        'apple-select--disabled': disabled,
        'apple-select--error': error 
      }"
      @click="toggleOpen"
    >
      <div class="apple-select__value">
        <span v-if="selectedOption" class="apple-select__selected">
          {{ selectedOption.label }}
        </span>
        <span v-else class="apple-select__placeholder">{{ placeholder }}</span>
      </div>
      <n-icon class="apple-select__arrow" :component="ChevronDown" size="18" />
    </div>
    
    <transition name="apple-select-dropdown">
      <div v-if="isOpen" class="apple-select__dropdown" v-click-outside="close">
        <div 
          v-for="option in options" 
          :key="option.value"
          class="apple-select__option"
          :class="{ 'apple-select__option--selected': modelValue === option.value }"
          @click="selectOption(option)"
        >
          <n-icon v-if="option.icon" :component="option.icon" size="16" />
          <span>{{ option.label }}</span>
          <n-icon 
            v-if="modelValue === option.value" 
            class="apple-select__check" 
            :component="CheckmarkOutline" 
            size="16" 
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon } from 'naive-ui'
import { ChevronDown, CheckmarkOutline } from '@vicons/ionicons5'
import type { Component } from 'vue'

interface Option {
  label: string
  value: string | number
  icon?: Component
}

interface Props {
  modelValue: string | number | null
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Seleccionar...',
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const toggleOpen = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const close = () => {
  isOpen.value = false
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  close()
}

// Click outside directive
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutside = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el._clickOutside)
  },
}
</script>

<style scoped>
.apple-select-wrapper {
  position: relative;
  width: 100%;
}

.apple-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  background: #F5F5F7;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-select:hover {
  background: #FFFFFF;
  border-color: #D2D2D7;
}

.apple-select-wrapper--open .apple-select {
  background: #FFFFFF;
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
}

.apple-select--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apple-select--error {
  background: rgba(255, 59, 48, 0.04);
  border-color: #FF3B30;
}

.apple-select__value {
  flex: 1;
  min-width: 0;
}

.apple-select__selected {
  font-size: 16px;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-select__placeholder {
  font-size: 16px;
  color: #A1A1A6;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-select__arrow {
  color: #86868B;
  transition: transform 0.2s ease;
  margin-left: 8px;
}

.apple-select-wrapper--open .apple-select__arrow {
  transform: rotate(180deg);
}

.apple-select__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
  padding: 8px;
  z-index: 1000;
  max-height: 280px;
  overflow-y: auto;
}

.apple-select__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  transition: all 0.15s ease;
}

.apple-select__option:hover {
  background: #F5F5F7;
}

.apple-select__option--selected {
  background: rgba(0, 122, 255, 0.08);
  color: #007AFF;
}

.apple-select__check {
  margin-left: auto;
}

.apple-select-dropdown-enter-active,
.apple-select-dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-select-dropdown-enter-from,
.apple-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
