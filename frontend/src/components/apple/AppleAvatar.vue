<template>
  <div class="apple-avatar" :class="`apple-avatar--${size}`" :style="avatarStyle">
    <img v-if="src && !error" :src="src" :alt="alt" class="apple-avatar__img" @error="error = true">
    <div v-else class="apple-avatar__fallback">
      <span class="apple-avatar__initials">{{ initials }}</span>
    </div>
    <div v-if="status" class="apple-avatar__status" :class="`apple-avatar__status--${status}`"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

interface Props {
  src?: string
  alt?: string
  name?: string
  size?: AvatarSize
  status?: AvatarStatus
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  name: '',
  size: 'md',
  bgColor: '#007AFF',
})

const error = ref(false)

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
}

const initials = computed(() => {
  if (!props.name) return ''
  return props.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const avatarStyle = computed(() => ({
  width: `${sizeMap[props.size]}px`,
  height: `${sizeMap[props.size]}px`,
  background: props.bgColor,
}))
</script>

<style scoped>
.apple-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.apple-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.apple-avatar__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #FFFFFF;
}

.apple-avatar__initials {
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-avatar--lg .apple-avatar__initials {
  font-size: 20px;
}

.apple-avatar--xl .apple-avatar__initials {
  font-size: 24px;
}

.apple-avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
}

.apple-avatar__status--online {
  background: #34C759;
}

.apple-avatar__status--offline {
  background: #A1A1A6;
}

.apple-avatar__status--busy {
  background: #FF3B30;
}

.apple-avatar__status--away {
  background: #FF9500;
}
</style>
