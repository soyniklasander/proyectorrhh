<template>
  <div class="apple-table-wrapper">
    <table class="apple-table" :class="{ 'apple-table--striped': striped, 'apple-table--bordered': bordered }">
      <thead v-if="showHeader">
        <tr>
          <th 
            v-for="col in columns" 
            :key="col.key"
            :class="{ 'apple-table__cell--sortable': col.sortable }"
            :style="{ width: col.width, textAlign: col.align || 'left' }"
            @click="col.sortable && handleSort(col)"
          >
            <div class="apple-table__th-content">
              {{ col.title }}
              <span v-if="col.sortable" class="apple-table__sort-icon">
                <n-icon v-if="sortKey === col.key" :component="sortOrder === 'asc' ? ArrowUp : ArrowDown" size="14" />
                <n-icon v-else :component="SwapVertical" size="14" />
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="apple-table__loading">
            <AppleLoading text="Cargando..." />
          </td>
        </tr>
        <tr v-else-if="data.length === 0">
          <td :colspan="columns.length" class="apple-table__empty">
            <AppleEmptyState description="No hay datos disponibles" />
          </td>
        </tr>
        <tr 
          v-else
          v-for="(row, index) in data" 
          :key="index"
          class="apple-table__row"
          :class="{ 'apple-table__row--clickable': clickable }"
          @click="clickable && $emit('row-click', row, index)"
        >
          <td 
            v-for="col in columns" 
            :key="col.key"
            :style="{ textAlign: col.align || 'left' }"
          >
            <template v-if="col.render">
              <component :is="renderCell(col, row, index)" />
            </template>
            <template v-else>
              {{ row[col.key] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="pagination && data.length > 0" class="apple-table__pagination">
      <span class="apple-table__pagination-info">
        Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, total) }} de {{ total }}
      </span>
      <div class="apple-table__pagination-controls">
        <button 
          class="apple-table__page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <n-icon :component="ChevronBackOutline" size="16" />
        </button>
        <span class="apple-table__page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="apple-table__page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <n-icon :component="ChevronForwardOutline" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NIcon } from 'naive-ui'
import { ArrowUp, ArrowDown, SwapVertical, ChevronBackOutline, ChevronForwardOutline } from '@vicons/ionicons5'
import AppleLoading from './AppleLoading.vue'
import AppleEmptyState from './AppleEmptyState.vue'

interface Column {
  title: string
  key: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (row: any, index: number) => any
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  striped?: boolean
  bordered?: boolean
  showHeader?: boolean
  clickable?: boolean
  pagination?: boolean
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  striped: false,
  bordered: false,
  showHeader: true,
  clickable: false,
  pagination: false,
  pageSize: 10,
})

const emit = defineEmits<{
  'row-click': [row: any, index: number]
}>()

const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

const total = computed(() => props.data.length)
const totalPages = computed(() => Math.ceil(total.value / props.pageSize))

const handleSort = (col: Column) => {
  if (sortKey.value === col.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = col.key
    sortOrder.value = 'asc'
  }
}

const renderCell = (col: Column, row: any, index: number) => {
  if (col.render) {
    const result = col.render(row, index)
    // If render function returns a primitive (string/number), wrap it in a VNode
    // This prevents <component :is="..."> from trying to use it as a tag name
    if (typeof result === 'string' || typeof result === 'number' || typeof result === 'boolean') {
      return h('span', {}, String(result))
    }
    return result
  }
  return h('span', {}, row[col.key])
}
</script>

<style scoped>
.apple-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.apple-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-table th,
.apple-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #E8E8ED;
}

.apple-table th {
  font-size: 13px;
  font-weight: 600;
  color: #86868B;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: #F5F5F7;
}

.apple-table th:first-child {
  border-radius: 10px 0 0 0;
}

.apple-table th:last-child {
  border-radius: 0 10px 0 0;
}

.apple-table__th-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.apple-table__cell--sortable {
  cursor: pointer;
  user-select: none;
}

.apple-table__cell--sortable:hover {
  color: #007AFF;
}

.apple-table__sort-icon {
  color: #A1A1A6;
}

.apple-table td {
  font-size: 14px;
  color: #1D1D1F;
}

.apple-table__row:hover {
  background: rgba(0, 122, 255, 0.02);
}

.apple-table--striped tbody tr:nth-child(even) {
  background: #FAFAFA;
}

.apple-table__row--clickable {
  cursor: pointer;
}

.apple-table__loading,
.apple-table__empty {
  padding: 60px 20px;
  text-align: center;
}

.apple-table__pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #E8E8ED;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-table__pagination-info {
  font-size: 14px;
  color: #86868B;
}

.apple-table__pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.apple-table__page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #E8E8ED;
  background: #FFFFFF;
  border-radius: 8px;
  cursor: pointer;
  color: #1D1D1F;
  transition: all 0.15s ease;
}

.apple-table__page-btn:hover:not(:disabled) {
  border-color: #007AFF;
  color: #007AFF;
}

.apple-table__page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.apple-table__page-info {
  font-size: 14px;
  color: #1D1D1F;
  font-weight: 500;
}
</style>
