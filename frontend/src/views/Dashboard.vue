<template>
  <div class="dashboard">
    <h1 class="page-title">Panel de Control</h1>
    
    <div class="stats-grid">
      <div class="stat-card employees">
        <div class="stat-value">{{ stats.totalEmployees }}</div>
        <div class="stat-label">Total Empleados</div>
      </div>
      <div class="stat-card contracts">
        <div class="stat-value">{{ stats.activeContracts }}</div>
        <div class="stat-label">Contratos Activos</div>
      </div>
      <div class="stat-card payroll">
        <div class="stat-value">S/ {{ stats.monthlyPayroll }}</div>
        <div class="stat-label">Planilla Mensual</div>
      </div>
      <div class="stat-card overtime">
        <div class="stat-value">{{ stats.pendingOvertime }}</div>
        <div class="stat-label">Horas Extras Pend.</div>
      </div>
    </div>
    
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Últimos Empleados</span>
          <button class="btn btn-primary btn-sm" @click="$router.push('/employees')">Ver Todos</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in recentEmployees" :key="emp.id">
                <td>{{ emp.nombreCompleto }}</td>
                <td>{{ emp.numeroDocumento }}</td>
                <td>
                  <span :class="['status-badge', 'status-' + emp.estado.toLowerCase()]">
                    {{ emp.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">Acciones Rápidas</span>
        </div>
        <div class="quick-actions">
          <button class="btn btn-primary btn-block" @click="$router.push('/employees')">
            ➕ Nuevo Empleado
          </button>
          <button class="btn btn-info btn-block" style="margin-top: 12px;" @click="$router.push('/contracts')">
            📄 Nuevo Contrato
          </button>
          <button class="btn btn-warning btn-block" style="margin-top: 12px;" @click="$router.push('/payroll')">
            💰 Generar Planilla
          </button>
          <button class="btn btn-danger btn-block" style="margin-top: 12px;" @click="$router.push('/overtime')">
            ⏰ Registrar Horas Extras
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = ref({
  totalEmployees: 0,
  activeContracts: 0,
  monthlyPayroll: '8,500',
  pendingOvertime: 0
})

const recentEmployees = ref<any[]>([])

const fetchDashboardData = async () => {
  try {
    const response = await fetch('https://rrhhmod-backend.rchavezza.workers.dev/api/v1/employees')
    const data = await response.json()
    
    if (data.success) {
      recentEmployees.value = data.data
      stats.value.totalEmployees = data.data.length
      stats.value.activeContracts = data.data.length
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.quick-actions {
  padding: 8px;
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

.btn-info { background: #06b6d4; color: white; }
.btn-info:hover { background: #0891b2; }

.btn-warning { background: #f59e0b; color: white; }
.btn-warning:hover { background: #d97706; }

.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
