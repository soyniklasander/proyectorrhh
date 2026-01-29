// Types básicos para el frontend
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

// Tipo para respuesta paginada
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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