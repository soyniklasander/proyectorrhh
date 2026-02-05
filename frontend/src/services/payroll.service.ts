import { api } from './api'

export interface Loan {
  id: string
  empleadoId: string
  empleadoCodigo: string
  empleadoNombre: string
  montoTotal: number
  cuotaMensual: number
  cuotasPagadas: number
  cuotasTotales: number
  saldoPendiente: number
  tasaInteres: number
  estado: 'ACTIVO' | 'CANCELADO' | 'ANULADO'
  fechaInicio: string
  fechaFin?: string
  motivo?: string
  createdAt: string
  updatedAt: string
  cuotas?: LoanCuota[]
}

export interface LoanCuota {
  id: string
  loanId: string
  numeroCuota: number
  montoCuota: number
  montoPagado: number
  fechaVencimiento: string
  fechaPago?: string
  estado: 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'ANULADA'
  observacion?: string
}

export interface CreateLoanData {
  empleadoId: string
  montoTotal: number
  cuotasTotales: number
  tasaInteres: number
  fechaInicio: string
  motivo?: string
}

export interface UpdateLoanData {
  tasaInteres?: number
  motivo?: string
  estado?: 'ACTIVO' | 'ANULADO'
}

export interface EmployeeDiscount {
  id: string
  empleadoId: string
  empleadoCodigo: string
  empleadoNombre: string
  tipoDescuentoId: string
  tipoDescuentoNombre: string
  concepto: string
  monto: number
  porcentaje?: number
  estado: 'ACTIVO' | 'INACTIVO' | 'LIQUIDADO'
  referencias?: string
  createdAt: string
  updatedAt: string
}

export interface DiscountType {
  id: string
  nombre: string
  codigo: string
  tipo: 'PORCENTUAL' | 'FIJO'
  valor: number
  aplicaA: 'SUELDO' | 'HORAS_EXTRAS' | 'VACACIONES' | 'CTS' | 'TODOS'
  obligatorio: boolean
  orden: number
  activo: boolean
}

export interface CreateEmployeeDiscountData {
  empleadoId: string
  tipoDescuentoId: string
  concepto: string
  monto: number
  porcentaje?: number
  referencias?: string
}

export interface CreateDiscountTypeData {
  nombre: string
  codigo: string
  tipo: 'PORCENTUAL' | 'FIJO'
  valor: number
  aplicaA: 'SUELDO' | 'HORAS_EXTRAS' | 'VACACIONES' | 'CTS' | 'TODOS'
  obligatorio: boolean
  orden: number
}

export interface Payslip {
  id: string
  empleadoId: string
  empleadoCodigo: string
  empleadoNombre: string
  empleadoDni: string
  periodo: string
  periodoLabel: string
  tipoPlanilla: string
  estado: 'BORRADOR' | 'PROCESADO' | 'APROBADO' | 'PAGADO'
  
  ingresos: {
    salarioBase: number
    horasExtras25: number
    horasExtras35: number
    horasExtras100: number
    bonificacionProductividad: number
    bonificacionPuesto: number
    asignacionFamiliar: number
    movilidad: number
    refrigerio: number
    vacacionesTruncas: number
    otrosIngresos: number
    totalIngresos: number
  }
  
  descuentos: {
    afpOnp: number
    essalud: number
    sctr: number
    quintaCategoria: number
    prestamos: number
    adelantos: number
    faltas: number
    tardanzas: number
    otrosDescuentos: number
    totalDescuentos: number
  }
  
  netoPagar: number
  datosBancarios?: {
    banco: string
    tipoCuenta: string
    numeroCuenta: string
    numeroCci: string
  }
  createdAt: string
  updatedAt: string
}

export interface GeneratePayrollData {
  periodo: string
  employeeIds?: string[]
  includeInactive?: boolean
  regenerateExisting?: boolean
}

export interface Liquidation {
  id: string
  empleadoId: string
  empleadoCodigo: string
  empleadoNombre: string
  empleadoDni: string
  tipoLiquidacion: 'RENUNCIA' | 'DESPIDO' | 'CESE' | 'FIN_CONTRATO' | 'OTRO'
  fechaIngreso: string
  fechaLiquidacion: string
  diasLaborados: number
  mesesLaborados: number
  
  conceptos: {
    remuneracion: number
    vacacionesTruncas: number
    bonificacion: number
    cts: number
    gratificacion: number
    lucroCesesantia: number
    otros: number
    totalBruto: number
  }
  
  descuentos: {
    afpOnp: number
    essalud: number
    adelantos: number
    prestamos: number
    otros: number
    totalDescuentos: number
  }
  
  totalNeto: number
  estado: 'PENDIENTE' | 'CALCULADA' | 'APROBADA' | 'PAGADA' | 'ANULADA'
  observacion?: string
  aprobadoPor?: string
  fechaAprobacion?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLiquidationData {
  empleadoId: string
  tipoLiquidacion: 'RENUNCIA' | 'DESPIDO' | 'CESE' | 'FIN_CONTRATO' | 'OTRO'
  fechaLiquidacion: string
  observacion?: string
}

const PAYROLL_SERVICE = {
  async getLoans(params?: { empleadoId?: string; estado?: string; page?: number; limit?: number }): Promise<{ data: Loan[]; total: number }> {
    const query = new URLSearchParams()
    if (params?.empleadoId) query.set('empleadoId', params.empleadoId)
    if (params?.estado) query.set('estado', params.estado)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    
    const { data } = await api.get(`/payroll/loans?${query.toString()}`)
    return data
  },

  async getLoanById(id: string): Promise<{ data: Loan }> {
    const { data } = await api.get(`/payroll/loans/${id}`)
    return data
  },

  async createLoan(payload: CreateLoanData): Promise<{ data: Loan }> {
    const { data } = await api.post('/payroll/loans', payload)
    return data
  },

  async updateLoan(id: string, payload: UpdateLoanData): Promise<{ data: Loan }> {
    const { data } = await api.put(`/payroll/loans/${id}`, payload)
    return data
  },

  async deleteLoan(id: string): Promise<void> {
    await api.delete(`/payroll/loans/${id}`)
  },

  async getLoanCuotas(loanId: string): Promise<{ data: LoanCuota[] }> {
    const { data } = await api.get(`/payroll/loans/${loanId}/cuotas`)
    return data
  },

  async getEmployeeDiscounts(params?: { empleadoId?: string; estado?: string; page?: number; limit?: number }): Promise<{ data: EmployeeDiscount[]; total: number }> {
    const query = new URLSearchParams()
    if (params?.empleadoId) query.set('empleadoId', params.empleadoId)
    if (params?.estado) query.set('estado', params.estado)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    
    const { data } = await api.get(`/payroll/discounts/employee?${query.toString()}`)
    return data
  },

  async createEmployeeDiscount(payload: CreateEmployeeDiscountData): Promise<{ data: EmployeeDiscount }> {
    const { data } = await api.post('/payroll/discounts/employee', payload)
    return data
  },

  async deleteEmployeeDiscount(id: string): Promise<void> {
    await api.delete(`/payroll/discounts/employee/${id}`)
  },

  async getDiscountTypes(): Promise<{ data: DiscountType[] }> {
    const { data } = await api.get('/payroll/discounts/types')
    return data
  },

  async createDiscountType(payload: CreateDiscountTypeData): Promise<{ data: DiscountType }> {
    const { data } = await api.post('/payroll/discounts/types', payload)
    return data
  },

  async getPayslips(params?: { periodo?: string; empleadoId?: string; estado?: string; page?: number; limit?: number }): Promise<{ data: Payslip[]; total: number }> {
    const query = new URLSearchParams()
    if (params?.periodo) query.set('periodo', params.periodo)
    if (params?.empleadoId) query.set('empleadoId', params.empleadoId)
    if (params?.estado) query.set('estado', params.estado)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    
    const { data } = await api.get(`/payroll/payslips?${query.toString()}`)
    return data
  },

  async getPayslipById(id: string): Promise<{ data: Payslip }> {
    const { data } = await api.get(`/payroll/payslips/${id}`)
    return data
  },

  async generatePayroll(payload: GeneratePayrollData): Promise<{ data: { generados: number; actualizados: number; errores: number } }> {
    const { data } = await api.post('/payroll/payslips/generate', payload)
    return data
  },

  async exportPayslips(periodo: string): Promise<Blob> {
    const { data } = await api.post('/payroll/payslips/export', { periodo }, { responseType: 'blob' })
    return data
  },

  async getLiquidations(params?: { estado?: string; page?: number; limit?: number }): Promise<{ data: Liquidation[]; total: number }> {
    const query = new URLSearchParams()
    if (params?.estado) query.set('estado', params.estado)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    
    const { data } = await api.get(`/payroll/liquidations?${query.toString()}`)
    return data
  },

  async getLiquidationById(id: string): Promise<{ data: Liquidation }> {
    const { data } = await api.get(`/payroll/liquidations/${id}`)
    return data
  },

  async createLiquidation(payload: CreateLiquidationData): Promise<{ data: Liquidation }> {
    const { data } = await api.post('/payroll/liquidations', payload)
    return data
  },

  async calculateLiquidation(id: string): Promise<{ data: Liquidation }> {
    const { data } = await api.post(`/payroll/liquidations/calculate/${id}`)
    return data
  },

  async approveLiquidation(id: string): Promise<{ data: Liquidation }> {
    const { data } = await api.put(`/payroll/liquidations/${id}/approve`)
    return data
  },

  async exportLiquidation(id: string): Promise<Blob> {
    const { data } = await api.get(`/payroll/liquidations/${id}/export`, { responseType: 'blob' })
    return data
  }
}

export default PAYROLL_SERVICE
