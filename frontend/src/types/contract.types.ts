// Tipos para contratos
export interface Contract {
  id: string
  empleadoId: string
  tipoContrato: string
  regimenLaboral: string
  modalidadContrato?: string
  fechaInicio: string
  fechaFin?: string
  duracionMeses?: number
  cargo: string
  puesto?: string
  categoriaOcupacional?: string
  nivel?: string
  centroCostos?: string
  departamentoTrabajo?: string
  areaTrabajo?: string
  turno?: string
  horarioTrabajo?: string
  diasTrabajo: number
  horasSemanales: number
  salarioBase: number
  tipoMoneda: string
  formaPago: string
  medioPago: string
  asignacionFamiliar: number
  bonificacionProductividad?: number
  bonificacionPuesto?: number
  movilidad?: number
  refrigerio?: number
  seguroSalud?: string
  nombreEPS?: string
  afp?: string
  nombreAFP?: string
  cuspp?: string
  tipoSeguro?: string
  tieneCTS: boolean
  tieneVacaciones: boolean
  tieneGratificaciones: boolean
  tieneUtilidades: boolean
  estado: string
  motivoSuspension?: string
  archivoContrato?: string
  archivoAddendum?: string
  createdById?: string
  createdAt: string
  updatedAt: string
  
  // Relaciones (para frontend)
  employee?: any
}