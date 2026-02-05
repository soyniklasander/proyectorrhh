<template>
  <div class="benefits-list">
    <div class="header-actions">
      <div>
        <h1 class="page-title">Beneficios y Descuentos</h1>
        <p class="subtitle">Gestión de conceptos adicionales de planilla.</p>
      </div>

      <div class="controls">
        <n-button type="primary" @click="showBenefitModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nuevo Concepto
        </n-button>
      </div>
    </div>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="benefits" tab="Beneficios">
        <n-card :bordered="false" class="table-card">
          <template #header>
            <div class="card-header">
              <span>Beneficios Registrados</span>
              <n-input
                v-model:value="searchBenefit"
                placeholder="Buscar..."
                style="width: 250px"
                clearable
              />
            </div>
          </template>

          <n-data-table
            :columns="benefitColumns"
            :data="filteredBenefits"
            :loading="loading"
            :pagination="pagination"
            :bordered="false"
            :row-key="(row: Benefit) => row.id"
          />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="deductions" tab="Descuentos">
        <n-card :bordered="false" class="table-card">
          <template #header>
            <div class="card-header">
              <span>Descuentos Registrados</span>
              <n-input
                v-model:value="searchDeduction"
                placeholder="Buscar..."
                style="width: 250px"
                clearable
              />
            </div>
          </template>

          <n-data-table
            :columns="deductionColumns"
            :data="filteredDeductions"
            :loading="loading"
            :pagination="pagination"
            :bordered="false"
            :row-key="(row: Deduction) => row.id"
          />
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="employees" tab="Asignaciones por Empleado">
        <n-card :bordered="false" class="table-card">
          <template #header>
            <div class="card-header">
              <span>Conceptos Asignados por Empleado</span>
              <n-button size="small" @click="showAssignmentModal = true">
                <template #icon><n-icon><PersonAddOutline /></n-icon></template>
                Asignar Concepto
              </n-button>
            </div>
          </template>

          <n-data-table
            :columns="assignmentColumns"
            :data="employeeConcepts"
            :loading="loading"
            :pagination="pagination"
            :bordered="false"
            :row-key="(row: EmployeeConcept) => row.id"
          />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showBenefitModal" style="width: 500px" preset="card" :title="editingBenefit ? 'Editar Concepto' : 'Nuevo Concepto'">
      <n-form ref="benefitFormRef" :model="benefitForm" :rules="benefitRules" label-placement="top">
        <n-form-item label="Tipo" path="type">
          <n-radio-group v-model:value="benefitForm.type">
            <n-radio value="BENEFICIO">Beneficio</n-radio>
            <n-radio value="DESCUENTO">Descuento</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="Nombre" path="name">
          <n-input v-model:value="benefitForm.name" placeholder="Nombre del concepto" />
        </n-form-item>

        <n-form-item label="Código" path="code">
          <n-input v-model:value="benefitForm.code" placeholder="Código único" />
        </n-form-item>

        <n-form-item label="Descripción">
          <n-input v-model:value="benefitForm.description" type="textarea" :rows="2" placeholder="Descripción..." />
        </n-form-item>

        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="Monto" path="amount">
              <n-input-number v-model:value="benefitForm.amount" :precision="2" :min="0" style="width: 100%">
                <template #prefix>S/</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Tipo de Monto" path="amountType">
              <n-select
                v-model:value="benefitForm.amountType"
                :options="[
                  { label: 'Fijo', value: 'FIJO' },
                  { label: 'Porcentaje', value: 'PORCENTAJE' }
                ]"
              />
            </n-form-item>
          </n-gi>
        </n-grid>

        <n-form-item label="Frecuencia" path="frequency">
          <n-select
            v-model:value="benefitForm.frequency"
            :options="[
              { label: 'Mensual', value: 'MENSUAL' },
              { label: 'Quincenal', value: 'QUINCENAL' },
              { label: 'Única vez', value: 'UNICA' }
            ]"
          />
        </n-form-item>

        <n-form-item label="Estado">
          <n-switch v-model:value="benefitForm.active" />
        </n-form-item>
      </n-form>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="closeBenefitModal">Cancelar</n-button>
          <n-button type="primary" :loading="saving" @click="saveBenefit">
            {{ editingBenefit ? 'Actualizar' : 'Crear' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showAssignmentModal" style="width: 500px" preset="card" title="Asignar Concepto a Empleado">
      <n-form ref="assignmentFormRef" :model="assignmentForm" :rules="assignmentRules" label-placement="top">
        <n-form-item label="Empleado" path="employeeId">
          <n-select
            v-model:value="assignmentForm.employeeId"
            :options="employeeOptions"
            filterable
            placeholder="Seleccionar empleado"
          />
        </n-form-item>

        <n-form-item label="Concepto" path="conceptId">
          <n-select
            v-model:value="assignmentForm.conceptId"
            :options="conceptOptions"
            placeholder="Seleccionar concepto"
          />
        </n-form-item>

        <n-form-item label="Monto Específico (opcional)">
          <n-input-number
            v-model:value="assignmentForm.customAmount"
            :precision="2"
            :min="0"
            style="width: 100%"
          >
            <template #prefix>S/</template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="Fecha Inicio">
          <n-date-picker v-model:value="assignmentForm.startDate" type="date" style="width: 100%" />
        </n-form-item>

        <n-form-item label="Fecha Fin (opcional)">
          <n-date-picker v-model:value="assignmentForm.endDate" type="date" style="width: 100%" />
        </n-form-item>

        <n-form-item label="Observaciones">
          <n-input v-model:value="assignmentForm.observation" type="textarea" :rows="2" />
        </n-form-item>
      </n-form>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="showAssignmentModal = false">Cancelar</n-button>
          <n-button type="primary" :loading="saving" @click="saveAssignment">
            Asignar
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NInput, NDataTable, NModal, NForm, NFormItem,
  NInputNumber, NSelect, NRadioGroup, NRadio, NSwitch, NGrid, NGi, NDivider,
  NTabs, NTabPane, useMessage, type DataTableColumns
} from 'naive-ui'
import {
  AddOutline, PersonAddOutline, CreateOutline, TrashOutline, BusinessOutline
} from '@vicons/ionicons5'
import { api } from '@/services/api'

interface Benefit {
  id: string
  name: string
  code: string
  type: 'BENEFICIO' | 'DESCUENTO'
  description: string
  amount: number
  amountType: 'FIJO' | 'PORCENTAJE'
  frequency: string
  active: boolean
  createdAt: string
}

interface Deduction {
  id: string
  name: string
  code: string
  type: 'DESCUENTO'
  description: string
  amount: number
  amountType: 'FIJO' | 'PORCENTAJE'
  frequency: string
  active: boolean
  createdAt: string
}

interface EmployeeConcept {
  id: string
  employeeId: string
  employeeName: string
  conceptId: string
  conceptName: string
  conceptType: string
  amount: number
  startDate: string
  endDate?: string
  status: 'ACTIVO' | 'INACTIVO' | 'VENCIDO'
}

const message = useMessage()
const activeTab = ref('benefits')
const loading = ref(false)
const saving = ref(false)
const benefits = ref<Benefit[]>([])
const deductions = ref<Deduction[]>([])
const employeeConcepts = ref<EmployeeConcept[]>([])
const searchBenefit = ref('')
const searchDeduction = ref('')

const showBenefitModal = ref(false)
const showAssignmentModal = ref(false)
const editingBenefit = ref<Benefit | null>(null)

const benefitForm = ref({
  type: 'BENEFICIO' as 'BENEFICIO' | 'DESCUENTO',
  name: '',
  code: '',
  description: '',
  amount: 0,
  amountType: 'FIJO',
  frequency: 'MENSUAL',
  active: true
})

const assignmentForm = ref({
  employeeId: '',
  conceptId: '',
  customAmount: null as number | null,
  startDate: Date.now(),
  endDate: null as number | null,
  observation: ''
})

const employeeOptions = ref<{ label: string; value: string }[]>([])
const conceptOptions = ref<{ label: string; value: string }[]>([])

const benefitRules = {
  type: { required: true },
  name: { required: true, message: 'Ingrese nombre' },
  code: { required: true, message: 'Ingrese código' },
  amount: { required: true, type: 'number', min: 0 }
}

const assignmentRules = {
  employeeId: { required: true, message: 'Seleccione empleado' },
  conceptId: { required: true, message: 'Seleccione concepto' }
}

const pagination = { pageSize: 10 }

const formatMoney = (val: number) =>
  val?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'

const formatDate = (val: string) =>
  val ? new Date(val).toLocaleDateString('es-PE') : '-'

const filteredBenefits = computed(() =>
  benefits.value.filter(b =>
    b.name.toLowerCase().includes(searchBenefit.value.toLowerCase()) ||
    b.code.toLowerCase().includes(searchBenefit.value.toLowerCase())
  )
)

const filteredDeductions = computed(() =>
  deductions.value.filter(d =>
    d.name.toLowerCase().includes(searchDeduction.value.toLowerCase()) ||
    d.code.toLowerCase().includes(searchDeduction.value.toLowerCase())
  )
)

const benefitColumns: DataTableColumns<Benefit> = [
  { title: 'Código', key: 'code', width: 100 },
  { title: 'Nombre', key: 'name', width: 200 },
  {
    title: 'Monto',
    key: 'amount',
    width: 120,
    render: (row) => {
      const prefix = row.amountType === 'PORCENTAJE' ? '%' : 'S/'
      return `${prefix}${row.amountType === 'PORCENTAJE' ? row.amount : formatMoney(row.amount)}`
    }
  },
  { title: 'Frecuencia', key: 'frequency', width: 120 },
  {
    title: 'Estado',
    key: 'active',
    width: 100,
    render: (row) => h('span', {
      style: {
        color: row.active ? '#10b981' : '#ef4444',
        fontWeight: 600
      }
    }, row.active ? 'Activo' : 'Inactivo')
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 120,
    render: (row) => h('div', { style: 'display: flex; gap: 8px' }, [
      h(
        NButton,
        { size: 'small', secondary: true, onClick: () => editBenefit(row) },
        { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }
      ),
      h(
        NButton,
        { size: 'small', secondary: true, type: 'error', onClick: () => deleteBenefit(row) },
        { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) }
      )
    ])
  }
]

const deductionColumns: DataTableColumns<Deduction> = [
  { title: 'Código', key: 'code', width: 100 },
  { title: 'Nombre', key: 'name', width: 200 },
  {
    title: 'Monto',
    key: 'amount',
    width: 120,
    render: (row) => {
      const prefix = row.amountType === 'PORCENTAJE' ? '%' : 'S/'
      return `${prefix}${row.amountType === 'PORCENTAJE' ? row.amount : formatMoney(row.amount)}`
    }
  },
  { title: 'Frecuencia', key: 'frequency', width: 120 },
  {
    title: 'Estado',
    key: 'active',
    width: 100,
    render: (row) => h('span', {
      style: {
        color: row.active ? '#10b981' : '#ef4444',
        fontWeight: 600
      }
    }, row.active ? 'Activo' : 'Inactivo')
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 120,
    render: (row) => h('div', { style: 'display: flex; gap: 8px' }, [
      h(
        NButton,
        { size: 'small', secondary: true, onClick: () => editBenefit(row) },
        { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }
      ),
      h(
        NButton,
        { size: 'small', secondary: true, type: 'error', onClick: () => deleteBenefit(row) },
        { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) }
      )
    ])
  }
]

const assignmentColumns: DataTableColumns<EmployeeConcept> = [
  { title: 'Empleado', key: 'employeeName', fixed: 'left', width: 200 },
  { title: 'Concepto', key: 'conceptName', width: 180 },
  {
    title: 'Tipo',
    key: 'conceptType',
    width: 120,
    render: (row) => h('span', {
      style: { color: row.conceptType === 'BENEFICIO' ? '#10b981' : '#ef4444' }
    }, row.conceptType)
  },
  {
    title: 'Monto',
    key: 'amount',
    width: 120,
    render: (row) => `S/ ${formatMoney(row.amount)}`
  },
  {
    title: 'Inicio',
    key: 'startDate',
    width: 110,
    render: (row) => formatDate(row.startDate)
  },
  {
    title: 'Fin',
    key: 'endDate',
    width: 110,
    render: (row) => row.endDate ? formatDate(row.endDate) : '-'
  },
  {
    title: 'Estado',
    key: 'status',
    width: 110,
    render: (row) => h('span', {
      style: {
        color: row.status === 'ACTIVO' ? '#10b981' : row.status === 'VENCIDO' ? '#ef4444' : '#666'
      }
    }, row.status)
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render: (row) => h(
      NButton,
      { size: 'small', secondary: true, type: 'error', onClick: () => deleteAssignment(row) },
      { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) }
    )
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/payroll/concepts')
    if (data.success) {
      benefits.value = data.data.filter((c: any) => c.type === 'BENEFICIO')
      deductions.value = data.data.filter((c: any) => c.type === 'DESCUENTO')
    }

    const { data: assignmentsData } = await api.get('/payroll/employee-concepts')
    if (assignmentsData.success) {
      employeeConcepts.value = assignmentsData.data
    }
  } catch (error) {
    console.error(error)
    message.error('Error al cargar datos')
  } finally {
    loading.value = false
  }
}

const loadEmployees = async () => {
  try {
    const { data } = await api.get('/employees')
    if (data.success) {
      employeeOptions.value = data.data.map((e: any) => ({
        label: `${e.nombres} ${e.apellidos}`,
        value: e.id
      }))
    }
  } catch (error) {
    console.error(error)
  }
}

const editBenefit = (benefit: Benefit) => {
  editingBenefit.value = benefit
  benefitForm.value = { ...benefit }
  showBenefitModal.value = true
}

const deleteBenefit = (benefit: Benefit) => {
  message.warning(`Eliminando ${benefit.name}`)
}

const deleteAssignment = (assignment: EmployeeConcept) => {
  message.warning(`Eliminando asignación de ${assignment.employeeName}`)
}

const closeBenefitModal = () => {
  showBenefitModal.value = false
  editingBenefit.value = null
  benefitForm.value = {
    type: 'BENEFICIO',
    name: '',
    code: '',
    description: '',
    amount: 0,
    amountType: 'FIJO',
    frequency: 'MENSUAL',
    active: true
  }
}

const saveBenefit = async () => {
  saving.value = true
  try {
    const endpoint = editingBenefit.value ? `/payroll/concepts/${editingBenefit.value.id}` : '/payroll/concepts'
    const method = editingBenefit.value ? 'put' : 'post'
    const { data } = await api[method](endpoint, benefitForm.value)
    if (data.success) {
      message.success(editingBenefit.value ? 'Concepto actualizado' : 'Concepto creado')
      closeBenefitModal()
      loadData()
    }
  } catch (error) {
    message.error('Error al guardar concepto')
  } finally {
    saving.value = false
  }
}

const saveAssignment = async () => {
  saving.value = true
  try {
    const { data } = await api.post('/payroll/employee-concepts', {
      ...assignmentForm.value,
      startDate: new Date(assignmentForm.value.startDate).toISOString(),
      endDate: assignmentForm.value.endDate ? new Date(assignmentForm.value.endDate).toISOString() : null
    })
    if (data.success) {
      message.success('Concepto asignado correctamente')
      showAssignmentModal.value = false
      loadData()
    }
  } catch (error) {
    message.error('Error al asignar concepto')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
  loadEmployees()
})
</script>

<style scoped>
.benefits-list {
  padding: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.controls {
  display: flex;
  gap: 12px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
  margin: 4px 0 0;
}

.table-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
