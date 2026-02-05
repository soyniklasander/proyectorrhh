<template>
  <div 
    class="apple-card" 
    :class="[
      `apple-card--${variant}`,
      `apple-card--${size}`,
      { 
        'apple-card--hoverable': hoverable,
        'apple-card--hover-lift': hoverLift,
        'apple-card--selected': selected,
        'apple-card--disabled': disabled,
      }
    ]"
    :style="customStyles"
    @click="handleClick"
  >
    <div v-if="$slots.header || title" class="apple-card-header">
      <slot name="header">
        <div class="apple-card-header-content">
          <h3 v-if="title" class="apple-card-title">{{ title }}</h3>
          <p v-if="subtitle" class="apple-card-subtitle">{{ subtitle }}</p>
        </div>
        <div v-if="$slots['header-extra']" class="apple-card-header-extra">
          <slot name="header-extra" />
        </div>
      </slot>
    </div>
    
    <div class="apple-card-body" :class="{ 'apple-card-body--no-padding': noPadding }">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="apple-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * AppleCard
 * 
 * Card component estilo Apple con múltiples variantes y efectos hover.
 * 
 * @example
 * <AppleCard title="Estadísticas" subtitle="Resumen mensual" variant="default" hoverable>
 *   <StatContent />
 * </AppleCard>
 * 
 * @example Variantes
 * <AppleCard variant="stat" hover-lift>
 *   <StatCardContent />
 * </AppleCard>
 * 
 * <AppleCard variant="info" size="compact">
 *   <InfoContent />
 * </AppleCard>
 */

type CardVariant = 'default' | 'stat' | 'info' | 'outlined' | 'elevated'
type CardSize = 'default' | 'small' | 'compact'

interface Props {
  /** Variante visual del card */
  variant?: CardVariant
  /** Tamaño del card */
  size?: CardSize
  /** Título del card */
  title?: string
  /** Subtítulo del card */
  subtitle?: string
  /** Color de fondo personalizado */
  backgroundColor?: string
  /** Sin padding en el body */
  noPadding?: boolean
  /** Efecto hover */
  hoverable?: boolean
  /** Efecto hover con elevación */
  hoverLift?: boolean
  /** Estado seleccionado */
  selected?: boolean
  /** Estado deshabilitado */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  title: undefined,
  subtitle: undefined,
  backgroundColor: undefined,
  noPadding: false,
  hoverable: false,
  hoverLift: false,
  selected: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const customStyles = computed(() => {
  const styles: Record<string, string> = {}
  if (props.backgroundColor) {
    styles['--card-bg'] = props.backgroundColor
  }
  return styles
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.apple-card {
  background: var(--card-bg, var(--surface, #FFFFFF));
  border-radius: var(--radius-lg, 16px);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  transition: var(--transition-card, all 0.2s cubic-bezier(0.4, 0, 0.2, 1));
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Variant: default */
.apple-card--default {
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04));
}

/* Variant: stat */
.apple-card--stat {
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04));
}

.apple-card--stat .apple-card-body {
  display: flex;
  flex-direction: column;
}

/* Variant: info */
.apple-card--info {
  background: var(--gray-100, #F5F5F7);
  border: 1px solid transparent;
}

/* Variant: outlined */
.apple-card--outlined {
  background: transparent;
  box-shadow: none;
}

/* Variant: elevated */
.apple-card--elevated {
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.08));
}

/* Size variants */
.apple-card--small {
  border-radius: var(--radius-md, 10px);
}

.apple-card--small .apple-card-header {
  padding: var(--space-3, 12px) var(--space-4, 16px);
}

.apple-card--small .apple-card-body {
  padding: var(--space-4, 16px);
}

.apple-card--compact .apple-card-body {
  padding: var(--space-3, 12px);
}

/* Hover effects */
.apple-card--hoverable:hover {
  border-color: var(--border-color-hover, rgba(0, 0, 0, 0.15));
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.08));
}

.apple-card--hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.08));
}

.apple-card--hover-lift:active {
  transform: translateY(0);
}

/* States */
.apple-card--selected {
  border-color: var(--apple-blue, #007AFF);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
}

.apple-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Header */
.apple-card-header {
  padding: var(--space-5, 20px) var(--space-6, 24px);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4, 16px);
}

.apple-card-header-content {
  flex: 1;
}

.apple-card-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary, #1D1D1F);
  margin: 0;
  line-height: 1.3;
}

.apple-card-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #86868B);
  margin: var(--space-1, 4px) 0 0 0;
  line-height: 1.4;
}

.apple-card-header-extra {
  flex-shrink: 0;
}

/* Body */
.apple-card-body {
  padding: var(--space-6, 24px);
  flex: 1;
}

.apple-card-body--no-padding {
  padding: 0;
}

/* Footer */
.apple-card-footer {
  padding: var(--space-4, 16px) var(--space-6, 24px);
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  background: var(--gray-100, #F5F5F7);
}

/* Compact footer for small cards */
.apple-card--small .apple-card-footer {
  padding: var(--space-3, 12px) var(--space-4, 16px);
}

.apple-card--compact .apple-card-footer {
  padding: var(--space-2, 8px) var(--space-3, 12px);
}
</style>
