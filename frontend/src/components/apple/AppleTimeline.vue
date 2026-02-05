<template>
  <div class="apple-timeline">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="apple-timeline__item"
      :class="{
        'apple-timeline__item--completed': item.completed,
        'apple-timeline__item--active': index === current
      }"
    >
      <div class="apple-timeline__marker">
        <div class="apple-timeline__dot">
          <n-icon v-if="item.completed" :component="CheckmarkOutline" size="12" />
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div v-if="index < items.length - 1" class="apple-timeline__line"></div>
      </div>
      <div class="apple-timeline__content">
        <div class="apple-timeline__header">
          <span class="apple-timeline__title">{{ item.title }}</span>
          <span v-if="item.time" class="apple-timeline__time">{{ item.time }}</span>
        </div>
        <div v-if="item.description" class="apple-timeline__description">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CheckmarkOutline } from '@vicons/ionicons5'

interface TimelineItem {
  title: string
  description?: string
  time?: string
  completed?: boolean
}

interface Props {
  items: TimelineItem[]
  current?: number
}

withDefaults(defineProps<Props>(), {
  current: 0,
})
</script>

<style scoped>
.apple-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.apple-timeline__item {
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;
}

.apple-timeline__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.apple-timeline__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E8E8ED;
  color: #6E6E73;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.apple-timeline__item--completed .apple-timeline__dot {
  background: #34C759;
  color: #FFFFFF;
}

.apple-timeline__item--active .apple-timeline__dot {
  background: #007AFF;
  color: #FFFFFF;
}

.apple-timeline__line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: #E8E8ED;
  margin-top: 8px;
}

.apple-timeline__item--completed .apple-timeline__line {
  background: #34C759;
}

.apple-timeline__content {
  flex: 1;
  padding-top: 4px;
}

.apple-timeline__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.apple-timeline__title {
  font-size: 15px;
  font-weight: 600;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-timeline__time {
  font-size: 12px;
  color: #A1A1A6;
  flex-shrink: 0;
}

.apple-timeline__description {
  font-size: 14px;
  color: #6E6E73;
  line-height: 1.5;
}
</style>
