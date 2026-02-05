<template>
  <button
    class="apple-icon-button"
    :class="[
      `apple-icon-button--${variant}`,
      `apple-icon-button--${size}`,
      { 
        'apple-icon-button--loading': loading,
        'apple-icon-button--disabled': disabled,
        'apple-icon-button--active': active,
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="apple-icon-button-spinner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="10"/>
      </svg>
    </span>
    <n-icon v-else :size="iconSize" :component="icon" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import type { Component } from 'vue'

/**
 * AppleIconButton
 * 
 * Botón circular con solo icono, ideal para toolbars y acciones secundarias.
 * 
 * @example
 * <AppleIconButton :icon="SearchOutline" @click="handleSearch" />
 * 
 * @example Variants
 * <AppleIconButton :icon="AddOutline" variant="primary" size="large" />
 * <AppleIconButton :icon="MoreHorizOutline" variant="ghost" />
 * <AppleIconButton :icon="TrashOutline" variant="danger" />
 */

type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'danger'
type IconButtonSize = 'small' | 'medium' | 'large'

interface Props {
  /** Icono a mostrar */
  icon: Component
  /** Variante visual */
  variant?: IconButtonVariant
  /** Tamaño del botón */
  size?: IconButtonSize
  /** Estado de carga */
  loading?: boolean
  /** Estado deshabilitado */
  disabled?: boolean
  /** Estado activo/seleccionado */
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'medium',
  loading: false,
  disabled: false,
  active: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconSize = computed(() => {
  const sizes = { small: 16, medium: 20, large: 24 }
  return sizes[props.size]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.apple-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md, 10px);
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.apple-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.apple-icon-button:not(:disabled):active {
  transform: scale(0.95);
}

/* Sizes */
.apple-icon-button--small {
  width: 32px;
  height: 32px;
}

.apple-icon-button--medium {
  width: 40px;
  height: 40px;
}

.apple-icon-button--large {
  width: 48px;
  height: 48px;
}

/* Variants */
.apple-icon-button--default {
  background: var(--gray-100, #F5F5F7);
  color: var(--text-primary, #1D1D1F);
}

.apple-icon-button--default:hover:not(:disabled) {
  background: var(--gray-200, #E8E8ED);
}

.apple-icon-button--primary {
  background: var(--apple-blue, #007AFF);
  color: white;
}

.apple-icon-button--primary:hover:not(:disabled) {
  background: var(--apple-blue-hover, #0051D5);
}

.apple-icon-button--secondary {
  background: var(--gray-200, #E8E8ED);
  color: var(--text-primary, #1D1D1F);
}

.apple-icon-button--secondary:hover:not(:disabled) {
  background: var(--gray-300, #D2D2D7);
}

.apple-icon-button--ghost {
  background: transparent;
  color: var(--text-secondary, #86868B);
}

.apple-icon-button--ghost:hover:not(:disabled) {
  background: var(--gray-100, #F5F5F7);
  color: var(--text-primary, #1D1D1F);
}

.apple-icon-button--danger {
  background: var(--gray-100, #F5F5F7);
  color: var(--apple-red, #FF3B30);
}

.apple-icon-button--danger:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.12);
}

/* Active state */
.apple-icon-button--active.apple-icon-button--default,
.apple-icon-button--active.apple-icon-button--ghost {
  background: var(--apple-blue, #007AFF);
  color: white;
}

.apple-icon-button--active.apple-icon-button--secondary {
  background: var(--text-primary, #1D1D1F);
  color: white;
}

/* Loading */
.apple-icon-button--loading {
  pointer-events: none;
}

.apple-icon-button-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
