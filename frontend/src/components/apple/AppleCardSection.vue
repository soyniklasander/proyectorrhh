<template>
  <div class="apple-card-section" :class="{ 'apple-card-section--bordered': bordered }">
    <h4 v-if="title" class="apple-card-section-title">{{ title }}</h4>
    <div class="apple-card-section-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AppleCardSection
 * 
 * Sección dentro de un card para agrupar contenido relacionado.
 * 
 * @example
 * <AppleCard title="Configuración">
 *   <AppleCardSection title="General" bordered>
 *     <FormItems />
 *   </AppleCardSection>
 *   <AppleCardSection title="Avanzado" bordered>
 *     <AdvancedOptions />
 *   </AppleCardSection>
 * </AppleCard>
 */

interface Props {
  /** Título de la sección */
  title?: string
  /** Mostrar borde superior */
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  bordered: false,
})
</script>

<style scoped>
.apple-card-section {
  padding: var(--space-4, 16px) 0;
}

.apple-card-section:first-child {
  padding-top: 0;
}

.apple-card-section:last-child {
  padding-bottom: 0;
}

.apple-card-section--bordered {
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
}

.apple-card-section--bordered:first-child {
  border-top: none;
}

.apple-card-section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-secondary, #86868B);
  margin: 0 0 var(--space-3, 12px) 0;
}

.apple-card-section-content {
  width: 100%;
}
</style>
