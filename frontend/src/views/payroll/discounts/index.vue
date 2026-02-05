<template>
  <div class="discounts-page">
    <PageHeader title="Descuentos" subtitle="Administración de descuentos y deducciones">
      <template #extra>
        <n-button type="primary" @click="showEmployeeModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nuevo Descuento
        </n-button>
      </template>
    </PageHeader>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="employees" tab="Descuentos por Empleado">
        <n-card :bordered="false" class="table-card">
          <template #header>
            <n-space>
              <n-input v-model:value="searchQuery" placeholder="Buscar empleado..." clearable style="width: 250px">
                <template #prefix><n-icon><SearchOutline /></n-icon></template>
              </n-input>
              <n-select v-model:value="typeFilter" :options="typeOptions" placeholder="Tipo" clearable style="width: 180px" />
            </n-space>
          </template>
          <n-data-table
            :columns="columns"
            :data="filteredDiscounts"
            :loading="loading"
            :pagination="pagination"
            :bordered="false"
            :row-key="(row: EmployeeDiscount) => row.id"
          />
        </n-card>
      </n-tab-pane>
      <n-tab-pane name="types" tab="Tipos de Descuento">
        <n-card :bordered="false" class="table-card">
          <template #header-extra>
            <n-button type="primary" size="small" @click="showTypeModal = true">
              <template #icon><n-icon><AddOutline /></n-icon></template>
              Nuevo Tipo
            </n-button>
          </template>
          <n-data-table
            :columns="typeColumns"
            :data="discountTypes"
            :loading="typesLoading"
            :bordered="false"
            :row-key="(row: DiscountType) => row.id"
          />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showEmployeeModal" preset="card" title="Nuevo Descuento por Empleado" style="width: 550px">
      <n-form ref="formRef" :model="employeeFormData" :rules="employeeFormRules" label-placement="left" label-width="120px">
        <n-form-item label="Empleado" path="empleadoId">
          <n-select
            v-model:value="employeeFormData.empleadoId"
            :options="employeeOptions"
            filterable
            placeholder="Seleccionar empleado"
          />
        </n-form-item>
        <n-form-item label="Tipo" path="tipoDescuentoId">
          <n-select
            v-model:value="employeeFormData.tipoDescuentoId"
            :options="discountTypeOptions"
            placeholder="Seleccionar tipo"
          />
        </n-form-item>
        <n-form-item label="Concepto" path="concepto">
          <n-input v-model:value="employeeFormData.concepto" placeholder="Descripción del descuento" />
        </n-form-item>
        <n-form-item label="Monto (S/)" path="monto">
          <n-input-number v-model:value="employeeFormData.monto" :min="0" :precision="2" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Referencias" path="referencias">
          <n-input v-model:value="employeeFormData.referencias" type="textarea" :rows="2" placeholder="Documento de referencia" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEmployeeModal = false">Cancelar</n-button>
          <n-button type="primary" @click="handleEmployeeSubmit" :loading="submitting">Guardar</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showTypeModal" preset="card" title="Nuevo Tipo de Descuento" style="width: 500px">
      <n-form :model="typeFormData" label-placement="left" label-width="120px">
        <n-form-item label="Código" path="codigo">
          <n-input v-model:value="typeFormData.codigo" placeholder="Código único" />
        </n-form-item>
        <n-form-item label="Nombre" path="nombre">
          <n-input v-model:value="typeFormData.nombre" placeholder="Nombre del descuento" />
        </n-form-item>
        <n-form-item label="Tipo">
          <n-radio-group v-model:value="typeFormData.tipo">
            <n-radio value="PORCENTUAL">Porcentual</n-radio>
            <n-radio value="FIJO">Fijo</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="Valor" path="valor">
          <n-input-number v-model:value="typeFormData.valor" :min="0" :precision="2" style="width: 100%">
            <template #suffix>{{ typeFormData.tipo === 'PORCENTUAL' ? '%' : 'S/' }}</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="Aplica a">
          <n-select
            v-model:value="typeFormData.aplicaA"
            :options="[
              { label: 'Sueldo', value: 'SUELDO' },
              { label: 'Horas Extras', value: 'HORAS_EXTRAS' },
              { label: 'Vacaciones', value: 'VACACIONES' },
              { label: 'CTS', value: 'CTS' },
              { label: 'Todos', value: 'TODOS' }
            ]"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="Obligatorio">
          <n-switch v-model:value="typeFormData.obligatorio" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showTypeModal = false">Cancelar</n-button>
          <n-button type="primary" @click="handleTypeSubmit" :loading="typeSubmitting">Guardar</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NButton, NIcon, NCard, NDataTable, NTabs, NTabPane, NTag, NSpace, useMessage, NModal, NForm, NFormItem,
  NInputNumber, NInput, NDatePicker, NSelect, NInputGroup, NDivider, NRadio, NRadioGroup, NSwitch,
  type DataTableColumns, type FormRules
} from 'naive-ui'
import {
  AddOutline, SearchOutline, TrashOutline
} from '@vicons/ionicons5'
import PageHeader from '@/components/shared/PageHeader.vue'
import payrollService, { type EmployeeDiscount, type DiscountType } from '@/services/payroll.service'

const message = useMessage()
const loading = ref(false)
const typesLoading = ref(false)
const submitting = ref(false)
const typeSubmitting = ref(false)

const activeTab = ref('employees')
const employeeDiscounts = ref<EmployeeDiscount[]>([])
const discountTypes = ref<DiscountType[]>([])
const employeeOptions = ref<{ label: string; value: string }[]>([])
const discountTypeOptions = ref<{ label: string; value: string }[]>([])

const searchQuery = ref('')
const typeFilter = ref<string | null>(null)
const showEmployeeModal = ref(false)
const showTypeModal = ref(false)

const pagination = { pageSize: 10 }

const employeeFormData = ref({
  empleadoId: '',
  tipoDescuentoId: '',
  concepto: '',
  monto: 0,
  referencias: ''
})

const employeeFormRules: FormRules = {
  empleadoId: { required: true, message: 'Seleccione un empleado' },
  tipoDescuentoId: { required: true, message: 'Seleccione un tipo' },
  concepto: { required: true, message: 'Ingrese un concepto' },
  monto: { required: true, type: 'number', min: 0.01, message: 'Ingrese un monto válido' }
}

const typeFormData = ref({
  codigo: '',
  nombre: '',
  tipo: 'PORCENTUAL' as 'PORCENTUAL' | 'FIJO',
  valor: 0,
  aplicaA: 'SUELDO' as 'SUELDO' | 'HORAS_EXTRAS' | 'VACACIONES' | 'CTS' | 'TODOS',
  obligatorio: false,
  orden: 0
})

const typeOptions = ref<{ label: string; value: string }[]>([])

const filteredDiscounts = computed(() => {
  let result = employeeDiscounts.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(d => 
      d.empleadoNombre?.toLowerCase().includes(query) ||
      d.empleadoCodigo?.toLowerCase().includes(query)
    )
  }
  if (typeFilter.value) {
    result = result.filter(d => d.tipoDescuentoId === typeFilter.value)
  }
  return result
})

const columns: DataTableColumns<EmployeeDiscount> = [
  { title: 'Código', key: 'empleadoCodigo', width: 100 },
  { title: 'Empleado', key: 'empleadoNombre', width: 200 },
  { title: 'Tipo', key: 'tipoDescuentoNombre', width: 150 },
  { title: 'Concepto', key: 'concepto', width: 200 },
  { 
    title: 'Monto', 
    key: 'monto', 
    width: 110, 
    render: (row) => {
      const prefix = row.porcentaje ? `${row.porcentaje}% - ` : 'S/ '
      return `${prefix}${row.monto?.toFixed(2)}`
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 100,
    render: (row) => h(NTag, { 
      type: row.estado === 'ACTIVO' ? 'warning' : row.estado === 'LIQUIDADO' ? 'success' : 'default', 
      size: 'small' 
    }, () => row.estado)
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render: (row) => h(NButton, { 
      size: 'small', 
      type: 'error',
      secondary: true,
      onClick: () => deleteDiscount(row) 
    }, { 
      icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) 
    })
  }
]

const typeColumns: DataTableColumns<DiscountType> = [
  { title: 'Código', key: 'codigo', width: 100 },
  { title: 'Nombre', key: 'nombre', width: 180 },
  { title: 'Tipo', key: 'tipo', width: 110, render: (row) => row.tipo === 'PORCENTUAL' ? `${row.valor}%` : `S/ ${row.valor}` },
  { title: 'Aplica a', key: 'aplicaA', width: 130, render: (row) => row.aplicaA.replace('_', ' ') },
  { 
    title: 'Obligatorio', 
    key: 'obligatorio', 
    width: 100, 
    render: (row) => h(NTag, { type: row.obligatorio ? 'success' : 'default', size: 'small' }, () => row.obligatorio ? 'Sí' : 'No') 
  },
  { 
    title: 'Estado', 
    key: 'activo', 
    width: 80, 
    render: (row) => h(NTag, { type: row.activo ? 'success' : 'default', size: 'small' }, () => row.activo ? 'Sí' : 'No') 
  }
]

const loadEmployeeDiscounts = async () => {
  loading.value = true
  try {
    const { data } = await payrollService.getEmployeeDiscounts({ limit: 100 })
    employeeDiscounts.value = data
    employeeOptions.value = data.map(e => ({ 
      label: `${e.empleadoCodigo} - ${e.empleadoNombre}`, 
      value: e.empleadoId 
    }))
  } catch (error) {
    console.error(error)
    message.error('Error al cargar descuentos')
  } finally {
    loading.value = false
  }
}

const loadDiscountTypes = async () => {
  typesLoading.value = true
  try {
    const { data } = await payrollService.getDiscountTypes()
    discountTypes.value = data
    discountTypeOptions.value = data.map(t => ({ label: t.nombre, value: t.id }))
  } catch (error) {
    console.error(error)
    message.error('Error al cargar tipos de descuento')
  } finally {
    typesLoading.value = false
  }
}

const handleEmployeeSubmit = async () => {
  submitting.value = true
  try {
    await payrollService.createEmployeeDiscount(employeeFormData.value)
    message.success('Descuento creado correctamente')
    showEmployeeModal.value = false
    loadEmployeeDiscounts()
  } catch (error) {
    console.error(error)
    message.error('Error al crear descuento')
  } finally {
    submitting.value = false
  }
}

const handleTypeSubmit = async () => {
  typeSubmitting.value = true
  try {
    await payrollService.createDiscountType(typeFormData.value)
    message.success('Tipo de descuento creado correctamente')
    showTypeModal.value = false
    loadDiscountTypes()
  } catch (error) {
    console.error(error)
    message.error('Error al crear tipo de descuento')
  } finally {
    typeSubmitting.value = false
  }
}

const deleteDiscount = async (discount: EmployeeDiscount) => {
  try {
    await payrollService.deleteEmployeeDiscount(discount.id)
    message.success('Descuento eliminado')
    loadEmployeeDiscounts()
  } catch (error) {
    console.error(error)
    message.error('Error al eliminar descuento')
  }
}

onMounted(() => {
  loadEmployeeDiscounts()
  loadDiscountTypes()
})
</script>

<style scoped>
.discounts-page { padding: 0; }
.table-card { border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
</style>
