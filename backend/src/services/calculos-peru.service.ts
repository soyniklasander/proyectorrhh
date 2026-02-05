/**
 * Servicio de Cálculos Legales Peruanos
 * Implementa todas las fórmulas según normativa SUNAT y ley peruana
 */

// Constantes legales Perú 2024
export const CONSTANTS_PERU = {
  RMV_2024: 1025.00, // Remuneración Mínima Vital
  RMV_DIARIA: 1025.00 / 30,
  ESSALUD_PORCENTAJE: 0.09, // 9% aporte del empleador
  CTS_PORCENTAJE: 1.0, // 1 sueldo completo por semestre
  GRATIFICACION_PORCENTAJE_ESSALUD: 0.09,
  VACACIONES_DIAS_ANUAL: 30,
  UIT_2024: 5150.00, // Unidad Impositiva Tributaria 2024
  ONP_PORCENTAJE: 0.13, // 13% ONP
};

// Tasas AFP 2024 (Comisión sobre flujo + Prima de seguro + Aporte obligatorio)
export const AFP_RATES_2024 = {
  HABITAT: {
    nombre: 'AFP Habitat',
    aporte_obligatorio: 0.10,
    comision_flujo: 0.0147,
    prima_seguro: 0.0174,
    total_empleado: 0.1321, // 10% + 1.47% + 1.74%
  },
  PRIMA: {
    nombre: 'AFP Prima',
    aporte_obligatorio: 0.10,
    comision_flujo: 0.0126,
    prima_seguro: 0.0168,
    total_empleado: 0.1294, // 10% + 1.26% + 1.68%
  },
  INTEGRA: {
    nombre: 'AFP Integra',
    aporte_obligatorio: 0.10,
    comision_flujo: 0.0106,
    prima_seguro: 0.0169,
    total_empleado: 0.1275, // 10% + 1.06% + 1.69%
  },
  PROFUTURO: {
    nombre: 'AFP Profuturo',
    aporte_obligatorio: 0.10,
    comision_flujo: 0.0129,
    prima_seguro: 0.0175,
    total_empleado: 0.1304, // 10% + 1.29% + 1.75%
  },
};

// Tabla progresiva IR - Renta de 5ta Categoría 2024
export const TABLA_IR_2024 = [
  { hasta: 5 * CONSTANTS_PERU.UIT_2024, tasa: 0.08, fraccion_basica: 0 },
  { hasta: 20 * CONSTANTS_PERU.UIT_2024, tasa: 0.14, fraccion_basica: 0.08 },
  { hasta: 35 * CONSTANTS_PERU.UIT_2024, tasa: 0.17, fraccion_basica: 0.14 },
  { hasta: 45 * CONSTANTS_PERU.UIT_2024, tasa: 0.20, fraccion_basica: 0.17 },
  { hasta: Infinity, tasa: 0.30, fraccion_basica: 0.20 },
];

// Interfaz para datos de empleado
export interface EmpleadoData {
  id: string;
  salarioBase: number;
  fechaIngreso: string;
  afpSistema: 'HABITAT' | 'PRIMA' | 'INTEGRA' | 'PROFUTURO' | 'ONP';
  tieneAsignacionFamiliar?: boolean;
  hijos?: number;
}

// Interfaz para cálculo de planilla
export interface CalculoPlanillaInput {
  empleado: EmpleadoData;
  periodo: string; // YYYY-MM
  horasExtras25?: number;
  horasExtras35?: number;
  horasExtras100?: number;
  bonificaciones?: number;
  comisiones?: number;
  gratificacion?: number;
  mesesProyectados?: number; // Para 5ta categoría
}

export interface CalculoPlanillaResult {
  // Ingresos
  salarioBase: number;
  asignacionFamiliar: number;
  horasExtras25: number;
  horasExtras35: number;
  horasExtras100: number;
  bonificaciones: number;
  comisiones: number;
  reintegros: number;
  totalIngresos: number;

  // Descuentos
  aporteObligatorio: number;
  comisionFlujo: number;
  primaSeguro: number;
  totalAFP: number;
  quintaCategoria: number;
  adelantos: number;
  prestamos: number;
  totalDescuentos: number;

  // Aportes del empleador
  essalud: number;
  totalAportesEmpleador: number;

  // Neto
  netoPagar: number;

  // Detalles
  detalleCalculos: {
    quintaCategoria?: QuintaCategoriaDetail;
    afp?: AFPDetail;
  };
}

interface QuintaCategoriaDetail {
  rentaNetaAnual: number;
  rentaNetaMensual: number;
  rentaBrutaAnual: number;
  deduccion7UIT: number;
  tasaAplicada: number;
  impuestoAnual: number;
  impuestoMensual: number;
  retencionesAcumuladas: number;
}

interface AFPDetail {
  nombre: string;
  aporteObligatorio: number;
  comisionFlujo: number;
  primaSeguro: number;
  total: number;
}

/**
 * Cálculo de Renta de Quinta Categoría
 */
export function calcularQuintaCategoria(
  salarioMensual: number,
  bonificaciones: number,
  mesesRestantes: number,
  retencionesAnteriores: number = 0
): { retencionMensual: number; detalle: QuintaCategoriaDetail } {
  // Renta bruta proyectada (meses restantes incluyendo el actual)
  const rentaBrutaProyectada = (salarioMensual + bonificaciones) * mesesRestantes;
  
  // Gratificaciones julio y diciembre (ordinarias)
  const gratificacionesProyectadas = salarioMensual * 2;
  
  // Renta bruta anual total
  const rentaBrutaAnual = rentaBrutaProyectada + gratificacionesProyectadas;
  
  // Deducción de 7 UIT
  const deduccion7UIT = 7 * CONSTANTS_PERU.UIT_2024;
  
  // Renta neta anual
  const rentaNetaAnual = Math.max(0, rentaBrutaAnual - deduccion7UIT);
  
  // Calcular impuesto anual según tabla progresiva
  let impuestoAnual = 0;
  let tasaAplicada = 0;
  let fraccionBasicaAnterior = 0;
  
  for (const tramo of TABLA_IR_2024) {
    if (rentaNetaAnual <= tramo.hasta) {
      // Calcular exceso sobre la fracción básica anterior
      const exceso = rentaNetaAnual - (tramo === TABLA_IR_2024[0] ? 0 : TABLA_IR_2024[TABLA_IR_2024.indexOf(tramo) - 1].hasta);
      const impuestoFraccionBasica = tramo === TABLA_IR_2024[0] ? 0 : 
        TABLA_IR_2024.slice(0, TABLA_IR_2024.indexOf(tramo)).reduce((sum, t) => {
          const base = t === TABLA_IR_2024[0] ? tramo.hasta : t.hasta - TABLA_IR_2024[TABLA_IR_2024.indexOf(t) - 1].hasta;
          return sum + base * t.tasa;
        }, 0);
      
      // Simplificación: cálculo directo
      impuestoAnual = calcularImpuestoTabla(rentaNetaAnual);
      tasaAplicada = tramo.tasa;
      break;
    }
  }
  
  // Si no se encontró tramo (renta muy alta)
  if (impuestoAnual === 0 && rentaNetaAnual > 0) {
    impuestoAnual = calcularImpuestoTabla(rentaNetaAnual);
    tasaAplicada = 0.30;
  }
  
  // Retención mensual
  const retencionMensual = Math.max(0, (impuestoAnual - retencionesAnteriores) / mesesRestantes);
  
  const detalle: QuintaCategoriaDetail = {
    rentaBrutaAnual,
    rentaNetaAnual,
    rentaNetaMensual: rentaNetaAnual / 12,
    deduccion7UIT,
    tasaAplicada,
    impuestoAnual,
    impuestoMensual: impuestoAnual / 12,
    retencionesAcumuladas: retencionesAnteriores,
  };
  
  return { retencionMensual, detalle };
}

function calcularImpuestoTabla(rentaNetaAnual: number): number {
  let impuesto = 0;
  let rentaRestante = rentaNetaAnual;
  let limiteAnterior = 0;
  
  for (const tramo of TABLA_IR_2024) {
    const baseTramo = tramo.hasta === Infinity ? Infinity : tramo.hasta - limiteAnterior;
    const montoTramo = Math.min(rentaRestante, baseTramo);
    
    if (montoTramo <= 0) break;
    
    impuesto += montoTramo * tramo.tasa;
    rentaRestante -= montoTramo;
    limiteAnterior = tramo.hasta;
  }
  
  return impuesto;
}

/**
 * Cálculo de Essalud (9% del empleador)
 */
export function calcularEssalud(totalRemuneracion: number): number {
  return Math.round(totalRemuneracion * CONSTANTS_PERU.ESSALUD_PORCENTAJE * 100) / 100;
}

/**
 * Cálculo de CTS (Compensación por Tiempo de Servicios)
 * Depósito semestral: 1 mayo y 1 noviembre
 */
export function calcularCTS(
  salarioBase: number,
  asignacionFamiliar: number,
  fechaIngreso: string,
  periodo: 'MAYO' | 'NOVIEMBRE'
): { monto: number; diasCalculados: number; mesesCalculados: number; detalle: string } {
  const fechaIngresoDate = new Date(fechaIngreso);
  const fechaActual = new Date();
  
  // Determinar fecha de corte según período
  const añoActual = fechaActual.getFullYear();
  const fechaCorte = periodo === 'MAYO' 
    ? new Date(añoActual, 4, 1) // 1 de mayo
    : new Date(añoActual, 10, 1); // 1 de noviembre
  
  // Calcular meses y días trabajados en el semestre
  let mesesTrabajados = 0;
  let diasTrabajados = 0;
  
  const inicioPeriodo = periodo === 'MAYO'
    ? new Date(añoActual, 10, 1) // 1 de noviembre del año anterior
    : new Date(añoActual, 4, 1); // 1 de mayo
  
  if (fechaIngresoDate > inicioPeriodo) {
    // Empleado ingresó durante el período
    const diffTime = fechaCorte.getTime() - fechaIngresoDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    mesesTrabajados = Math.floor(diffDays / 30);
    diasTrabajados = diffDays % 30;
  } else {
    // Empleado trabajó todo el semestre
    mesesTrabajados = 6;
    diasTrabajados = 0;
  }
  
  // 1/6 del sueldo completo (salario + asignación familiar) por cada mes trabajado
  const sueldoCompleto = salarioBase + asignacionFamiliar;
  const factorMes = 1 / 12; // 1 sueldo por año = 1/12 por mes
  const factorDia = 1 / 360; // 1 sueldo por año = 1/360 por día
  
  const ctsPorMeses = sueldoCompleto * factorMes * mesesTrabajados;
  const ctsPorDias = sueldoCompleto * factorDia * diasTrabajados;
  const montoTotal = Math.round((ctsPorMeses + ctsPorDias) * 100) / 100;
  
  const detalle = `CTS ${periodo}: ${mesesTrabajados} meses, ${diasTrabajados} días. Base: S/ ${sueldoCompleto.toFixed(2)}`;
  
  return {
    monto: montoTotal,
    diasCalculados: diasTrabajados,
    mesesCalculados: mesesTrabajados,
    detalle,
  };
}

/**
 * Cálculo de Gratificaciones (Julio y Diciembre)
 * Salario completo + 9% Essalud sobre gratificación
 */
export function calcularGratificacion(
  salarioBase: number,
  asignacionFamiliar: number,
  fechaIngreso: string,
  periodo: 'JULIO' | 'DICIEMBRE'
): { gratificacion: number; essalud9: number; total: number; mesesCalculados: number; detalle: string } {
  const fechaIngresoDate = new Date(fechaIngreso);
  const fechaActual = new Date();
  
  // Período de cálculo
  const añoActual = fechaActual.getFullYear();
  const inicioPeriodo = periodo === 'JULIO'
    ? new Date(añoActual, 0, 1) // 1 de enero
    : new Date(añoActual, 6, 1); // 1 de julio
  
  const fechaCorte = periodo === 'JULIO'
    ? new Date(añoActual, 6, 1) // 1 de julio (cierre del semestre)
    : new Date(añoActual, 11, 1); // 1 de diciembre
  
  // Calcular meses trabajados
  let mesesTrabajados = 6; // Por defecto semestre completo
  
  if (fechaIngresoDate > inicioPeriodo) {
    const diffTime = fechaCorte.getTime() - fechaIngresoDate.getTime();
    mesesTrabajados = Math.min(6, Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))));
  }
  
  // Gratificación proporcional
  const sueldoCompleto = salarioBase + asignacionFamiliar;
  const gratificacionCompleta = (sueldoCompleto / 6) * mesesTrabajados;
  const gratificacionRedondeada = Math.round(gratificacionCompleta * 100) / 100;
  
  // 9% de Essalud sobre gratificación (ley actual)
  const essalud9 = Math.round(gratificacionRedondeada * CONSTANTS_PERU.GRATIFICACION_PORCENTAJE_ESSALUD * 100) / 100;
  
  const detalle = `Gratificación ${periodo}: ${mesesTrabajados}/6 meses. Base: S/ ${sueldoCompleto.toFixed(2)}`;
  
  return {
    gratificacion: gratificacionRedondeada,
    essalud9,
    total: gratificacionRedondeada + essalud9,
    mesesCalculados: mesesTrabajados,
    detalle,
  };
}

/**
 * Cálculo de Vacaciones
 * 30 días por año trabajado
 */
export function calcularVacaciones(
  salarioBase: number,
  fechaIngreso: string,
  diasTrabajadosPeriodo?: number
): {
  diasAcumulados: number;
  diasTruncos: number;
  montoVacaciones: number;
  montoVentaVacaciones: number;
  compensacion: number;
  detalle: string;
} {
  const fechaIngresoDate = new Date(fechaIngreso);
  const fechaActual = new Date();
  
  // Calcular tiempo de servicio
  const diffTime = fechaActual.getTime() - fechaIngresoDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const añosCompletos = Math.floor(diffDays / 365);
  const diasRestantes = diffDays % 365;
  
  // 30 días por año completo
  const diasPorAñoCompleto = añosCompletos * CONSTANTS_PERU.VACACIONES_DIAS_ANUAL;
  
  // Días truncos (proporcional al año en curso)
  const diasTruncos = Math.floor((diasRestantes / 365) * CONSTANTS_PERU.VACACIONES_DIAS_ANUAL);
  
  const diasAcumuladosTotal = diasPorAñoCompleto + diasTruncos;
  
  // Cálculo de montos (salario diario = salario mensual / 30)
  const salarioDiario = salarioBase / 30;
  const montoVacaciones = Math.round(salarioDiario * diasTruncos * 100) / 100;
  
  // Venta de vacaciones (hasta 15 días)
  const diasVenta = Math.min(15, diasTruncos);
  const montoVentaVacaciones = Math.round(salarioDiario * diasVenta * 100) / 100;
  
  // Compensación por vacaciones no gozadas (caso cese)
  const compensacion = montoVacaciones;
  
  const detalle = `Vacaciones: ${añosCompletos} años completos (${diasPorAñoCompleto} días) + ${diasTruncos} días truncos`;
  
  return {
    diasAcumulados: diasAcumuladosTotal,
    diasTruncos,
    montoVacaciones,
    montoVentaVacaciones,
    compensacion,
    detalle,
  };
}

/**
 * Cálculo de AFP
 */
export function calcularAFP(
  sueldoBruto: number,
  afpSistema: 'HABITAT' | 'PRIMA' | 'INTEGRA' | 'PROFUTURO' | 'ONP'
): { total: number; detalle: AFPDetail } {
  if (afpSistema === 'ONP') {
    const total = Math.round(sueldoBruto * CONSTANTS_PERU.ONP_PORCENTAJE * 100) / 100;
    return {
      total,
      detalle: {
        nombre: 'ONP',
        aporteObligatorio: total,
        comisionFlujo: 0,
        primaSeguro: 0,
        total,
      },
    };
  }
  
  const afpRates = AFP_RATES_2024[afpSistema] || AFP_RATES_2024.HABITAT;
  
  const aporteObligatorio = Math.round(sueldoBruto * afpRates.aporte_obligatorio * 100) / 100;
  const comisionFlujo = Math.round(sueldoBruto * afpRates.comision_flujo * 100) / 100;
  const primaSeguro = Math.round(sueldoBruto * afpRates.prima_seguro * 100) / 100;
  const total = Math.round((aporteObligatorio + comisionFlujo + primaSeguro) * 100) / 100;
  
  return {
    total,
    detalle: {
      nombre: afpRates.nombre,
      aporteObligatorio,
      comisionFlujo,
      primaSeguro,
      total,
    },
  };
}

/**
 * Cálculo completo de planilla mensual
 */
export function calcularPlanillaPeru(
  input: CalculoPlanillaInput
): CalculoPlanillaResult {
  const { empleado, periodo, horasExtras25 = 0, horasExtras35 = 0, horasExtras100 = 0, bonificaciones = 0, comisiones = 0, gratificacion = 0 } = input;
  
  // Asignación familiar (S/ 93.00 por cada hijo menores de 18, hasta 5 hijos)
  const asignacionFamiliar = empleado.tieneAsignacionFamiliar 
    ? Math.min((empleado.hijos || 0) * 93.00, 465.00)
    : 0;
  
  // Calcular total de ingresos
  const totalIngresos = empleado.salarioBase + asignacionFamiliar + horasExtras25 + 
    horasExtras35 + horasExtras100 + bonificaciones + comisiones + gratificacion;
  
  // Calcular AFP
  const afpCalc = calcularAFP(totalIngresos, empleado.afpSistema);
  
  // Calcular Quinta Categoría
  const mesesProyectados = input.mesesProyectados || 12;
  const quintaCalc = calcularQuintaCategoria(
    empleado.salarioBase + bonificaciones,
    gratificacion,
    mesesProyectados,
    0
  );
  
  // Calcular Essalud (aporte del empleador)
  const essalud = calcularEssalud(totalIngresos);
  
  // Total descuentos
  const totalDescuentos = afpCalc.total + quintaCalc.retencionMensual;
  
  // Neto a pagar
  const netoPagar = totalIngresos - totalDescuentos;
  
  return {
    salarioBase: empleado.salarioBase,
    asignacionFamiliar,
    horasExtras25,
    horasExtras35,
    horasExtras100,
    bonificaciones,
    comisiones,
    reintegros: 0,
    totalIngresos,
    aporteObligatorio: afpCalc.detalle.aporteObligatorio,
    comisionFlujo: afpCalc.detalle.comisionFlujo,
    primaSeguro: afpCalc.detalle.primaSeguro,
    totalAFP: afpCalc.total,
    quintaCategoria: Math.round(quintaCalc.retencionMensual * 100) / 100,
    adelantos: 0,
    prestamos: 0,
    totalDescuentos,
    essalud,
    totalAportesEmpleador: essalud,
    netoPagar,
    detalleCalculos: {
      quintaCategoria: quintaCalc.detalle,
      afp: afpCalc.detalle,
    },
  };
}

/**
 * Verifica si corresponde pago de CTS (mayo o noviembre)
 */
export function esMesCTS(): { esCTS: boolean; periodo: 'MAYO' | 'NOVIEMBRE' | null } {
  const mes = new Date().getMonth() + 1; // 1-12
  if (mes === 5) return { esCTS: true, periodo: 'MAYO' };
  if (mes === 11) return { esCTS: true, periodo: 'NOVIEMBRE' };
  return { esCTS: false, periodo: null };
}

/**
 * Verifica si corresponde gratificación (julio o diciembre)
 */
export function esMesGratificacion(): { esGratificacion: boolean; periodo: 'JULIO' | 'DICIEMBRE' | null } {
  const mes = new Date().getMonth() + 1; // 1-12
  if (mes === 7) return { esGratificacion: true, periodo: 'JULIO' };
  if (mes === 12) return { esGratificacion: true, periodo: 'DICIEMBRE' };
  return { esGratificacion: false, periodo: null };
}

/**
 * Validación de DNI peruano (8 dígitos)
 */
export function validarDNI(dni: string): boolean {
  if (!dni || dni.length !== 8) return false;
  return /^\d{8}$/.test(dni);
}

/**
 * Validación de RUC peruano (11 dígitos)
 */
export function validarRUC(ruc: string): boolean {
  if (!ruc || ruc.length !== 11) return false;
  if (!/^\d{11}$/.test(ruc)) return false;
  
  // Validar dígito verificador
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = ruc.slice(0, 10).split('').reduce((acc, digit, index) => {
    return acc + parseInt(digit) * factores[index];
  }, 0);
  
  const resto = 11 - (suma % 11);
  const digitoVerificador = resto === 11 ? 0 : resto === 10 ? 1 : resto;
  
  return digitoVerificador === parseInt(ruc[10]);
}

/**
 * Feriados peruanos (fijos y móviles)
 */
export function getFeriadosPeru(año: number): Array<{ fecha: string; nombre: string; tipo: 'FIJO' | 'MOVIL' }> {
  const feriados: Array<{ fecha: string; nombre: string; tipo: 'FIJO' | 'MOVIL' }> = [
    // Fijos
    { fecha: `${año}-01-01`, nombre: 'Año Nuevo', tipo: 'FIJO' },
    { fecha: `${año}-05-01`, nombre: 'Día del Trabajo', tipo: 'FIJO' },
    { fecha: `${año}-06-07`, nombre: 'Batalla de Arica', tipo: 'FIJO' },
    { fecha: `${año}-06-29`, nombre: 'San Pedro y San Pablo', tipo: 'FIJO' },
    { fecha: `${año}-07-28`, nombre: 'Fiestas Patrias', tipo: 'FIJO' },
    { fecha: `${año}-07-29`, nombre: 'Día de la Independencia', tipo: 'FIJO' },
    { fecha: `${año}-08-30`, nombre: 'Santa Rosa de Lima', tipo: 'FIJO' },
    { fecha: `${año}-10-08`, nombre: 'Combate de Angamos', tipo: 'FIJO' },
    { fecha: `${año}-11-01`, nombre: 'Día de Todos los Santos', tipo: 'FIJO' },
    { fecha: `${año}-12-08`, nombre: 'Inmaculada Concepción', tipo: 'FIJO' },
    { fecha: `${año}-12-09`, nombre: 'Batalla de Ayacucho', tipo: 'FIJO' },
    { fecha: `${año}-12-25`, nombre: 'Navidad', tipo: 'FIJO' },
  ];
  
  // Semana Santa (fechas aproximadas - varían cada año)
  // Para 2024-2025
  if (año === 2024) {
    feriados.push({ fecha: '2024-03-28', nombre: 'Jueves Santo', tipo: 'MOVIL' });
    feriados.push({ fecha: '2024-03-29', nombre: 'Viernes Santo', tipo: 'MOVIL' });
    feriados.push({ fecha: '2024-03-31', nombre: 'Domingo de Resurrección', tipo: 'MOVIL' });
  } else if (año === 2025) {
    feriados.push({ fecha: '2025-04-17', nombre: 'Jueves Santo', tipo: 'MOVIL' });
    feriados.push({ fecha: '2025-04-18', nombre: 'Viernes Santo', tipo: 'MOVIL' });
    feriados.push({ fecha: '2025-04-20', nombre: 'Domingo de Resurrección', tipo: 'MOVIL' });
  }
  
  return feriados;
}

export default {
  calcularQuintaCategoria,
  calcularEssalud,
  calcularCTS,
  calcularGratificacion,
  calcularVacaciones,
  calcularAFP,
  calcularPlanillaPeru,
  esMesCTS,
  esMesGratificacion,
  validarDNI,
  validarRUC,
  getFeriadosPeru,
  CONSTANTS_PERU,
  AFP_RATES_2024,
  TABLA_IR_2024,
};
