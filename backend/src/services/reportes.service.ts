/**
 * Servicio de Reportes
 * Dashboard de métricas, PLAME, costos y tendencias
 */

import { CONSTANTS_PERU } from './calculos-peru.service';

export interface ReporteDashboard {
  empleadosActivos: number;
  empleadosNuevosMes: number;
  empleadosRetiradosMes: number;
  rotacion: number;
  ausentismo: number;
  costoTotalMensual: number;
  costoPromedioPorEmpleado: number;
  tendenciaEmpleados: Array<{ mes: string; total: number }>;
  distribucionPorDepartamento: Array<{ departamento: string; total: number; porcentaje: number }>;
  distribucionPorRegimen: Array<{ regimen: string; total: number; porcentaje: number }>;
}

export interface ReportePLAME {
  periodo: string;
  empresaRUC: string;
  empresaNombre: string;
  totalTrabajadores: number;
  totalRemuneraciones: number;
  aportesAFP: number;
  aportesONP: number;
  aportesESSALUD: number;
  trabajadores: Array<{
    dni: string;
    nombres: string;
    apellidos: string;
    fechaIngreso: string;
    sueldoBase: number;
    diasTrabajados: number;
    horasTrabajadas: number;
    remuneracionAsegurable: number;
    aporteAFP: number;
    aporteONP: number;
    comisionAFP: number;
    primaSeguro: number;
    sistemaPension: string;
    cuspp: string;
  }>;
}

export interface ReporteCostos {
  periodo: string;
  totalCostos: number;
  costosPorCentroCosto: Array<{
    centroCosto: string;
    cantidadEmpleados: number;
    costoSalarios: number;
    costoBeneficios: number;
    costoTotal: number;
    porcentaje: number;
  }>;
  costosPorDepartamento: Array<{
    departamento: string;
    cantidadEmpleados: number;
    costoSalarios: number;
    costoBeneficios: number;
    costoTotal: number;
    porcentaje: number;
  }>;
  evolucionMensual: Array<{
    mes: string;
    costoTotal: number;
    variacion: number;
  }>;
}

export interface ReporteAsistencia {
  periodo: string;
  totalEmpleados: number;
  promedioAsistencia: number;
  totalTardanzas: number;
  totalFaltas: number;
  totalHorasExtras: number;
  tendencias: Array<{
    fecha: string;
    asistencia: number;
    tardanzas: number;
    faltas: number;
    horasExtras: number;
  }>;
  porEmpleado: Array<{
    empleadoId: string;
    nombre: string;
    diasAsistidos: number;
    diasFaltados: number;
    minutosTardanza: number;
    horasExtras: number;
    puntualidad: number;
  }>;
}

/**
 * Generar reporte PLAME (SUNAT - Planilla Mensual)
 */
export function generarPLAME(
  periodo: string,
  empresaRUC: string,
  empresaNombre: string,
  empleados: Array<{
    dni: string;
    nombres: string;
    apellidos: string;
    fechaIngreso: string;
    sueldoBase: number;
    sistemaPension: string;
    cuspp: string;
    afpSistema?: string;
  }>,
  diasTrabajados: { [key: string]: number },
  horasExtras: { [key: string]: number }
): ReportePLAME {
  const trabajadores = empleados.map(emp => {
    const dias = diasTrabajados[emp.dni] || 30;
    const horasExt = horasExtras[emp.dni] || 0;
    const remuneracionAsegurable = emp.sueldoBase + (horasExt * (emp.sueldoBase / 30 / 8) * 1.25);
    
    let aporteAFP = 0;
    let aporteONP = 0;
    let comisionAFP = 0;
    let primaSeguro = 0;
    
    if (emp.sistemaPension === 'ONP') {
      aporteONP = Math.round(remuneracionAsegurable * CONSTANTS_PERU.ONP_PORCENTAJE * 100) / 100;
    } else {
      // AFP
      const afpSistema = emp.afpSistema || 'HABITAT';
      const tasas = {
        HABITAT: { aporte: 0.10, comision: 0.0147, prima: 0.0174 },
        PRIMA: { aporte: 0.10, comision: 0.0126, prima: 0.0168 },
        INTEGRA: { aporte: 0.10, comision: 0.0106, prima: 0.0169 },
        PROFUTURO: { aporte: 0.10, comision: 0.0129, prima: 0.0175 },
      }[afpSistema] || { aporte: 0.10, comision: 0.0147, prima: 0.0174 };
      
      aporteAFP = Math.round(remuneracionAsegurable * tasas.aporte * 100) / 100;
      comisionAFP = Math.round(remuneracionAsegurable * tasas.comision * 100) / 100;
      primaSeguro = Math.round(remuneracionAsegurable * tasas.prima * 100) / 100;
    }
    
    return {
      dni: emp.dni,
      nombres: emp.nombres,
      apellidos: emp.apellidos,
      fechaIngreso: emp.fechaIngreso,
      sueldoBase: emp.sueldoBase,
      diasTrabajados: dias,
      horasTrabajadas: dias * 8,
      remuneracionAsegurable: Math.round(remuneracionAsegurable * 100) / 100,
      aporteAFP,
      aporteONP,
      comisionAFP,
      primaSeguro,
      sistemaPension: emp.sistemaPension,
      cuspp: emp.cuspp || '',
    };
  });
  
  const totalRemuneraciones = trabajadores.reduce((sum, t) => sum + t.remuneracionAsegurable, 0);
  const aportesAFP = trabajadores.reduce((sum, t) => sum + t.aporteAFP, 0);
  const aportesONP = trabajadores.reduce((sum, t) => sum + t.aporteONP, 0);
  const aportesESSALUD = Math.round(totalRemuneraciones * CONSTANTS_PERU.ESSALUD_PORCENTAJE * 100) / 100;
  
  return {
    periodo,
    empresaRUC,
    empresaNombre,
    totalTrabajadores: trabajadores.length,
    totalRemuneraciones,
    aportesAFP,
    aportesONP,
    aportesESSALUD,
    trabajadores,
  };
}

/**
 * Exportar PLAME a formato CSV/SUNAT
 */
export function exportarPLAME_CSV(reporte: ReportePLAME): string {
  const header = 'TIPO_DOCUMENTO,NUMERO_DOCUMENTO,APELLIDO_PATERNO,APELLIDO_MATERNO,NOMBRES,FECHA_INGRESO,REMUNERACION_ASEGURABLE,DIAS_TRABAJADOS,HORAS_TRABAJADAS,TIPO_SALARIO,SITUACION,CUSPP,SISTEMA_PENSION,AFP_APORTE,AFP_COMISION,AFP_PRIMA,ONP_APORTE,ESSALUD\n';
  
  const rows = reporte.trabajadores.map(t => 
    `01,${t.dni},${t.apellidos.split(' ')[0] || ''},${t.apellidos.split(' ')[1] || ''},${t.nombres},${t.fechaIngreso},${t.remuneracionAsegurable.toFixed(2)},${t.diasTrabajados},${t.horasTrabajadas},R,1,${t.cuspp},${t.sistemaPension === 'ONP' ? '02' : '01'},${t.aporteAFP.toFixed(2)},${t.comisionAFP.toFixed(2)},${t.primaSeguro.toFixed(2)},${t.aporteONP.toFixed(2)},${(t.remuneracionAsegurable * 0.09).toFixed(2)}`
  ).join('\n');
  
  return header + rows;
}

/**
 * Generar archivo bancario para transferencias
 */
export function generarArchivoBancario(
  banco: 'BCP' | 'INTERBANK' | 'BBVA' | 'SCOTIABANK',
  empresaRUC: string,
  empresaNombre: string,
  cuentaCargo: string,
  fechaPago: string,
  empleados: Array<{
    dni: string;
    nombre: string;
    cuentaAbono: string;
    cci: string;
    monto: number;
  }>
): string {
  switch (banco) {
    case 'BCP':
      return generarBCP(empresaRUC, empresaNombre, cuentaCargo, fechaPago, empleados);
    case 'INTERBANK':
      return generarInterbank(empresaRUC, empresaNombre, cuentaCargo, fechaPago, empleados);
    case 'BBVA':
      return generarBBVA(empresaRUC, empresaNombre, cuentaCargo, fechaPago, empleados);
    case 'SCOTIABANK':
      return generarScotiabank(empresaRUC, empresaNombre, cuentaCargo, fechaPago, empleados);
    default:
      return generarBCP(empresaRUC, empresaNombre, cuentaCargo, fechaPago, empleados);
  }
}

function generarBCP(
  empresaRUC: string,
  empresaNombre: string,
  cuentaCargo: string,
  fechaPago: string,
  empleados: Array<{ dni: string; nombre: string; cuentaAbono: string; cci: string; monto: number }>
): string {
  const fechaFormat = fechaPago.replace(/-/g, '');
  let contenido = '';
  
  // Cabecera
  contenido += `1${empresaRUC.padEnd(35, ' ')}${fechaFormat}${cuentaCargo.padEnd(20, ' ')}${'SOLES'.padEnd(10, ' ')}${String(empleados.length).padStart(6, '0')}${String(empleados.reduce((s, e) => s + e.monto, 0).toFixed(2)).padStart(15, '0')}\n`;
  
  // Detalle
  empleados.forEach((emp, idx) => {
    const tipoCuenta = emp.cci ? 'B' : 'A'; // B = CCI, A = Cuenta
    const cuenta = emp.cci || emp.cuentaAbono;
    contenido += `2${String(idx + 1).padStart(6, '0')}${tipoCuenta}${cuenta.padEnd(20, ' ')}${String(emp.monto.toFixed(2)).padStart(15, '0')}1${emp.dni.padEnd(15, ' ')}${emp.nombre.substring(0, 40).padEnd(40, ' ')}\n`;
  });
  
  return contenido;
}

function generarInterbank(
  empresaRUC: string,
  empresaNombre: string,
  cuentaCargo: string,
  fechaPago: string,
  empleados: Array<{ dni: string; nombre: string; cuentaAbono: string; cci: string; monto: number }>
): string {
  const totalMonto = empleados.reduce((s, e) => s + e.monto, 0);
  let contenido = '';
  
  // Cabecera
  contenido += `PC,${empresaRUC},${empresaNombre},${cuentaCargo},S,${fechaPago},${totalMonto.toFixed(2)},${empleados.length}\n`;
  
  // Detalle
  empleados.forEach(emp => {
    const cuenta = emp.cci || emp.cuentaAbono;
    contenido += `PD,${emp.dni},${emp.nombre},${cuenta},S,${emp.monto.toFixed(2)},PAGO DE REMUNERACIONES\n`;
  });
  
  return contenido;
}

function generarBBVA(
  empresaRUC: string,
  empresaNombre: string,
  cuentaCargo: string,
  fechaPago: string,
  empleados: Array<{ dni: string; nombre: string; cuentaAbono: string; cci: string; monto: number }>
): string {
  let contenido = '';
  const totalMonto = empleados.reduce((s, e) => s + e.monto, 0);
  
  // Cabecera
  contenido += `HD,${empresaRUC},${empresaNombre},${cuentaCargo},${fechaPago},${totalMonto.toFixed(2)},${empleados.length}\n`;
  
  // Detalle
  empleados.forEach((emp, idx) => {
    const cuenta = emp.cci || emp.cuentaAbono;
    contenido += `DT,${String(idx + 1).padStart(6, '0')},${emp.dni},${emp.nombre},${cuenta},${emp.monto.toFixed(2)},PAGO REMUNERACIONES\n`;
  });
  
  return contenido;
}

function generarScotiabank(
  empresaRUC: string,
  empresaNombre: string,
  cuentaCargo: string,
  fechaPago: string,
  empleados: Array<{ dni: string; nombre: string; cuentaAbono: string; cci: string; monto: number }>
): string {
  let contenido = '';
  const totalMonto = empleados.reduce((s, e) => s + e.monto, 0);
  
  // Cabecera
  contenido += `CAB,${empresaRUC},${empresaNombre},${cuentaCargo},${fechaPago},${totalMonto.toFixed(2)},${empleados.length}\n`;
  
  // Detalle
  empleados.forEach((emp, idx) => {
    const cuenta = emp.cci || emp.cuentaAbono;
    contenido += `DET,${String(idx + 1).padStart(6, '0')},${emp.dni},${emp.nombre},${cuenta},${emp.monto.toFixed(2)},PAGO REMUNERACIONES\n`;
  });
  
  return contenido;
}

/**
 * Calcular métricas de dashboard
 */
export function calcularDashboardMetrics(
  empleados: Array<{ id: string; departamento: string; regimen: string; fechaIngreso: string; estado: string }>,
  asistencias: Array<{ empleadoId: string; fecha: string; estado: string }>,
  salarios: Array<{ empleadoId: string; salario: number }>,
  periodo: string
): ReporteDashboard {
  const fechaActual = new Date();
  const mesActual = fechaActual.toISOString().slice(0, 7);
  
  // Empleados activos
  const empleadosActivos = empleados.filter(e => e.estado === 'ACTIVO').length;
  
  // Empleados nuevos este mes
  const empleadosNuevosMes = empleados.filter(e => {
    const fechaIngreso = e.fechaIngreso.slice(0, 7);
    return fechaIngreso === mesActual;
  }).length;
  
  // Rotación (asumiendo que tenemos datos de empleados retirados)
  const empleadosRetiradosMes = 0; // Se calcularía con historial
  const rotacion = empleadosActivos > 0 ? (empleadosRetiradosMes / empleadosActivos) * 100 : 0;
  
  // Ausentismo
  const totalRegistros = asistencias.length;
  const faltas = asistencias.filter(a => a.estado === 'FALTA').length;
  const ausentismo = totalRegistros > 0 ? (faltas / totalRegistros) * 100 : 0;
  
  // Costos
  const costoTotalMensual = salarios.reduce((sum, s) => sum + s.salario, 0);
  const costoPromedioPorEmpleado = empleadosActivos > 0 ? costoTotalMensual / empleadosActivos : 0;
  
  // Distribución por departamento
  const deptos: { [key: string]: number } = {};
  empleados.forEach(e => {
    deptos[e.departamento] = (deptos[e.departamento] || 0) + 1;
  });
  const distribucionPorDepartamento = Object.entries(deptos).map(([depto, total]) => ({
    departamento: depto,
    total,
    porcentaje: empleadosActivos > 0 ? (total / empleadosActivos) * 100 : 0,
  }));
  
  // Distribución por régimen
  const regimenes: { [key: string]: number } = {};
  empleados.forEach(e => {
    regimenes[e.regimen] = (regimenes[e.regimen] || 0) + 1;
  });
  const distribucionPorRegimen = Object.entries(regimenes).map(([regimen, total]) => ({
    regimen,
    total,
    porcentaje: empleadosActivos > 0 ? (total / empleadosActivos) * 100 : 0,
  }));
  
  return {
    empleadosActivos,
    empleadosNuevosMes,
    empleadosRetiradosMes,
    rotacion,
    ausentismo,
    costoTotalMensual,
    costoPromedioPorEmpleado,
    tendenciaEmpleados: [], // Se llenaría con datos históricos
    distribucionPorDepartamento,
    distribucionPorRegimen,
  };
}

/**
 * Calcular reporte de costos
 */
export function calcularReporteCostos(
  empleados: Array<{
    id: string;
    departamento: string;
    centroCosto: string;
    salario: number;
    beneficios: number;
  }>,
  periodo: string
): ReporteCostos {
  // Agrupar por centro de costo
  const ccostos: { [key: string]: { cantidad: number; salarios: number; beneficios: number } } = {};
  empleados.forEach(e => {
    if (!ccostos[e.centroCosto]) {
      ccostos[e.centroCosto] = { cantidad: 0, salarios: 0, beneficios: 0 };
    }
    ccostos[e.centroCosto].cantidad++;
    ccostos[e.centroCosto].salarios += e.salario;
    ccostos[e.centroCosto].beneficios += e.beneficios;
  });
  
  // Agrupar por departamento
  const deptos: { [key: string]: { cantidad: number; salarios: number; beneficios: number } } = {};
  empleados.forEach(e => {
    if (!deptos[e.departamento]) {
      deptos[e.departamento] = { cantidad: 0, salarios: 0, beneficios: 0 };
    }
    deptos[e.departamento].cantidad++;
    deptos[e.departamento].salarios += e.salario;
    deptos[e.departamento].beneficios += e.beneficios;
  });
  
  const totalCostos = empleados.reduce((sum, e) => sum + e.salario + e.beneficios, 0);
  
  const costosPorCentroCosto = Object.entries(ccostos).map(([centro, data]) => ({
    centroCosto: centro,
    cantidadEmpleados: data.cantidad,
    costoSalarios: data.salarios,
    costoBeneficios: data.beneficios,
    costoTotal: data.salarios + data.beneficios,
    porcentaje: totalCostos > 0 ? ((data.salarios + data.beneficios) / totalCostos) * 100 : 0,
  }));
  
  const costosPorDepartamento = Object.entries(deptos).map(([depto, data]) => ({
    departamento: depto,
    cantidadEmpleados: data.cantidad,
    costoSalarios: data.salarios,
    costoBeneficios: data.beneficios,
    costoTotal: data.salarios + data.beneficios,
    porcentaje: totalCostos > 0 ? ((data.salarios + data.beneficios) / totalCostos) * 100 : 0,
  }));
  
  return {
    periodo,
    totalCostos,
    costosPorCentroCosto,
    costosPorDepartamento,
    evolucionMensual: [],
  };
}

export default {
  generarPLAME,
  exportarPLAME_CSV,
  generarArchivoBancario,
  calcularDashboardMetrics,
  calcularReporteCostos,
};
