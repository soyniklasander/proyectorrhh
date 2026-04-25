// Types generales para la aplicación

// Tipo base para entidades
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// Tipo para respuesta de API
export interface ApiResponse<T> {
  success: boolean
  data: T
  statusCode: number
  timestamp: string
}

// Tipo para paginación
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Tipo para respuesta paginada
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta
}

// Tipos para filtros comunes
export interface DateRange {
  startDate: string
  endDate: string
}

export interface SortOption {
  field: string
  order: 'asc' | 'desc'
}

// Tipo para opciones de select
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// Tipo para tabla
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, record: any) => any
}

// Tipo para filtros de tabla
export interface TableFilters {
  search?: string
  page?: number
  limit?: number
  sort?: SortOption
  [key: string]: any
}

// Estado de carga
export interface LoadingState {
  loading: boolean
  error: string | null
}

// Estados comunes en Perú
export const EMPLEADO_ESTADOS = [
  { label: 'Activo', value: 'ACTIVO' },
  { label: 'Inactivo', value: 'INACTIVO' },
  { label: 'Suspendido', value: 'SUSPENDIDO' },
  { label: 'Cesado', value: 'CESADO' }
] as const

export const CONTRATO_ESTADOS = [
  { label: 'Vigente', value: 'VIGENTE' },
  { label: 'Suspendido', value: 'SUSPENDIDO' },
  { label: 'Finalizado', value: 'FINALIZADO' },
  { label: 'Renovado', value: 'RENOVADO' }
] as const

export const TIPO_CONTRATO = [
  { label: 'Indeterminado', value: 'INDETERMINADO' },
  { label: 'Plazo Fijo', value: 'PLAZO_FIJO' },
  { label: 'Tiempo Parcial', value: 'TIEMPO_PARCIAL' },
  { label: 'CAS', value: 'CAS' },
  { label: 'Locación de Servicios', value: 'LOCACION_SERVICIOS' },
  { label: 'Prácticas', value: 'PRACTICAS' },
  { label: 'Capacitación', value: 'CAPACITACION' }
] as const

export const REGIMEN_LABORAL = [
  { label: 'General', value: 'GENERAL' },
  { label: 'Microempresa', value: 'MICROEMPRESA' },
  { label: 'Pequeña Empresa', value: 'PEQUENA_EMPRESA' },
  { label: 'CAS', value: 'CAS' },
  { label: 'Agrario', value: 'AGRARIO' },
  { label: 'Pesquero', value: 'PESQUERO' },
  { label: 'Construcción', value: 'CONSTRUCCION' }
] as const

export const TIPO_DOCUMENTO = [
  { label: 'DNI', value: 'DNI' },
  { label: 'Carnet de Extranjería', value: 'CARNET_EXTRANJERIA' },
  { label: 'Pasaporte', value: 'PASAPORTE' }
] as const

export const ESTADO_CIVIL = [
  { label: 'Soltero/a', value: 'SOLTERO' },
  { label: 'Casado/a', value: 'CASADO' },
  { label: 'Divorciado/a', value: 'DIVORCIADO' },
  { label: 'Viudo/a', value: 'VIUDO' },
  { label: 'Conviviente', value: 'CONVIVIENTE' }
] as const

export const TIPO_CUENTA_BANCARIA = [
  { label: 'Ahorros', value: 'AHORROS' },
  { label: 'Corriente', value: 'CORRIENTE' }
] as const

export const AFP_OPTIONS = [
  { label: 'Prima AFP', value: 'PRIMA' },
  { label: 'Profuturo AFP', value: 'PROFUTURO' },
  { label: 'Integra AFP', value: 'INTEGRA' },
  { label: 'Hábitat AFP', value: 'HABITAT' },
  { label: 'ONP', value: 'ONP' }
] as const

export const SEGURO_SALUD = [
  { label: 'Essalud', value: 'ESSALUD' },
  { label: 'EPS', value: 'EPS' },
  { label: 'SIS', value: 'SIS' },
  { label: 'Particular', value: 'PARTICULAR' }
] as const