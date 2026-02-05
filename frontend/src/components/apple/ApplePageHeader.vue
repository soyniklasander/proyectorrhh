<template>
  <div class="apple-page-header" :class="{ 'apple-page-header--bordered': bordered }">
    <div class="apple-page-header-content">
      <div v-if="showBack" class="apple-page-header-back" @click="handleBack">
        <n-icon size="20"><ChevronBackOutline /></n-icon>
        <span v-if="backText">{{ backText }}</span>
      </div>
      
      <div class="apple-page-header-main">
        <div v-if="icon" class="apple-page-header-icon">
          <n-icon :size="iconSize" :component="icon" />
        </div>
        
        <div class="apple-page-header-text">
          <h1 class="apple-page-header-title">{{ title }}</h1>
          <p v-if="subtitle" class="apple-page-header-subtitle">{{ subtitle }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="$slots.actions || actions" class="apple-page-header-actions">
      <slot name="actions">
        <AppleButtonGroup v-if="actions">
          <AppleButton
            v-for="(action, index) in actions"
            :key="index"
            :variant="action.variant || 'secondary'"
            :size="action.size || 'medium'"
            :icon="action.icon"
            @click="action.onClick"
          >
            {{ action.label }}
          </AppleButton>
        </AppleButtonGroup>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ChevronBackOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import type { Component } from 'vue'

import AppleButton from './AppleButton.vue'
import AppleButtonGroup from './AppleButtonGroup.vue'

/**
 * ApplePageHeader
 * 
 * Encabezado de página estilo Apple con título, subtítulo, icono y acciones.
 * 
 * @example
 * <ApplePageHeader
 *   title="Dashboard"
 *   subtitle="Resumen de tu sistema"
 *   :icon="AnalyticsOutline"
 *   :actions="[{ label: 'Nuevo', variant: 'primary', onClick: handleNew }]"
 * />
 */

interface Action {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  icon?: Component
}

interface Props {
  /** Título principal de la página */
  title: string
  /** Subtítulo descriptivo */
  subtitle?: string
  /** Icono opcional */
  icon?: Component
  /** Tamaño del icono */
  iconSize?: number
  /** Mostrar botón de retroceso */
  showBack?: boolean
  /** Texto del botón de retroceso */
  backText?: string
  /** Ruta o función para retroceder */
  backTo?: string | (() => void)
  /** Mostrar borde inferior */
  bordered?: boolean
  /** Acciones a mostrar en el header */
  actions?: Action[]
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  icon: undefined,
  iconSize: 28,
  showBack: false,
  backText: '',
  backTo: undefined,
  bordered: false,
  actions: undefined,
})

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()

const handleBack = () => {
  emit('back')
  
  if (props.backTo) {
    if (typeof props.backTo === 'function') {
      props.backTo()
    } else {
      router.push(props.backTo)
    }
  } else {
    router.back()
  }
}
</script>

<style scoped>
.apple-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6, 24px) 0;
  gap: var(--space-4, 16px);
}

.apple-page-header--bordered {
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  padding-bottom: var(--space-6, 24px);
  margin-bottom: var(--space-6, 24px);
}

.apple-page-header-content {
  display: flex;
  align-items: center;
  gap: var(--space-4, 16px);
  flex: 1;
}

.apple-page-header-back {
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  color: var(--apple-blue, #007AFF);
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.15s ease;
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 10px);
  margin-right: var(--space-2, 8px);
}

.apple-page-header-back:hover {
  background: rgba(0, 122, 255, 0.08);
}

.apple-page-header-main {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
}

.apple-page-header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--apple-blue, #007AFF) 0%, var(--apple-indigo, #5856D6) 100%);
  border-radius: var(--radius-md, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.apple-page-header-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}

.apple-page-header-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary, #1D1D1F);
  margin: 0;
  line-height: 1.2;
}

.apple-page-header-subtitle {
  font-size: 15px;
  color: var(--text-secondary, #86868B);
  margin: 0;
  font-weight: 400;
}

.apple-page-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
}

@media (max-width: 768px) {
  .apple-page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4, 16px);
  }
  
  .apple-page-header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .apple-page-header-title {
    font-size: 24px;
  }
}
</style>
