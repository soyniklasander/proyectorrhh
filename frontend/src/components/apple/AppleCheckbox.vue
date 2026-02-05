<template>
  <label class="apple-checkbox" :class="{ 'apple-checkbox--checked': modelValue, 'apple-checkbox--disabled': disabled }">
    <input
      type="checkbox"
      class="apple-checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    >
    <span class="apple-checkbox__box">
      <n-icon v-if="modelValue" class="apple-checkbox__check" :component="CheckmarkOutline" size="14" />
    </span>
    <span v-if="label" class="apple-checkbox__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CheckmarkOutline } from '@vicons/ionicons5'

interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<style scoped>
.apple-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.apple-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apple-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.apple-checkbox__box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #F5F5F7;
  border: 1px solid #D2D2D7;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.apple-checkbox:hover .apple-checkbox__box {
  border-color: #007AFF;
}

.apple-checkbox--checked .apple-checkbox__box {
  background: #007AFF;
  border-color: #007AFF;
}

.apple-checkbox__check {
  color: #FFFFFF;
}

.apple-checkbox__label {
  font-size: 15px;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
</style>
