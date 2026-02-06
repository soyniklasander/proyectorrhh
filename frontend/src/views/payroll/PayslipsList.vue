<template>
  <AppleContainer>
    <ApplePageHeader title="Boletas de Pago" subtitle="Visualización y gestión de recibos de pago">
      <template #actions>
        <AppleSelect v-model="selectedEmployee" placeholder="Filtrar por empleado" :options="employeeOptions" style="width: 300px" />
        <AppleButton variant="secondary" @click="loadPayslips">Actualizar</AppleButton>
        <AppleButton variant="primary" @click="exportAllPayslips">Exportar Todas</AppleButton>
      </template>
    </ApplePageHeader>

    <AppleCard>
      <AppleTable :columns="columns" :data="payslips" />
    </AppleCard>

    <AppleModal v-model:show="showPayslipModal" title="Boleta de Pago" style="width: 700px">
      <div v-if="selectedPayslip" class="payslip-content">
        <div class="payslip-header">
          <div class="company-info">
            <h2>RickERP</h2>
            <p>Sistema de Gestión de Recursos Humanos</p>
          </div>
          <div class="payslip-title">
            <h3>BOLETA DE PAGO</h3>
            <p>{{ selectedPayslip.period }}</p>
          </div>
        </div>

        <div class="employee-section">
          <div class="employee-row">
            <span><strong>{{ selectedPayslip.employeeName }}</strong></span>
            <span>{{ selectedPayslip.dni }}</span>
            <span>{{ selectedPayslip.position }}</span>
            <span>{{ selectedPayslip.department }}</span>
          </div>
        </div>

        <div class="earnings-section">
          <h4>INGRESOS</h4>
          <table class="detail-table">
            <tr><td>Sueldo Básico</td><td class="text-right">S/ {{ selectedPayslip.salarioBase?.toFixed(2) }}</td></tr>
            <tr v-if="selectedPayslip.asignacionFamiliar > 0"><td>Asignación Familiar</td><td class="text-right">S/ {{ selectedPayslip.asignacionFamiliar?.toFixed(2) }}</td></tr>
            <tr v-if="selectedPayslip.horasExtras > 0"><td>Horas Extras</td><td class="text-right">S/ {{ selectedPayslip.horasExtras?.toFixed(2) }}</td></tr>
            <tr v-if="selectedPayslip.bonificaciones > 0"><td>Bonificaciones</td><td class="text-right">S/ {{ selectedPayslip.bonificaciones?.toFixed(2) }}</td></tr>
            <tr class="total-row"><td>TOTAL INGRESOS</td><td class="text-right">S/ {{ selectedPayslip.totalIngresos?.toFixed(2) }}</td></tr>
          </table>
        </div>

        <div class="deductions-section">
          <h4>DESCUENTOS</h4>
          <table class="detail-table">
            <tr><td>AFP</td><td class="text-right text-red">-S/ {{ selectedPayslip.afpDescuento?.toFixed(2) }}</td></tr>
            <tr v-if="selectedPayslip.adelantos > 0"><td>Adelantos</td><td class="text-right text-red">-S/ {{ selectedPayslip.adelantos?.toFixed(2) }}</td></tr>
            <tr v-if="selectedPayslip.prestamos > 0"><td>Préstamos</td><td class="text-right text-red">-S/ {{ selectedPayslip.prestamos?.toFixed(2) }}</td></tr>
            <tr class="total-row"><td>TOTAL DESCUENTOS</td><td class="text-right">-S/ {{ selectedPayslip.totalDescuentos?.toFixed(2) }}</td></tr>
          </table>
        </div>

        <div class="net-section">
          <div class="net-row"><span class="net-label">NETO A PAGAR</span><span class="net-amount">S/ {{ selectedPayslip.netoPagar?.toFixed(2) }}</span></div>
        </div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <AppleButton variant="secondary" @click="showPayslipModal = false">Cerrar</AppleButton>
          <AppleButton variant="primary" @click="downloadPayslip">Descargar</AppleButton>
        </div>
      </template>
    </AppleModal>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppleContainer, ApplePageHeader, AppleCard, AppleButton, AppleTable, AppleSelect, AppleModal } from '@/components/apple'
import { api } from '@/services/api'

interface Payslip {
  id: string
  period: string
  employeeId: string
  employeeName: string
  dni: string
  position: string
  department: string
  salarioBase: number
  asignacionFamiliar: number
  horasExtras: number
  bonificaciones: number
  totalIngresos: number
  afpDescuento: number
  adelantos: number
  prestamos: number
  otrosDescuentos: number
  totalDescuentos: number
  netoPagar: number
}

const loading = ref(false)
const payslips = ref<Payslip[]>([])
const selectedEmployee = ref<string | null>(null)
const showPayslipModal = ref(false)
const selectedPayslip = ref<Payslip | null>(null)
const employeeOptions = ref<{ label: string; value: string }[]>([])

const columns = [
  { title: 'Período', key: 'period' },
  { title: 'Empleado', key: 'employeeName' },
  { title: 'DNI', key: 'dni' },
  { title: 'Básico', key: 'salarioBase', render: (row: any) => `S/ ${row.salarioBase?.toFixed(2)}` },
  { title: 'Ingresos', key: 'totalIngresos', render: (row: any) => `S/ ${row.totalIngresos?.toFixed(2)}` },
  { title: 'Descuentos', key: 'totalDescuentos', render: (row: any) => `S/ ${row.totalDescuentos?.toFixed(2)}` },
  { title: 'Neto', key: 'netoPagar', render: (row: any) => `S/ ${row.netoPagar?.toFixed(2)}` },
  { title: 'Acciones', key: 'actions', render: (row: any) => h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => openPayslip(row) }, () => 'Ver') }
]

const loadPayslips = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (selectedEmployee.value) params.append('employeeId', selectedEmployee.value)
    const { data } = await api.get(`/payroll/payslips?${params.toString()}`)
    if (data.success) payslips.value = data.data
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

const loadEmployees = async () => {
  try {
    const { data } = await api.get('/employees')
    if (data.success) employeeOptions.value = data.data.map((e: any) => ({ label: `${e.nombres} ${e.apellidos}`, value: e.id }))
  } catch (error) { console.error(error) }
}

const openPayslip = (payslip: Payslip) => { selectedPayslip.value = payslip; showPayslipModal.value = true }
const downloadPayslip = () => alert('Descargando PDF...')
const exportAllPayslips = () => alert('Exportando todas las boletas...')

onMounted(() => { loadEmployees(); loadPayslips() })
</script>

<style scoped>
.payslip-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.company-info h2 { margin: 0; font-size: 24px; color: #3b82f6; }
.company-info p { margin: 4px 0 0; font-size: 12px; color: #666; }
.payslip-title { text-align: right; }
.payslip-title h3 { margin: 0; font-size: 20px; color: #1f2937; }
.employee-section { margin: 20px 0; }
.employee-row { display: flex; gap: 24px; padding: 12px; background: #f8fafc; border-radius: 8px; }
.earnings-section, .deductions-section { margin: 20px 0; }
.earnings-section h4, .deductions-section h4 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #666; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
.detail-table { width: 100%; border-collapse: collapse; }
.detail-table td { padding: 8px 12px; border-bottom: 1px solid #eee; }
.detail-table .total-row { font-weight: 600; background: #f8fafc; }
.text-right { text-align: right; }
.text-red { color: #ef4444; }
.net-section { margin: 20px 0; padding: 16px; background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%); border-radius: 8px; color: white; text-align: center; }
.net-row { display: flex; justify-content: space-between; align-items: center; }
.net-label { font-size: 14px; font-weight: 500; }
.net-amount { font-size: 32px; font-weight: bold; }
</style>
