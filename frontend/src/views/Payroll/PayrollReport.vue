<script setup lang="ts">
import { ref } from 'vue'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}

const payrollData = ref({
  employee: {
    name: 'Carlos Ruiz',
    dni: '45678912',
    position: 'Gerente de Ventas',
    department: 'Comercial',
    hireDate: '15 Ene, 2022',
    regimen: 'Régimen General'
  },
  earnings: [
    { concept: 'Sueldo Basico', days: 30, amount: 15000.00 },
    { concept: 'Asignacion Familiar', days: 30, amount: 1025.00 },
    { concept: 'Horas Extras (12 hrs)', days: 12, amount: 450.00 },
    { concept: 'Bono de Produccion', days: 1, amount: 2500.00 }
  ],
  deductions: [
    { concept: 'AFP (Onp/Afp)', amount: 1650.00 },
    { concept: 'Retencion Judicial', amount: 800.00 },
    { concept: 'Adelanto de Sueldo', amount: 500.00 }
  ],
  employerContributions: [
    { concept: 'Essalud (9%)', amount: 1350.00 },
    { concept: 'Senati (0.75%)', amount: 112.50 },
    { concept: 'SCTR Pension', amount: 45.00 },
    { concept: 'SCTR Salud', amount: 37.50 }
  ],
  totals: {
    gross: 17975.00,
    totalDeductions: 2950.00,
    net: 15025.00,
    employerTotal: 1545.00
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Boleta de Pago Electronica</h1>
        <p class="text-slate-500">Detalle de remuneraciones y deducciones del periodo.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
          <span class="material-icons text-sm">download</span>
          Descargar PDF
        </button>
        <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <span class="material-icons text-sm\">email</span>
          Enviar por Email
        </button>
      </div>
    </div>

    <!-- Employee Info Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-wider">Colaborador</p>
          <p class="font-bold text-lg">{{ payrollData.employee.name }}</p>
          <p class="text-sm text-slate-500">DNI: {{ payrollData.employee.dni }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-wider">Cargo / Area</p>
          <p class="font-medium">{{ payrollData.employee.position }}</p>
          <p class="text-sm text-slate-500">{{ payrollData.employee.department }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-wider">Fecha de Ingreso</p>
          <p class="font-medium">{{ payrollData.employee.hireDate }}</p>
          <p class="text-sm text-slate-500">{{ payrollData.employee.regimen }}</p>
        </div>
      </div>
    </div>

    <!-- Earnings Section -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
      <div class="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800 px-6 py-3">
        <h2 class="font-bold text-green-800 dark:text-green-200">INGRESOS</h2>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Concepto</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Dias/Hrs</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Monto (PEN)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="(item, index) in payrollData.earnings" :key="index">
            <td class="px-6 py-3 font-medium">{{ item.concept }}</td>
            <td class="px-6 py-3 text-center">{{ item.days }}</td>
            <td class="px-6 py-3 text-right">{{ formatCurrency(item.amount) }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-slate-50 dark:bg-slate-800 font-bold">
          <tr>
            <td class="px-6 py-3">TOTAL INGRESOS</td>
            <td class="px-6 py-3"></td>
            <td class="px-6 py-3 text-right text-green-600">{{ formatCurrency(payrollData.totals.gross) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Deductions Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 px-6 py-3">
          <h2 class="font-bold text-red-800 dark:text-red-200">DESCUENTOS</h2>
        </div>
        <table class="w-full text-sm">
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="(item, index) in payrollData.deductions" :key="index">
              <td class="px-6 py-3 font-medium">{{ item.concept }}</td>
              <td class="px-6 py-3 text-right text-red-600">- {{ formatCurrency(item.amount) }}</td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 dark:bg-slate-800 font-bold">
            <tr>
              <td class="px-6 py-3">TOTAL DESCUENTOS</td>
              <td class="px-6 py-3 text-right text-red-600">- {{ formatCurrency(payrollData.totals.totalDeductions) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Employer Contributions -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800 px-6 py-3">
          <h2 class="font-bold text-purple-800 dark:text-purple-200">APORTES DEL EMPLEADOR</h2>
        </div>
        <table class="w-full text-sm">
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="(item, index) in payrollData.employerContributions" :key="index">
              <td class="px-6 py-3 font-medium">{{ item.concept }}</td>
              <td class="px-6 py-3 text-right text-purple-600">{{ formatCurrency(item.amount) }}</td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 dark:bg-slate-800 font-bold">
            <tr>
              <td class="px-6 py-3">TOTAL APORTES</td>
              <td class="px-6 py-3 text-right text-purple-600">{{ formatCurrency(payrollData.totals.employerTotal) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Net Pay Summary -->
    <div class="bg-primary text-white rounded-xl p-6 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm opacity-80">NETO A PAGAR AL TRABAJADOR</p>
          <p class="text-3xl font-bold mt-1">{{ formatCurrency(payrollData.totals.net) }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm opacity-80">TOTAL COSTO EMPRESA</p>
          <p class="text-2xl font-bold mt-1">{{ formatCurrency(payrollData.totals.gross + payrollData.totals.employerTotal) }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center text-xs text-slate-500">
      <p>Esta boleta de pago electronica ha sido generada automaticamente por ERPRick.</p>
      <p class="mt-1">NexaCorp Peru S.A.C. - RUC: 20601234567</p>
    </div>
  </div>
</template>
