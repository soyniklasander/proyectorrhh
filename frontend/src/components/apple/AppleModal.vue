<template>
  <n-modal
    v-model:show="showModel"
    :preset="preset"
    :style="modalStyle"
    :mask-closable="maskClosable"
    class="apple-modal"
    @update:show="$emit('update:show', $event)"
    @close="$emit('close')"
  >
    <template #header>
      <div class="apple-modal__header">
        <div class="apple-modal__title-section">
          <h3 class="apple-modal__title">{{ title }}</h3>
          <p v-if="subtitle" class="apple-modal__subtitle">{{ subtitle }}</p>
        </div>
        <button v-if="closable" class="apple-modal__close" @click="showModel = false">
          <n-icon :component="CloseOutline" size="20" />
        </button>
      </div>
    </template>
    
    <div class="apple-modal__body">
      <slot />
    </div>
    
    <template #footer v-if="$slots.footer">
      <div class="apple-modal__footer">
        <slot name="footer" />
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NIcon } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'
import type { CSSProperties } from 'vue'

interface Props {
  show: boolean
  title: string
  subtitle?: string
  width?: string | number
  closable?: boolean
  maskClosable?: boolean
  preset?: 'dialog' | 'card'
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  width: 480,
  closable: true,
  maskClosable: true,
  preset: 'card',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

const showModel = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const modalStyle: CSSProperties = {
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  maxWidth: '90vw',
}
</script>

<style scoped>
.apple-modal :deep(.n-card) {
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16);
}

.apple-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 0;
}

.apple-modal__title-section {
  flex: 1;
  padding-right: 16px;
}

.apple-modal__title {
  font-size: 20px;
  font-weight: 600;
  color: #1D1D1F;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-modal__subtitle {
  font-size: 14px;
  color: #86868B;
  margin: 4px 0 0 0;
}

.apple-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #F5F5F7;
  border-radius: 8px;
  cursor: pointer;
  color: #6E6E73;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.apple-modal__close:hover {
  background: #E8E8ED;
  color: #1D1D1F;
}

.apple-modal__body {
  padding: 20px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 15px;
  color: #1D1D1F;
}

.apple-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
}
</style>
