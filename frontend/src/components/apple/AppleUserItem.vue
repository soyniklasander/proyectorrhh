<template>
  <div class="apple-user-item" :class="{ 'apple-user-item--compact': compact }">
    <AppleAvatar
      :src="avatar"
      :name="name"
      :size="avatarSize"
      :status="status"
    />
    <div class="apple-user-item__info">
      <div class="apple-user-item__name">{{ name }}</div>
      <div v-if="subtitle" class="apple-user-item__subtitle">{{ subtitle }}</div>
      <div v-if="email" class="apple-user-item__email">{{ email }}</div>
    </div>
    <div v-if="$slots.extra" class="apple-user-item__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppleAvatar from './AppleAvatar.vue'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'
type UserStatus = 'online' | 'offline' | 'busy' | 'away'

interface Props {
  name: string
  avatar?: string
  subtitle?: string
  email?: string
  status?: UserStatus
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
})

const avatarSize = computed((): AvatarSize => {
  return props.compact ? 'sm' : 'md'
})
</script>

<style scoped>
.apple-user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
}

.apple-user-item--compact {
  gap: 10px;
  padding: 8px;
}

.apple-user-item__info {
  flex: 1;
  min-width: 0;
}

.apple-user-item__name {
  font-size: 15px;
  font-weight: 500;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-user-item--compact .apple-user-item__name {
  font-size: 14px;
}

.apple-user-item__subtitle {
  font-size: 13px;
  color: #6E6E73;
}

.apple-user-item__email {
  font-size: 12px;
  color: #A1A1A6;
}

.apple-user-item__extra {
  flex-shrink: 0;
}
</style>
