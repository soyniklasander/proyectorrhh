<template>
  <div class="apple-steps" :class="[orientation, { 'compact': compact }]">
    <div 
      v-for="(step, index) in normalizedSteps" 
      :key="index"
      class="apple-step"
      :class="{
        'active': index === current,
        'completed': index < current,
        'error': step.status === 'error',
        'warning': step.status === 'warning'
      }"
    >
      <div class="step-indicator">
        <div v-if="index < current" class="step-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div v-else-if="step.status === 'error'" class="step-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z" stroke="currentColor" stroke-width="2"/>
            <path d="M10 6L6 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div v-else-if="step.status === 'warning'" class="step-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 5.33333V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 10.6667H8.00667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M7.99992 14.6667C11.6818 14.6667 14.6666 11.6819 14.6666 8C14.6666 4.3181 11.6818 1.33333 7.99992 1.33333C4.31802 1.33333 1.33325 4.3181 1.33325 8C1.33325 11.6819 4.31802 14.6667 7.99992 14.6667Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div v-else class="step-number">
          {{ index + 1 }}
        </div>
      </div>
      
      <div class="step-content">
        <div class="step-title">{{ step.title }}</div>
        <div v-if="step.description" class="step-description">{{ step.description }}</div>
      </div>
      
      <div v-if="index < normalizedSteps.length - 1" class="step-connector"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Step {
  title: string
  description?: string
  status?: 'default' | 'error' | 'warning'
}

interface Props {
  steps: Step[]
  current?: number
  orientation?: 'horizontal' | 'vertical'
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  current: 0,
  orientation: 'horizontal',
  compact: false
})

const normalizedSteps = computed(() => {
  return props.steps.map(step => ({
    ...step,
    status: step.status || 'default'
  }))
})
</script>

<style scoped>
.apple-steps {
  display: flex;
  gap: var(--spacing-4);
}

.apple-steps.horizontal {
  flex-direction: row;
}

.apple-steps.vertical {
  flex-direction: column;
  gap: var(--spacing-6);
}

.apple-steps.compact {
  gap: var(--spacing-2);
}

.apple-step {
  display: flex;
  align-items: flex-start;
  flex: 1;
  position: relative;
  min-width: 0;
}

.apple-steps.vertical .apple-step {
  flex-direction: row;
  align-items: flex-start;
}

.step-indicator {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  position: relative;
  z-index: 2;
}

.apple-step.active .step-indicator {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}

.apple-step.completed .step-indicator {
  background: var(--color-success);
  border-color: var(--color-success);
  color: var(--color-white);
}

.apple-step.error .step-indicator {
  background: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-white);
}

.apple-step.warning .step-indicator {
  background: var(--color-warning);
  border-color: var(--color-warning);
  color: var(--color-white);
}

.step-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-content {
  margin-left: var(--spacing-3);
  min-width: 0;
  flex: 1;
}

.apple-steps.vertical .step-content {
  margin-left: var(--spacing-3);
  margin-top: 0;
}

.apple-steps.compact .step-content {
  margin-left: var(--spacing-2);
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.apple-step.active .step-title {
  color: var(--color-primary);
}

.apple-step.completed .step-title {
  color: var(--color-text-primary);
}

.apple-step.error .step-title {
  color: var(--color-error);
}

.apple-step.warning .step-title {
  color: var(--color-warning);
}

.step-description {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-top: var(--spacing-1);
}

.step-connector {
  position: absolute;
  top: 12px;
  left: 24px;
  right: 0;
  height: 1px;
  background: var(--color-border);
  z-index: 1;
}

.apple-steps.vertical .step-connector {
  top: 24px;
  left: 12px;
  right: auto;
  bottom: 0;
  width: 1px;
  height: calc(100% + var(--spacing-6));
}

.apple-steps.compact .step-connector {
  left: 12px;
}

.apple-step:last-child .step-connector {
  display: none;
}

.apple-step.completed .step-connector,
.apple-step.active .step-connector {
  background: var(--color-primary);
}

.apple-step.error .step-connector {
  background: var(--color-error);
}

.apple-step.warning .step-connector {
  background: var(--color-warning);
}
</style>