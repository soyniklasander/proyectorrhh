<template>
  <div class="apple-container" :class="[
    `apple-container--${size}`,
    { 'apple-container--fluid': fluid }
  ]">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * AppleContainer
 * 
 * Contenedor principal con anchos predefinidos estilo Apple.
 * Usa max-widths consistentes con el diseño de Apple.
 * 
 * @example
 * <AppleContainer size="lg">
 *   <YourContent />
 * </AppleContainer>
 */

interface Props {
  /** Tamaño del contenedor: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px) */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Si es true, el contenedor ocupa el 100% del ancho */
  fluid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'xl',
  fluid: false,
})
</script>

<style scoped>
.apple-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-6, 24px);
  padding-right: var(--space-6, 24px);
}

.apple-container--sm {
  max-width: 640px;
}

.apple-container--md {
  max-width: 768px;
}

.apple-container--lg {
  max-width: 1024px;
}

.apple-container--xl {
  max-width: 1280px;
}

.apple-container--2xl {
  max-width: 1536px;
}

.apple-container--fluid {
  max-width: none;
}

@media (max-width: 768px) {
  .apple-container {
    padding-left: var(--space-4, 16px);
    padding-right: var(--space-4, 16px);
  }
}
</style>
