<template>
  <div class="loans-page">
    <div class="page-header">
      <h1 class="page-title">Préstamos al Personal</h1>
      <button class="btn btn-primary" @click="showModal = true">➕ Nuevo Préstamo</button>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card contracts">
        <div class="stat-value">{{ loans.length }}</div>
        <div class="stat-label">Total Préstamos</div>
      </div>
      <div class="stat-card payroll">
        <div class="stat-value">S/ {{ totalDebt.toLocaleString() }}</div>
        <div class="stat-label">Deuda Total</div>
      </div>
      <div class="stat-card employees">
        <div class="stat-value">{{ activeLoans }}</div>
        <div class="stat-label">En Curso</div>
      </div>
      <div class="stat-card overtime">
        <div class="stat-value">{{ paidLoans }}</div>
        <div class="stat-label">Cancelados</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Préstamos Registrados</span>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Cuotas</th>
              <th>Cuota Mensual</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in loans" :key="loan.id">
              <td>{{ loan.employeeName }}</td>
              <td>{{ loan.tipo }}</td>
              <td>S/ {{ loan.monto.toFixed(2) }}</td>
              <td>{{ loan.cuotas }}</td>
              <td>S/ {{ loan.cuotaMensual.toFixed(2) }}</td>
              <td>S/ {{ loan.saldo.toFixed(2) }}</td>
              <td>
                <span :class="['status-badge', loan.estado === 'Activo' ? 'status-active' : 'status-pending']">
                  {{ loan.estado }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-info" @click="viewLoan(loan)">Ver</button>
                <button class="btn btn-sm btn-success" style="margin-left: 8px;" @click="payInstallment(loan)">Pagar Cuota</button>
              </td>
            </tr>
            <tr v-if="loans.length === 0">
              <td colspan="8" class="empty-state">
                <p>No hay préstamos registrados</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Nuevo Préstamo</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Empleado</label>
              <select v-model="form.employeeId" class="form-input">
                <option value="">Seleccionar empleado</option>
                <option value="1">Juan Pérez García</option>
                <option value="2">María López Martínez</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo de Préstamo</label>
              <select v-model="form.tipo" class="form-input">
                <option value="Liquidación">Por Liquidación</option>
                <option value="Quita">Quita</option>
                <option value="Adicional">Adicional</option>
                <option value="Emergencia">Emergencia</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Monto (S/)</label>
              <input type="number" v-model="form.monto" class="form-input" placeholder="5000" />
            </div>
            <div class="form-group">
              <label class="form-label">Número de Cuotas</label>
              <input type="number" v-model="form.cuotas" class="form-input" min="1" max="24" placeholder="6" />
            </div>
            <div class="form-group">
              <label class="form-label">Tasa Interés (%)</label>
              <input type="number" v-model="form.interes" class="form-input" min="0" max="10" placeholder="5" />
            </div>
            <div class="form-group">
              <label class="form-label">Fecha Inicio</label>
              <input type="date" v-model="form.fecha" class="form-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveLoan">Crear Préstamo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const showModal = ref(false)
const form = ref({
  employeeId: '',
  tipo: 'Liquidación',
  monto: 5000,
  cuotas: 6,
  interes: 5,
  fecha: new Date().toISOString().split('T')[0]
})

const loans = ref([
  { id: '1', employeeName: 'Juan Pérez García', tipo: 'Liquidación', monto: 5000, cuotas: 6, cuotaMensual: 875, saldo: 3500, estado: 'Activo' },
  { id: '2', employeeName: 'María López Martínez', tipo: 'Emergencia', monto: 2000, cuotas: 4, cuotaMensual: 512.50, saldo: 0, estado: 'Cancelado' },
  { id: '3', employeeName: 'Carlos Rodríguez', tipo: 'Quita', monto: 8000, cuotas: 10, cuotaMensual: 848, saldo: 5088, estado: 'Activo' }
])

const totalDebt = computed(() => loans.value.filter(l => l.estado === 'Activo').reduce((sum, l) => sum + l.saldo, 0))
const activeLoans = computed(() => loans.value.filter(l => l.estado === 'Activo').length)
const paidLoans = computed(() => loans.value.filter(l => l.estado === 'Cancelado').length)

const viewLoan = (loan: any) => {
  alert(`Detalle del préstamo:\n\nEmpleado: ${loan.employeeName}\nTipo: ${loan.tipo}\nMonto: S/ ${loan.monto}\nCuotas: ${loan.cuotas}\nCuota Mensual: S/ ${loan.cuotaMensual}\nSaldo: S/ ${loan.saldo}\nEstado: ${loan.estado}`)
}

const payInstallment = (loan: any) => {
  if (loan.saldo > 0) {
    loan.saldo -= loan.cuotaMensual
    if (loan.saldo <= 0) {
      loan.saldo = 0
      loan.estado = 'Cancelado'
    }
    alert(`Cuota pagada. Nuevo saldo: S/ ${loan.saldo.toFixed(2)}`)
  }
}

const saveLoan = () => {
  const montoTotal = parseFloat(form.value.monto.toString())
  const cuotas = parseInt(form.value.cuotas.toString())
  const interes = parseFloat(form.value.interes.toString())
  const montoInteres = montoTotal * (interes / 100)
  const total = montoTotal + montoInteres
  const cuotaMensual = total / cuotas
  
  loans.value.unshift({
    id: Date.now().toString(),
    employeeName: 'Juan Pérez García',
    tipo: form.value.tipo,
    monto: total,
    cuotas,
    cuotaMensual,
    saldo: total,
    estado: 'Activo'
  })
  
  showModal.value = false
  form.value = { employeeId: '', tipo: 'Liquidación', monto: 5000, cuotas: 6, interes: 5, fecha: new Date().toISOString().split('T')[0] }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-secondary { background: #6b7280; color: white; }
.btn-success { background: #10b981; color: white; }
.btn-info { background: #06b6d4; color: white; }
.btn-sm { padding: 6px 12px; font-size: 12px; }

.status-active { background: #dcfce7; color: #166534; }
.status-pending { background: #dbeafe; color: #1e40af; }

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
  max-width: 600px;
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
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
</style>
