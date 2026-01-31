<template>
  <div class="contracts-page">
    <div class="page-header">
      <h1 class="page-title">Contratos Laborales</h1>
      <button class="btn btn-primary" @click="showModal = true">➕ Nuevo Contrato</button>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card contracts">
        <div class="stat-value">{{ contracts.length }}</div>
        <div class="stat-label">Total Contratos</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <div class="stat-value">{{ activeCount }}</div>
        <div class="stat-label">Vigentes</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <div class="stat-value">{{ expiringCount }}</div>
        <div class="stat-label">Por Vencer</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
        <div class="stat-value">{{ expiredCount }}</div>
        <div class="stat-label">Vencidos</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Lista de Contratos</span>
        <select v-model="filter" class="filter-select">
          <option value="all">Todos</option>
          <option value="active">Vigentes</option>
          <option value="expiring">Por Vencer</option>
          <option value="expired">Vencidos</option>
        </select>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Tipo</th>
              <th>Regimen</th>
              <th>Sueldo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contract in filteredContracts" :key="contract.id">
              <td>{{ contract.employeeName || 'No asignado' }}</td>
              <td>{{ contract.tipoContrato || 'Plazo Fijo' }}</td>
              <td>{{ contract.regimen || 'General' }}</td>
              <td>S/ {{ contract.sueldo || '0.00' }}</td>
              <td>{{ contract.fechaInicio || 'N/A' }}</td>
              <td>{{ contract.fechaFin || 'Indefinido' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(contract)]">
                  {{ getStatus(contract) }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-info" @click="viewContract(contract)">Ver</button>
                <button class="btn btn-sm btn-primary" style="margin-left: 8px;" @click="renewContract(contract)">Renovar</button>
              </td>
            </tr>
            <tr v-if="filteredContracts.length === 0">
              <td colspan="8" class="empty-state">
                <p>No hay contratos registrados</p>
                <button class="btn btn-primary" @click="showModal = true">Crear primer contrato</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3>Nuevo Contrato</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <h4>Datos del Contrato</h4>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Tipo de Contrato</label>
                <select v-model="form.tipoContrato" class="form-input">
                  <option value="Plazo Fijo">Plazo Fijo</option>
                  <option value="Indeterminado">Indeterminado</option>
                  <option value="CAS">CAS</option>
                  <option value="Locación de Servicios">Locación de Servicios</option>
                  <option value="Prácticas">Prácticas</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Régimen Laboral</label>
                <select v-model="form.regimen" class="form-input">
                  <option value="General">General</option>
                  <option value="Microempresa">Microempresa</option>
                  <option value="Pequeña Empresa">Pequeña Empresa</option>
                  <option value="Agrario">Agrario</option>
                  <option value="Pesquero">Pesquero</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Sueldo Base (S/)</label>
                <input type="number" v-model="form.sueldo" class="form-input" placeholder="1025.00" />
              </div>
              <div class="form-group">
                <label class="form-label">Fecha Inicio</label>
                <input type="date" v-model="form.fechaInicio" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Fecha Fin (si aplica)</label>
                <input type="date" v-model="form.fechaFin" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Cargo</label>
                <input type="text" v-model="form.cargo" class="form-input" placeholder="Desarrollador" />
              </div>
              <div class="form-group">
                <label class="form-label">AFP</label>
                <select v-model="form.afp" class="form-input">
                  <option value="">Sin AFP</option>
                  <option value="Habitat">Habitat</option>
                  <option value="Integra">Integra</option>
                  <option value="Prima">Prima</option>
                  <option value="Profuturo">Profuturo</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">CUSPP</label>
                <input type="text" v-model="form.cuspp" class="form-input" placeholder="Número CUSPP" />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h4>Beneficios</h4>
            <div class="checkbox-group">
              <label><input type="checkbox" v-model="form.essalud" /> Essalud (9%)</label>
              <label><input type="checkbox" v-model="form.cts" /> CTS</label>
              <label><input type="checkbox" v-model="form.gratificaciones" /> Gratificaciones</label>
              <label><input type="checkbox" v-model="form.vacaciones" /> Vacaciones (30 días)</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveContract">Crear Contrato</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const contracts = ref<any[]>([])
const filter = ref('all')
const showModal = ref(false)

const form = ref({
  tipoContrato: 'Plazo Fijo',
  regimen: 'General',
  sueldo: '',
  fechaInicio: new Date().toISOString().split('T')[0],
  fechaFin: '',
  cargo: '',
  afp: '',
  cuspp: '',
  essalud: true,
  cts: true,
  gratificaciones: true,
  vacaciones: true
})

const activeCount = computed(() => contracts.value.filter(c => getStatus(c) === 'Vigente').length)
const expiringCount = computed(() => contracts.value.filter(c => getStatus(c) === 'Por Vencer').length)
const expiredCount = computed(() => contracts.value.filter(c => getStatus(c) === 'Vencido').length)

const filteredContracts = computed(() => {
  if (filter.value === 'all') return contracts.value
  return contracts.value.filter(c => getStatus(c).toLowerCase() === filter.value)
})

const getStatus = (contract: any) => {
  if (!contract.fechaFin) return 'Vigente'
  const today = new Date()
  const end = new Date(contract.fechaFin)
  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return 'Vencido'
  if (daysLeft <= 30) return 'Por Vencer'
  return 'Vigente'
}

const getStatusClass = (contract: any) => {
  const status = getStatus(contract)
  if (status === 'Vigente') return 'status-active'
  if (status === 'Por Vencer') return 'status-pending'
  return 'status-inactive'
}

const viewContract = (contract: any) => {
  alert(`Ver contrato: ${contract.id}`)
}

const renewContract = (contract: any) => {
  form.value.fechaInicio = contract.fechaFin
  form.value.fechaFin = ''
  showModal.value = true
}

const saveContract = async () => {
  alert('Contrato guardado (funcionalidad demo)')
  showModal.value = false
  contracts.value.push({
    id: Date.now().toString(),
    ...form.value,
    employeeName: 'Juan Pérez García'
  })
}

onMounted(() => {
  contracts.value = [
    { id: '1', employeeName: 'Juan Pérez García', tipoContrato: 'Plazo Fijo', regimen: 'General', sueldo: '3500', fechaInicio: '2024-01-15', fechaFin: '2025-01-15' },
    { id: '2', employeeName: 'María López', tipoContrato: 'Indeterminado', regimen: 'General', sueldo: '4200', fechaInicio: '2023-06-01', fechaFin: '' },
    { id: '3', employeeName: 'Carlos Rodríguez', tipoContrato: 'CAS', regimen: 'General', sueldo: '2800', fechaInicio: '2024-07-01', fechaFin: '2025-02-28' }
  ]
})
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

.modal-lg {
  max-width: 800px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h4 {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  color: #374151;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
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
.btn-info { background: #06b6d4; color: white; }
.btn-sm { padding: 6px 12px; font-size: 12px; }

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
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
</style>
