<template>
  <div class="apple-skeleton" :class="{ 'apple-skeleton--animated': animated }">
    <div v-if="variant === 'text'" class="apple-skeleton__text" :style="{ width, height }"></div>
    <div v-else-if="variant === 'circular'" class="apple-skeleton__circular" :style="{ width: size, height: size }"></div>
    <div v-else-if="variant === 'rectangular'" class="apple-skeleton__rectangular" :style="{ width, height }"></div>
    <div v-else-if="variant === 'card'" class="apple-skeleton__card">
      <div class="apple-skeleton__card-avatar"></div>
      <div class="apple-skeleton__card-lines">
        <div class="apple-skeleton__card-line"></div>
        <div class="apple-skeleton__card-line" style="width: 60%"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card'

interface Props {
  variant?: SkeletonVariant
  width?: string
  height?: string
  size?: string
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'text',
  width: '100%',
  height: '16px',
  size: '48px',
  animated: true,
})
</script>

<style scoped>
.apple-skeleton {
  display: inline-block;
  width: 100%;
}

.apple-skeleton__text,
.apple-skeleton__circular,
.apple-skeleton__rectangular,
.apple-skeleton__card-avatar,
.apple-skeleton__card-line {
  background: #E8E8ED;
  border-radius: 4px;
}

.apple-skeleton--animated .apple-skeleton__text,
.apple-skeleton--animated .apple-skeleton__circular,
.apple-skeleton--animated .apple-skeleton__rectangular,
.apple-skeleton--animated .apple-skeleton__card-avatar,
.apple-skeleton--animated .apple-skeleton__card-line {
  background: linear-gradient(90deg, #E8E8ED 25%, #F5F5F7 50%, #E8E8ED 75%);
  background-size: 200% 100%;
  animation: apple-skeleton-shimmer 1.5s infinite;
}

.apple-skeleton__text {
  min-height: 16px;
}

.apple-skeleton__circular {
  border-radius: 50%;
}

.apple-skeleton__card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E8E8ED;
}

.apple-skeleton__card-avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
}

.apple-skeleton__card-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.apple-skeleton__card-line {
  height: 14px;
  width: 100%;
}

@keyframes apple-skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
