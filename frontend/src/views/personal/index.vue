<template>
  <AppleContainer>
    <!-- Header -->
    <ApplePageHeader
      title="Gestión de Personal"
      subtitle="Administración completa de empleados y contratos"
    >
      <template #actions>
        <AppleButton 
          :variant="activeTab === 'personal' ? 'primary' : 'secondary'"
          @click="activeTab = 'personal'"
        >
          Lista de Personal
        </AppleButton>
        <AppleButton 
          :variant="activeTab === 'contracts' ? 'primary' : 'secondary'"
          @click="activeTab = 'contracts'"
        >
          Contratos
        </AppleButton>
        <AppleButton 
          :variant="activeTab === 'onboarding' ? 'primary' : 'secondary'"
          @click="activeTab = 'onboarding'"
        >
          Nuevo Ingreso
        </AppleButton>
        <AppleButton 
          :variant="activeTab === 'desvinculacion' ? 'primary' : 'secondary'"
          @click="activeTab = 'desvinculacion'"
        >
          Desvinculación
        </AppleButton>
      </template>
    </ApplePageHeader>

    <!-- Content based on active tab -->
    <div class="tab-content">
      <PersonalList v-if="activeTab === 'personal'" />
      <ContractsList v-else-if="activeTab === 'contracts'" />
      <OnboardingWizard v-else-if="activeTab === 'onboarding'" />
      <DesvinculacionList v-else-if="activeTab === 'desvinculacion'" />
      <DocumentosList v-else-if="activeTab === 'documentos'" />
    </div>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  AppleContainer,
  ApplePageHeader,
  AppleButton
} from '@/components/apple'

import PersonalList from './PersonalList.vue'
import ContractsList from './ContractsList.vue'
import OnboardingWizard from './OnboardingWizard.vue'
import DesvinculacionList from './DesvinculacionList.vue'
import DocumentosList from './DocumentosList.vue'

const activeTab = ref('personal')
</script>

<style scoped>
.tab-content {
  margin-top: 24px;
}
</style>
