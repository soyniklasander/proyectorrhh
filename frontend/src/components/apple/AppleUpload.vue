<template>
  <div class="apple-upload" :class="{ 'dragover': isDragover, 'disabled': disabled }">
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
      @change="handleFileChange"
      @click.stop
      class="upload-input"
    />
    
    <div
      class="upload-area"
      :class="{ 'has-files': files.length > 0 }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div v-if="files.length === 0" class="upload-placeholder">
        <div class="upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="upload-text">
          <div class="upload-title">{{ placeholder || 'Arrastra archivos aquí o haz clic para subir' }}</div>
          <div v-if="hint" class="upload-hint">{{ hint }}</div>
        </div>
      </div>
      
      <div v-else class="upload-files">
        <div class="files-header">
          <div class="files-count">{{ files.length }} archivo{{ files.length !== 1 ? 's' : '' }} seleccionado{{ files.length !== 1 ? 's' : '' }}</div>
          <AppleButton size="small" variant="text" @click.stop="clearFiles">
            Limpiar
          </AppleButton>
        </div>
        
        <div class="files-list">
          <div v-for="(file, index) in files" :key="index" class="file-item">
            <div class="file-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 4.66667V12.6667C14 13.403 13.403 14 12.6667 14H3.33333C2.59667 14 2 13.403 2 12.6667V3.33333C2 2.59667 2.59667 2 3.33333 2H9.33333L14 6.66667V4.66667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.3335 2V6.66667H14.0002" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
            <button
              class="file-remove"
              @click.stop="() => removeFile(index)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="maxSize" class="upload-limit">
      Tamaño máximo: {{ formatFileSize(maxSize) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface FileWithPreview extends File {
  preview?: string
}

interface Props {
  modelValue?: FileWithPreview[]
  multiple?: boolean
  accept?: string
  placeholder?: string
  hint?: string
  maxSize?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  accept: '*/*',
  maxSize: 10 * 1024 * 1024, // 10MB default
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [files: FileWithPreview[]]
  'change': [files: FileWithPreview[]]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragover = ref(false)
const files = ref<FileWithPreview[]>(props.modelValue || [])

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const triggerFileInput = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    processFiles(Array.from(input.files))
  }
}

const handleDragOver = (event: DragEvent) => {
  if (!props.disabled) {
    event.preventDefault()
    isDragover.value = true
  }
}

const handleDragLeave = () => {
  isDragover.value = false
}

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return
  
  event.preventDefault()
  isDragover.value = false
  
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    processFiles(Array.from(event.dataTransfer.files))
  }
}

const processFiles = (newFiles: File[]) => {
  const validFiles = newFiles.filter(file => {
    if (file.size > (props.maxSize || 0)) {
      console.warn(`File ${file.name} exceeds maximum size limit`)
      return false
    }
    return true
  })
  
  if (validFiles.length === 0) return
  
  if (props.multiple) {
    files.value = [...files.value, ...validFiles]
  } else {
    files.value = validFiles.slice(0, 1)
  }
  
  emit('update:modelValue', files.value)
  emit('change', files.value)
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
  emit('update:modelValue', files.value)
  emit('change', files.value)
}

const clearFiles = () => {
  files.value = []
  emit('update:modelValue', files.value)
  emit('change', files.value)
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    files.value = newValue
  }
})
</script>

<style scoped>
.apple-upload {
  width: 100%;
}

.apple-upload.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.upload-input {
  display: none;
}

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-surface-primary);
}

.upload-area:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-surface);
}

.upload-area.has-files {
  padding: var(--spacing-4);
  text-align: left;
}

.apple-upload.dragover .upload-area {
  border-color: var(--color-primary);
  background: var(--color-primary-surface);
  transform: scale(1.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.upload-icon {
  color: var(--color-text-secondary);
}

.upload-icon svg {
  width: 48px;
  height: 48px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.upload-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.files-count {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-surface-secondary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
}

.file-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.file-icon svg {
  width: 16px;
  height: 16px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

.file-remove {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-remove:hover {
  color: var(--color-error);
  background: var(--color-error-surface);
}

.file-remove svg {
  width: 16px;
  height: 16px;
}

.upload-limit {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-2);
  text-align: center;
}

.upload-area.has-files + .upload-limit {
  text-align: left;
}
</style>