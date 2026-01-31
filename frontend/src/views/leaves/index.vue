<template>
  <div class="leaves-page">
    <div class="page-header">
      <h1 class="page-title">Vacaciones y Permisos</h1>
      <button class="btn btn-primary" @click="showModal = true">➕ Solicitar Permiso</button>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card contracts">
        <div class="stat-value">{{ pendingRequests }}</div>
        <div class="stat-label">Pendientes</div>
      </div>
      <div class="stat-card payroll">
        <div class="stat-value">{{ approvedRequests }}</div>
        <div class="stat-label">Aprobados</div>
      </div>
      <div class="stat-card employees">
        <div class="stat-value">{{ vacationDaysAvailable }}</div>
        <div class="stat-label">Días Disponibles</div>
      </div>
      <div class="stat-card overtime">
        <div class="stat-value">{{ vacationDaysTaken }}</div>
        <div class="stat-label">Días Tomados</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Solicitudes de Permiso y Vacaciones</span>
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
              <th>Tipo</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Días</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="leave in filteredLeaves" :key="leave.id">
              <td>{{ leave.employeeName }}</td>
              <td>
                <span :class="['type-badge', getTypeClass(leave.tipo)]">{{ leave.tipo }}</span>
              </td>
              <td>{{ leave.fechaInicio }}</td>
              <td>{{ leave.fechaFin }}</td>
              <td>{{ leave.dias }}</td>
              <td>{{ leave.motivo }}</td>
              <td>
                <span :class="['status-badge', 'status-' + leave.estado.toLowerCase()]">
                  {{ leave.estado }}
                </span>
              </td>
              <td>
                <template v-if="leave.estado === 'Pendiente'">
                  <button class="btn btn-sm btn-success" @click="approveLeave(leave)">Aprobar</button>
                  <button class="btn btn-sm btn-danger" style="margin-left: 8px;" @click="rejectLeave(leave)">Rechazar</button>
                </template>
                <button class="btn btn-sm btn-info" @click="viewDetail(leave)">Ver</button>
              </td>
            </tr>
            <tr v-if="filteredLeaves.length === 0">
              <td colspan="8" class="empty-state">
                <p>No hay solicitudes registradas</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Calendario de Vacaciones</span>
      </div>
      <div class="calendar-summary">
        <div class="calendar-month" v-for="month in calendarMonths" :key="month.name">
          <div class="month-name">{{ month.name }}</div>
          <div class="month-days">
            <span v-for="day in month.days" :key="day" :class="['day', day.status]">
              {{ day.date }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Nueva Solicitud</h3>
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
              <label class="form-label">Tipo de Permiso</label>
              <select v-model="form.tipo" class="form-input">
                <option value="Vacaciones">Vacaciones</option>
                <option value="Permiso Médico">Permiso Médico</option>
                <option value="Licencia por Maternidad">Licencia por Maternidad</option>
                <option value="Licencia por Paternidad">Licencia por Paternidad</option>
                <option value="Permiso Truncado">Permiso Truncado</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha Inicio</label>
              <input type="date" v-model="form.fechaInicio" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Fecha Fin</label>
              <input type="date" v-model="form.fechaFin" class="form-input" />
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Motivo/Observaciones</label>
              <textarea v-model="form.motivo" class="form-input" rows="3" placeholder="Describe el motivo de tu solicitud..."></textarea>
            </div>
          </div>
          
          <div class="leave-balance">
            <h4>Saldo de Vacaciones</h4>
            <div class="balance-item">
              <span>Días disponibles:</span>
              <strong>{{ vacationDaysAvailable }} días</strong>
            </div>
            <div class="balance-item">
              <span>Días solicitados:</span>
              <strong>{{ calculateRequestedDays() }} días</strong>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveLeave">Enviar Solicitud</button>
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
  tipo: 'Vacaciones',
  fechaInicio: '',
  fechaFin: '',
  motivo: ''
})

const leaves = ref([
  { id: '1', employeeName: 'Juan Pérez García', tipo: 'Vacaciones', fechaInicio: '2024-02-01', fechaFin: '2024-02-10', dias: 8, motivo: 'Vacaciones de fin de año', estado: 'Aprobada' },
  { id: '2', employeeName: 'María López Martínez', tipo: 'Permiso Médico', fechaInicio: '2024-01-20', fechaFin: '2024-01-22', dias: 3, motivo: 'Chequeo médico', estado: 'Aprobada' },
  { id: '3', employeeName: 'Carlos Rodríguez', tipo: 'Vacaciones', fechaInicio: '2024-02-15', fechaFin: '2024-02-20', dias: 4, motivo: 'Viaje familiar', estado: 'Pendiente' },
  { id: '4', employeeName: 'Ana García Sánchez', tipo: 'Licencia por Maternidad', fechaInicio: '2024-03-01', fechaFin: '2024-05-30', dias: 90, motivo: 'Licencia por nacimiento', estado: 'Pendiente' }
])

const filteredLeaves = computed(() => {
  if (filter.value === 'all') return leaves.value
  return leaves.value.filter(l => l.estado.toLowerCase() === filter.value)
})

const pendingRequests = computed(() => leaves.value.filter(l => l.estado === 'Pendiente').length)
const approvedRequests = computed(() => leaves.value.filter(l => l.estado === 'Aprobada').length)
const vacationDaysAvailable = ref(15)
const vacationDaysTaken = computed(() => leaves.value.filter(l => l.tipo === 'Vacaciones' && l.estado === 'Aprobada').reduce((sum, l) => sum + l.dias, 0))

const calendarMonths = ref([
  { name: 'Enero', days: [{ date: 1, status: 'work' }, { date: 2, status: 'work' }, { date: 3, status: 'work' }, { date: 4, status: 'work' }, { date: 5, status: 'work' }, { date: 6, status: 'weekend' }, { date: 7, status: 'weekend' }, { date: 8, status: 'leave' }, { date: 9, status: 'work' }, { date: 10, status: 'work' }, { date: 11, status: 'work' }, { date: 12, status: 'work' }, { date: 13, status: 'weekend' }, { date: 14, status: 'weekend' }] },
  { name: 'Febrero', days: [{ date: 1, status: 'work' }, { date: 2, status: 'work' }, { date: 3, status: 'weekend' }, { date: 4, status: 'weekend' }, { date: 5, status: 'work' }, { date: 6, status: 'work' }, { date: 7, status: 'work' }, { date: 8, status: 'work' }, { date: 9, status: 'work' }, { date: 10, status: 'weekend' }, { date: 11, status: 'weekend' }] }
])

const getTypeClass = (tipo: string) => {
  if (tipo === 'Vacaciones') return 'type-vacation'
  if (tipo === 'Permiso Médico') return 'type-medical'
  if (tipo.includes('Licencia')) return 'type-license'
  return 'type-other'
}

const approveLeave = (leave: any) => {
  leave.estado = 'Aprobada'
  if (leave.tipo === 'Vacaciones') {
    vacationDaysAvailable.value -= leave.dias
  }
}

const rejectLeave = (leave: any) => {
  leave.estado = 'Rechazada'
}

const viewDetail = (leave: any) => {
  alert(`Detalle de solicitud:\n\nEmpleado: ${leave.employeeName}\nTipo: ${leave.tipo}\nDel: ${leave.fechaInicio} al ${leave.fechaFin}\nDías: ${leave.dias}\nMotivo: ${leave.motivo}\nEstado: ${leave.estado}`)
}

const calculateRequestedDays = () => {
  if (!form.value.fechaInicio || !form.value.fechaFin) return 0
  const start = new Date(form.value.fechaInicio)
  const end = new Date(form.value.fechaFin)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

const saveLeave = () => {
  const dias = calculateRequestedDays()
  leaves.value.unshift({
    id: Date.now().toString(),
    employeeName: 'Juan Pérez García',
    tipo: form.value.tipo,
    fechaInicio: form.value.fechaInicio,
    fechaFin: form.value.fechaFin,
    dias,
    motivo: form.value.motivo,
    estado: 'Pendiente'
  })
  
  showModal.value = false
  form.value = { employeeId: '', tipo: 'Vacaciones', fechaInicio: '', fechaFin: '', motivo: '' }
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

.type-vacation { background: #dbeafe; color: #1e40af; }
.type-medical { background: #dcfce7; color: #166534; }
.type-license { background: #fef3c7; color: #92400e; }
.type-other { background: #f3f4f6; color: #374151; }

.status-approved { background: #dcfce7; color: #166534; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-rejected { background: #fee2e2; color: #991b1b; }

.calendar-summary {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.calendar-month {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  min-width: 150px;
}

.month-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.month-days {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.day {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 4px;
}

.day.work { background: #dbeafe; color: #1e40af; }
.day.weekend { background: #fee2e2; color: #991b1b; }
.day.leave { background: #dcfce7; color: #166534; }

.leave-balance {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.leave-balance h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.balance-item:last-child {
  border-bottom: none;
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
</style>
