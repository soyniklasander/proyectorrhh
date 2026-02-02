import { BaseEntity, SelectOption } from './index'
import type { Employee, Contract } from './employee.types'

// Enums para nómina
export enum EstadoPayroll {
  BORRADOR = 'BORRADOR',
  PROCESADO = 'PROCESADO',
  APROBADO = 'APROBADO',
  PAGADO = 'PAGADO'
}

export enum TipoDescuento {
  AFP = 'AFP',
  ONP = 'ONP',
  ESSALUD = 'ESSALUD',
  SCTR = 'SCTR',
  PRESTAMO = 'PRÉSTAMO',
  ADELANTO = 'ADELANTO',
  FALTA = 'FALTA',
  TARDANZA = 'TARDANZA',
  OTRO = 'OTRO'
}

// Interfaces principales
export interface Payroll extends BaseEntity {
  empleadoId: string
  contratoId: string
  periodo: string
  
  // Ingresos
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
  CTS: number
  gratificacion: number
  utilidades: number
  
  // Descuentos
  totalAFP_ONP: number
  totalEssalud: number
  totalSCTR: number
  quintaCategoria: number
  prestamos: number
  adelantos: number
  faltasInjustificadas: number
  tardanzas: number
  otrosDescuentos: number
  
  // Detalles AFP
  aporteObligatorio: number
  comisionFlujo: number
  primaSeguro: number
  
  // Totales
  totalIngresos: number
  totalDescuentos: number
  netoPagar: number
  
  // Control
  estado: EstadoPayroll
  fechaProceso: string
  procesadoPor?: string
  aprobadoPor?: string
  fechaPago?: string
  bancoPago?: string
  numeroReferencia?: string
  
  // Relaciones
  employee?: Employee
  contract?: Contract
  deductions?: Deduction[]
}

export interface Deduction extends BaseEntity {
  empleadoId: string
  contratoId: string
  periodo: string
  tipoDescuento: TipoDescuento
  concepto: string
  monto: number
  porcentaje?: number
  baseCalculo?: number
  descripcion?: string
  referencia?: string
  estado: string
  
  // Auditoría
  creadoPor?: string
  fechaCreacion: string
  autorizadoPor?: string
  fechaAutorizacion?: string
  
  // Relaciones
  employee?: Employee
  contract?: Contract
}

export interface PayrollFilters {
  periodo?: string
  empleadoId?: string
  estado?: EstadoPayroll
  fechaProcesoDesde?: string
  fechaProcesoHasta?: string
  page?: number
  limit?: number
}

export interface PayrollGenerateData {
  periodo: string
  employeeIds?: string[]
  includeInactive?: boolean
  regenerateExisting?: boolean
}

export interface PayrollCalculateData {
  empleadoId: string
  contratoId: string
  periodo: string
  // Datos adicionales para cálculo
  diasTrabajados?: number
  horasExtras?: OvertimeHour[]
  faltas?: number
  tardanzas?: number
}

export interface OvertimeHour {
  id: string
  empleadoId: string
  contratoId: string
  fecha: string
  totalHoras: number
  tipoHora: string
  montoCalculado: number
}

// Interfaces para exportación Excel
export interface PayrollExportData {
  periodo: string
  fechaGeneracion: string
  generadoPor: string
  totalEmpleados: number
  totalIngresos: number
  totalDescuentos: number
  totalNetoPagar: number
  empleados: PayrollExportEmployee[]
}

export interface PayrollExportEmployee {
  numero: number
  dni: string
  nombreCompleto: string
  cargo: string
  // Datos bancarios
  banco: string
  tipoCuenta: string
  numeroCuenta: string
  numeroCCI: string
  
  // Remuneración
  salarioBase: number
  horasExtras: number
  bonificaciones: number
  asignaciones: number
  totalIngresos: number
  
  // Descuentos
  afpOnp: number
  essalud: number
  prestamos: number
  otrosDescuentos: number
  totalDescuentos: number
  
  // Neto
  netoPagar: number
  
  // Estado
  estado: string
  observaciones?: string
}

// Configuración para cálculo de nómina
export interface PayrollConfig {
  // Asignación familiar (S/. 93.00)
  asignacionFamiliar: number
  
  // Tasas AFP
  tasasAFP: {
    [key: string]: {
      aporteObligatorio: number
      comisionFlujo: number
      primaSeguro: number
    }
  }
  
  // Tasa ONP
  tasaONP: number
  
  // Tasa Essalud
  tasaEssalud: number
  
  // Tasas de horas extra
  tasasHorasExtra: {
    hora25: number
    hora35: number
    hora100: number
  }
  
  // Configuración SCTR
  sctrSalud: number
  sctrPension: number
  
  // Quinta categoría
  quintaCategoria: {
    uit: number
    limiteInferior: number
    limiteSuperior: number
    tasas: { [key: number]: number }
  }
}

// Datos para resumen de nómina
export interface PayrollSummary {
  periodo: string
  totalEmpleados: number
  empleadosActivos: number
  totalIngresos: number
  totalDescuentos: number
  totalNetoPagar: number
  
  // Desglose por conceptos
  resumenIngresos: {
    salarioBase: number
    horasExtras: number
    bonificaciones: number
    asignacionFamiliar: number
    otrosIngresos: number
  }
  
  resumenDescuentos: {
    afpOnp: number
    essalud: number
    prestamos: number
    otrosDescuentos: number
  }
  
  // Estadísticas
  promedioSalario: number
  maximoSalario: number
  minimoSalario: number
}

// Opciones para selects
export const ESTADO_PAYROLL_OPTIONS: SelectOption[] = [
  { label: 'Borrador', value: EstadoPayroll.BORRADOR },
  { label: 'Procesado', value: EstadoPayroll.PROCESADO },
  { label: 'Aprobado', value: EstadoPayroll.APROBADO },
  { label: 'Pagado', value: EstadoPayroll.PAGADO }
]

export const TIPO_DESCUENTO_OPTIONS: SelectOption[] = [
  { label: 'AFP', value: TipoDescuento.AFP },
  { label: 'ONP', value: TipoDescuento.ONP },
  { label: 'Essalud', value: TipoDescuento.ESSALUD },
  { label: 'SCTR', value: TipoDescuento.SCTR },
  { label: 'Préstamo', value: TipoDescuento.PRESTAMO },
  { label: 'Adelanto', value: TipoDescuento.ADELANTO },
  { label: 'Falta', value: TipoDescuento.FALTA },
  { label: 'Tardanza', value: TipoDescuento.TARDANZA },
  { label: 'Otro', value: TipoDescuento.OTRO }
]

// Configuración por defecto Perú
export const PERU_PAYROLL_CONFIG: PayrollConfig = {
  asignacionFamiliar: 93.00,
  tasaONP: 0.13,
  tasaEssalud: 0.09,
  tasasHorasExtra: {
    hora25: 1.25,
    hora35: 1.35,
    hora100: 2.00
  },
  sctrSalud: 0.09,
  sctrPension: 0.0278,
  tasasAFP: {
    'PRIMA': {
      aporteObligatorio: 0.10,
      comisionFlujo: 0.0169,
      primaSeguro: 0.0113
    },
    'PROFUTURO': {
      aporteObligatorio: 0.10,
      comisionFlujo: 0.0149,
      primaSeguro: 0.0122
    },
    'INTEGRA': {
      aporteObligatorio: 0.10,
      comisionFlujo: 0.0139,
      primaSeguro: 0.0127
    },
    'HABITAT': {
      aporteObligatorio: 0.10,
      comisionFlujo: 0.0144,
      primaSeguro: 0.0122
    }
  },
  quintaCategoria: {
    uit: 4950, // UIT 2024
    limiteInferior: 7 * 4950,
    limiteSuperior: 35 * 4950,
    tasas: {
      8: 0.08,
      14: 0.14,
      17: 0.17,
      20: 0.20
    }
  }
}