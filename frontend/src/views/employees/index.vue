<template>
  <div class="employees-page">
    <div class="page-header">
      <h1 class="page-title">Gestión de Personal</h1>
      <button class="btn btn-primary" @click="showModal = true">➕ Nuevo Empleado</button>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Lista de Empleados</span>
        <input type="text" v-model="search" placeholder="Buscar empleado..." class="search-input" />
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>DNI</th>
              <th>Fecha Ingreso</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id">
              <td>{{ emp.id.substring(0, 8) }}...</td>
              <td>{{ emp.nombreCompleto }}</td>
              <td>{{ emp.numeroDocumento }}</td>
              <td>{{ emp.fechaIngreso || 'N/A' }}</td>
              <td>
                <span :class="['status-badge', 'status-' + (emp.estado || 'inactive').toLowerCase()]">
                  {{ emp.estado || 'INACTIVO' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-info" @click="editEmployee(emp)">Editar</button>
                <button class="btn btn-sm btn-danger" style="margin-left: 8px;" @click="deleteEmployee(emp.id)">Eliminar</button>
              </td>
            </tr>
            <tr v-if="filteredEmployees.length === 0">
              <td colspan="6" class="empty-state">
                <p>No hay empleados registrados</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado' }}</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nombres</label>
              <input type="text" v-model="form.nombres" class="form-input" placeholder="Nombres" />
            </div>
            <div class="form-group">
              <label class="form-label">Apellido Paterno</label>
              <input type="text" v-model="form.apellidoPaterno" class="form-input" placeholder="Apellido Paterno" />
            </div>
            <div class="form-group">
              <label class="form-label">Apellido Materno</label>
              <input type="text" v-model="form.apellidoMaterno" class="form-input" placeholder="Apellido Materno" />
            </div>
            <div class="form-group">
              <label class="form-label">Tipo Documento</label>
              <select v-model="form.tipoDocumento" class="form-input">
                <option value="DNI">DNI</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Número Documento</label>
              <input type="text" v-model="form.numeroDocumento" class="form-input" placeholder="12345678" />
            </div>
            <div class="form-group">
              <label class="form-label">Fecha Nacimiento</label>
              <input type="date" v-model="form.fechaNacimiento" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Fecha Ingreso</label>
              <input type="date" v-model="form.fechaIngreso" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select v-model="form.estado" class="form-input">
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="SUSPENDIDO">SUSPENDIDO</option>
                <option value="CESADO">CESADO</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveEmployee">
            {{ editingEmployee ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const employees = ref<any[]>([])
const search = ref('')
const showModal = ref(false)
const editingEmployee = ref<any>(null)

const form = ref({
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  fechaNacimiento: '1990-01-01',
  fechaIngreso: new Date().toISOString().split('T')[0],
  estado: 'ACTIVO'
})

const filteredEmployees = computed(() => {
  if (!search.value) return employees.value
  const s = search.value.toLowerCase()
  return employees.value.filter(e => 
    e.nombreCompleto?.toLowerCase().includes(s) ||
    e.numeroDocumento?.includes(s)
  )
})

const fetchEmployees = async () => {
  try {
    const response = await fetch('https://rrhhmod-backend.rchavezza.workers.dev/api/v1/employees')
    const data = await response.json()
    if (data.success) {
      employees.value = data.data
    }
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

const editEmployee = (emp: any) => {
  editingEmployee.value = emp
  form.value = { ...emp }
  showModal.value = true
}

const deleteEmployee = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar este empleado?')) return
  alert('Función de eliminación no implementada en backend demo')
}

const saveEmployee = async () => {
  try {
    const response = await fetch('https://rrhhmod-backend.rchavezza.workers.dev/api/v1/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await response.json()
    
    if (data.success) {
      showModal.value = false
      editingEmployee.value = null
      resetForm()
      fetchEmployees()
      alert('Empleado creado exitosamente')
    }
  } catch (error) {
    alert('Error al guardar empleado')
  }
}

const resetForm = () => {
  form.value = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    fechaNacimiento: '1990-01-01',
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'ACTIVO'
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-input {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 250px;
  font-size: 14px;
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

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
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

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

select.form-input {
  cursor: pointer;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }

.btn-secondary { background: #6b7280; color: white; }
.btn-secondary:hover { background: #4b5563; }

.btn-info { background: #06b6d4; color: white; }
.btn-danger { background: #ef4444; color: white; }

.btn-sm { padding: 6px 12px; font-size: 12px; }
</style>
