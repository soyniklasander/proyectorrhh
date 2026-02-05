/**
 * Servicio de Generación de PDF
 * Boletas de pago con formato oficial peruano
 */

export interface BoletaPagoData {
  // Empresa
  empresaRUC: string;
  empresaNombre: string;
  empresaDireccion: string;
  
  // Empleado
  empleadoNombre: string;
  empleadoDNI: string;
  empleadoCargo: string;
  empleadoRegimen: string;
  
  // Período
  periodo: string;
  fechaIngreso: string;
  diasTrabajados: number;
  
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
  faltas: number;
  tardanzas: number;
  totalDescuentos: number;
  
  // Aportes empleador
  essalud: number;
  
  // Neto
  netoPagar: number;
  
  // Banco
  banco: string;
  cuentaBancaria: string;
  
  // Fecha
  fechaEmision: string;
}

/**
 * Generar HTML de boleta de pago (formato oficial peruano)
 */
export function generarHTMLBoleta(data: BoletaPagoData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boleta de Pago - ${data.empleadoDNI} - ${data.periodo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      background: #fff;
      padding: 20px;
    }
    .boleta-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #333;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .empresa-info h2 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .empresa-info p {
      font-size: 10px;
      color: #555;
    }
    .boleta-title {
      text-align: center;
    }
    .boleta-title h1 {
      font-size: 18px;
      font-weight: bold;
      border: 2px solid #333;
      padding: 8px 20px;
      display: inline-block;
    }
    .periodo {
      text-align: center;
      margin-top: 10px;
      font-weight: bold;
      font-size: 12px;
    }
    
    .section {
      margin-bottom: 15px;
    }
    .section-title {
      background: #f0f0f0;
      font-weight: bold;
      padding: 5px 10px;
      border: 1px solid #333;
      font-size: 11px;
    }
    
    .datos-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 10px;
      border: 1px solid #333;
      border-top: none;
    }
    .dato-row {
      display: flex;
    }
    .dato-label {
      font-weight: bold;
      width: 120px;
      color: #555;
    }
    .dato-value {
      flex: 1;
    }
    
    .conceptos-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    .conceptos-table th,
    .conceptos-table td {
      border: 1px solid #333;
      padding: 6px 10px;
      text-align: left;
    }
    .conceptos-table th {
      background: #f0f0f0;
      font-weight: bold;
    }
    .conceptos-table .number {
      text-align: right;
    }
    .conceptos-table .total-row {
      font-weight: bold;
      background: #f9f9f9;
    }
    
    .footer-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    .firma-box {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 10px;
      text-align: center;
    }
    .firma-label {
      font-size: 9px;
      color: #666;
    }
    
    .neto-box {
      background: #f0f0f0;
      border: 2px solid #333;
      padding: 15px;
      text-align: center;
      margin-top: 20px;
    }
    .neto-label {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .neto-amount {
      font-size: 20px;
      font-weight: bold;
      color: #000;
    }
    
    .disclaimer {
      margin-top: 20px;
      font-size: 8px;
      color: #666;
      text-align: justify;
    }
  </style>
</head>
<body>
  <div class="boleta-container">
    <!-- Header -->
    <div class="header">
      <div class="empresa-info">
        <h2>${escapeHtml(data.empresaNombre)}</h2>
        <p>RUC: ${data.empresaRUC}</p>
        <p>${escapeHtml(data.empresaDireccion)}</p>
      </div>
      <div class="boleta-title">
        <h1>BOLETA DE PAGO</h1>
        <div class="periodo">PERÍODO: ${formatearPeriodo(data.periodo)}</div>
      </div>
    </div>

    <!-- Datos del Trabajador -->
    <div class="section">
      <div class="section-title">DATOS DEL TRABAJADOR</div>
      <div class="datos-grid">
        <div class="dato-row">
          <span class="dato-label">APELLIDOS Y NOMBRES:</span>
          <span class="dato-value">${escapeHtml(data.empleadoNombre)}</span>
        </div>
        <div class="dato-row">
          <span class="dato-label">REGIMEN PENSIONARIO:</span>
          <span class="dato-value">${escapeHtml(data.empleadoRegimen)}</span>
        </div>
        <div class="dato-row">
          <span class="dato-label">DNI:</span>
          <span class="dato-value">${data.empleadoDNI}</span>
        </div>
        <div class="dato-row">
          <span class="dato-label">FECHA DE INGRESO:</span>
          <span class="dato-value">${formatearFecha(data.fechaIngreso)}</span>
        </div>
        <div class="dato-row">
          <span class="dato-label">CARGO:</span>
          <span class="dato-value">${escapeHtml(data.empleadoCargo)}</span>
        </div>
        <div class="dato-row">
          <span class="dato-label">DÍAS TRABAJADOS:</span>
          <span class="dato-value">${data.diasTrabajados}</span>
        </div>
      </div>
    </div>

    <!-- Conceptos de Ingresos y Descuentos -->
    <div class="section">
      <div class="section-title">CONCEPTOS DE INGRESOS Y DESCUENTOS</div>
      <table class="conceptos-table">
        <thead>
          <tr>
            <th style="width: 35%">CONCEPTO</th>
            <th style="width: 20%" class="number">INGRESOS (S/)</th>
            <th style="width: 20%" class="number">DESCUENTOS (S/)</th>
            <th style="width: 25%" class="number">APORTES (S/)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Salario Básico</td>
            <td class="number">${formatearMoneda(data.salarioBase)}</td>
            <td class="number">-</td>
            <td class="number">-</td>
          </tr>
          ${data.asignacionFamiliar > 0 ? `
          <tr>
            <td>Asignación Familiar</td>
            <td class="number">${formatearMoneda(data.asignacionFamiliar)}</td>
            <td class="number">-</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.horasExtras25 > 0 ? `
          <tr>
            <td>Horas Extras 25%</td>
            <td class="number">${formatearMoneda(data.horasExtras25)}</td>
            <td class="number">-</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.horasExtras35 > 0 ? `
          <tr>
            <td>Horas Extras 35%</td>
            <td class="number">${formatearMoneda(data.horasExtras35)}</td>
            <td class="number">-</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.horasExtras100 > 0 ? `
          <tr>
            <td>Horas Extras 100%</td>
            <td class="number">${formatearMoneda(data.horasExtras100)}</td>
            <td class="number">-</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.bonificaciones > 0 ? `
          <tr>
            <td>Bonificaciones</td>
            <td class="number">${formatearMoneda(data.bonificaciones)}</td>
            <td class="number">-</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.comisiones > 0 ? `
          <tr>
            <td>Comisiones</td>
            <td class="number">${formatearMoneda(data.comisiones)}</td>
            <td class="number">-</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.reintegros > 0 ? `
          <tr>
            <td>Reintegros</td>
            <td class="number">${formatearMoneda(data.reintegros)}</td>
            <td class="number">-</td>
            <td class="number">-</td>
          </tr>` : ''}
          <tr>
            <td>Aporte Obligatorio AFP (10%)</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.aporteObligatorio)}</td>
            <td class="number">-</td>
          </tr>
          <tr>
            <td>Comisión Flujo AFP</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.comisionFlujo)}</td>
            <td class="number">-</td>
          </tr>
          <tr>
            <td>Prima de Seguro AFP</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.primaSeguro)}</td>
            <td class="number">-</td>
          </tr>
          ${data.quintaCategoria > 0 ? `
          <tr>
            <td>Renta de 5ta Categoría</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.quintaCategoria)}</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.adelantos > 0 ? `
          <tr>
            <td>Adelantos</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.adelantos)}</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.prestamos > 0 ? `
          <tr>
            <td>Préstamos</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.prestamos)}</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.faltas > 0 ? `
          <tr>
            <td>Descuento por Faltas</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.faltas)}</td>
            <td class="number">-</td>
          </tr>` : ''}
          ${data.tardanzas > 0 ? `
          <tr>
            <td>Descuento por Tardanzas</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.tardanzas)}</td>
            <td class="number">-</td>
          </tr>` : ''}
          <tr>
            <td>Essalud (9%)</td>
            <td class="number">-</td>
            <td class="number">-</td>
            <td class="number">${formatearMoneda(data.essalud)}</td>
          </tr>
          <tr class="total-row">
            <td>TOTALES</td>
            <td class="number">${formatearMoneda(data.totalIngresos)}</td>
            <td class="number">${formatearMoneda(data.totalDescuentos)}</td>
            <td class="number">${formatearMoneda(data.essalud)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Neto a Pagar -->
    <div class="neto-box">
      <div class="neto-label">NETO A PAGAR</div>
      <div class="neto-amount">S/ ${formatearMoneda(data.netoPagar)}</div>
    </div>

    <!-- Datos Bancarios y Firmas -->
    <div class="footer-section">
      <div>
        <div class="section-title">DATOS BANCARIOS</div>
        <div class="datos-grid" style="display: block; border-top: none;">
          <div class="dato-row">
            <span class="dato-label">BANCO:</span>
            <span class="dato-value">${escapeHtml(data.banco || 'No especificado')}</span>
          </div>
          <div class="dato-row">
            <span class="dato-label">CUENTA:</span>
            <span class="dato-value">${data.cuentaBancaria ? '****' + data.cuentaBancaria.slice(-4) : 'No especificado'}</span>
          </div>
        </div>
      </div>
      <div>
        <div class="section-title">DECLARACIÓN</div>
        <div class="firma-box">
          <div class="firma-label">
            Declaro haber recibido a mi entera satisfacción el importe de la presente boleta de pago.<br>
            Fecha: ${formatearFecha(data.fechaEmision)}
          </div>
        </div>
      </div>
    </div>

    <div class="disclaimer">
      Este documento es una representación digital de la boleta de pago. Para consultas o reclamos, 
      acérquese al área de Recursos Humanos dentro de los 15 días hábiles posteriores a la fecha de emisión. 
      La presente boleta constituye comprobante de pago de remuneraciones de acuerdo con la normativa laboral peruana.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generar boleta de pago simplificada (para vista previa)
 */
export function generarHTMLBoletaSimplificada(data: BoletaPagoData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
    .header h1 { font-size: 16px; margin-bottom: 5px; }
    .section { margin-bottom: 15px; }
    .section-title { font-weight: bold; background: #f0f0f0; padding: 5px; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 5px; text-align: left; }
    th { background: #f9f9f9; }
    .number { text-align: right; }
    .total { font-weight: bold; background: #e8f4e8; }
    .neto { font-size: 14px; font-weight: bold; background: #d4edda; padding: 10px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>BOLETA DE PAGO - ${escapeHtml(data.empresaNombre)}</h1>
    <p>RUC: ${data.empresaRUC}</p>
    <p>Período: ${formatearPeriodo(data.periodo)}</p>
  </div>
  
  <div class="section">
    <div class="section-title">TRABAJADOR</div>
    <p><strong>Nombre:</strong> ${escapeHtml(data.empleadoNombre)}</p>
    <p><strong>DNI:</strong> ${data.empleadoDNI}</p>
    <p><strong>Cargo:</strong> ${escapeHtml(data.empleadoCargo)}</p>
    <p><strong>Días Trabajados:</strong> ${data.diasTrabajados}</p>
  </div>

  <div class="section">
    <div class="section-title">RESUMEN</div>
    <table>
      <tr>
        <th>Concepto</th>
        <th class="number">Ingresos</th>
        <th class="number">Descuentos</th>
      </tr>
      <tr>
        <td>Salario Básico</td>
        <td class="number">${formatearMoneda(data.salarioBase)}</td>
        <td class="number">-</td>
      </tr>
      ${data.asignacionFamiliar > 0 ? `<tr><td>Asignación Familiar</td><td class="number">${formatearMoneda(data.asignacionFamiliar)}</td><td class="number">-</td></tr>` : ''}
      ${data.bonificaciones > 0 ? `<tr><td>Bonificaciones</td><td class="number">${formatearMoneda(data.bonificaciones)}</td><td class="number">-</td></tr>` : ''}
      <tr>
        <td>Aporte AFP (10% + comisión + seguro)</td>
        <td class="number">-</td>
        <td class="number">${formatearMoneda(data.totalAFP)}</td>
      </tr>
      ${data.quintaCategoria > 0 ? `<tr><td>Renta 5ta Categoría</td><td class="number">-</td><td class="number">${formatearMoneda(data.quintaCategoria)}</td></tr>` : ''}
      <tr class="total">
        <td>TOTALES</td>
        <td class="number">${formatearMoneda(data.totalIngresos)}</td>
        <td class="number">${formatearMoneda(data.totalDescuentos)}</td>
      </tr>
    </table>
  </div>

  <div class="neto">
    NETO A PAGAR: S/ ${formatearMoneda(data.netoPagar)}
  </div>

  <div class="section" style="margin-top: 20px; font-size: 10px; color: #666;">
    <p><strong>Aportes Empleador:</strong> Essalud (9%): S/ ${formatearMoneda(data.essalud)}</p>
    <p>Fecha de emisión: ${formatearFecha(data.fechaEmision)}</p>
  </div>
</body>
</html>`;
}

// Utilidades
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatearMoneda(valor: number): string {
  return valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatearFecha(fecha: string): string {
  if (!fecha) return '-';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatearPeriodo(periodo: string): string {
  if (!periodo) return '-';
  const [año, mes] = periodo.split('-');
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesNombre = meses[parseInt(mes) - 1] || mes;
  return `${mesNombre} ${año}`;
}

export default {
  generarHTMLBoleta,
  generarHTMLBoletaSimplificada,
};
