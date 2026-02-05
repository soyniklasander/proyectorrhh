<template>
  <div class="apple-loading" :class="{ 'apple-loading--fullscreen': fullscreen }">
    <div class="apple-loading__spinner">
      <svg class="apple-loading__svg" viewBox="0 0 50 50">
        <circle
          class="apple-loading__circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div v-if="text" class="apple-loading__text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  fullscreen?: boolean
}

withDefaults(defineProps<Props>(), {
  fullscreen: false,
})
</script>

<style scoped>
.apple-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #007AFF;
}

.apple-loading--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 9999;
  padding: 0;
}

.apple-loading__spinner {
  width: 40px;
  height: 40px;
}

.apple-loading__svg {
  width: 100%;
  height: 100%;
  animation: apple-loading-rotate 1s linear infinite;
}

.apple-loading__circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: apple-loading-dash 1.5s ease-in-out infinite;
}

.apple-loading__text {
  font-size: 14px;
  font-weight: 500;
  color: #6E6E73;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

@keyframes apple-loading-rotate {
  100% { transform: rotate(360deg); }
}

@keyframes apple-loading-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
