<template>
  <div class="personal-module">
    <PageHeader title="Gestión de Personal" subtitle="Administración completa de empleados y contratos">
      <template #extra>
        <div class="module-actions">
          <n-button type="primary" @click="activeTab = 'personal'">
            Lista de Personal
          </n-button>
          <n-button type="success" @click="activeTab = 'contracts'">
            Contratos
          </n-button>
          <n-button type="info" @click="activeTab = 'onboarding'">
            Nuevo Ingreso
          </n-button>
          <n-button type="warning" @click="activeTab = 'desvinculacion'">
            Desvinculación
          </n-button>
        </div>
      </template>
    </PageHeader>

    <div class="module-tabs">
      <n-tabs v-model:value="activeTab" type="line" size="large">
        <n-tab-pane name="personal" tab="Personal">
          <PersonalList />
        </n-tab-pane>
        <n-tab-pane name="contracts" tab="Contratos">
          <ContractsList />
        </n-tab-pane>
        <n-tab-pane name="onboarding" tab="Onboarding">
          <OnboardingWizard />
        </n-tab-pane>
        <n-tab-pane name="desvinculacion" tab="Desvinculación">
          <DesvinculacionList />
        </n-tab-pane>
        <n-tab-pane name="documentos" tab="Documentos">
          <DocumentosList />
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NTabPane } from 'naive-ui'

import PageHeader from '@/components/shared/PageHeader.vue'
import PersonalList from './PersonalList.vue'
import ContractsList from './ContractsList.vue'
import OnboardingWizard from './OnboardingWizard.vue'
import DesvinculacionList from './DesvinculacionList.vue'
import DocumentosList from './DocumentosList.vue'

const activeTab = ref('personal')
</script>

<style scoped>
.personal-module {
  padding: 24px;
}

.module-actions {
  display: flex;
  gap: 12px;
}

.module-tabs {
  margin-top: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>