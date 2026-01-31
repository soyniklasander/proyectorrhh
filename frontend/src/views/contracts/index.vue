<template>
  <div class="contracts-page">
    <div class="page-header">
      <h1 class="page-title">Gestión de Contratos</h1>
      <button class="btn btn-primary" @click="startWizard">➕ Nuevo Contrato</button>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card contracts">
        <div class="stat-value">{{ contracts.length }}</div>
        <div class="stat-label">Total Contratos</div>
      </div>
      <div class="stat-card active">
        <div class="stat-value">{{ activeCount }}</div>
        <div class="stat-label">Vigentes</div>
      </div>
      <div class="stat-card expiring">
        <div class="stat-value">{{ expiringCount }}</div>
        <div class="stat-label">Por Vencer</div>
      </div>
      <div class="stat-card expired">
        <div class="stat-value">{{ expiredCount }}</div>
        <div class="stat-label">Vencidos</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Lista de Contratos</span>
        <div class="header-actions">
          <select v-model="filter" class="filter-select">
            <option value="all">Todos</option>
            <option value="active">Vigentes</option>
            <option value="expiring">Por Vencer</option>
            <option value="expired">Vencidos</option>
          </select>
          <button class="btn btn-secondary btn-sm" @click="loadContracts">🔄 Refrescar</button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando contratos...</p>
      </div>
      
      <div v-else class="table-container">
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
              <td>{{ contract.nombreCompleto || contract.employeeName || 'No asignado' }}</td>
              <td>{{ contract.tipoContrato || 'Plazo Fijo' }}</td>
              <td>{{ contract.regimenLaboral || contract.regimen || 'General' }}</td>
              <td>S/ {{ formatSalary(contract.salarioBase) }}</td>
              <td>{{ formatDate(contract.fechaInicio) }}</td>
              <td>{{ contract.fechaFin ? formatDate(contract.fechaFin) : 'Indefinido' }}</td>
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
            <tr v-if="filteredContracts.length === 0 && !loading">
              <td colspan="8" class="empty-state">
                <p>No hay contratos registrados</p>
                <button class="btn btn-primary" @click="startWizard">Crear primer contrato</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="showWizard" class="modal-overlay" @click.self="closeWizard">
      <div class="modal modal-wizard">
        <div class="modal-header wizard-header">
          <h3>Nuevo Contrato Laboral</h3>
          <button class="close-btn" @click="closeWizard">&times;</button>
        </div>
        
        <div class="wizard-progress">
          <div class="progress-step" :class="{ active: wizardStep >= 1, completed: wizardStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">Empleado</div>
          </div>
          <div class="progress-line" :class="{ filled: wizardStep > 1 }"></div>
          <div class="progress-step" :class="{ active: wizardStep >= 2, completed: wizardStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">Plantilla</div>
          </div>
          <div class="progress-line" :class="{ filled: wizardStep > 2 }"></div>
          <div class="progress-step" :class="{ active: wizardStep >= 3, completed: wizardStep > 3 }">
            <div class="step-number">3</div>
            <div class="step-label">Datos</div>
          </div>
          <div class="progress-line" :class="{ filled: wizardStep > 3 }"></div>
          <div class="progress-step" :class="{ active: wizardStep >= 4 }">
            <div class="step-number">4</div>
            <div class="step-label">Vista Previa</div>
          </div>
        </div>
        
        <div class="modal-body wizard-body">
          <div v-if="wizardStep === 1" class="wizard-step">
            <h4>Seleccionar Empleado</h4>
            <div class="search-box">
              <input type="text" v-model="employeeSearch" placeholder="🔍 Buscar por nombre, DNI o email..." class="form-input search-input" />
            </div>
            <div class="employee-list">
              <div v-for="employee in filteredEmployees" :key="employee.id" :class="['employee-card', { selected: selectedEmployee?.id === employee.id }]" @click="selectEmployee(employee)">
                <div class="employee-avatar">{{ getEmployeeInitials(employee) }}</div>
                <div class="employee-info">
                  <div class="employee-name">{{ employee.nombreCompleto }}</div>
                  <div class="employee-details"><span>DNI: {{ employee.numeroDocumento }}</span><span>Email: {{ employee.email }}</span></div>
                </div>
                <div v-if="selectedEmployee?.id === employee.id" class="check-icon">✓</div>
              </div>
              <div v-if="filteredEmployees.length === 0" class="no-results">No se encontraron empleados</div>
            </div>
          </div>
          
          <div v-if="wizardStep === 2" class="wizard-step">
            <h4>Seleccionar Plantilla de Contrato</h4>
            <div class="template-grid">
              <div v-for="template in templates" :key="template.id" :class="['template-card', { selected: selectedTemplate?.id === template.id }]" @click="selectTemplate(template)">
                <div class="template-icon">{{ getTemplateIcon(template.regimenLaboral) }}</div>
                <div class="template-name">{{ template.nombre }}</div>
                <div class="template-regimen">{{ formatRegimen(template.regimenLaboral) }} - {{ template.tipoContrato }}</div>
                <div class="template-desc">{{ template.descripcion }}</div>
                <div class="template-benefits">
                  <span v-if="template.tieneCTS" class="benefit-badge">CTS</span>
                  <span v-if="template.tieneVacaciones" class="benefit-badge">Vacaciones</span>
                  <span v-if="template.tieneGratificaciones" class="benefit-badge">Gratificaciones</span>
                </div>
                <div v-if="selectedTemplate?.id === template.id" class="selected-badge">✓ Seleccionado</div>
              </div>
            </div>
          </div>
          
          <div v-if="wizardStep === 3" class="wizard-step">
            <h4>Datos del Contrato</h4>
            <div class="form-grid">
              <div class="form-group"><label class="form-label">Cargo / Puesto</label><input type="text" v-model="contractForm.position" class="form-input" placeholder="Ej: Desarrollador Full Stack" /></div>
              <div class="form-group"><label class="form-label">Área / Departamento</label><input type="text" v-model="contractForm.department" class="form-input" placeholder="Ej: Tecnología" /></div>
              <div class="form-group"><label class="form-label">Sueldo Base (S/)</label><input type="number" v-model="contractForm.salary" class="form-input" placeholder="1025.00" min="0" step="0.01" /></div>
              <div class="form-group"><label class="form-label">Fecha de Inicio</label><input type="date" v-model="contractForm.startDate" class="form-input" /></div>
              <div class="form-group"><label class="form-label">Fecha de Término (si aplica)</label><input type="date" v-model="contractForm.endDate" class="form-input" :min="contractForm.startDate" /><small class="form-hint">Dejar en blanco para contrato indefinido</small></div>
              <div class="form-group"><label class="form-label">AFP</label><select v-model="contractForm.afp" class="form-input"><option value="">Sin AFP</option><option value="Habitat">Habitat</option><option value="Integra">Integra</option><option value="Prima">Prima</option><option value="Profuturo">Profuturo</option></select></div>
              <div class="form-group"><label class="form-label">CUSPP</label><input type="text" v-model="contractForm.cuspp" class="form-input" placeholder="Número CUSPP" :disabled="!contractForm.afp" /></div>
              <div class="form-group full-width"><label class="form-label">Observaciones</label><textarea v-model="contractForm.observations" class="form-input" rows="3" placeholder="Notas adicionales..."></textarea></div>
            </div>
          </div>
          
          <div v-if="wizardStep === 4" class="wizard-step">
            <h4>Vista Previa del Contrato</h4>
            <div class="contract-preview">
              <div class="preview-header"><h2>{{ selectedTemplate?.name || 'Contrato de Trabajo' }}</h2><p class="regimen">Régimen: {{ formatRegimen(selectedTemplate?.regimen || 'General') }}</p></div>
              <div class="preview-section"><h5>DATOS DEL EMPLEADO</h5><div class="preview-grid"><div><strong>Nombre:</strong> {{ selectedEmployee?.nombreCompleto }}</div><div><strong>DNI:</strong> {{ selectedEmployee?.numeroDocumento }}</div><div><strong>Email:</strong> {{ selectedEmployee?.email }}</div><div><strong>Dirección:</strong> {{ selectedEmployee?.direccion || 'No especificada' }}</div></div></div>
              <div class="preview-section"><h5>CONDICIONES LABORALES</h5><div class="preview-grid"><div><strong>Cargo:</strong> {{ contractForm.position }}</div><div><strong>Área:</strong> {{ contractForm.department }}</div><div><strong>Sueldo:</strong> S/ {{ formatSalary(contractForm.salary) }}</div><div><strong>Fecha Inicio:</strong> {{ formatDate(contractForm.startDate) }}</div><div><strong>Fecha Fin:</strong> {{ contractForm.endDate ? formatDate(contractForm.endDate) : 'Indefinido' }}</div><div><strong>AFP:</strong> {{ contractForm.afp || 'No aplica' }}</div><div><strong>CUSPP:</strong> {{ contractForm.cuspp || 'No aplica' }}</div></div></div>
              <div class="preview-section" v-if="contractForm.observations"><h5>OBSERVACIONES</h5><p>{{ contractForm.observations }}</p></div>
              <div class="preview-footer"><p class="disclaimer">Este contrato se regirá por las leyes laborales del Perú, específicamente por el régimen {{ formatRegimen(selectedTemplate?.regimen) }}.</p></div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button v-if="wizardStep > 1" class="btn btn-secondary" @click="prevStep">← Atrás</button>
          <button v-if="wizardStep < 4" class="btn btn-primary" @click="nextStep" :disabled="!canProceed">Siguiente →</button>
          <button v-if="wizardStep === 4" class="btn btn-success" @click="createContract" :disabled="saving">{{ saving ? 'Guardando...' : '💾 Guardar Contrato' }}</button>
        </div>
      </div>
    </div>
    
    <div v-if="showViewModal" class="modal-overlay" @click.self="showViewModal = false">
      <div class="modal modal-lg">
        <div class="modal-header"><h3>Detalle del Contrato</h3><button class="close-btn" @click="showViewModal = false">&times;</button></div>
        <div class="modal-body">
          <div v-if="viewingContract" class="contract-detail">
            <div class="detail-section"><h4>Empleado</h4><p><strong>Nombre:</strong> {{ viewingContract.nombreCompleto }}</p><p><strong>DNI:</strong> {{ viewingContract.numeroDocumento }}</p><p><strong>Email:</strong> {{ viewingContract.email }}</p></div>
            <div class="detail-section"><h4>Contrato</h4><p><strong>Tipo:</strong> {{ viewingContract.tipoContrato }}</p><p><strong>Régimen:</strong> {{ formatRegimen(viewingContract.regimenLaboral) }}</p><p><strong>Cargo:</strong> {{ viewingContract.cargo }}</p><p><strong>Sueldo:</strong> S/ {{ formatSalary(viewingContract.salarioBase) }}</p><p><strong>Período:</strong> {{ formatDate(viewingContract.fechaInicio) }} - {{ viewingContract.fechaFin ? formatDate(viewingContract.fechaFin) : 'Indefinido' }}</p></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showViewModal = false">Cerrar</button>
          <button class="btn btn-primary" @click="printContract">🖨️ Imprimir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const API_URL = 'https://rrhhmod-backend.rchavezza.workers.dev/api/v1'

const contracts = ref<any[]>([])
const employees = ref<any[]>([])
const templates = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const filter = ref('all')
const showWizard = ref(false)
const showViewModal = ref(false)
const wizardStep = ref(1)
const employeeSearch = ref('')
const selectedEmployee = ref<any>(null)
const selectedTemplate = ref<any>(null)
const viewingContract = ref<any>(null)

const contractForm = ref({
  position: '',
  department: '',
  salary: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  afp: '',
  cuspp: '',
  observations: ''
})

const activeCount = computed(() => (contracts.value || []).filter(c => getStatus(c) === 'Vigente').length)
const expiringCount = computed(() => (contracts.value || []).filter(c => getStatus(c) === 'Por Vencer').length)
const expiredCount = computed(() => (contracts.value || []).filter(c => getStatus(c) === 'Vencido').length)

const filteredContracts = computed(() => {
  if (!contracts.value || contracts.value.length === 0) return []
  if (filter.value === 'all') return contracts.value
  return contracts.value.filter(c => getStatus(c).toLowerCase() === filter.value)
})

const filteredEmployees = computed(() => {
  if (!employees.value || employees.value.length === 0) return []
  if (!employeeSearch.value) return employees.value
  const search = employeeSearch.value.toLowerCase()
  return employees.value.filter(e => 
    e.nombreCompleto?.toLowerCase().includes(search) ||
    e.numeroDocumento?.includes(search) ||
    e.email?.toLowerCase().includes(search)
  )
})

const canProceed = computed(() => {
  if (wizardStep.value === 1) return !!selectedEmployee.value
  if (wizardStep.value === 2) return !!selectedTemplate.value
  if (wizardStep.value === 3) return contractForm.value.position && contractForm.value.salary && contractForm.value.startDate
  return true
})

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatSalary = (salary: number | string) => {
  const num = typeof salary === 'string' ? parseFloat(salary) : salary
  return num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatRegimen = (regimen: string) => {
  const map: Record<string, string> = {
    GENERAL: 'Régimen General DL 728',
    MICROEMPRESA: 'Microempresa DL 1276',
    PEQUENA_EMPRESA: 'Pequeña Empresa DL 1448',
    CAS: 'Contrato Administrativo de Servicios',
    LOCACION_SERVICIOS: 'Locación de Servicios',
    PRACTICAS: 'Prácticas',
    PRACTICAS_PRE: 'Prácticas Pre-profesionales',
    PROFESIONAL: 'Prácticas Profesionales',
    AGRARIO: 'Régimen Agrario DL 1053'
  }
  return map[regimen] || regimen || 'General'
}

const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

const getEmployeeInitials = (employee: any) => {
  const name = employee.nombreCompleto || employee.fullName || ''
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

const getTemplateIcon = (regimen: string) => {
  const icons: Record<string, string> = {
    GENERAL: '📋',
    MICROEMPRESA: '🏢',
    PEQUENA_EMPRESA: '🏪',
    CAS: '📄',
    LOCACION_SERVICIOS: '🤝',
    PRACTICAS: '📚',
    PRACTICAS_PRE: '📝',
    PROFESIONAL: '🎓',
    AGRARIO: '🌾'
  }
  return icons[regimen] || '📄'
}

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

const loadContracts = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/contracts`)
    const json = await res.json()
    contracts.value = json.data || []
  } catch (e) {
    console.error('Error loading contracts:', e)
    contracts.value = []
  } finally {
    loading.value = false
  }
}

const loadEmployees = async () => {
  try {
    const res = await fetch(`${API_URL}/employees`)
    const json = await res.json()
    employees.value = json.data || []
  } catch (e) {
    console.error('Error loading employees:', e)
    employees.value = []
  }
}

const loadTemplates = async () => {
  try {
    const res = await fetch(`${API_URL}/contract-templates`)
    const json = await res.json()
    templates.value = json.data || []
  } catch (e) {
    console.error('Error loading templates:', e)
    templates.value = []
  }
}

const startWizard = async () => {
  showWizard.value = true
  wizardStep.value = 1
  selectedEmployee.value = null
  selectedTemplate.value = null
  employeeSearch.value = ''
  contractForm.value = {
    position: '',
    department: '',
    salary: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    afp: '',
    cuspp: '',
    observations: ''
  }
  await loadEmployees()
  await loadTemplates()
}

const closeWizard = () => {
  showWizard.value = false
}

const selectEmployee = (employee: any) => {
  selectedEmployee.value = employee
}

const selectTemplate = (template: any) => {
  selectedTemplate.value = template
}

const nextStep = () => {
  if (wizardStep.value < 4) wizardStep.value++
}

const prevStep = () => {
  if (wizardStep.value > 1) wizardStep.value--
}

const createContract = async () => {
  saving.value = true
  try {
    const payload = {
      employeeId: selectedEmployee.value.id,
      templateId: selectedTemplate.value.id,
      position: contractForm.value.position,
      department: contractForm.value.department,
      salary: parseFloat(contractForm.value.salary),
      startDate: contractForm.value.startDate,
      endDate: contractForm.value.endDate || null,
      afp: contractForm.value.afp || null,
      cuspp: contractForm.value.cuspp || null,
      observations: contractForm.value.observations || null
    }
    
    const res = await fetch(`${API_URL}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (res.ok) {
      await loadContracts()
      closeWizard()
    } else {
      alert('Error al crear contrato')
    }
  } catch (e) {
    console.error('Error creating contract:', e)
    alert('Error al crear contrato')
  } finally {
    saving.value = false
  }
}

const viewContract = (contract: any) => {
  viewingContract.value = contract
  showViewModal.value = true
}

const renewContract = (contract: any) => {
  startWizard()
  selectedEmployee.value = { id: contract.empleadoId, fullName: contract.nombreCompleto, dni: contract.numeroDocumento, email: contract.email, address: '' }
  contractForm.value.startDate = contract.fechaFin || new Date().toISOString().split('T')[0]
  contractForm.value.endDate = ''
}

const printContract = () => {
  window.print()
}

onMounted(() => {
  loadContracts()
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-wizard {
  max-width: 900px;
  width: 95%;
}

.wizard-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.wizard-header h3 {
  color: white;
  margin: 0;
}

.wizard-header .close-btn {
  color: white;
}

.wizard-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: #3b82f6;
  color: white;
}

.progress-step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.progress-step.active .step-label {
  color: #3b82f6;
  font-weight: 600;
}

.progress-line {
  width: 60px;
  height: 3px;
  background: #e5e7eb;
  margin: 0 12px;
  margin-bottom: 28px;
  transition: background 0.3s ease;
}

.progress-line.filled {
  background: #10b981;
}

.wizard-body {
  min-height: 400px;
  max-height: 60vh;
  overflow-y: auto;
}

.wizard-step h4 {
  margin-bottom: 20px;
  color: #1f2937;
}

.search-input {
  margin-bottom: 16px;
}

.employee-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.employee-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.employee-card:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.employee-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.employee-info {
  flex: 1;
}

.employee-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.employee-details {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
}

.check-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.template-card {
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.template-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.template-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.template-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.template-regimen {
  font-size: 13px;
  color: #3b82f6;
  margin-bottom: 8px;
}

.template-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.template-benefits {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.benefit-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 500;
}

.selected-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #3b82f6;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.contract-preview {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px;
}

.preview-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.preview-header h2 {
  color: #1f2937;
  margin-bottom: 8px;
}

.preview-header .regimen {
  color: #3b82f6;
  font-weight: 500;
}

.preview-section {
  margin-bottom: 24px;
}

.preview-section h5 {
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preview-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.disclaimer {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.contract-detail .detail-section {
  margin-bottom: 24px;
}

.contract-detail .detail-section h4 {
  color: #3b82f6;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.contract-detail p {
  margin: 8px 0;
  color: #374151;
}

@media (max-width: 768px) {
  .wizard-progress {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .progress-line {
    display: none;
  }
  
  .form-grid,
  .preview-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>
