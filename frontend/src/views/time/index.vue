<template>
  <AppleContainer>
    <ApplePageHeader
      title="Tiempo y Asistencia"
      subtitle="Control de asistencia, horas extras, vacaciones y permisos"
    >
      <template #actions>
        <AppleButton variant="primary" :icon="MapPinIcon" @click="activeTab = 'attendance'">
          📍 Asistencia
        </AppleButton>
        <AppleButton variant="secondary" :icon="ClockIcon" @click="activeTab = 'overtime'">
          ⏰ Horas Extras
        </AppleButton>
        <AppleButton variant="secondary" :icon="SunIcon" @click="activeTab = 'vacations'">
          🏖️ Vacaciones
        </AppleButton>
        <AppleButton variant="secondary" :icon="FileTextIcon" @click="activeTab = 'permits'">
          📋 Permisos
        </AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <div v-if="activeTab === 'attendance'">
        <AttendanceList />
      </div>
      
      <div v-else-if="activeTab === 'overtime'">
        <div class="overtime-actions" style="margin-bottom: 16px;">
          <AppleButton variant="primary" :icon="DownloadIcon" @click="$router.push('/time/overtime/import')">
            📥 Importar Excel
          </AppleButton>
          <AppleButton variant="secondary" :icon="EyeIcon" @click="$router.push('/time/overtime/review')">
            👁️ Revisión
          </AppleButton>
          <AppleButton variant="secondary" :icon="SettingsIcon" @click="$router.push('/time/overtime/settings')">
            ⚙️ Configuración
          </AppleButton>
        </div>
        <OvertimeList />
      </div>
      
      <div v-else-if="activeTab === 'vacations'">
        <VacationsList />
      </div>
      
      <div v-else-if="activeTab === 'permits'">
        <PermitsList />
      </div>
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  AppleContainer,
  ApplePageHeader,
  AppleButton,
  AppleCard
} from '@/components/apple'
import { 
  MapPin, Clock, Sun, FileText, 
  Download, Eye, Settings 
} from 'lucide-vue-next'
import AttendanceList from './AttendanceList.vue'
import OvertimeList from './OvertimeList.vue'
import VacationsList from './VacationsList.vue'
import PermitsList from './PermitsList.vue'

const MapPinIcon = MapPin
const ClockIcon = Clock
const SunIcon = Sun
const FileTextIcon = FileText
const DownloadIcon = Download
const EyeIcon = Eye
const SettingsIcon = Settings

const activeTab = ref('attendance')
</script>
