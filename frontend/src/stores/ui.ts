import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const scopeMode = ref<'HOLDING' | 'FISCAL'>('HOLDING')
  const selectedLegalEntityId = ref<string | null>(null)

  const setScope = (mode: 'HOLDING' | 'FISCAL') => {
    scopeMode.value = mode
    if (mode === 'HOLDING') {
      selectedLegalEntityId.value = null
    }
  }

  const setLegalEntity = (id: string) => {
    scopeMode.value = 'FISCAL'
    selectedLegalEntityId.value = id
  }

  return { scopeMode, selectedLegalEntityId, setScope, setLegalEntity }
})
