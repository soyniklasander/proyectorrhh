import { z } from 'zod';
import { Env } from '../types';

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const OnboardingSchema = z.object({
  // Identidad
  tipoDocumento: z.enum(['DNI', 'CE']),
  numeroDocumento: z.string().refine((val) => {
    // Basic length check, ideally regex based on type
    return val.length >= 8 && val.length <= 12;
  }, { message: "Documento inválido (8-12 dígitos)" }),
  nombres: z.string().min(2),
  apellidoPaterno: z.string().min(2),
  apellidoMaterno: z.string().min(2),

  // Ubigeo & Domicilio
  ubigeo: z.string().length(6, "El Ubigeo debe tener 6 dígitos"),
  direccion: z.string().min(5),

  // Financiero
  banco: z.string(),
  tipoCuenta: z.string(),
  numeroCuenta: z.string(),
  numeroCCI: z.string().length(20, "El CCI debe tener 20 dígitos"),

  // Previsional
  sistemaPensiones: z.enum(['ONP', 'AFP_HABITAT', 'AFP_PRIMA', 'AFP_INTEGRA', 'AFP_PROFUTURO']),
  cuspp: z.string().optional(), // Obligatorio si es AFP? validación condicional compleja, lo dejamos opcional en schema base

  // Familiar
  asignacionFamiliar: z.boolean(),
  derechohabientes: z.array(z.object({
    nombre: z.string(),
    dni: z.string(),
    relacion: z.string()
  })).optional(),

  // Contract Specifics
  cargo: z.string(),
  salarioBase: z.number().positive(),
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tipoContrato: z.string(),
  regimenLaboral: z.string(),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;

export class ContractService {
  constructor(private env: Env, private tenantId: string) {}

  async createOnboarding(data: OnboardingInput) {
    // 1. Validate Input (Zod parse happens at controller level usually, but we can double check)
    const validData = OnboardingSchema.parse(data);

    // 2. Fetch Company Data (Tenant)
    const company = await this.env.DB.prepare(
      'SELECT * FROM companies WHERE id = ?'
    ).bind(this.tenantId).first();

    if (!company) {
      throw new Error('Company not found for current tenant context');
    }

    // Parse Company JSON fields
    const companyConfig = typeof company.config === 'string' ? JSON.parse(company.config) : company.config || {};
    const companyAddress = typeof company.direccion_fiscal === 'string' ? JSON.parse(company.direccion_fiscal) : company.direccion_fiscal || {};

    // 3. Create Employee
    const employeeId = crypto.randomUUID();
    const fullName = `${validData.nombres} ${validData.apellidoPaterno} ${validData.apellidoMaterno}`;

    // Note: In real app, check if exists first
    const stmtEmployee = this.env.DB.prepare(`
      INSERT INTO employees (
        id, company_id, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto,
        tipoDocumento, numeroDocumento, direccion, banco, tipoCuenta, numeroCuenta, numeroCCI,
        estado, fechaIngreso, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO', ?, datetime('now'), datetime('now'))
    `).bind(
      employeeId, this.tenantId, validData.nombres, validData.apellidoPaterno, validData.apellidoMaterno, fullName,
      validData.tipoDocumento, validData.numeroDocumento, validData.direccion, validData.banco, validData.tipoCuenta, validData.numeroCuenta, validData.numeroCCI,
      validData.fechaInicio
    );

    // 4. Create Contract
    const contractId = crypto.randomUUID();
    const stmtContract = this.env.DB.prepare(`
      INSERT INTO contracts (
        id, company_id, empleadoId, cargo, salarioBase, fechaInicio,
        tipoContrato, regimenLaboral, asignacionFamiliar, afp, cuspp,
        estado, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VIGENTE', datetime('now'), datetime('now'))
    `).bind(
      contractId, this.tenantId, employeeId, validData.cargo, validData.salarioBase, validData.fechaInicio,
      validData.tipoContrato, validData.regimenLaboral, validData.asignacionFamiliar ? 1 : 0, validData.sistemaPensiones, validData.cuspp || null
    );

    await this.env.DB.batch([stmtEmployee, stmtContract]);

    // 5. Generate Document Preview (Fusion)
    const contractPreview = this.generateContractPreview(validData, company, companyAddress);

    return {
      success: true,
      data: {
        employeeId,
        contractId,
        preview: contractPreview
      }
    };
  }

  private generateContractPreview(employee: OnboardingInput, company: any, companyAddress: any) {
    // Simple Template
    const template = `
      CONTRATO DE TRABAJO

      Conste por el presente documento, el Contrato de Trabajo que celebran:

      EL EMPLEADOR: {{EMPRESA_RAZON_SOCIAL}}, con RUC N° {{EMPRESA_RUC}},
      con domicilio fiscal en {{EMPRESA_DOMICILIO}}, debidamente representada por
      {{REPRESENTANTE_NOMBRE}}, identificado con DNI N° {{REPRESENTANTE_DNI}}.

      EL TRABAJADOR: {{TRABAJADOR_NOMBRE}}, identificado con {{TRABAJADOR_TIPO_DOC}} N° {{TRABAJADOR_NUM_DOC}},
      con domicilio en {{TRABAJADOR_DOMICILIO}}.

      CLÁUSULAS:
      1. El TRABAJADOR desempeñará el cargo de {{CARGO}}.
      2. La remuneración será de S/ {{SALARIO}}.
      3. El régimen laboral es {{REGIMEN}}.

      Firmado en {{CIUDAD}}, a los {{DIA}} días del mes de {{MES}} del {{ANIO}}.
    `;

    // Fusion Logic
    let content = template
      .replace('{{EMPRESA_RAZON_SOCIAL}}', company.razon_social)
      .replace('{{EMPRESA_RUC}}', company.ruc)
      .replace('{{EMPRESA_DOMICILIO}}', typeof companyAddress === 'object' ?
        `${companyAddress.direccion}, ${companyAddress.distrito}, ${companyAddress.provincia}` :
        String(companyAddress)
      )
      .replace('{{REPRESENTANTE_NOMBRE}}', company.representante_legal_nombre)
      .replace('{{REPRESENTANTE_DNI}}', company.representante_legal_dni)
      .replace('{{TRABAJADOR_NOMBRE}}', `${employee.nombres} ${employee.apellidoPaterno} ${employee.apellidoMaterno}`)
      .replace('{{TRABAJADOR_TIPO_DOC}}', employee.tipoDocumento)
      .replace('{{TRABAJADOR_NUM_DOC}}', employee.numeroDocumento)
      .replace('{{TRABAJADOR_DOMICILIO}}', employee.direccion)
      .replace('{{CARGO}}', employee.cargo)
      .replace('{{SALARIO}}', employee.salarioBase.toFixed(2))
      .replace('{{REGIMEN}}', employee.regimenLaboral);

    // Date formatting (simple)
    const now = new Date();
    content = content
      .replace('{{CIUDAD}}', 'Lima') // Default or from Company
      .replace('{{DIA}}', now.getDate().toString())
      .replace('{{MES}}', (now.getMonth() + 1).toString())
      .replace('{{ANIO}}', now.getFullYear().toString());

    return content;
  }
}
