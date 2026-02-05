<template>
  <label class="apple-switch" :class="{ 'apple-switch--checked': modelValue, 'apple-switch--disabled': disabled }">
    <input
      type="checkbox"
      class="apple-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    >
    <span class="apple-switch__track">
      <span class="apple-switch__thumb"></span>
    </span>
    <span v-if="label" class="apple-switch__label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
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
.apple-switch {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.apple-switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apple-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.apple-switch__track {
  position: relative;
  width: 50px;
  height: 30px;
  background: #E8E8ED;
  border-radius: 15px;
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-switch--checked .apple-switch__track {
  background: #34C759;
}

.apple-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 26px;
  height: 26px;
  background: #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-switch--checked .apple-switch__thumb {
  transform: translateX(20px);
}

.apple-switch__label {
  font-size: 15px;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
</style>
