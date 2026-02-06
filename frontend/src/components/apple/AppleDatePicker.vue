<template>
  <div class="apple-datepicker-wrapper">
    <div 
      class="apple-datepicker" 
      :class="{ 
        'apple-datepicker--focused': isOpen,
        'apple-datepicker--error': error,
        'apple-datepicker--disabled': disabled 
      }"
      @click="toggleOpen"
    >
      <div class="apple-datepicker__value">
        <span v-if="formattedValue" class="apple-datepicker__selected">{{ formattedValue }}</span>
        <span v-else class="apple-datepicker__placeholder">{{ placeholder }}</span>
      </div>
      <n-icon class="apple-datepicker__icon" :component="CalendarOutline" size="18" />
    </div>
    
    <transition name="apple-datepicker-dropdown">
      <div v-if="isOpen" class="apple-datepicker__dropdown" v-click-outside="close">
        <div class="apple-datepicker__header">
          <button class="apple-datepicker__nav" @click.stop="prevMonth">
            <n-icon :component="ChevronBackOutline" size="18" />
          </button>
          <span class="apple-datepicker__month">{{ currentMonthYear }}</span>
          <button class="apple-datepicker__nav" @click.stop="nextMonth">
            <n-icon :component="ChevronForwardOutline" size="18" />
          </button>
        </div>
        
        <div class="apple-datepicker__days-header">
          <span v-for="day in weekDays" :key="day" class="apple-datepicker__day-name">{{ day }}</span>
        </div>
        
        <div class="apple-datepicker__days">
          <button
            v-for="(date, idx) in calendarDays"
            :key="idx"
            class="apple-datepicker__day"
            :class="{
              'apple-datepicker__day--other-month': !date.currentMonth,
              'apple-datepicker__day--selected': isSelected(date.date),
              'apple-datepicker__day--today': isToday(date.date)
            }"
            @click.stop="selectDate(date.date)"
          >
            {{ date.day }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon } from 'naive-ui'
import { CalendarOutline, ChevronBackOutline, ChevronForwardOutline } from '@vicons/ionicons5'

interface Props {
  modelValue: Date | number | null
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Seleccionar fecha',
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
}>()

// Normalizar modelValue a Date
const normalizedDate = computed(() => {
  if (!props.modelValue) return null
  if (typeof props.modelValue === 'number') {
    return new Date(props.modelValue)
  }
  return props.modelValue
})

const isOpen = ref(false)
const currentDate = ref(new Date())

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const formattedValue = computed(() => {
  if (!normalizedDate.value) return ''
  return normalizedDate.value.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()
  
  const days = []
  
  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      day: prevMonthDays - i,
      currentMonth: false
    })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      day: i,
      currentMonth: true
    })
  }
  
  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      day: i,
      currentMonth: false
    })
  }
  
  return days
})

const toggleOpen = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const close = () => {
  isOpen.value = false
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const isSelected = (date: Date) => {
  if (!normalizedDate.value) return false
  return date.toDateString() === normalizedDate.value.toDateString()
}

const isToday = (date: Date) => {
  return date.toDateString() === new Date().toDateString()
}

const selectDate = (date: Date) => {
  emit('update:modelValue', date)
  close()
}

const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    (el as any)._clickOutside = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', (el as any)._clickOutside)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', (el as any)._clickOutside)
  },
}
</script>

<style scoped>
.apple-datepicker-wrapper {
  position: relative;
  width: 100%;
}

.apple-datepicker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  background: #F5F5F7;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-datepicker:hover {
  background: #FFFFFF;
  border-color: #D2D2D7;
}

.apple-datepicker--focused {
  background: #FFFFFF;
  border-color: #007AFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
}

.apple-datepicker--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apple-datepicker__value {
  flex: 1;
  min-width: 0;
}

.apple-datepicker__selected {
  font-size: 16px;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-datepicker__placeholder {
  font-size: 16px;
  color: #A1A1A6;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-datepicker__icon {
  color: #86868B;
  margin-left: 8px;
}

.apple-datepicker__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
  padding: 16px;
  z-index: 1000;
  width: 280px;
}

.apple-datepicker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.apple-datepicker__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #6E6E73;
  transition: all 0.15s ease;
}

.apple-datepicker__nav:hover {
  background: #F5F5F7;
  color: #1D1D1F;
}

.apple-datepicker__month {
  font-size: 15px;
  font-weight: 600;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-datepicker__days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.apple-datepicker__day-name {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #86868B;
  padding: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.apple-datepicker__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.apple-datepicker__day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  transition: all 0.15s ease;
}

.apple-datepicker__day:hover:not(.apple-datepicker__day--selected) {
  background: #F5F5F7;
}

.apple-datepicker__day--other-month {
  color: #A1A1A6;
}

.apple-datepicker__day--selected {
  background: #007AFF;
  color: #FFFFFF;
}

.apple-datepicker__day--today:not(.apple-datepicker__day--selected) {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  font-weight: 600;
}

.apple-datepicker-dropdown-enter-active,
.apple-datepicker-dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-datepicker-dropdown-enter-from,
.apple-datepicker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
