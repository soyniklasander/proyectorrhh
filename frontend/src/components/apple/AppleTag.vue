<template>
  <div class="apple-tag" :class="`apple-tag--${type}`">
    <span class="apple-tag__label">{{ label }}</span>
    <button v-if="closable" class="apple-tag__close" @click="$emit('close')">
      <n-icon :component="CloseOutline" size="12" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

type TagType = 'default' | 'primary' | 'success' | 'warning' | 'error'

interface Props {
  label: string
  type?: TagType
  closable?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  closable: false,
})

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.apple-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-tag--default {
  background: #F5F5F7;
  color: #1D1D1F;
}

.apple-tag--primary {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.apple-tag--success {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
}

.apple-tag--warning {
  background: rgba(255, 149, 0, 0.1);
  color: #FF9500;
}

.apple-tag--error {
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
}

.apple-tag__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.15s ease;
  padding: 0;
}

.apple-tag__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}
</style>
