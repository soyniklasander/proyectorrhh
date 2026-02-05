<template>
  <AppleCard variant="stat" :hover-lift="true" class="apple-stat-card">
    <div class="apple-stat-card-content">
      <div 
        class="apple-stat-card-icon" 
        :class="`apple-stat-card-icon--${color}`"
        :style="iconStyles"
      >
        <n-icon :size="28" :component="icon" />
      </div>
      
      <div class="apple-stat-card-main">
        <div class="apple-stat-card-value" :class="{ 'apple-stat-card-value--loading': loading }">
          <template v-if="loading">
            <div class="apple-stat-card-skeleton"></div>
          </template>
          <template v-else>
            {{ formattedValue }}
          </template>
        </div>
        <div class="apple-stat-card-label">{{ label }}</div>
      </div>
    </div>
    
    <div v-if="trend !== undefined || $slots.footer" class="apple-stat-card-footer">
      <slot name="footer">
        <div v-if="trend !== undefined" class="apple-stat-card-trend" :class="trendClass">
          <n-icon :size="14" :component="trendIcon" />
          <span>{{ Math.abs(trend) }}%</span>
          <span class="apple-stat-card-trend-label">vs {{ trendLabel }}</span>
        </div>
      </slot>
    </div>
  </AppleCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpOutline, ArrowDownOutline, RemoveOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import type { Component } from 'vue'

import AppleCard from './AppleCard.vue'

/**
 * AppleStatCard
 * 
 * Card de estadísticas con icono circular, valor grande y tendencia.
 * 
 * @example
 * <AppleStatCard
 *   :icon="PeopleOutline"
 *   :value="1240"
 *   label="Empleados"
 *   :trend="12.5"
 *   trend-label="mes pasado"
 *   color="blue"
 * />
 * 
 * @example Custom color
 * <AppleStatCard
 *   :icon="WalletOutline"
 *   :value="45800"
 *   label="Salarios"
 *   color="green"
 *   :custom-color="{ bg: '#E8F5E9', text: '#2E7D32' }"
 * />
 */

type StatColor = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'teal' | 'indigo' | 'custom'

interface CustomColor {
  bg: string
  text: string
}

interface Props {
  /** Icono del card */
  icon: Component
  /** Valor numérico a mostrar */
  value: number | string
  /** Etiqueta descriptiva */
  label: string
  /** Color del icono */
  color?: StatColor
  /** Colores personalizados cuando color='custom' */
  customColor?: CustomColor
  /** Formato del valor: 'number' | 'currency' | 'percentage' | 'decimal' */
  format?: 'number' | 'currency' | 'percentage' | 'decimal'
  /** Símbolo de moneda para formato currency */
  currency?: string
  /** Número de decimales */
  decimals?: number
  /** Porcentaje de tendencia (positivo/negativo) */
  trend?: number
  /** Label para la tendencia */
  trendLabel?: string
  /** Estado de carga */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  customColor: undefined,
  format: 'number',
  currency: 'S/',
  decimals: 0,
  trend: undefined,
  trendLabel: 'mes anterior',
  loading: false,
})

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'rgba(0, 122, 255, 0.12)', text: '#007AFF' },
  green: { bg: 'rgba(52, 199, 89, 0.12)', text: '#34C759' },
  orange: { bg: 'rgba(255, 149, 0, 0.12)', text: '#FF9500' },
  red: { bg: 'rgba(255, 59, 48, 0.12)', text: '#FF3B30' },
  purple: { bg: 'rgba(175, 82, 222, 0.12)', text: '#AF52DE' },
  teal: { bg: 'rgba(90, 200, 250, 0.12)', text: '#5AC8FA' },
  indigo: { bg: 'rgba(88, 86, 214, 0.12)', text: '#5856D6' },
}

const iconStyles = computed(() => {
  const colors = props.color === 'custom' && props.customColor
    ? props.customColor
    : colorMap[props.color] || colorMap.blue
  
  return {
    background: colors.bg,
    color: colors.text,
  }
})

const formattedValue = computed(() => {
  const val = typeof props.value === 'string' ? parseFloat(props.value) : props.value
  
  switch (props.format) {
    case 'currency':
      return `${props.currency} ${val.toLocaleString('es-PE', { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals })}`
    case 'percentage':
      return `${val.toFixed(props.decimals)}%`
    case 'decimal':
      return val.toFixed(props.decimals)
    default:
      return val.toLocaleString('es-PE')
  }
})

const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  if (props.trend > 0) return 'apple-stat-card-trend--positive'
  if (props.trend < 0) return 'apple-stat-card-trend--negative'
  return 'apple-stat-card-trend--neutral'
})

const trendIcon = computed(() => {
  if (props.trend === undefined) return RemoveOutline
  if (props.trend > 0) return ArrowUpOutline
  if (props.trend < 0) return ArrowDownOutline
  return RemoveOutline
})
</script>

<style scoped>
.apple-stat-card :deep(.apple-card-body) {
  padding: var(--space-5, 20px);
}

.apple-stat-card-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4, 16px);
}

.apple-stat-card-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.apple-stat-card-main {
  flex: 1;
  min-width: 0;
}

.apple-stat-card-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary, #1D1D1F);
  line-height: 1.2;
  margin-bottom: var(--space-1, 4px);
}

.apple-stat-card-value--loading {
  min-height: 36px;
  display: flex;
  align-items: center;
}

.apple-stat-card-skeleton {
  width: 80%;
  height: 32px;
  background: linear-gradient(90deg, var(--gray-200, #E8E8ED) 25%, var(--gray-300, #D2D2D7) 50%, var(--gray-200, #E8E8ED) 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm, 6px);
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.apple-stat-card-label {
  font-size: 14px;
  color: var(--text-secondary, #86868B);
  font-weight: 500;
}

.apple-stat-card-footer {
  margin-top: var(--space-4, 16px);
  padding-top: var(--space-4, 16px);
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
}

.apple-stat-card-trend {
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  font-size: 13px;
  font-weight: 600;
}

.apple-stat-card-trend--positive {
  color: var(--apple-green, #34C759);
}

.apple-stat-card-trend--negative {
  color: var(--apple-red, #FF3B30);
}

.apple-stat-card-trend--neutral {
  color: var(--text-secondary, #86868B);
}

.apple-stat-card-trend-label {
  font-weight: 400;
  color: var(--text-secondary, #86868B);
  margin-left: var(--space-1, 4px);
}
</style>
