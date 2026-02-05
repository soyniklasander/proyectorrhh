<template>
  <div class="apple-list-item" :class="{ 'apple-list-item--clickable': clickable }" @click="$emit('click')">
    <div v-if="icon || $slots.icon" class="apple-list-item__icon">
      <slot name="icon">
        <n-icon :component="icon" size="20" />
      </slot>
    </div>
    <div class="apple-list-item__content">
      <div class="apple-list-item__title">{{ title }}</div>
      <div v-if="description" class="apple-list-item__description">{{ description }}</div>
    </div>
    <div v-if="$slots.suffix" class="apple-list-item__suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import type { Component } from 'vue'

interface Props {
  title: string
  description?: string
  icon?: Component
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  description: '',
  clickable: false,
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.apple-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: background 0.15s ease;
}

.apple-list-item--clickable {
  cursor: pointer;
}

.apple-list-item--clickable:hover {
  background: #F5F5F7;
}

.apple-list-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(0, 122, 255, 0.08);
  border-radius: 10px;
  color: #007AFF;
  flex-shrink: 0;
}

.apple-list-item__content {
  flex: 1;
  min-width: 0;
}

.apple-list-item__title {
  font-size: 15px;
  font-weight: 500;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-list-item__description {
  font-size: 13px;
  color: #86868B;
  margin-top: 2px;
}

.apple-list-item__suffix {
  flex-shrink: 0;
}
</style>
