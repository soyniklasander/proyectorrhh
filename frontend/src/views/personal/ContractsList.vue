<template>
  <AppleCard>
    <div class="list-header">
      <div class="header-left">
        <AppleBadge type="success" :label="`${activeContracts} vigentes`" />
        <AppleBadge type="warning" :label="`${expiringContracts} por vencer`" />
        <AppleBadge type="error" :label="`${expiredContracts} vencidos`" />
      </div>
      <div class="header-right">
        <AppleSelect
          v-model="filterStatus"
          placeholder="Filtrar por estado"
          :options="statusOptions"
          class="filter-select"
        />
        <AppleSearchInput
          v-model="search"
          placeholder="Buscar contrato..."
          class="search-input"
        />
        <AppleButton variant="secondary" :icon="RefreshIcon" @click="loadContracts">
          Actualizar
        </AppleButton>
      </div>
    </div>

    <AppleTable
      :columns="columns"
      :data="filteredContracts"
      :loading="loading"
      :bordered="false"
      :striped="true"
      pagination
    />
  </AppleCard>

  <!-- Terminar Contrato Modal -->
  <AppleModal v-model:show="showTerminateModal" title="Terminar Contrato" style="width: 500px">
    <div v-if="selectedContract" class="form-grid">
      <div class="form-group full">
        <label>Empleado</label>
        <span>{{ selectedContract.nombreCompleto }}</span>
      </div>
      <div class="form-group full">
        <label>Motivo de Terminación</label>
        <textarea v-model="terminateMotivo" class="textarea-input" rows="3" placeholder="Ingrese el motivo..."></textarea>
      </div>
    </div>
    <template #footer>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <AppleButton variant="secondary" @click="showTerminateModal = false">Cancelar</AppleButton>
        <AppleButton variant="danger" @click="confirmTerminate">Terminar Contrato</AppleButton>
      </div>
    </template>
  </AppleModal>

  <!-- Renovar Contrato Modal -->
  <AppleModal v-model:show="showRenewModal" title="Renovar Contrato" style="width: 500px">
    <div v-if="selectedContract" class="form-grid">
      <div class="form-group full">
        <label>Empleado</label>
        <span>{{ selectedContract.nombreCompleto }}</span>
      </div>
      <div class="form-group full">
        <label>Nueva Fecha de Finalización</label>
        <AppleDatePicker v-model="renewFechaFin" type="date" />
      </div>
    </div>
    <template #footer>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <AppleButton variant="secondary" @click="showRenewModal = false">Cancelar</AppleButton>
        <AppleButton variant="primary" @click="confirmRenew">Renovar Contrato</AppleButton>
      </div>
    </template>
  </AppleModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  AppleCard,
  AppleButton,
  AppleBadge,
  AppleTable,
  AppleTag,
  AppleSearchInput,
  AppleSelect,
  AppleAvatar,
  AppleModal,
  AppleInput,
  AppleDatePicker
} from '@/components/apple'
import { RefreshCw } from 'lucide-vue-next'
import { api } from '@/services/api'
import { useMessage } from 'naive-ui'

const RefreshIcon = RefreshCw
const message = useMessage()

interface Contract {
  id: string
  employeeId: string
  nombreCompleto: string
  numeroDocumento: string
  tipoContrato: string
  regimenLaboral: string
  cargo: string
  fechaInicio: string
  fechaFin: string
  salarioBase: number
  estado: string
  motivo?: string
}

const contracts = ref<Contract[]>([])
const loading = ref(false)
const search = ref('')
const filterStatus = ref('todos')
const showTerminateModal = ref(false)
const showRenewModal = ref(false)
const selectedContract = ref<Contract | null>(null)
const terminateMotivo = ref('')
const renewFechaFin = ref<Date | null>(null)

const statusOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Vigentes', value: 'VIGENTE' },
  { label: 'Por Vencer', value: 'POR_VENCER' },
  { label: 'Vencidos', value: 'VENCIDO' },
  { label: 'Suspendidos', value: 'SUSPENDIDO' }
]

const activeContracts = computed(() => contracts.value.filter((c: any) => c.estado === 'VIGENTE').length)
const expiringContracts = computed(() => contracts.value.filter((c: any) => c.estado === 'POR_VENCER').length)
const expiredContracts = computed(() => contracts.value.filter((c: any) => c.estado === 'VENCIDO').length)

const getStatusType = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  const types: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
    'VIGENTE': 'success',
    'POR_VENCER': 'warning',
    'VENCIDO': 'error',
    'SUSPENDIDO': 'primary'
  }
  return types[status] || 'default'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Indefinido'
  return new Date(dateStr).toLocaleDateString('es-PE')
}

const columns = [
  {
    title: 'Empleado',
    key: 'empleado',
    render(row: any) {
      return h('div', { class: 'employee-info' }, [
        h(AppleAvatar, { src: '', size: 'sm', name: row.nombreCompleto || '' }),
        h('div', { style: 'margin-left: 10px;' }, [
          h('div', { style: 'font-weight: 500;' }, row.nombreCompleto || ''),
          h('div', { style: 'font-size: 12px; color: var(--color-text-secondary);' }, `DNI: ${row.numeroDocumento || ''}`)
        ])
      ])
    }
  },
  { title: 'Tipo', key: 'tipoContrato', width: '140px' },
  { title: 'Régimen', key: 'regimenLaboral', width: '140px', render: (row: any) => h(AppleTag, { type: 'primary', label: row.regimenLaboral || '' }) },
  { title: 'Cargo', key: 'cargo', width: '160px' },
  {
    title: 'Período',
    key: 'periodo',
    width: '160px',
    render(row: any) {
      return h('div', { class: 'periodo-info' }, [
        h('div', {}, `Inicio: ${formatDate(row.fechaInicio)}`),
        h('div', { style: 'font-size: 12px;' }, `Fin: ${formatDate(row.fechaFin)}`)
      ])
    }
  },
  { title: 'Sueldo', key: 'salarioBase', width: '120px', render: (row: any) => h('strong', {}, `S/ ${(row.salarioBase || 0).toLocaleString()}`) },
  {
    title: 'Estado',
    key: 'estado',
    width: '110px',
    render(row: any) {
      const labels: Record<string, string> = { 'VIGENTE': 'Vigente', 'POR_VENCER': 'Por Vencer', 'VENCIDO': 'Vencido', 'SUSPENDIDO': 'Suspendido' }
      return h(AppleTag, { type: getStatusType(row.estado), label: labels[row.estado] || row.estado })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: '200px',
    render(row: any) {
      return h('div', { class: 'actions' }, [
        h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => viewContract(row.id) }, () => 'Ver'),
        h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => renewContract(row.id) }, () => 'Renovar'),
        h(AppleButton, { variant: 'ghost', size: 'small', onClick: () => terminateContract(row.id) }, () => 'Terminar')
      ])
    }
  }
]

const filteredContracts = computed(() => {
  let data = contracts.value
  if (search.value) {
    const s = search.value.toLowerCase()
    data = data.filter((c: any) => c.nombreCompleto?.toLowerCase().includes(s) || c.numeroDocumento?.includes(search.value))
  }
  if (filterStatus.value !== 'todos') {
    data = data.filter((c: any) => c.estado === filterStatus.value)
  }
  return data
})

const loadContracts = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/contracts')
    if (Array.isArray(data)) {
      contracts.value = data.map(c => ({
        ...c,
        id: c.id || c.contratoId,
        employeeId: c.employeeId || c.empleadoId,
        nombreCompleto: c.nombreCompleto || c.empleadoNombre || `${c.empleado?.nombre} ${c.empleado?.apellido}`,
        numeroDocumento: c.numeroDocumento || c.dni || c.empleado?.dni,
        tipoContrato: c.tipoContrato || c.tipo || 'Indeterminado',
        regimenLaboral: c.regimenLaboral || c.regimen || 'General',
        cargo: c.cargo || c.puesto || 'Sin cargo',
        fechaInicio: c.fechaInicio || c.inicio,
        fechaFin: c.fechaFin || c.fin,
        salarioBase: c.salarioBase || c.sueldo || c.salario || 0,
        estado: c.estado || c.estadoContrato || 'VIGENTE'
      }))
    } else if (data.success && data.data) {
      contracts.value = data.data.map((c: any) => ({
        ...c,
        id: c.id || c.contratoId,
        employeeId: c.employeeId || c.empleadoId,
        nombreCompleto: c.nombreCompleto || c.empleadoNombre || `${c.empleado?.nombre} ${c.empleado?.apellido}`,
        numeroDocumento: c.numeroDocumento || c.dni || c.empleado?.dni,
        tipoContrato: c.tipoContrato || c.tipo || 'Indeterminado',
        regimenLaboral: c.regimenLaboral || c.regimen || 'General',
        cargo: c.cargo || c.puesto || 'Sin cargo',
        fechaInicio: c.fechaInicio || c.inicio,
        fechaFin: c.fechaFin || c.fin,
        salarioBase: c.salarioBase || c.sueldo || c.salario || 0,
        estado: c.estado || c.estadoContrato || 'VIGENTE'
      }))
    }
  } catch (error: any) {
    console.error('Error loading contracts:', error)
    if (error.response?.status === 401) {
      message.error('Sesión expirada. Por favor inicie sesión nuevamente.')
    } else {
      // Si la API falla, usamos datos mock para demostración
      contracts.value = getMockContracts()
      message.warning('Usando datos de demostración')
    }
  } finally {
    loading.value = false
  }
}

const getMockContracts = (): Contract[] => [
  {
    id: 'CTR-001',
    employeeId: 'EMP-001',
    nombreCompleto: 'Juan Carlos Pérez García',
    numeroDocumento: '47856321',
    tipoContrato: 'Indeterminado',
    regimenLaboral: 'GRP - Régimen General de la Actividad Privada',
    cargo: 'Ingeniero de Software Senior',
    fechaInicio: '2022-03-15',
    fechaFin: '2026-12-31',
    salarioBase: 8500,
    estado: 'VIGENTE'
  },
  {
    id: 'CTR-002',
    employeeId: 'EMP-002',
    nombreCompleto: 'María Elena López Mendoza',
    numeroDocumento: '29587416',
    tipoContrato: 'Plazo Fijo',
    regimenLaboral: 'RAC - Régimen Agrario de Cocaña',
    cargo: 'Gerente de Recursos Humanos',
    fechaInicio: '2024-01-15',
    fechaFin: '2025-01-14',
    salarioBase: 12000,
    estado: 'VIGENTE'
  },
  {
    id: 'CTR-003',
    employeeId: 'EMP-003',
    nombreCompleto: 'Roberto Carlos Mendoza Silva',
    numeroDocumento: '15284739',
    tipoContrato: 'Indeterminado',
    regimenLaboral: 'RCL - Construcción Civil',
    cargo: 'Supervisor de Obra',
    fechaInicio: '2021-06-01',
    fechaFin: '2025-02-28',
    salarioBase: 7200,
    estado: 'POR_VENCER'
  },
  {
    id: 'CTR-004',
    employeeId: 'EMP-004',
    nombreCompleto: 'Ana Sofía Torres Ruiz',
    numeroDocumento: '61829374',
    tipoContrato: 'Plazo Fijo',
    regimenLaboral: 'RMR - Régimen de la Microempresa',
    cargo: 'Asistente Administrativa',
    fechaInicio: '2024-06-01',
    fechaFin: '2024-12-31',
    salarioBase: 2500,
    estado: 'VIGENTE'
  },
  {
    id: 'CTR-005',
    employeeId: 'EMP-005',
    nombreCompleto: 'Pedro Andrés Fernández Díaz',
    numeroDocumento: '38274651',
    tipoContrato: 'Indeterminado',
    regimenLaboral: 'RNP - Régimen Nacional de Pensiones',
    cargo: 'Analista Contable',
    fechaInicio: '2023-09-01',
    fechaFin: '2025-06-30',
    salarioBase: 4800,
    estado: 'SUSPENDIDO'
  },
  {
    id: 'CTR-006',
    employeeId: 'EMP-006',
    nombreCompleto: 'Carmen Rosa Vásquez López',
    numeroDocumento: '52938471',
    tipoContrato: 'Indeterminado',
    regimenLaboral: 'GRP - Régimen General de la Actividad Privada',
    cargo: 'Jefa de Marketing Digital',
    fechaInicio: '2020-01-10',
    fechaFin: '2024-11-30',
    salarioBase: 9500,
    estado: 'VENCIDO'
  }
]

const viewContract = (id: string) => {
  const contract = contracts.value.find(c => c.id === id)
  if (contract) {
    message.info(`Ver contrato: ${contract.nombreCompleto}`)
  }
}

const renewContract = (id: string) => {
  const contract = contracts.value.find(c => c.id === id)
  if (contract) {
    selectedContract.value = contract
    showRenewModal.value = true
  }
}

const terminateContract = (id: string) => {
  const contract = contracts.value.find(c => c.id === id)
  if (contract) {
    selectedContract.value = contract
    showTerminateModal.value = true
  }
}

const confirmTerminate = async () => {
  if (!selectedContract.value || !terminateMotivo.value) {
    message.warning('Por favor ingrese el motivo de terminación')
    return
  }
  
  try {
    await api.put(`/contracts/${selectedContract.value.id}/terminate`, {
      motivo: terminateMotivo.value
    })
    message.success('Contrato terminado exitosamente')
    showTerminateModal.value = false
    loadContracts()
  } catch (error: any) {
    console.error('Error terminating contract:', error)
    message.error('Error al terminar el contrato')
  }
}

const confirmRenew = async () => {
  if (!selectedContract.value || !renewFechaFin.value) {
    message.warning('Por favor seleccione la nueva fecha de finalización')
    return
  }
  
  try {
    await api.put(`/contracts/${selectedContract.value.id}/renew`, {
      nuevaFechaFin: renewFechaFin.value.toISOString()
    })
    message.success('Contrato renovado exitosamente')
    showRenewModal.value = false
    loadContracts()
  } catch (error: any) {
    console.error('Error renewing contract:', error)
    message.error('Error al renovar el contrato')
  }
}

onMounted(() => loadContracts())
</script>

<style scoped>
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.header-left, .header-right { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.search-input { max-width: 250px; }
.filter-select { min-width: 140px; }
.employee-info { display: flex; align-items: center; }
.periodo-info { font-size: 13px; }
.actions { display: flex; gap: 6px; }
.textarea-input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical; font-family: inherit; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: span 2; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
</style>
