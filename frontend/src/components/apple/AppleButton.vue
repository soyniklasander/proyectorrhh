<template>
  <button
    class="apple-button"
    :class="[
      `apple-button--${variant}`,
      `apple-button--${size}`,
      {
        'apple-button--loading': loading,
        'apple-button--disabled': disabled,
        'apple-button--block': block,
        'apple-button--round': round,
        'apple-button--icon-only': iconOnly,
      }
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="apple-button-spinner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="10"/>
      </svg>
    </span>
    
    <n-icon v-else-if="icon && iconPosition === 'left'" :size="iconSize" :component="icon" />
    
    <span v-if="$slots.default && !iconOnly" class="apple-button-content">
      <slot />
    </span>
    
    <n-icon v-if="icon && iconPosition === 'right'" :size="iconSize" :component="icon" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import type { Component } from 'vue'

/**
 * AppleButton
 * 
 * Botón estilo Apple con múltiples variantes y estados.
 * 
 * @example Variantes
 * <AppleButton variant="primary">Primary</AppleButton>
 * <AppleButton variant="secondary">Secondary</AppleButton>
 * <AppleButton variant="ghost">Ghost</AppleButton>
 * <AppleButton variant="danger">Danger</AppleButton>
 * <AppleButton variant="success">Success</AppleButton>
 * 
 * @example Con icono
 * <AppleButton :icon="AddOutline" icon-position="left">Nuevo</AppleButton>
 * <AppleButton :icon="ArrowForwardOutline" icon-position="right">Siguiente</AppleButton>
 * 
 * @example Estados
 * <AppleButton loading>Cargando...</AppleButton>
 * <AppleButton disabled>Deshabilitado</AppleButton>
 * <AppleButton block>Block width</AppleButton>
 */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'text'
type ButtonSize = 'small' | 'medium' | 'large'
type IconPosition = 'left' | 'right'

interface Props {
  /** Variante visual del botón */
  variant?: ButtonVariant
  /** Tamaño del botón */
  size?: ButtonSize
  /** Icono a mostrar */
  icon?: Component
  /** Posición del icono */
  iconPosition?: IconPosition
  /** Tipo de botón HTML */
  type?: 'button' | 'submit' | 'reset'
  /** Estado de carga */
  loading?: boolean
  /** Estado deshabilitado */
  disabled?: boolean
  /** Ocupar todo el ancho disponible */
  block?: boolean
  /** Borde redondeado completo */
  round?: boolean
  /** Solo mostrar icono (sin texto) */
  iconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  icon: undefined,
  iconPosition: 'left',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
  round: false,
  iconOnly: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconSize = computed(() => {
  const sizes = { small: 16, medium: 18, large: 20 }
  return sizes[props.size]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.apple-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2, 8px);
  font-family: var(--font-stack, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif);
  font-weight: 500;
  letter-spacing: -0.01em;
  border: none;
  border-radius: var(--radius-md, 10px);
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  text-decoration: none;
}

.apple-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.apple-button:hover::before {
  opacity: 1;
}

.apple-button:active:not(:disabled) {
  transform: scale(0.98);
}

.apple-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Sizes */
.apple-button--small {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

.apple-button--medium {
  height: 40px;
  padding: 0 16px;
  font-size: 15px;
}

.apple-button--large {
  height: 48px;
  padding: 0 20px;
  font-size: 17px;
}

.apple-button--icon-only.apple-button--small {
  width: 32px;
  padding: 0;
}

.apple-button--icon-only.apple-button--medium {
  width: 40px;
  padding: 0;
}

.apple-button--icon-only.apple-button--large {
  width: 48px;
  padding: 0;
}

/* Variants */
.apple-button--primary {
  background: var(--apple-blue, #007AFF);
  color: white;
}

.apple-button--primary:hover:not(:disabled) {
  background: var(--apple-blue-hover, #0051D5);
}

.apple-button--secondary {
  background: var(--gray-200, #E8E8ED);
  color: var(--text-primary, #1D1D1F);
}

.apple-button--secondary:hover:not(:disabled) {
  background: var(--gray-300, #D2D2D7);
}

.apple-button--ghost {
  background: transparent;
  color: var(--apple-blue, #007AFF);
}

.apple-button--ghost:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.08);
}

.apple-button--danger {
  background: var(--apple-red, #FF3B30);
  color: white;
}

.apple-button--danger:hover:not(:disabled) {
  background: #D70015;
}

.apple-button--success {
  background: var(--apple-green, #34C759);
  color: white;
}

.apple-button--success:hover:not(:disabled) {
  background: #30B350;
}

.apple-button--text {
  background: transparent;
  color: var(--apple-blue, #007AFF);
  padding-left: 8px;
  padding-right: 8px;
}

.apple-button--text:hover:not(:disabled) {
  text-decoration: underline;
}

.apple-button--text::before {
  display: none;
}

/* Loading state */
.apple-button--loading {
  pointer-events: none;
}

.apple-button-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  animation: spin 0.8s linear infinite;
}

.apple-button-spinner svg {
  width: 100%;
  height: 100%;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Block modifier */
.apple-button--block {
  width: 100%;
}

/* Round modifier */
.apple-button--round {
  border-radius: var(--radius-full, 9999px);
}

/* Content */
.apple-button-content {
  display: flex;
  align-items: center;
}
</style>
