<template>
  <div class="apple-tabs">
    <div class="apple-tabs__list">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="apple-tabs__tab"
        :class="{ 'apple-tabs__tab--active': modelValue === tab.value }"
        @click="selectTab(tab.value)"
      >
        <n-icon v-if="tab.icon" :component="tab.icon" size="16" />
        <span>{{ tab.label }}</span>
      </button>
    </div>
    <div class="apple-tabs__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import type { Component } from 'vue'

interface Tab {
  label: string
  value: string
  icon?: Component
}

interface Props {
  modelValue: string
  tabs: Tab[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectTab = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.apple-tabs {
  width: 100%;
}

.apple-tabs__list {
  display: inline-flex;
  background: #F5F5F7;
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.apple-tabs__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6E6E73;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-tabs__tab:hover {
  color: #1D1D1F;
}

.apple-tabs__tab--active {
  background: #FFFFFF;
  color: #1D1D1F;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.apple-tabs__content {
  margin-top: 24px;
}
</style>
