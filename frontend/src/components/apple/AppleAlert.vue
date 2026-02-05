<template>
  <div class="apple-alert" :class="`apple-alert--${type}`">
    <div v-if="showIcon" class="apple-alert__icon">
      <n-icon :component="iconComponent" size="20" />
    </div>
    <div class="apple-alert__content">
      <div v-if="title" class="apple-alert__title">{{ title }}</div>
      <div class="apple-alert__message">
        <slot />
      </div>
    </div>
    <button v-if="closable" class="apple-alert__close" @click="$emit('close')">
      <n-icon :component="CloseOutline" size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { AlertCircleOutline, CheckmarkCircleOutline, InformationCircleOutline, CloseOutline, WarningOutline } from '@vicons/ionicons5'
import type { Component } from 'vue'

type AlertType = 'info' | 'success' | 'warning' | 'error'

interface Props {
  type?: AlertType
  title?: string
  closable?: boolean
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  closable: false,
  showIcon: true,
})

const emit = defineEmits<{
  close: []
}>()

const iconMap: Record<AlertType, Component> = {
  info: InformationCircleOutline,
  success: CheckmarkCircleOutline,
  warning: WarningOutline,
  error: AlertCircleOutline,
}

const iconComponent = computed(() => iconMap[props.type])
</script>

<style scoped>
.apple-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-alert--info {
  background: rgba(0, 122, 255, 0.08);
  border: 1px solid rgba(0, 122, 255, 0.2);
  color: #0040DD;
}

.apple-alert--success {
  background: rgba(52, 199, 89, 0.08);
  border: 1px solid rgba(52, 199, 89, 0.2);
  color: #248A3D;
}

.apple-alert--warning {
  background: rgba(255, 149, 0, 0.08);
  border: 1px solid rgba(255, 149, 0, 0.2);
  color: #B36A00;
}

.apple-alert--error {
  background: rgba(255, 59, 48, 0.08);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #D70015;
}

.apple-alert__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.apple-alert__content {
  flex: 1;
  min-width: 0;
}

.apple-alert__title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1D1D1F;
}

.apple-alert__message {
  font-size: 14px;
  color: #6E6E73;
  line-height: 1.5;
}

.apple-alert__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: currentColor;
  opacity: 0.6;
  padding: 0;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.apple-alert__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}
</style>
