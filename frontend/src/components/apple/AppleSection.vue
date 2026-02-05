<template>
  <section class="apple-section" :class="[
    `apple-section--${size}`,
    { 'apple-section--bordered': bordered }
  ]">
    <div v-if="title || $slots.header" class="apple-section-header">
      <div class="apple-section-header-content">
        <h2 v-if="title" class="apple-section-title">{{ title }}</h2>
        <p v-if="description" class="apple-section-description">{{ description }}</p>
        <slot name="header" />
      </div>
      <div v-if="$slots['header-actions']" class="apple-section-header-actions">
        <slot name="header-actions" />
      </div>
    </div>
    
    <div class="apple-section-content" :class="{ 'apple-section-content--padded': padded }">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="apple-section-footer">
      <slot name="footer" />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * AppleSection
 * 
 * Sección de contenido con título, descripción y áreas de header/footer.
 * 
 * @example
 * <AppleSection
 *   title="Configuración"
 *   description="Gestiona las preferencias de tu cuenta"
 *   size="lg"
 *   bordered
 * >
 *   <YourContent />
 * </AppleSection>
 */

interface Props {
  /** Título de la sección */
  title?: string
  /** Descripción de la sección */
  description?: string
  /** Tamaño del espaciado: sm, md, lg */
  size?: 'sm' | 'md' | 'lg'
  /** Mostrar borde inferior */
  bordered?: boolean
  /** Agregar padding al contenido */
  padded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  description: undefined,
  size: 'md',
  bordered: false,
  padded: true,
})
</script>

<style scoped>
.apple-section {
  width: 100%;
}

.apple-section--sm {
  --section-gap: var(--space-4, 16px);
}

.apple-section--md {
  --section-gap: var(--space-6, 24px);
}

.apple-section--lg {
  --section-gap: var(--space-8, 32px);
}

.apple-section--bordered {
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  padding-bottom: var(--section-gap);
}

.apple-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4, 16px);
  margin-bottom: var(--section-gap);
}

.apple-section-header-content {
  flex: 1;
}

.apple-section-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary, #1D1D1F);
  margin: 0 0 var(--space-1, 4px) 0;
}

.apple-section-description {
  font-size: 15px;
  color: var(--text-secondary, #86868B);
  margin: 0;
  line-height: 1.5;
}

.apple-section-header-actions {
  flex-shrink: 0;
}

.apple-section-content {
  width: 100%;
}

.apple-section-content--padded {
  padding: var(--section-gap);
  background: var(--surface, #FFFFFF);
  border-radius: var(--radius-lg, 16px);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
}

.apple-section-footer {
  margin-top: var(--section-gap);
  padding-top: var(--section-gap);
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
}

@media (max-width: 768px) {
  .apple-section-header {
    flex-direction: column;
    gap: var(--space-3, 12px);
  }
  
  .apple-section-header-actions {
    width: 100%;
  }
}
</style>
