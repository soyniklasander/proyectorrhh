<template>
  <div class="apple-form-item" :class="{ 'apple-form-item--required': required, 'apple-form-item--error': error }">
    <label v-if="label" class="apple-form-item__label">
      {{ label }}
      <span v-if="required" class="apple-form-item__required">*</span>
    </label>
    <div class="apple-form-item__content">
      <slot />
    </div>
    <div v-if="errorMessage" class="apple-form-item__error">
      {{ errorMessage }}
    </div>
    <div v-else-if="hint" class="apple-form-item__hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  required?: boolean
  error?: boolean
  errorMessage?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  label: '',
  required: false,
  error: false,
  errorMessage: '',
  hint: '',
})
</script>

<style scoped>
.apple-form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.apple-form-item__label {
  font-size: 13px;
  font-weight: 600;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-form-item__required {
  color: #FF3B30;
  margin-left: 2px;
}

.apple-form-item__content {
  width: 100%;
}

.apple-form-item__error {
  font-size: 12px;
  color: #FF3B30;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-form-item__hint {
  font-size: 12px;
  color: #86868B;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
</style>
