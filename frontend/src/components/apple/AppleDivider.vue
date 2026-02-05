<template>
  <div class="apple-divider" :class="`apple-divider--${orientation}`">
    <div v-if="$slots.default" class="apple-divider__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
})
</script>

<style scoped>
.apple-divider {
  position: relative;
  display: flex;
  align-items: center;
}

.apple-divider--horizontal {
  width: 100%;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 24px 0;
}

.apple-divider--vertical {
  width: 1px;
  height: 100%;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 24px;
}

.apple-divider__content {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #FFFFFF;
  padding: 0 12px;
  font-size: 14px;
  color: #86868B;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
</style>
