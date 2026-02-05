<template>
  <div class="apple-list">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="apple-list__item"
      :class="{ 'apple-list__item--clickable': clickable, 'apple-list__item--divided': divided }"
      @click="clickable && $emit('item-click', item, index)"
    >
      <slot name="item" :item="item" :index="index" />
    </div>
    <div v-if="data.length === 0" class="apple-list__empty">
      <slot name="empty">
        <AppleEmptyState description="No hay elementos" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppleEmptyState from './AppleEmptyState.vue'

interface Props {
  data: any[]
  clickable?: boolean
  divided?: boolean
}

withDefaults(defineProps<Props>(), {
  clickable: false,
  divided: false,
})

defineEmits<{
  'item-click': [item: any, index: number]
}>()
</script>

<style scoped>
.apple-list {
  display: flex;
  flex-direction: column;
}

.apple-list__item {
  padding: 12px 0;
}

.apple-list__item--clickable {
  cursor: pointer;
}

.apple-list__item--clickable:hover {
  background: rgba(0, 122, 255, 0.02);
}

.apple-list__item--divided + .apple-list__item--divided {
  border-top: 1px solid #E8E8ED;
}

.apple-list__empty {
  padding: 40px 20px;
}
</style>
