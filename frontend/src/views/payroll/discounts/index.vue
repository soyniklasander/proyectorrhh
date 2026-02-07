<template>
  <AppleContainer>
    <ApplePageHeader title="Descuentos" subtitle="Administración de descuentos y deducciones">
      <template #actions>
        <AppleButton variant="primary" @click="showEmployeeModal = true">Nuevo Descuento</AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <div class="tabs">
        <button :class="{ active: activeTab === 'employees' }" @click="activeTab = 'employees'">Por Empleado</button>
        <button :class="{ active: activeTab === 'types' }" @click="activeTab = 'types'">Tipos</button>
      </div>

      <div v-if="activeTab === 'employees'" class="tab-content">
        <div class="filters">
          <AppleSearchInput v-model="searchQuery" placeholder="Buscar empleado..." />
          <AppleSelect v-model="typeFilter" :options="typeOptions" placeholder="Tipo" />
        </div>
        <AppleTable :columns="columns" :data="filteredDiscounts" />
      </div>

      <div v-if="activeTab === 'types'" class="tab-content">
        <AppleTable :columns="typeColumns" :data="discountTypes" />
      </div>
    </AppleCard>

    <AppleModal v-model:show="showEmployeeModal" title="Nuevo Descuento" style="width: 550px">
      <div class="form-grid">
        <div class="form-group"><label>Empleado</label><AppleSelect v-model="employeeFormData.empleadoId" :options="employeeOptions" filterable /></div>
        <div class="form-group"><label>Tipo</label><AppleSelect v-model="employeeFormData.tipoDescuentoId" :options="discountTypeOptions" /></div>
        <div class="form-group"><label>Concepto</label><AppleInput v-model="employeeFormData.concepto" /></div>
        <div class="form-group"><label>Monto</label><AppleInput v-model="employeeFormData.montoStr" /></div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showEmployeeModal = false">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="submitting" @click="handleEmployeeSubmit">Guardar</AppleButton>
        </div>
      </template>
    </AppleModal>

    <AppleModal v-model:show="showTypeModal" title="Nuevo Tipo" style="width: 500px">
      <div class="form-grid">
        <div class="form-group"><label>Código</label><AppleInput v-model="typeFormData.codigo" /></div>
        <div class="form-group"><label>Nombre</label><AppleInput v-model="typeFormData.nombre" /></div>
        <div class="form-group"><label>Tipo</label><AppleSelect v-model="typeFormData.tipo" :options="[{ label: 'Porcentual', value: 'PORCENTUAL' }, { label: 'Fijo', value: 'FIJO' }]" /></div>
        <div class="form-group"><label>Valor</label><AppleInput v-model="typeFormData.valorStr" /></div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showTypeModal = false">Cancelar</AppleButton>
          <AppleButton variant="primary" :loading="typeSubmitting" @click="handleTypeSubmit">Guardar</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTable, AppleSearchInput, AppleSelect, AppleModal, AppleInput } from '@/components/apple'
import payrollService, { type EmployeeDiscount, type DiscountType } from '@/services/payroll.service'

const loading = ref(false)
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

const employeeFormData = ref({ empleadoId: '', tipoDescuentoId: '', concepto: '', monto: 0, montoStr: '0', referencias: '' })

interface TypeFormData {
  codigo: string
  nombre: string
  tipo: 'PORCENTUAL' | 'FIJO'
  valor: number
  valorStr: string
  aplicaA: 'SUELDO' | 'HORAS_EXTRAS' | 'VACACIONES' | 'CTS' | 'TODOS'
  obligatorio: boolean
  orden: number
}

const typeFormData = ref<TypeFormData>({ codigo: '', nombre: '', tipo: 'PORCENTUAL', valor: 0, valorStr: '0', aplicaA: 'SUELDO', obligatorio: false, orden: 0 })

watch(() => employeeFormData.value.monto, (val) => { employeeFormData.value.montoStr = String(val) })
watch(() => typeFormData.value.valor, (val) => { typeFormData.value.valorStr = String(val) })

const filteredDiscounts = computed(() => {
  let result = employeeDiscounts.value
  if (searchQuery.value) result = result.filter(d => d.empleadoNombre?.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (typeFilter.value) result = result.filter(d => d.tipoDescuentoId === typeFilter.value)
  return result
})

const typeOptions = [{ label: 'Todos', value: '' }]

const columns = [
  { title: 'Código', key: 'empleadoCodigo' },
  { title: 'Empleado', key: 'empleadoNombre' },
  { title: 'Tipo', key: 'tipoDescuentoNombre' },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Monto', key: 'monto', render: (row: any) => `S/ ${row.monto?.toFixed(2)}` },
  { title: 'Estado', key: 'estado', render: (row: any) => row.estado },
  { title: 'Acciones', key: 'actions', render: (row: any) => h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => deleteDiscount(row) }, () => 'Eliminar') }
]

const typeColumns = [
  { title: 'Código', key: 'codigo' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Tipo', key: 'tipo', render: (row: any) => row.tipo === 'PORCENTUAL' ? `${row.valor}%` : `S/ ${row.valor}` },
  { title: 'Aplica a', key: 'aplicaA', render: (row: any) => row.aplicaA?.replace('_', ' ') },
  { title: 'Obligatorio', key: 'obligatorio', render: (row: any) => row.obligatorio ? 'Sí' : 'No' }
]

const loadEmployeeDiscounts = async () => {
  loading.value = true
  try {
    const { data } = await payrollService.getEmployeeDiscounts({ limit: 100 })
    employeeDiscounts.value = data
    employeeOptions.value = data.map((e: any) => ({ label: `${e.empleadoCodigo} - ${e.empleadoNombre}`, value: e.empleadoId }))
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const loadDiscountTypes = async () => {
  try {
    const { data } = await payrollService.getDiscountTypes()
    discountTypes.value = data
    discountTypeOptions.value = data.map((t: any) => ({ label: t.nombre, value: t.id }))
  } catch (error) { console.error(error) }
}

const handleEmployeeSubmit = async () => {
  submitting.value = true
  try {
    await payrollService.createEmployeeDiscount({ ...employeeFormData.value, monto: Number(employeeFormData.value.montoStr) })
    alert('Descuento creado')
    showEmployeeModal.value = false
    loadEmployeeDiscounts()
  } catch (error) { console.error(error) }
  finally { submitting.value = false }
}

const handleTypeSubmit = async () => {
  typeSubmitting.value = true
  try {
    await payrollService.createDiscountType({ ...typeFormData.value, valor: Number(typeFormData.value.valorStr) })
    alert('Tipo creado')
    showTypeModal.value = false
    loadDiscountTypes()
  } catch (error) { console.error(error) }
  finally { typeSubmitting.value = false }
}

const deleteDiscount = async (discount: EmployeeDiscount) => {
  if (confirm('¿Eliminar?')) {
    await payrollService.deleteEmployeeDiscount(discount.id)
    loadEmployeeDiscounts()
  }
}

onMounted(() => { loadEmployeeDiscounts(); loadDiscountTypes() })
</script>

<style scoped>
.tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 8px; margin-bottom: 16px; }
.tabs button { flex: 1; padding: 10px 16px; border: none; background: transparent; border-radius: 6px; cursor: pointer; font-weight: 500; }
.tabs button.active { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.tab-content { margin-top: 16px; }
.filters { display: flex; gap: 12px; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
</style>
