<template>
  <div class="apple-button-group" :class="[
    `apple-button-group--${size}`,
    { 'apple-button-group--vertical': vertical }
  ]">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * AppleButtonGroup
 * 
 * Agrupa botones relacionados con espaciado consistente.
 * 
 * @example Horizontal
 * <AppleButtonGroup>
 *   <AppleButton variant="secondary">Cancelar</AppleButton>
 *   <AppleButton variant="primary">Guardar</AppleButton>
 * </AppleButtonGroup>
 * 
 * @example Vertical
 * <AppleButtonGroup vertical>
 *   <AppleButton>Option 1</AppleButton>
 *   <AppleButton>Option 2</AppleButton>
 * </AppleButtonGroup>
 */

interface Props {
  /** Tamaño del espaciado: sm, md, lg */
  size?: 'sm' | 'md' | 'lg'
  /** Orientación vertical */
  vertical?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  vertical: false,
})
</script>

<style scoped>
.apple-button-group {
  display: flex;
  align-items: center;
}

.apple-button-group:not(.apple-button-group--vertical) {
  flex-direction: row;
}

.apple-button-group--vertical {
  flex-direction: column;
  align-items: stretch;
}

/* Spacing */
.apple-button-group--sm {
  gap: var(--space-2, 8px);
}

.apple-button-group--md {
  gap: var(--space-3, 12px);
}

.apple-button-group--lg {
  gap: var(--space-4, 16px);
}

/* Vertical spacing override */
.apple-button-group--vertical.apple-button-group--sm {
  gap: var(--space-2, 8px);
}

.apple-button-group--vertical.apple-button-group--md {
  gap: var(--space-3, 12px);
}

.apple-button-group--vertical.apple-button-group--lg {
  gap: var(--space-4, 16px);
}

/* Attached buttons (no gap, shared borders) */
.apple-button-group:not(.apple-button-group--vertical) :deep(.apple-button:not(:first-child):not(:last-child)) {
  border-radius: 0;
}

.apple-button-group:not(.apple-button-group--vertical) :deep(.apple-button:first-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.apple-button-group:not(.apple-button-group--vertical) :deep(.apple-button:last-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.apple-button-group--vertical :deep(.apple-button:not(:first-child):not(:last-child)) {
  border-radius: 0;
}

.apple-button-group--vertical :deep(.apple-button:first-child) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.apple-button-group--vertical :deep(.apple-button:last-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
