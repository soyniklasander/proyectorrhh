<template>
  <AppleContainer>
    <ApplePageHeader title="Liquidaciones" subtitle="Cálculo y generación de liquidaciones">
      <template #actions>
        <AppleButton variant="primary" @click="showCreateModal = true">Nueva Liquidación</AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <div class="tabs">
        <button :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">Pendientes</button>
        <button :class="{ active: activeTab === 'processed' }" @click="activeTab = 'processed'">Procesadas</button>
      </div>

      <div v-if="activeTab === 'pending'">
        <AppleTable :columns="columns" :data="pendingLiquidations" />
      </div>
      <div v-if="activeTab === 'processed'">
        <AppleTable :columns="columns" :data="processedLiquidations" />
      </div>
    </AppleCard>

    <AppleModal v-model:show="showCreateModal" title="Nueva Liquidación" style="width: 500px">
      <div class="form-grid">
        <div class="form-group"><label>Empleado</label><AppleSelect v-model="createFormData.empleadoId" :options="employeeOptions" filterable /></div>
        <div class="form-group"><label>Tipo</label><AppleSelect v-model="createFormData.tipoLiquidacion" :options="tipoOptions" /></div>
        <div class="form-group"><label>Fecha Cese</label><AppleDatePicker v-model="selectedDate" /></div>
        <div class="form-group full"><label>Observación</label><textarea v-model="createFormData.observacion" class="textarea"></textarea></div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showCreateModal = false">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="creating" @click="handleCreate">Crear</AppleButton>
        </div>
      </template>
    </AppleModal>

    <AppleModal v-model:show="showDetailModal" title="Detalle de Liquidación" style="width: 900px">
      <div v-if="selectedLiquidation" class="detail-content">
        <div class="employee-info">
          <strong>{{ selectedLiquidation.empleadoNombre }}</strong>
          <span>{{ selectedLiquidation.empleadoDni }}</span>
          <span>{{ selectedLiquidation.tipoLiquidacion }}</span>
        </div>
        <div class="totals-grid">
          <div class="total-item"><label>Remuneraciones</label><span>S/ {{ selectedLiquidation.conceptos?.remuneracion?.toFixed(2) }}</span></div>
          <div class="total-item"><label>Vacaciones</label><span>S/ {{ selectedLiquidation.conceptos?.vacacionesTruncas?.toFixed(2) }}</span></div>
          <div class="total-item"><label>CTS</label><span>S/ {{ selectedLiquidation.conceptos?.cts?.toFixed(2) }}</span></div>
          <div class="total-item"><label>Gratificación</label><span>S/ {{ selectedLiquidation.conceptos?.gratificacion?.toFixed(2) }}</span></div>
          <div class="total-item"><label>Bruto</label><span>S/ {{ selectedLiquidation.conceptos?.totalBruto?.toFixed(2) }}</span></div>
          <div class="total-item deduction"><label>Descuentos</label><span>-S/ {{ selectedLiquidation.descuentos?.totalDescuentos?.toFixed(2) }}</span></div>
          <div class="total-item highlight"><label>Neto</label><span>S/ {{ selectedLiquidation.totalNeto?.toFixed(2) }}</span></div>
        </div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showDetailModal = false">Cerrar</AppleButton>
          <AppleButton variant="primary" @click="exportLiquidation">Exportar</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTable, AppleSelect, AppleModal, AppleDatePicker } from '@/components/apple'
import payrollService, { type Liquidation, type CreateLiquidationData } from '@/services/payroll.service'

const loading = ref(false)
const creating = ref(false)
const liquidations = ref<Liquidation[]>([])
const pendingLiquidations = ref<Liquidation[]>([])
const processedLiquidations = ref<Liquidation[]>([])
const employeeOptions = ref<{ label: string; value: string }[]>([])
const activeTab = ref('pending')
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedLiquidation = ref<Liquidation | null>(null)

const createFormData = ref<CreateLiquidationData>({ empleadoId: '', tipoLiquidacion: 'RENUNCIA', fechaLiquidacion: '', observacion: '' })
const tipoOptions = [{ label: 'Renuncia', value: 'RENUNCIA' }, { label: 'Despido', value: 'DESPIDO' }, { label: 'Cese', value: 'CESE' }, { label: 'Fin Contrato', value: 'FIN_CONTRATO' }, { label: 'Otro', value: 'OTRO' }]
const selectedDate = ref<Date | null>(null)

const columns = [
  { title: 'Código', key: 'empleadoCodigo' },
  { title: 'Empleado', key: 'empleadoNombre' },
  { title: 'Tipo', key: 'tipoLiquidacion' },
  { title: 'Ingreso', key: 'fechaIngreso', render: (row: any) => row.fechaIngreso },
  { title: 'Cese', key: 'fechaLiquidacion', render: (row: any) => row.fechaLiquidacion },
  { title: 'Días', key: 'diasLaborados' },
  { title: 'Neto', key: 'totalNeto', render: (row: any) => `S/ ${row.totalNeto?.toFixed(2)}` },
  { title: 'Estado', key: 'estado', render: (row: any) => row.estado },
  { title: 'Acciones', key: 'actions', render: (row: any) => h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => viewDetails(row) }, () => 'Ver') }
]

const loadLiquidations = async () => {
  loading.value = true
  try {
    const { data } = await payrollService.getLiquidations({ limit: 200 })
    liquidations.value = data
    pendingLiquidations.value = data.filter((l: any) => ['PENDIENTE', 'CALCULADA'].includes(l.estado))
    processedLiquidations.value = data.filter((l: any) => ['APROBADA', 'PAGADA', 'ANULADA'].includes(l.estado))
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const viewDetails = (liquidation: Liquidation) => { selectedLiquidation.value = liquidation; showDetailModal.value = true }

const handleCreate = async () => {
  creating.value = true
  try {
    if (selectedDate.value) {
      await payrollService.createLiquidation({ ...createFormData.value, fechaLiquidacion: selectedDate.value.toISOString().split('T')[0] })
    } else {
      await payrollService.createLiquidation({ ...createFormData.value })
    }
    alert('Liquidación creada')
    showCreateModal.value = false
    loadLiquidations()
  } catch (error) { console.error(error) }
  finally { creating.value = false }
}

const exportLiquidation = () => alert('Exportando...')

onMounted(() => loadLiquidations())
</script>

<style scoped>
.tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 8px; margin-bottom: 16px; }
.tabs button { flex: 1; padding: 10px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; font-weight: 500; }
.tabs button.active { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: span 2; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical; min-height: 80px; font-family: inherit; }
.employee-info { display: flex; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 16px; }
.employee-info span { color: #666; }
.totals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.total-item { text-align: center; padding: 12px; background: #f8fafc; border-radius: 8px; }
.total-item label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.total-item span { font-size: 18px; font-weight: 600; }
.total-item.deduction span { color: #ef4444; }
.total-item.highlight { background: #10b981; color: white; }
.total-item.highlight label { color: rgba(255,255,255,0.8); }
.total-item.highlight span { color: white; }
</style>

