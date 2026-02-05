<template>
  <div 
    class="apple-badge" 
    :class="`apple-badge--${type}`"
    @click="$emit('click')"
  >
    <slot>{{ label }}</slot>
  </div>
</template>

<script setup lang="ts">
type BadgeType = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface Props {
  type?: BadgeType
  label?: string
}

withDefaults(defineProps<Props>(), {
  type: 'neutral',
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.apple-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.apple-badge--success {
  background: rgba(52, 199, 89, 0.15);
  color: #248A3D;
}

.apple-badge--warning {
  background: rgba(255, 149, 0, 0.15);
  color: #B36A00;
}

.apple-badge--error {
  background: rgba(255, 59, 48, 0.15);
  color: #D70015;
}

.apple-badge--info {
  background: rgba(0, 122, 255, 0.15);
  color: #0040DD;
}

.apple-badge--neutral {
  background: #F5F5F7;
  color: #6E6E73;
}
</style>
