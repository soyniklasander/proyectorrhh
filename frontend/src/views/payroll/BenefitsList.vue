<template>
  <AppleCard>
    <div class="header-actions">
      <div>
        <h3 class="page-title">Beneficios y Descuentos</h3>
        <p class="subtitle">Gestión de conceptos adicionales de planilla.</p>
      </div>
      <AppleButton variant="primary" @click="showBenefitModal = true">Nuevo Concepto</AppleButton>
    </div>

    <div class="tabs-container">
      <div class="tabs">
        <button :class="{ active: activeTab === 'benefits' }" @click="activeTab = 'benefits'">Beneficios</button>
        <button :class="{ active: activeTab === 'deductions' }" @click="activeTab = 'deductions'">Descuentos</button>
        <button :class="{ active: activeTab === 'employees' }" @click="activeTab = 'employees'">Asignaciones</button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'benefits'" class="tab-panel">
          <div class="card-header"><span>Beneficios Registrados</span><AppleSearchInput v-model="searchBenefit" placeholder="Buscar..." /></div>
          <AppleTable :columns="benefitColumns" :data="filteredBenefits" />
        </div>
        <div v-if="activeTab === 'deductions'" class="tab-panel">
          <div class="card-header"><span>Descuentos Registrados</span><AppleSearchInput v-model="searchDeduction" placeholder="Buscar..." /></div>
          <AppleTable :columns="deductionColumns" :data="filteredDeductions" />
        </div>
        <div v-if="activeTab === 'employees'" class="tab-panel">
          <div class="card-header"><span>Conceptos por Empleado</span><AppleButton variant="secondary" size="small" @click="showAssignmentModal = true">Asignar</AppleButton></div>
          <AppleTable :columns="assignmentColumns" :data="employeeConcepts" />
        </div>
      </div>
    </div>

    <AppleModal v-model:show="showBenefitModal" :title="editingBenefit ? 'Editar Concepto' : 'Nuevo Concepto'" style="width: 500px">
      <div class="form-grid">
        <div class="form-group"><label>Tipo</label><AppleSelect v-model="benefitForm.type" :options="typeOptions" /></div>
        <div class="form-group"><label>Nombre</label><AppleInput v-model="benefitForm.name" /></div>
        <div class="form-group"><label>Código</label><AppleInput v-model="benefitForm.code" /></div>
        <div class="form-group full"><label>Descripción</label><textarea v-model="benefitForm.description" class="textarea"></textarea></div>
        <div class="form-group"><label>Monto</label><AppleInput v-model="benefitForm.amountStr" @update:model-value="(val) => benefitForm.amount = Number(val) || 0" /></div>
        <div class="form-group"><label>Frecuencia</label><AppleSelect v-model="benefitForm.frequency" :options="frequencyOptions" /></div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="closeBenefitModal">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="saving" @click="saveBenefit">{{ editingBenefit ? 'Actualizar' : 'Crear' }}</AppleButton>
        </div>
      </template>
    </AppleModal>

    <AppleModal v-model:show="showAssignmentModal" title="Asignar Concepto" style="width: 500px">
      <div class="form-grid">
        <div class="form-group"><label>Empleado</label><AppleSelect v-model="assignmentForm.employeeId" :options="employeeOptions" filterable /></div>
        <div class="form-group"><label>Concepto</label><AppleSelect v-model="assignmentForm.conceptId" :options="conceptOptions" /></div>
        <div class="form-group"><label>Monto</label><AppleInput v-model="assignmentForm.customAmountStr" @update:model-value="(val) => assignmentForm.customAmount = val ? Number(val) : null" /></div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showAssignmentModal = false">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="saving" @click="saveAssignment">Asignar</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AppleCard, AppleButton, AppleSearchInput, AppleTable, AppleModal, AppleInput, AppleSelect } from '@/components/apple'
import { api } from '@/services/api'

interface Benefit { id: string; name: string; code: string; type: string; description: string; amount: number; frequency: string; active: boolean }
interface EmployeeConcept { id: string; employeeName: string; conceptName: string; conceptType: string; amount: number; status: string }

const activeTab = ref('benefits')
const saving = ref(false)
const benefits = ref<Benefit[]>([])
const deductions = ref<Benefit[]>([])
const employeeConcepts = ref<EmployeeConcept[]>([])
const searchBenefit = ref('')
const searchDeduction = ref('')
const showBenefitModal = ref(false)
const showAssignmentModal = ref(false)
const editingBenefit = ref<Benefit | null>(null)

const benefitForm = ref({
  type: 'BENEFICIO', name: '', code: '', description: '', amount: 0, amountStr: '0', frequency: 'MENSUAL', active: true
})

const assignmentForm = ref({
  employeeId: '', conceptId: '', customAmount: null as number | null, customAmountStr: ''
})

const typeOptions = [{ label: 'Beneficio', value: 'BENEFICIO' }, { label: 'Descuento', value: 'DESCUENTO' }]
const frequencyOptions = [{ label: 'Mensual', value: 'MENSUAL' }, { label: 'Quincenal', value: 'QUINCENAL' }]
const employeeOptions = ref<{ label: string; value: string }[]>([])
const conceptOptions = ref<{ label: string; value: string }[]>([])

const filteredBenefits = computed(() => benefits.value.filter(b => b.name.toLowerCase().includes(searchBenefit.value.toLowerCase())))
const filteredDeductions = computed(() => deductions.value.filter(d => d.name.toLowerCase().includes(searchDeduction.value.toLowerCase())))

const benefitColumns = [
  { title: 'Código', key: 'code' },
  { title: 'Nombre', key: 'name' },
  { title: 'Monto', key: 'amount', render: (row: any) => `S/ ${row.amount.toFixed(2)}` },
  { title: 'Estado', key: 'active', render: (row: any) => row.active ? 'Activo' : 'Inactivo' },
  { title: 'Acciones', key: 'actions', render: (row: any) => h('div', { style: 'display: flex; gap: 8px' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => editBenefit(row) }, () => 'Editar'), h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => deleteBenefit(row) }, () => 'Eliminar')]) }
]

const deductionColumns = [
  { title: 'Código', key: 'code' },
  { title: 'Nombre', key: 'name' },
  { title: 'Monto', key: 'amount', render: (row: any) => `S/ ${row.amount.toFixed(2)}` },
  { title: 'Estado', key: 'active', render: (row: any) => row.active ? 'Activo' : 'Inactivo' },
  { title: 'Acciones', key: 'actions', render: (row: any) => h('div', { style: 'display: flex; gap: 8px' }, [h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => editBenefit(row) }, () => 'Editar'), h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => deleteBenefit(row) }, () => 'Eliminar')]) }
]

const assignmentColumns = [
  { title: 'Empleado', key: 'employeeName' },
  { title: 'Concepto', key: 'conceptName' },
  { title: 'Tipo', key: 'conceptType' },
  { title: 'Monto', key: 'amount', render: (row: any) => `S/ ${row.amount.toFixed(2)}` },
  { title: 'Estado', key: 'status' },
  { title: 'Acciones', key: 'actions', render: (row: any) => h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => deleteAssignment(row) }, () => 'Eliminar') }
]

watch(() => benefitForm.value.amount, (val) => { benefitForm.value.amountStr = String(val) })
watch(() => assignmentForm.value.customAmount, (val) => { assignmentForm.value.customAmountStr = val ? String(val) : '' })

const loadData = async () => {
  try {
    const { data } = await api.get('/payroll/concepts')
    if (data.success) {
      benefits.value = data.data.filter((c: any) => c.type === 'BENEFICIO')
      deductions.value = data.data.filter((c: any) => c.type === 'DESCUENTO')
    }
    const { data: aData } = await api.get('/payroll/employee-concepts')
    if (aData.success) employeeConcepts.value = aData.data
  } catch (error) { console.error(error) }
}

const loadOptions = async () => {
  try {
    const { data } = await api.get('/employees')
    if (data.success) employeeOptions.value = data.data.map((e: any) => ({ label: `${e.nombres} ${e.apellidos}`, value: e.id }))
    const { data: cData } = await api.get('/payroll/concepts')
    if (cData.success) conceptOptions.value = cData.data.map((c: any) => ({ label: `${c.code} - ${c.name}`, value: c.id }))
  } catch (error) { console.error(error) }
}

const saveBenefit = async () => {
  saving.value = true
  try {
    if (editingBenefit.value) await api.put(`/payroll/concepts/${editingBenefit.value.id}`, benefitForm.value)
    else await api.post('/payroll/concepts', benefitForm.value)
    showBenefitModal.value = false
    loadData()
  } catch (error) { console.error(error) }
  finally { saving.value = false }
}

const saveAssignment = async () => {
  saving.value = true
  try {
    await api.post('/payroll/employee-concepts', { employeeId: assignmentForm.value.employeeId, conceptId: assignmentForm.value.conceptId, customAmount: assignmentForm.value.customAmount })
    showAssignmentModal.value = false
    loadData()
  } catch (error) { console.error(error) }
  finally { saving.value = false }
}

const editBenefit = (benefit: Benefit) => {
  editingBenefit.value = benefit
  benefitForm.value = { ...benefit, amountStr: String(benefit.amount) }
  showBenefitModal.value = true
}

const deleteBenefit = async (benefit: Benefit) => { if (confirm('¿Eliminar?')) { await api.delete(`/payroll/concepts/${benefit.id}`); loadData() }}
const deleteAssignment = async (a: EmployeeConcept) => { if (confirm('¿Eliminar?')) { await api.delete(`/payroll/employee-concepts/${a.id}`); loadData() }}
const closeBenefitModal = () => { showBenefitModal.value = false; editingBenefit.value = null; benefitForm.value = { type: 'BENEFICIO', name: '', code: '', description: '', amount: 0, amountStr: '0', frequency: 'MENSUAL', active: true }}

onMounted(() => { loadData(); loadOptions() })
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
.subtitle { color: var(--color-text-secondary); font-size: 14px; }
.header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.tabs-container { margin-top: 24px; }
.tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 8px; margin-bottom: 16px; }
.tabs button { flex: 1; padding: 10px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; font-weight: 500; }
.tabs button.active { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.tab-panel { background: white; border-radius: 8px; padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-weight: 500; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: span 2; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical; min-height: 60px; font-family: inherit; }
</style>
