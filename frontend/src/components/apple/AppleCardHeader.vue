<template>
  <div class="apple-card-header-wrapper">
    <div class="apple-card-header-icon" v-if="icon">
      <n-icon :size="iconSize" :component="icon" />
    </div>
    <div class="apple-card-header-text">
      <h3 class="apple-card-header-title">{{ title }}</h3>
      <p v-if="subtitle" class="apple-card-header-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.extra" class="apple-card-header-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { NIcon } from 'naive-ui'

/**
 * AppleCardHeader
 * 
 * Header reutilizable para cards estilo Apple.
 * 
 * @example
 * <AppleCard>
 *   <template #header>
 *     <AppleCardHeader
 *       title="Título"
 *       subtitle="Descripción"
 *       :icon="SettingsOutline"
 *     />
 *   </template>
 *   <Content />
 * </AppleCard>
 */

interface Props {
  /** Título del header */
  title: string
  /** Subtítulo opcional */
  subtitle?: string
  /** Icono opcional */
  icon?: Component
  /** Tamaño del icono */
  iconSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  icon: undefined,
  iconSize: 20,
})
</script>

<style scoped>
.apple-card-header-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3, 12px);
  width: 100%;
}

.apple-card-header-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--apple-blue, #007AFF) 0%, var(--apple-indigo, #5856D6) 100%);
  border-radius: var(--radius-md, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.apple-card-header-text {
  flex: 1;
  min-width: 0;
}

.apple-card-header-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary, #1D1D1F);
  margin: 0;
  line-height: 1.3;
}

.apple-card-header-subtitle {
  font-size: 13px;
  color: var(--text-secondary, #86868B);
  margin: 2px 0 0 0;
  line-height: 1.4;
}

.apple-card-header-extra {
  flex-shrink: 0;
  margin-left: auto;
}
</style>
