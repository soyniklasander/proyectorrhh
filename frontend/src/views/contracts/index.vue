<template>
  <AppleContainer>
    <ApplePageHeader
      title="Gestión de Contratos"
      subtitle="Administración de vínculos laborales y adendas"
    >
      <template #actions>
        <AppleButton variant="primary" :icon="PlusIcon" @click="$router.push('/contracts/new')">
          Nuevo Contrato
        </AppleButton>
      </template>
    </ApplePageHeader>

    <!-- Stats Row -->
    <AppleGrid :columns="3" style="margin-bottom: 24px;">
      <AppleStatCard
        :icon="DocumentIcon"
        :value="contracts.length"
        label="Total Contratos"
        color="blue"
      />
      <AppleStatCard
        :icon="CheckIcon"
        :value="activeCount"
        label="Vigentes"
        color="green"
      />
      <AppleStatCard
        :icon="AlertIcon"
        :value="expiringCount"
        label="Por Vencer"
        color="orange"
      />
    </AppleGrid>

    <AppleCard>
      <AppleTable
        :columns="columns"
        :data="contracts"
        :loading="loading"
        :bordered="false"
        :striped="true"
        pagination
      />
    </AppleCard>
  </AppleContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  AppleContainer,
  ApplePageHeader,
  AppleGrid,
  AppleStatCard,
  AppleCard,
  AppleButton,
  AppleTable,
  AppleTag,
  AppleAvatar
} from '@/components/apple'
import { Plus, FileText, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { api } from '@/services/api'
import dayjs from 'dayjs'

const PlusIcon = Plus
const DocumentIcon = FileText
const CheckIcon = CheckCircle
const AlertIcon = AlertCircle

interface Contract {
  id: string
  nombreCompleto?: string
  cargo: string
  fechaInicio: string
  fechaFin?: string
  salarioBase: number
  estado: string
  email?: string
  [key: string]: any
}

const contracts = ref<Contract[]>([])
const loading = ref(false)

const activeCount = computed(() => contracts.value.filter(c => c.estado === 'VIGENTE').length)
const expiringCount = computed(() => 0)

const getStatusType = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'VIGENTE': return 'success'
    case 'POR_VENCER': return 'warning'
    case 'VENCIDO': return 'error'
    default: return 'default'
  }
}

const columns = [
  {
    title: 'Colaborador',
    key: 'nombreCompleto',
    width: '200px',
    render(row: Contract) {
      return h('div', { class: 'name-cell' }, [
        h(AppleAvatar, {
          src: '',
          size: 'sm',
          name: row.nombreCompleto || 'SN'
        }),
        h('div', { style: 'margin-left: 10px;' }, [
          h('div', { style: 'font-weight: 500; color: var(--color-text-primary);' }, row.nombreCompleto || 'Sin Nombre'),
          h('div', { style: 'font-size: 12px; color: var(--color-text-secondary);' }, row.email || '')
        ])
      ])
    }
  },
  { title: 'Cargo', key: 'cargo', width: '150px' },
  {
    title: 'Inicio',
    key: 'fechaInicio',
    width: '110px',
    render(row: Contract) {
      return dayjs(row.fechaInicio).format('DD/MM/YYYY')
    }
  },
  {
    title: 'Fin',
    key: 'fechaFin',
    width: '110px',
    render(row: Contract) {
      return row.fechaFin ? dayjs(row.fechaFin).format('DD/MM/YYYY') : 'Indefinido'
    }
  },
  {
    title: 'Salario',
    key: 'salarioBase',
    width: '120px',
    render(row: Contract) {
      return h('strong', `S/ ${row.salarioBase.toLocaleString()}`)
    }
  },
  {
    title: 'Estado',
    key: 'estado',
    width: '110px',
    render(row: Contract) {
      return h(AppleTag, {
        type: getStatusType(row.estado),
        label: row.estado
      })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: '100px',
    render(row: Contract) {
      return h(AppleButton, {
        variant: 'ghost',
        size: 'small',
        onClick: () => console.log('View', row.id)
      }, () => 'Ver')
    }
  }
]

const fetchContracts = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/contracts')
    if (data.success) {
      contracts.value = data.data
    }
  } catch (error) {
    console.error('Error fetching contracts:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchContracts)
</script>

<style scoped>
.name-cell {
  display: flex;
  align-items: center;
}
</style>
