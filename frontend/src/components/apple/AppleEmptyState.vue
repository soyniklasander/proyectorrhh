<template>
  <div class="apple-empty-state">
    <div class="apple-empty-state__icon">
      <n-icon :component="icon || ArchiveOutline" size="48" />
    </div>
    <h3 class="apple-empty-state__title">{{ title || 'Sin datos' }}</h3>
    <p class="apple-empty-state__description">{{ description || 'No hay información disponible' }}</p>
    <div v-if="$slots.action || actionText" class="apple-empty-state__action">
      <slot name="action">
        <AppleButton v-if="actionText" @click="$emit('action')">
          {{ actionText }}
        </AppleButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { ArchiveOutline } from '@vicons/ionicons5'
import type { Component } from 'vue'
import AppleButton from './AppleButton.vue'

interface Props {
  icon?: Component
  title?: string
  description?: string
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
})

defineEmits<{
  action: []
}>()
</script>

<style scoped>
.apple-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.apple-empty-state__icon {
  width: 80px;
  height: 80px;
  background: #F5F5F7;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A1A1A6;
  margin-bottom: 20px;
}

.apple-empty-state__title {
  font-size: 18px;
  font-weight: 600;
  color: #1D1D1F;
  margin: 0 0 8px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-empty-state__description {
  font-size: 14px;
  color: #86868B;
  margin: 0 0 20px 0;
  max-width: 300px;
}

.apple-empty-state__action {
  margin-top: 8px;
}
</style>
