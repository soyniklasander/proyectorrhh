<template>
  <div class="payroll-page">
    <div class="page-header">
      <h1 class="page-title">Planilla y Nómina</h1>
      <div class="header-actions">
        <select v-model="selectedMonth" class="form-input month-select">
          <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <button class="btn btn-warning" @click="generatePayroll">📊 Generar Planilla</button>
        <button class="btn btn-success" @click="exportExcel">📥 Exportar Excel</button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card payroll">
        <div class="stat-value">S/ {{ totalPayroll.toLocaleString() }}</div>
        <div class="stat-label">Total Planilla</div>
      </div>
      <div class="stat-card contracts">
        <div class="stat-value">{{ employeeCount }}</div>
        <div class="stat-label">Empleados</div>
      </div>
      <div class="stat-card employees">
        <div class="stat-value">S/ {{ avgSalary.toLocaleString() }}</div>
        <div class="stat-label">Promedio Sueldo</div>
      </div>
      <div class="stat-card overtime">
        <div class="stat-value">S/ {{ totalDeductions.toLocaleString() }}</div>
        <div class="stat-label">Total Descuentos</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Detalle de Planilla - {{ selectedMonth }}</span>
        <input type="text" v-model="search" placeholder="Buscar empleado..." class="search-input" />
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>DNI</th>
              <th>Haber Básico</th>
              <th>H. Extras</th>
              <th>Bonificaciones</th>
              <th>Total Ingresos</th>
              <th>AFP/ONP</th>
              <th>Otros Desc.</th>
              <th>Neto a Pagar</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredPayroll" :key="row.id">
              <td>{{ row.employeeName }}</td>
              <td>{{ row.dni }}</td>
              <td>S/ {{ row.basico.toFixed(2) }}</td>
              <td>S/ {{ row.horasExtras.toFixed(2) }}</td>
              <td>S/ {{ row.bonificaciones.toFixed(2) }}</td>
              <td><strong>S/ {{ row.totalIngresos.toFixed(2) }}</strong></td>
              <td class="text-danger">-S/ {{ row.afp.toFixed(2) }}</td>
              <td class="text-danger">-S/ {{ row.otrosDescuentos.toFixed(2) }}</td>
              <td class="text-success"><strong>S/ {{ row.neto.toFixed(2) }}</strong></td>
              <td>
                <button class="btn btn-sm btn-info" @click="viewDetail(row)">Ver Boleta</button>
              </td>
            </tr>
            <tr class="total-row">
              <td colspan="2"><strong>TOTAL</strong></td>
              <td><strong>S/ {{ totalBasico.toFixed(2) }}</strong></td>
              <td><strong>S/ {{ totalExtras.toFixed(2) }}</strong></td>
              <td><strong>S/ {{ totalBonos.toFixed(2) }}</strong></td>
              <td><strong>S/ {{ totalIngresos.toFixed(2) }}</strong></td>
              <td><strong>-S/ {{ totalAfp.toFixed(2) }}</strong></td>
              <td><strong>-S/ {{ totalDescuentos.toFixed(2) }}</strong></td>
              <td><strong>S/ {{ totalNeto.toFixed(2) }}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Resumen de Aportes y Descuentos</span>
      </div>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Aporte Empleador (Essalud 9%)</span>
          <span class="summary-value">S/ {{ essaludEmployer.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total AFP (10%)</span>
          <span class="summary-value">S/ {{ totalAfp.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">5ta Categoría</span>
          <span class="summary-value">S/ {{ quintaCategoria.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">SCTR</span>
          <span class="summary-value">S/ {{ sctr.toFixed(2) }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Boleta de Pago</h3>
          <button class="close-btn" @click="showDetailModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="paystub">
            <div class="paystub-header">
              <h4>RRHHMod ERP</h4>
              <p>Boleta de Pago - {{ selectedMonth }}</p>
            </div>
            <div class="paystub-section">
              <h5>Datos del Empleado</h5>
              <p><strong>Nombre:</strong> {{ selectedRow?.employeeName }}</p>
              <p><strong>DNI:</strong> {{ selectedRow?.dni }}</p>
              <p><strong>Cargo:</strong> Desarrollador</p>
            </div>
            <div class="paystub-section">
              <h5>Ingresos</h5>
              <div class="paystub-row">
                <span>Sueldo Básico</span>
                <span>S/ {{ selectedRow?.basico.toFixed(2) }}</span>
              </div>
              <div class="paystub-row">
                <span>Horas Extras</span>
                <span>S/ {{ selectedRow?.horasExtras.toFixed(2) }}</span>
              </div>
              <div class="paystub-row">
                <span>Bonificaciones</span>
                <span>S/ {{ selectedRow?.bonificaciones.toFixed(2) }}</span>
              </div>
              <div class="paystub-row total">
                <span>Total Ingresos</span>
                <span>S/ {{ selectedRow?.totalIngresos.toFixed(2) }}</span>
              </div>
            </div>
            <div class="paystub-section">
              <h5>Descuentos</h5>
              <div class="paystub-row">
                <span>AFP (10%)</span>
                <span>-S/ {{ selectedRow?.afp.toFixed(2) }}</span>
              </div>
              <div class="paystub-row">
                <span>Otros Descuentos</span>
                <span>-S/ {{ selectedRow?.otrosDescuentos.toFixed(2) }}</span>
              </div>
              <div class="paystub-row total">
                <span>Total Descuentos</span>
                <span>-S/ {{ (selectedRow?.afp + selectedRow?.otrosDescuentos).toFixed(2) }}</span>
              </div>
            </div>
            <div class="paystub-section net">
              <div class="paystub-row">
                <span><strong>NETO A PAGAR</strong></span>
                <span><strong>S/ {{ selectedRow?.neto.toFixed(2) }}</strong></span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="printPaystub">🖨️ Imprimir</button>
          <button class="btn btn-secondary" @click="showDetailModal = false">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedMonth = ref('2024-01')
const search = ref('')
const showDetailModal = ref(false)
const selectedRow = ref<any>(null)

const months = [
  { value: '2024-01', label: 'Enero 2024' },
  { value: '2024-02', label: 'Febrero 2024' },
  { value: '2024-03', label: 'Marzo 2024' },
  { value: '2024-04', label: 'Abril 2024' },
  { value: '2024-05', label: 'Mayo 2024' },
  { value: '2024-06', label: 'Junio 2024' }
]

const payrollData = ref([
  { id: '1', employeeName: 'Juan Pérez García', dni: '12345678', basico: 3500, horasExtras: 450, bonificaciones: 200, afp: 350, otrosDescuentos: 50 },
  { id: '2', employeeName: 'María López Martínez', dni: '23456789', basico: 4200, horasExtras: 0, bonificaciones: 300, afp: 420, otrosDescuentos: 0 },
  { id: '3', employeeName: 'Carlos Rodríguez', dni: '34567890', basico: 2800, horasExtras: 600, bonificaciones: 150, afp: 280, otrosDescuentos: 100 },
  { id: '4', employeeName: 'Ana García Sánchez', dni: '45678901', basico: 5100, horasExtras: 0, bonificaciones: 500, afp: 510, otrosDescuentos: 200 }
])

payrollData.value = payrollData.value.map(p => ({
  ...p,
  totalIngresos: p.basico + p.horasExtras + p.bonificaciones,
  neto: p.basico + p.horasExtras + p.bonificaciones - p.afp - p.otrosDescuentos
}))

const filteredPayroll = computed(() => {
  if (!search.value) return payrollData.value
  const s = search.value.toLowerCase()
  return payrollData.value.filter(p => p.employeeName.toLowerCase().includes(s) || p.dni.includes(s))
})

const payrollTotals = computed(() => {
  return payrollData.value.reduce((acc, p) => {
    acc.basico += p.basico
    acc.extras += p.horasExtras
    acc.bonos += p.bonificaciones
    acc.ingresos += p.totalIngresos
    acc.afp += p.afp
    acc.descuentos += p.otrosDescuentos
    acc.neto += p.neto
    return acc
  }, {
    basico: 0,
    extras: 0,
    bonos: 0,
    ingresos: 0,
    afp: 0,
    descuentos: 0,
    neto: 0
  })
})

const employeeCount = computed(() => payrollData.value.length)
const totalPayroll = computed(() => payrollTotals.value.neto)
const avgSalary = computed(() => employeeCount.value ? totalPayroll.value / employeeCount.value : 0)
const totalDeductions = computed(() => payrollTotals.value.afp + payrollTotals.value.descuentos)

const totalBasico = computed(() => payrollTotals.value.basico)
const totalExtras = computed(() => payrollTotals.value.extras)
const totalBonos = computed(() => payrollTotals.value.bonos)
const totalIngresos = computed(() => payrollTotals.value.ingresos)
const totalAfp = computed(() => payrollTotals.value.afp)
const totalDescuentos = computed(() => payrollTotals.value.descuentos)
const totalNeto = computed(() => payrollTotals.value.neto)

const essaludEmployer = computed(() => totalBasico.value * 0.09)
const quintaCategoria = computed(() => totalBasico.value * 0.08)
const sctr = computed(() => totalBasico.value * 0.01)

const generatePayroll = () => {
  alert('Planilla generada para ' + selectedMonth.value)
}

const exportExcel = () => {
  alert('Exportando a Excel...')
}

const viewDetail = (row: any) => {
  selectedRow.value = row
  showDetailModal.value = true
}

const printPaystub = () => {
  window.print()
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.month-select {
  width: 150px;
}

.search-input {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 250px;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-warning { background: #f59e0b; color: white; }
.btn-success { background: #10b981; color: white; }
.btn-primary { background: #3b82f6; color: white; }
.btn-secondary { background: #6b7280; color: white; }
.btn-sm { padding: 6px 12px; font-size: 12px; }

.text-danger { color: #dc2626; }
.text-success { color: #16a34a; }

.total-row {
  background: #f8fafc;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}

.paystub {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
}

.paystub-header {
  text-align: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.paystub-section {
  margin-bottom: 16px;
}

.paystub-section h5 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
}

.paystub-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.paystub-row.total {
  font-weight: 600;
  border-bottom: none;
  border-top: 2px solid #eee;
  margin-top: 8px;
  padding-top: 12px;
}

.paystub-section.net {
  background: #f0fdf4;
  margin: 16px -24px -24px;
  padding: 16px 24px;
  border-radius: 0 0 8px 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
</style>
