<template>
  <div class="loans-page">
    <PageHeader title="Préstamos al Personal" subtitle="Gestión de préstamos y amortizaciones">
      <template #extra>
        <div class="module-actions">
          <n-space>
            <n-input v-model:value="searchQuery" placeholder="Buscar empleado..." clearable style="width: 250px">
              <template #prefix><n-icon><SearchOutline /></n-icon></template>
            </n-input>
            <n-select v-model:value="statusFilter" :options="statusOptions" placeholder="Estado" clearable style="width: 150px" />
            <n-button type="primary" @click="showModal = true">
              <template #icon><n-icon><AddOutline /></n-icon></template>
              Nuevo Préstamo
            </n-button>
          </n-space>
        </div>
      </template>
    </PageHeader>

    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="filteredLoans"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :row-key="(row: Loan) => row.id"
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" title="Nuevo Préstamo" style="width: 600px">
      <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="120px">
        <n-form-item label="Empleado" path="empleadoId">
          <n-select
            v-model:value="formData.empleadoId"
            :options="employeeOptions"
            filterable
            placeholder="Seleccionar empleado"
            @search="searchEmployees"
          />
        </n-form-item>
        <n-form-item label="Monto Total (S/)" path="montoTotal">
          <n-input-number v-model:value="formData.montoTotal" :min="0" :precision="2" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Nº Cuotas" path="cuotasTotales">
          <n-input-number v-model:value="formData.cuotasTotales" :min="1" :max="120" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Tasa Interés (%)" path="tasaInteres">
          <n-input-number v-model:value="formData.tasaInteres" :min="0" :max="100" :precision="2" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Fecha Inicio" path="fechaInicio">
          <n-date-picker v-model:value="formData.fechaInicio" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Motivo" path="motivo">
          <n-input v-model:value="formData.motivo" type="textarea" :rows="3" placeholder="Motivo del préstamo" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">Cancelar</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">Guardar</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showDetails" preset="card" title="Detalle del Préstamo" style="width: 700px">
      <n-descriptions :column="2" label-placement="left" v-if="selectedLoan">
        <n-descriptions-item label="Empleado">{{ selectedLoan.empleadoNombre }}</n-descriptions-item>
        <n-descriptions-item label="Estado">
          <n-tag :type="selectedLoan.estado === 'ACTIVO' ? 'warning' : 'success'" size="small">{{ selectedLoan.estado }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="Monto Total">S/ {{ selectedLoan.montoTotal?.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="Saldo Pendiente">S/ {{ selectedLoan.saldoPendiente?.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="Cuota Mensual">S/ {{ selectedLoan.cuotaMensual?.toFixed(2) }}</n-descriptions-item>
        <n-descriptions-item label="Progreso">{{ selectedLoan.cuotasPagadas }}/{{ selectedLoan.cuotasTotales }}</n-descriptions-item>
        <n-descriptions-item label="Fecha Inicio">{{ formatDate(selectedLoan.fechaInicio) }}</n-descriptions-item>
        <n-descriptions-item label="Tasa Interés">{{ selectedLoan.tasaInteres }}%</n-descriptions-item>
      </n-descriptions>
      
      <n-divider>Cronograma de Cuotas</n-divider>
      <n-data-table
        :columns="cuotaColumns"
        :data="loanCuotas"
        :loading="cuotasLoading"
        :bordered="false"
        :max-height="300"
        size="small"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NDataTable, NTag, NSpace, useMessage, NModal, NForm, NFormItem,
  NInputNumber, NInput, NDatePicker, NSelect, NDescriptions, NDescriptionsItem, NDivider,
  NInputGroup, type DataTableColumns, type FormRules
} from 'naive-ui'
import {
  AddOutline, EyeOutline, SearchOutline, CheckmarkCircleOutline, TimeOutline, CloseCircleOutline
} from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'
import payrollService, { type Loan, type LoanCuota } from '@/services/payroll.service'

const message = useMessage()
const loading = ref(false)
const submitting = ref(false)
const loans = ref<Loan[]>([])
const loanCuotas = ref<LoanCuota[]>([])
const cuotasLoading = ref(false)

const searchQuery = ref('')
const statusFilter = ref<string | null>(null)
const showModal = ref(false)
const showDetails = ref(false)
const selectedLoan = ref<Loan | null>(null)

const pagination = { pageSize: 10 }

const formData = ref({
  empleadoId: '',
  montoTotal: 0,
  cuotasTotales: 12,
  tasaInteres: 0,
  fechaInicio: Date.now(),
  motivo: ''
})

const formRules: FormRules = {
  empleadoId: { required: true, message: 'Seleccione un empleado' },
  montoTotal: { required: true, type: 'number', min: 1, message: 'Ingrese un monto válido' },
  cuotasTotales: { required: true, type: 'number', min: 1, message: 'Ingrese número de cuotas' },
  fechaInicio: { required: true, type: 'number', message: 'Seleccione fecha de inicio' }
}

const employeeOptions = ref<{ label: string; value: string }[]>([])

const statusOptions = [
  { label: 'Activo', value: 'ACTIVO' },
  { label: 'Cancelado', value: 'CANCELADO' },
  { label: 'Anulado', value: 'ANULADO' }
]

const filteredLoans = computed(() => {
  let result = loans.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(l => 
      l.empleadoNombre?.toLowerCase().includes(query) ||
      l.empleadoCodigo?.toLowerCase().includes(query)
    )
  }
  if (statusFilter.value) {
    result = result.filter(l => l.estado === statusFilter.value)
  }
  return result
})

const columns: DataTableColumns<Loan> = [
  { title: 'Código', key: 'empleadoCodigo', width: 100 },
  { title: 'Empleado', key: 'empleadoNombre', width: 200 },
  { title: 'Monto Total', key: 'montoTotal', width: 130, render: (row) => `S/ ${row.montoTotal?.toFixed(2)}` },
  { title: 'Saldo', key: 'saldoPendiente', width: 130, render: (row) => `S/ ${row.saldoPendiente?.toFixed(2)}` },
  { title: 'Cuota', key: 'cuotaMensual', width: 100, render: (row) => `S/ ${row.cuotaMensual?.toFixed(2)}` },
  { title: 'Progreso', key: 'progreso', width: 120, render: (row) => `${row.cuotasPagadas}/${row.cuotasTotales}` },
  {
    title: 'Estado',
    key: 'estado',
    width: 110,
    render: (row) => h(NTag, { 
      type: row.estado === 'ACTIVO' ? 'warning' : row.estado === 'CANCELADO' ? 'success' : 'default', 
      size: 'small' 
    }, () => row.estado)
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 120,
    render: (row) => h(NSpace, { size: 'small' }, () => [
      h(NButton, { size: 'small', secondary: true, onClick: () => viewDetails(row) }, { 
        icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) 
      })
    ])
  }
]

const cuotaColumns: DataTableColumns<LoanCuota> = [
  { title: 'Cuota', key: 'numeroCuota', width: 70, render: (row) => `#${row.numeroCuota}` },
  { title: 'Monto', key: 'montoCuota', width: 100, render: (row) => `S/ ${row.montoCuota?.toFixed(2)}` },
  { title: 'Vencimiento', key: 'fechaVencimiento', width: 120, render: (row) => formatDate(row.fechaVencimiento) },
  { title: 'Pagado', key: 'montoPagado', width: 100, render: (row) => `S/ ${row.montoPagado?.toFixed(2)}` },
  {
    title: 'Estado',
    key: 'estado',
    width: 100,
    render: (row) => {
      const icon = row.estado === 'PAGADA' ? CheckmarkCircleOutline : 
                   row.estado === 'VENCIDA' ? TimeOutline : TimeOutline
      const type = row.estado === 'PAGADA' ? 'success' : row.estado === 'VENCIDA' ? 'error' : 'warning'
      return h(NTag, { type, size: 'small' }, () => row.estado)
    }
  }
]

const formatDate = (date: string | number) => {
  if (!date) return '-'
  const d = typeof date === 'number' ? new Date(date) : new Date(date)
  return d.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const searchEmployees = async (query: string) => {
  if (query.length < 2) return
  try {
    const { data } = await payrollService.getEmployeeDiscounts({ limit: 50 })
    employeeOptions.value = data.map(e => ({ label: `${e.empleadoCodigo} - ${e.empleadoNombre}`, value: e.empleadoId }))
  } catch (e) {
    console.error(e)
  }
}

const loadLoans = async () => {
  loading.value = true
  try {
    const { data } = await payrollService.getLoans({ limit: 100 })
    loans.value = data
  } catch (error) {
    console.error(error)
    message.error('Error al cargar préstamos')
  } finally {
    loading.value = false
  }
}

const viewDetails = async (loan: Loan) => {
  selectedLoan.value = loan
  showDetails.value = true
  cuotasLoading.value = true
  try {
    const { data } = await payrollService.getLoanCuotas(loan.id)
    loanCuotas.value = data
  } catch (error) {
    console.error(error)
    message.error('Error al cargar cuotas')
  } finally {
    cuotasLoading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await payrollService.createLoan({
      ...formData.value,
      fechaInicio: new Date(formData.value.fechaInicio).toISOString()
    })
    message.success('Préstamo creado correctamente')
    showModal.value = false
    loadLoans()
  } catch (error) {
    console.error(error)
    message.error('Error al crear préstamo')
  } finally {
    submitting.value = false
  }
}

onMounted(() => { loadLoans() })
</script>

<style scoped>
.loans-page { padding: 0; }
.module-actions { display: flex; gap: 12px; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
</style>
