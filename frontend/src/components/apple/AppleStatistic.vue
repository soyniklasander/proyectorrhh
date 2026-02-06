<template>
  <div class="apple-statistic" :class="[size, { 'trend-up': trend === 'up', 'trend-down': trend === 'down' }]">
    <div class="statistic-content">
      <div v-if="prefix || icon" class="statistic-prefix">
        <span v-if="icon" class="statistic-icon">
          <component :is="icon" v-if="typeof icon === 'object'" />
          <span v-else>{{ icon }}</span>
        </span>
        <span v-if="prefix" class="statistic-text">{{ prefix }}</span>
      </div>
      
      <div class="statistic-value">
        {{ formattedValue }}
      </div>
      
      <div v-if="suffix" class="statistic-suffix">
        {{ suffix }}
      </div>
    </div>
    
    <div v-if="label" class="statistic-label">
      {{ label }}
    </div>
    
    <div v-if="trend" class="statistic-trend">
      <span class="trend-icon">
        <svg v-if="trend === 'up'" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 12.6667V3.33333" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 7.33333L8 3.33333" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 7.33333L8 3.33333" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3.33333V12.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 8.66667L8 12.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8.66667L8 12.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span v-if="trendValue" class="trend-value">
        {{ trendValue }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number | string
  label?: string
  prefix?: string
  suffix?: string
  icon?: any
  precision?: number
  size?: 'small' | 'medium' | 'large'
  trend?: 'up' | 'down'
  trendValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  precision: 0,
  size: 'medium',
  trend: undefined
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString(undefined, {
      minimumFractionDigits: props.precision,
      maximumFractionDigits: props.precision
    })
  }
  return props.value
})
</script>

<style scoped>
.apple-statistic {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border);
}

.apple-statistic.small {
  padding: var(--spacing-3);
}

.apple-statistic.large {
  padding: var(--spacing-5);
}

.apple-statistic.trend-up {
  border-color: var(--color-success-light);
  background: var(--color-success-surface);
}

.apple-statistic.trend-down {
  border-color: var(--color-error-light);
  background: var(--color-error-surface);
}

.statistic-content {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.statistic-prefix {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 400;
}

.statistic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.statistic-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.apple-statistic.small .statistic-value {
  font-size: 18px;
}

.apple-statistic.large .statistic-value {
  font-size: 32px;
}

.apple-statistic.trend-up .statistic-value {
  color: var(--color-success);
}

.apple-statistic.trend-down .statistic-value {
  color: var(--color-error);
}

.statistic-suffix {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 400;
}

.statistic-label {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}

.statistic-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: 12px;
  font-weight: 500;
}

.apple-statistic.trend-up .statistic-trend {
  color: var(--color-success);
}

.apple-statistic.trend-down .statistic-trend {
  color: var(--color-error);
}

.trend-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
}

.trend-value {
  font-weight: 600;
}
</style>