<template>
  <div class="apple-grid" :class="[
    `apple-grid--cols-${columns}`,
    `apple-grid--gap-${gap}`,
    { 'apple-grid--responsive': responsive }
  ]">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * AppleGrid
 * 
 * Grid layout estilo Apple con columnas y espaciado consistentes.
 * 
 * @example
 * <AppleGrid :columns="3" gap="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </AppleGrid>
 * 
 * @example Responsive
 * <AppleGrid :columns="4" gap="md" responsive>
 *   <!-- Se adapta a 2 cols en tablet y 1 en mobile -->
 * </AppleGrid>
 */

interface Props {
  /** Número de columnas (1-12) */
  columns?: number
  /** Espaciado entre items: sm (8px), md (16px), lg (24px), xl (32px) */
  gap?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
  /** Hacer el grid responsive */
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: 3,
  gap: 'md',
  responsive: true,
})
</script>

<style scoped>
.apple-grid {
  display: grid;
  width: 100%;
}

/* Gap variants */
.apple-grid--gap-none {
  gap: 0;
}

.apple-grid--gap-sm {
  gap: var(--space-2, 8px);
}

.apple-grid--gap-md {
  gap: var(--space-4, 16px);
}

.apple-grid--gap-lg {
  gap: var(--space-6, 24px);
}

.apple-grid--gap-xl {
  gap: var(--space-8, 32px);
}

/* Column variants */
.apple-grid--cols-1 {
  grid-template-columns: repeat(1, 1fr);
}

.apple-grid--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.apple-grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.apple-grid--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.apple-grid--cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.apple-grid--cols-6 {
  grid-template-columns: repeat(6, 1fr);
}

.apple-grid--cols-7 {
  grid-template-columns: repeat(7, 1fr);
}

.apple-grid--cols-8 {
  grid-template-columns: repeat(8, 1fr);
}

.apple-grid--cols-9 {
  grid-template-columns: repeat(9, 1fr);
}

.apple-grid--cols-10 {
  grid-template-columns: repeat(10, 1fr);
}

.apple-grid--cols-11 {
  grid-template-columns: repeat(11, 1fr);
}

.apple-grid--cols-12 {
  grid-template-columns: repeat(12, 1fr);
}

/* Responsive behavior */
@media (max-width: 1200px) {
  .apple-grid--responsive.apple-grid--cols-4,
  .apple-grid--responsive.apple-grid--cols-5,
  .apple-grid--responsive.apple-grid--cols-6 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .apple-grid--responsive.apple-grid--cols-7,
  .apple-grid--responsive.apple-grid--cols-8,
  .apple-grid--responsive.apple-grid--cols-9,
  .apple-grid--responsive.apple-grid--cols-10,
  .apple-grid--responsive.apple-grid--cols-11,
  .apple-grid--responsive.apple-grid--cols-12 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .apple-grid--responsive.apple-grid--cols-3,
  .apple-grid--responsive.apple-grid--cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .apple-grid--responsive.apple-grid--cols-5,
  .apple-grid--responsive.apple-grid--cols-6,
  .apple-grid--responsive.apple-grid--cols-7,
  .apple-grid--responsive.apple-grid--cols-8 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .apple-grid--responsive.apple-grid--cols-2,
  .apple-grid--responsive.apple-grid--cols-3,
  .apple-grid--responsive.apple-grid--cols-4 {
    grid-template-columns: 1fr;
  }
  
  .apple-grid--responsive.apple-grid--cols-5,
  .apple-grid--responsive.apple-grid--cols-6 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
