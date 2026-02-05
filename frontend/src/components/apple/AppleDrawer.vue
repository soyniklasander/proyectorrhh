<template>
  <n-drawer
    v-model:show="showModel"
    :placement="placement"
    :width="drawerWidth"
    class="apple-drawer"
  >
    <n-drawer-content :title="title" :closable="closable">
      <div class="apple-drawer__body">
        <slot />
      </div>
      <template #footer v-if="$slots.footer">
        <div class="apple-drawer__footer">
          <slot name="footer" />
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NDrawer, NDrawerContent } from 'naive-ui'

type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

interface Props {
  show: boolean
  title: string
  placement?: DrawerPlacement
  width?: number
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'right',
  width: 400,
  closable: true,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const showModel = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const drawerWidth = computed(() => {
  if (props.placement === 'top' || props.placement === 'bottom') {
    return undefined
  }
  return props.width
})
</script>

<style scoped>
.apple-drawer :deep(.n-drawer) {
  border-radius: 20px 0 0 20px;
}

.apple-drawer :deep(.n-drawer-header) {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #E8E8ED;
}

.apple-drawer :deep(.n-drawer-header__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-drawer :deep(.n-drawer-body-content-wrapper) {
  padding: 24px;
}

.apple-drawer__body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 15px;
  color: #1D1D1F;
}

.apple-drawer__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #E8E8ED;
}
</style>
