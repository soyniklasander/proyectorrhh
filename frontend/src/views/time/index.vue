<template>
  <div class="time-module">
    <PageHeader title="Tiempo y Asistencia" subtitle="Control de asistencia, horas extras, vacaciones y permisos">
      <template #extra>
        <div class="module-actions">
          <n-button type="primary" @click="activeTab = 'attendance'">
            📍 Asistencia
          </n-button>
          <n-button type="warning" @click="activeTab = 'overtime'">
            ⏰ Horas Extras
          </n-button>
          <n-button type="success" @click="activeTab = 'vacations'">
            🏖️ Vacaciones
          </n-button>
          <n-button type="info" @click="activeTab = 'permits'">
            📋 Permisos
          </n-button>
        </div>
      </template>
    </PageHeader>

    <div class="module-tabs">
      <n-tabs v-model:value="activeTab" type="line" size="large">
        <n-tab-pane name="attendance" tab="📍 Asistencia">
          <AttendanceList />
        </n-tab-pane>
        <n-tab-pane name="overtime" tab="⏰ Horas Extras">
          <div class="overtime-actions" style="margin-bottom: 16px;">
            <n-space>
              <n-button type="primary" @click="$router.push('/time/overtime/import')">
                📥 Importar Excel
              </n-button>
              <n-button type="info" @click="$router.push('/time/overtime/review')">
                👁️ Revisión
              </n-button>
              <n-button @click="$router.push('/time/overtime/settings')">
                ⚙️ Configuración
              </n-button>
            </n-space>
          </div>
          <OvertimeList />
        </n-tab-pane>
        <n-tab-pane name="vacations" tab="🏖️ Vacaciones">
          <VacationsList />
        </n-tab-pane>
        <n-tab-pane name="permits" tab="📋 Permisos">
          <PermitsList />
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NTabPane } from 'naive-ui'

import PageHeader from '@/components/shared/PageHeader.vue'
import AttendanceList from './AttendanceList.vue'
import OvertimeList from './OvertimeList.vue'
import VacationsList from './VacationsList.vue'
import PermitsList from './PermitsList.vue'

const activeTab = ref('attendance')
</script>

<style scoped>
.time-module {
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
