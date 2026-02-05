<template>
  <button
    class="apple-fab"
    :class="[
      `apple-fab--${variant}`,
      `apple-fab--${size}`,
      `apple-fab--${position}`,
      { 'apple-fab--extended': $slots.default }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <n-icon :size="iconSize" :component="icon" />
    <span v-if="$slots.default" class="apple-fab-label">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import type { Component } from 'vue'

/**
 * AppleFabButton (Floating Action Button)
 * 
 * Botón flotante estilo Apple para acciones principales.
 * 
 * @example
 * <AppleFabButton :icon="AddOutline" @click="createNew" />
 * 
 * @example Extended FAB
 * <AppleFabButton :icon="AddOutline" position="bottom-right">
 *   Nuevo empleado
 * </AppleFabButton>
 * 
 * @example Position
 * <AppleFabButton :icon="EditOutline" position="bottom-left" />
 */

type FabVariant = 'primary' | 'secondary'
type FabSize = 'small' | 'medium' | 'large'
type FabPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

interface Props {
  /** Icono a mostrar */
  icon: Component
  /** Variante visual */
  variant?: FabVariant
  /** Tamaño del FAB */
  size?: FabSize
  /** Posición en pantalla */
  position?: FabPosition
  /** Estado deshabilitado */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'large',
  position: 'bottom-right',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconSize = computed(() => {
  const sizes = { small: 20, medium: 24, large: 28 }
  return sizes[props.size]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.apple-fab {
  position: fixed;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2, 8px);
  border: none;
  border-radius: var(--radius-full, 9999px);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  z-index: 100;
  font-family: var(--font-stack, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif);
  font-weight: 600;
  letter-spacing: -0.01em;
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.12));
}

.apple-fab:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg, 0 12px 48px rgba(0, 0, 0, 0.15));
}

.apple-fab:not(:disabled):active {
  transform: translateY(0) scale(0.98);
}

.apple-fab:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Sizes */
.apple-fab--small {
  width: 48px;
  height: 48px;
}

.apple-fab--medium {
  width: 56px;
  height: 56px;
}

.apple-fab--large {
  width: 64px;
  height: 64px;
}

/* Extended sizes */
.apple-fab--extended.apple-fab--small {
  width: auto;
  padding: 0 16px;
  height: 40px;
}

.apple-fab--extended.apple-fab--medium {
  width: auto;
  padding: 0 20px;
  height: 48px;
}

.apple-fab--extended.apple-fab--large {
  width: auto;
  padding: 0 24px;
  height: 56px;
}

/* Variants */
.apple-fab--primary {
  background: var(--apple-blue, #007AFF);
  color: white;
}

.apple-fab--primary:hover:not(:disabled) {
  background: var(--apple-blue-hover, #0051D5);
}

.apple-fab--secondary {
  background: var(--surface, #FFFFFF);
  color: var(--text-primary, #1D1D1F);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
}

.apple-fab--secondary:hover:not(:disabled) {
  background: var(--gray-100, #F5F5F7);
}

/* Positions */
.apple-fab--bottom-right {
  bottom: 24px;
  right: 24px;
}

.apple-fab--bottom-left {
  bottom: 24px;
  left: 24px;
}

.apple-fab--top-right {
  top: 24px;
  right: 24px;
}

.apple-fab--top-left {
  top: 24px;
  left: 24px;
}

/* Label */
.apple-fab-label {
  font-size: 15px;
  padding-right: var(--space-1, 4px);
}

@media (max-width: 768px) {
  .apple-fab--bottom-right,
  .apple-fab--bottom-left {
    bottom: 16px;
  }
  
  .apple-fab--bottom-right {
    right: 16px;
  }
  
  .apple-fab--bottom-left {
    left: 16px;
  }
}
</style>
