<template>
  <div class="apple-status-indicator" :class="`apple-status-indicator--${size}`">
    <span class="apple-status-indicator__dot" :class="`apple-status-indicator__dot--${type}`"></span>
    <span v-if="label" class="apple-status-indicator__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
type StatusType = 'online' | 'offline' | 'busy' | 'away' | 'success' | 'warning' | 'error' | 'neutral'
type StatusSize = 'sm' | 'md' | 'lg'

interface Props {
  type?: StatusType
  label?: string
  size?: StatusSize
}

withDefaults(defineProps<Props>(), {
  type: 'neutral',
  size: 'md',
})
</script>

<style scoped>
.apple-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.apple-status-indicator__dot {
  border-radius: 50%;
  flex-shrink: 0;
}

.apple-status-indicator--sm .apple-status-indicator__dot {
  width: 8px;
  height: 8px;
}

.apple-status-indicator--md .apple-status-indicator__dot {
  width: 10px;
  height: 10px;
}

.apple-status-indicator--lg .apple-status-indicator__dot {
  width: 12px;
  height: 12px;
}

.apple-status-indicator__dot--online,
.apple-status-indicator__dot--success {
  background: #34C759;
}

.apple-status-indicator__dot--offline,
.apple-status-indicator__dot--neutral {
  background: #A1A1A6;
}

.apple-status-indicator__dot--busy,
.apple-status-indicator__dot--error {
  background: #FF3B30;
}

.apple-status-indicator__dot--away,
.apple-status-indicator__dot--warning {
  background: #FF9500;
}

.apple-status-indicator__label {
  font-size: 14px;
  color: #6E6E73;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
</style>
