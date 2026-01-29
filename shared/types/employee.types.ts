import { BaseEntity, SelectOption } from './index'

// Enums para tipos de datos
export enum TipoDocumento {
  DNI = 'DNI',
  CARNET_EXTRANJERIA = 'CARNET_EXTRANJERIA',
  PASAPORTE = 'PASAPORTE'
}

export enum Sexo {
  MASCULINO = 'M',
  FEMENINO = 'F'
}

export enum EstadoCivil {
  SOLTERO = 'SOLTERO',
  CASADO = 'CASADO',
  DIVORCIADO = 'DIVORCIADO',
  VIUDO = 'VIUDO',
  CONVIVIENTE = 'CONVIVIENTE'
}

export enum NivelEducativo {
  PRIMARIA = 'PRIMARIA',
  SECUNDARIA = 'SECUNDARIA',
  TECNICO = 'TECNICO',
  UNIVERSITARIO = 'UNIVERSITARIO',
  POSTGRADO = 'POSTGRADO'
}

export enum EstadoEmpleado {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  CESADO = 'CESADO'
}

export enum TipoCuenta {
  AHORROS = 'AHORROS',
  CORRIENTE = 'CORRIENTE'
}

// Interfaces principales
export interface Employee extends BaseEntity {
  // Datos personales
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombreCompleto: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  fechaNacimiento: string
  lugarNacimiento?: string
  sexo?: Sexo
  estadoCivil?: EstadoCivil
  nacionalidad?: string
  direccion?: string
  departamento?: string
  provincia?: string
  distrito?: string
  telefono?: string
  email?: string
  emailCorporativo?: string
  nivelEducativo?: NivelEducativo
  profesion?: string
  licenciaConducir?: string
  hijos: number
  
  // Datos bancarios
  banco?: string
  tipoCuenta?: TipoCuenta
  numeroCuenta?: string
  numeroCCI?: string
  
  // Datos familiares
  nombreConyuge?: string
  dniConyuge?: string
  nombrePadre?: string
  nombreMadre?: string
  
  // Fotos y documentos
  foto?: string
  fotoDNI?: string
  fotoRUC?: string
  
  // Control
  estado: EstadoEmpleado
  fechaIngreso: string
  fechaCese?: string
  motivoCese?: string
  
  // Campos calculados (no en BD)
  contracts?: Contract[]
  currentContract?: Contract
  payrollHistory?: Payroll[]
}

export interface Contract extends BaseEntity {
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
  
  // Asignaciones
  asignacionFamiliar: number
  bonificacionProductividad?: number
  bonificacionPuesto?: number
  movilidad?: number
  refrigerio?: number
  
  // Beneficios sociales
  seguroSalud?: string
  nombreEPS?: string
  afp?: string
  nombreAFP?: string
  cuspp?: string
  tipoSeguro?: string
  
  // Contingencias
  tieneCTS: boolean
  tieneVacaciones: boolean
  tieneGratificaciones: boolean
  tieneUtilidades: boolean
  
  // Estado
  estado: string
  motivoSuspension?: string
  archivoContrato?: string
  archivoAddendum?: string
  
  // Auditoría
  createdById?: string
  
  // Relaciones
  employee?: Employee
}

export interface EmployeeFilters {
  search?: string
  estado?: EstadoEmpleado
  departamento?: string
  puesto?: string
  regimenLaboral?: string
  fechaIngresoDesde?: string
  fechaIngresoHasta?: string
  page?: number
  limit?: number
}

export interface EmployeeCreate {
  // Datos personales requeridos
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  fechaNacimiento: string
  estadoCivil?: EstadoCivil
  direccion?: string
  telefono?: string
  email?: string
  
  // Datos bancarios
  banco?: string
  tipoCuenta?: TipoCuenta
  numeroCuenta?: string
  numeroCCI?: string
  
  // Datos laborales
  fechaIngreso: string
  puesto?: string
  departamentoTrabajo?: string
}

export interface EmployeeUpdate {
  // Datos personales
  nombres?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  fechaNacimiento?: string
  lugarNacimiento?: string
  sexo?: Sexo
  estadoCivil?: EstadoCivil
  nacionalidad?: string
  direccion?: string
  departamento?: string
  provincia?: string
  distrito?: string
  telefono?: string
  email?: string
  emailCorporativo?: string
  nivelEducativo?: NivelEducativo
  profesion?: string
  licenciaConducir?: string
  hijos?: number
  
  // Datos bancarios
  banco?: string
  tipoCuenta?: TipoCuenta
  numeroCuenta?: string
  numeroCCI?: string
  
  // Datos familiares
  nombreConyuge?: string
  dniConyuge?: string
  nombrePadre?: string
  nombreMadre?: string
  
  // Fotos y documentos
  foto?: string
  fotoDNI?: string
  fotoRUC?: string
  
  // Control
  estado?: EstadoEmpleado
  fechaCese?: string
  motivoCese?: string
}

// Opciones para selects
export const TIPO_DOCUMENTO_OPTIONS: SelectOption[] = [
  { label: 'DNI', value: TipoDocumento.DNI },
  { label: 'Carnet de Extranjería', value: TipoDocumento.CARNET_EXTRANJERIA },
  { label: 'Pasaporte', value: TipoDocumento.PASAPORTE }
]

export const ESTADO_CIVIL_OPTIONS: SelectOption[] = [
  { label: 'Soltero/a', value: EstadoCivil.SOLTERO },
  { label: 'Casado/a', value: EstadoCivil.CASADO },
  { label: 'Divorciado/a', value: EstadoCivil.DIVORCIADO },
  { label: 'Viudo/a', value: EstadoCivil.VIUDO },
  { label: 'Conviviente', value: EstadoCivil.CONVIVIENTE }
]

export const NIVEL_EDUCATIVO_OPTIONS: SelectOption[] = [
  { label: 'Primaria', value: NivelEducativo.PRIMARIA },
  { label: 'Secundaria', value: NivelEducativo.SECUNDARIA },
  { label: 'Técnico', value: NivelEducativo.TECNICO },
  { label: 'Universitario', value: NivelEducativo.UNIVERSITARIO },
  { label: 'Postgrado', value: NivelEducativo.POSTGRADO }
]

export const TIPO_CUENTA_OPTIONS: SelectOption[] = [
  { label: 'Ahorros', value: TipoCuenta.AHORROS },
  { label: 'Corriente', value: TipoCuenta.CORRIENTE }
]

export const ESTADO_EMPLEADO_OPTIONS: SelectOption[] = [
  { label: 'Activo', value: EstadoEmpleado.ACTIVO },
  { label: 'Inactivo', value: EstadoEmpleado.INACTIVO },
  { label: 'Suspendido', value: EstadoEmpleado.SUSPENDIDO },
  { label: 'Cesado', value: EstadoEmpleado.CESADO }
]