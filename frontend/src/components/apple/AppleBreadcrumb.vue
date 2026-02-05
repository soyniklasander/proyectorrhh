<template>
  <nav class="apple-breadcrumb">
    <ol class="apple-breadcrumb__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="apple-breadcrumb__item"
        :class="{ 'apple-breadcrumb__item--active': index === items.length - 1 }"
      >
        <n-icon v-if="item.icon" :component="item.icon" size="14" />
        <a
          v-if="index < items.length - 1"
          href="#"
          class="apple-breadcrumb__link"
          @click.prevent="handleClick(item, index)"
        >
          {{ item.label }}
        </a>
        <span v-else class="apple-breadcrumb__current">{{ item.label }}</span>
        <n-icon
          v-if="index < items.length - 1"
          class="apple-breadcrumb__separator"
          :component="ChevronForwardOutline"
          size="14"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { ChevronForwardOutline } from '@vicons/ionicons5'
import type { Component } from 'vue'

interface BreadcrumbItem {
  label: string
  path?: string
  icon?: Component
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  'item-click': [item: BreadcrumbItem, index: number]
}>()

const handleClick = (item: BreadcrumbItem, index: number) => {
  emit('item-click', item, index)
}
</script>

<style scoped>
.apple-breadcrumb {
  padding: 12px 0;
}

.apple-breadcrumb__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.apple-breadcrumb__item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-breadcrumb__link {
  font-size: 14px;
  color: #007AFF;
  text-decoration: none;
  transition: color 0.15s ease;
}

.apple-breadcrumb__link:hover {
  color: #0051D5;
  text-decoration: underline;
}

.apple-breadcrumb__current {
  font-size: 14px;
  color: #6E6E73;
  font-weight: 500;
}

.apple-breadcrumb__separator {
  color: #A1A1A6;
  margin-left: 4px;
}
</style>
