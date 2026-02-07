/**
 * Utilidades compartidas para el proyecto RRHHMod
 * Centraliza funciones helper repetidas en múltiples componentes
 */

/**
 * Convierte un estado a un tipo de badge/tag para UI
 * @param status - El estado a convertir
 * @returns El tipo de badge correspondiente
 */
export const getStatusType = (status: string | undefined | null): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'PUNTUAL':
    case 'VIGENTE':
    case 'ACTIVO':
    case 'APROBADO':
    case 'CANCELADO':
      return 'success'
    case 'TARDE':
    case 'PENDIENTE':
    case 'POR_VENCER':
      return 'warning'
    case 'FALTA':
    case 'RECHAZADO':
    case 'VENCIDO':
    case 'ANULADO':
      return 'error'
    case 'JUSTIFICADO':
      return 'primary'
    default:
      return 'default'
  }
}

/**
 * Genera datos de ejemplo para pruebas
 */
export const generateMockEmployees = () => [
  { label: 'Juan Pérez', value: 'emp-001' },
  { label: 'María López', value: 'emp-002' },
  { label: 'Carlos García', value: 'emp-003' },
  { label: 'Ana Martínez', value: 'emp-004' }
]

/**
 * Formatea un valor como moneda soles
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'S/ 0.00'
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Formatea un valor de porcentaje
 */
export const formatPercent = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0%'
  return `${value}%`
}

/**
 * Manejo de errores consistente para llamadas API
 */
export const handleApiError = (error: unknown, message: string = 'Error en la operación'): void => {
  console.error(message, error)
  alert(message)
}

/**
 * Obtiene la fecha actual formateada YYYY-MM-DD
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Calcula la fecha sumando días a la fecha actual
 */
export const addDaysToDate = (days: number): string => {
  return new Date(Date.now() + 86400000 * days).toISOString().split('T')[0]
}

/**
 * Obtiene opciones de estado para filtros
 */
export const getStatusOptions = () => [
  { label: 'Todos', value: '' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aprobados', value: 'APROBADO' },
  { label: 'Rechazados', value: 'RECHAZADO' }
]
