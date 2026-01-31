<template>
  <div class="overtime-page">
    <div class="page-header">
      <h1 class="page-title">Control de Horas Extras</h1>
      <button class="btn btn-primary" @click="showModal = true">➕ Registrar Horas Extras</button>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card overtime">
        <div class="stat-value">{{ totalHours }}</div>
        <div class="stat-label">Horas Registradas</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <div class="stat-value">S/ {{ totalCost.toLocaleString() }}</div>
        <div class="stat-label">Costo Total</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <div class="stat-value">{{ approvedCount }}</div>
        <div class="stat-label">Aprobadas</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
        <div class="stat-value">{{ pendingCount }}</div>
        <div class="stat-label">Pendientes</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Registro de Horas Extras</span>
        <select v-model="filter" class="filter-select">
          <option value="all">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Fecha</th>
              <th>Horas</th>
              <th>Tipo</th>
              <th>Motivo</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ot in filteredOvertime" :key="ot.id">
              <td>{{ ot.employeeName }}</td>
              <td>{{ ot.fecha }}</td>
              <td>{{ ot.horas }} hrs</td>
              <td>
                <span :class="['type-badge', getTypeClass(ot.tipo)]">{{ ot.tipo }}</span>
              </td>
              <td>{{ ot.motivo }}</td>
              <td>S/ {{ ot.monto.toFixed(2) }}</td>
              <td>
                <span :class="['status-badge', 'status-' + ot.estado.toLowerCase()]">
                  {{ ot.estado }}
                </span>
              </td>
              <td>
                <template v-if="ot.estado === 'Pendiente'">
                  <button class="btn btn-sm btn-success" @click="approveOvertime(ot)">Aprobar</button>
                  <button class="btn btn-sm btn-danger" style="margin-left: 8px;" @click="rejectOvertime(ot)">Rechazar</button>
                </template>
                <button class="btn btn-sm btn-info" @click="viewDetail(ot)">Ver</button>
              </td>
            </tr>
            <tr v-if="filteredOvertime.length === 0">
              <td colspan="8" class="empty-state">
                <p>No hay registros de horas extras</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Registrar Horas Extras</h3>
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
                <option value="3">Carlos Rodríguez</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha</label>
              <input type="date" v-model="form.fecha" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Horas</label>
              <input type="number" v-model="form.horas" class="form-input" min="1" max="12" placeholder="Número de horas" />
            </div>
            <div class="form-group">
              <label class="form-label">Tipo de Hora Extra</label>
              <select v-model="form.tipo" class="form-input">
                <option value="25%">25% (Día laborable)</option>
                <option value="35%">35% (Día laborable > 2hrs)</option>
                <option value="100%">100% (Feriado/Domingo)</option>
              </select>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Motivo</label>
              <textarea v-model="form.motivo" class="form-input" rows="3" placeholder="Describe el motivo de las horas extras..."></textarea>
            </div>
          </div>
          
          <div class="rate-info">
            <h4>Tarifas según normativa peruana</h4>
            <ul>
              <li><strong>25%</strong> - Hora extra en día laborable</li>
              <li><strong>35%</strong> - Hora extra en día laborable (después de 2 horas)</li>
              <li><strong>100%</strong> - Hora extra en feriados o domingos</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveOvertime">Registrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const showModal = ref(false)
const filter = ref('all')

const form = ref({
  employeeId: '',
  fecha: new Date().toISOString().split('T')[0],
  horas: 2,
  tipo: '25%',
  motivo: ''
})

const overtimeData = ref([
  { id: '1', employeeName: 'Juan Pérez García', fecha: '2024-01-15', horas: 3, tipo: '25%', motivo: 'Entrega de proyecto', monto: 131.25, estado: 'Aprobada' },
  { id: '2', employeeName: 'María López Martínez', fecha: '2024-01-16', horas: 2, tipo: '100%', motivo: 'Mantenimiento de servidor', monto: 175, estado: 'Pendiente' },
  { id: '3', employeeName: 'Carlos Rodríguez', fecha: '2024-01-18', horas: 4, tipo: '25%', motivo: 'Corrección de bugs críticos', monto: 175, estado: 'Rechazada' },
  { id: '4', employeeName: 'Ana García Sánchez', fecha: '2024-01-20', horas: 1, tipo: '35%', motivo: 'Atención de incidente', monto: 53.38, estado: 'Aprobada' }
])

const filteredOvertime = computed(() => {
  if (filter.value === 'all') return overtimeData.value
  return overtimeData.value.filter(ot => ot.estado.toLowerCase() === filter.value)
})

const totalHours = computed(() => overtimeData.value.reduce((sum, ot) => sum + ot.horas, 0))
const totalCost = computed(() => overtimeData.value.filter(ot => ot.estado !== 'Rechazada').reduce((sum, ot) => sum + ot.monto, 0))
const approvedCount = computed(() => overtimeData.value.filter(ot => ot.estado === 'Aprobada').length)
const pendingCount = computed(() => overtimeData.value.filter(ot => ot.estado === 'Pendiente').length)

const getTypeClass = (tipo: string) => {
  if (tipo === '100%') return 'type-100'
  if (tipo === '35%') return 'type-35'
  return 'type-25'
}

const approveOvertime = (ot: any) => {
  ot.estado = 'Aprobada'
}

const rejectOvertime = (ot: any) => {
  ot.estado = 'Rechazada'
}

const viewDetail = (ot: any) => {
  alert(`Detalle de horas extras:\n\nEmpleado: ${ot.employeeName}\nFecha: ${ot.fecha}\nHoras: ${ot.horas}\nTipo: ${ot.tipo}\nMotivo: ${ot.motivo}\nMonto: S/ ${ot.monto.toFixed(2)}\nEstado: ${ot.estado}`)
}

const saveOvertime = () => {
  const baseSalary = 3500
  const hourlyRate = baseSalary / 240
  const extraRate = parseFloat(form.value.tipo) / 100
  const monto = hourlyRate * form.value.horas * (1 + extraRate)
  
  overtimeData.value.unshift({
    id: Date.now().toString(),
    employeeName: 'Juan Pérez García',
    ...form.value,
    monto,
    estado: 'Pendiente'
  })
  
  showModal.value = false
  form.value = { employeeId: '', fecha: new Date().toISOString().split('T')[0], horas: 2, tipo: '25%', motivo: '' }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filter-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
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
.btn-danger { background: #ef4444; color: white; }
.btn-info { background: #06b6d4; color: white; }
.btn-sm { padding: 6px 12px; font-size: 12px; }

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-25 { background: #dbeafe; color: #1e40af; }
.type-35 { background: #fef3c7; color: #92400e; }
.type-100 { background: #fee2e2; color: #991b1b; }

.status-approved { background: #dcfce7; color: #166534; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-rejected { background: #fee2e2; color: #991b1b; }

.rate-info {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.rate-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #374151;
}

.rate-info ul {
  margin: 0;
  padding-left: 20px;
}

.rate-info li {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
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

textarea.form-input {
  resize: vertical;
}

select.form-input {
  cursor: pointer;
}
</style>
