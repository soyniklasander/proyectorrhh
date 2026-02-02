import { Env } from '../types';

export class PayrollService {
  constructor(private env: Env, private tenantId: string) {}

  async exportPayroll(period: string) {
    // 1. Fetch Payroll Data joined with Employee Data
    const results = await this.env.DB.prepare(`
      SELECT
        e.nombreCompleto,
        e.tipoDocumento,
        e.numeroDocumento,
        e.banco,
        e.numeroCuenta,
        p.periodo,
        p.salarioBase,
        p.totalIngresos,
        p.totalDescuentos,
        p.netoPagar,
        p.fechaPago,
        p.estado
      FROM payroll p
      JOIN employees e ON p.empleadoId = e.id
      WHERE p.company_id = ? AND p.periodo = ?
    `).bind(this.tenantId, period).all();

    if (!results.results || results.results.length === 0) {
      return null;
    }

    // 2. Generate CSV
    const headers = [
      'Periodo',
      'Empleado',
      'Tipo Doc',
      'Documento',
      'Banco',
      'Cuenta',
      'Salario Base',
      'Total Ingresos',
      'Total Descuentos',
      'Neto a Pagar',
      'Fecha Pago',
      'Estado'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = results.results.map((row: any) => [
      escapeCsv(row.periodo),
      escapeCsv(row.nombreCompleto),
      escapeCsv(row.tipoDocumento),
      escapeCsv(row.numeroDocumento),
      escapeCsv(row.banco),
      escapeCsv(row.numeroCuenta),
      row.salarioBase.toFixed(2),
      row.totalIngresos.toFixed(2),
      row.totalDescuentos.toFixed(2),
      row.netoPagar.toFixed(2),
      escapeCsv(row.fechaPago),
      escapeCsv(row.estado)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }
}
