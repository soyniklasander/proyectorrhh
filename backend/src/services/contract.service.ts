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

const CONTRACT_TEMPLATE = `
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

function precompileTemplate(tpl: string): string[] {
  const parts: string[] = [];
  let lastIndex = 0;
  const regex = /{{([A-Z_]+)}}/g;
  let match;
  while ((match = regex.exec(tpl)) !== null) {
    if (match.index > lastIndex) {
      parts.push(tpl.substring(lastIndex, match.index));
    }
    parts.push(`VAR:${match[1]}`);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < tpl.length) {
    parts.push(tpl.substring(lastIndex));
  }
  return parts;
}

const COMPILED_CONTRACT_TEMPLATE = precompileTemplate(CONTRACT_TEMPLATE);

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
    await this.env.DB.prepare(`
      INSERT INTO employees (
        id, company_id, nombres, apellidoPaterno, apellidoMaterno, nombreCompleto,
        tipoDocumento, numeroDocumento, direccion, banco, tipoCuenta, numeroCuenta, numeroCCI,
        estado, fechaIngreso, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO', ?, datetime('now'), datetime('now'))
    `).bind(
      employeeId, this.tenantId, validData.nombres, validData.apellidoPaterno, validData.apellidoMaterno, fullName,
      validData.tipoDocumento, validData.numeroDocumento, validData.direccion, validData.banco, validData.tipoCuenta, validData.numeroCuenta, validData.numeroCCI,
      validData.fechaInicio
    ).run();

    // 4. Create Contract
    const contractId = crypto.randomUUID();
    await this.env.DB.prepare(`
      INSERT INTO contracts (
        id, company_id, empleadoId, cargo, salarioBase, fechaInicio,
        tipoContrato, regimenLaboral, asignacionFamiliar, afp, cuspp,
        estado, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VIGENTE', datetime('now'), datetime('now'))
    `).bind(
      contractId, this.tenantId, employeeId, validData.cargo, validData.salarioBase, validData.fechaInicio,
      validData.tipoContrato, validData.regimenLaboral, validData.asignacionFamiliar ? 1 : 0, validData.sistemaPensiones, validData.cuspp || null
    ).run();

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
    const now = new Date();
    let result = '';

    for (const part of COMPILED_CONTRACT_TEMPLATE) {
      if (part.startsWith('VAR:')) {
        const key = part.substring(4);
        switch (key) {
          case 'EMPRESA_RAZON_SOCIAL': result += company.razon_social; break;
          case 'EMPRESA_RUC': result += company.ruc; break;
          case 'EMPRESA_DOMICILIO': result += (typeof companyAddress === 'object' ?
            `${companyAddress.direccion}, ${companyAddress.distrito}, ${companyAddress.provincia}` :
            String(companyAddress)); break;
          case 'REPRESENTANTE_NOMBRE': result += company.representante_legal_nombre; break;
          case 'REPRESENTANTE_DNI': result += company.representante_legal_dni; break;
          case 'TRABAJADOR_NOMBRE': result += `${employee.nombres} ${employee.apellidoPaterno} ${employee.apellidoMaterno}`; break;
          case 'TRABAJADOR_TIPO_DOC': result += employee.tipoDocumento; break;
          case 'TRABAJADOR_NUM_DOC': result += employee.numeroDocumento; break;
          case 'TRABAJADOR_DOMICILIO': result += employee.direccion; break;
          case 'CARGO': result += employee.cargo; break;
          case 'SALARIO': result += employee.salarioBase.toFixed(2); break;
          case 'REGIMEN': result += employee.regimenLaboral; break;
          case 'CIUDAD': result += 'Lima'; break;
          case 'DIA': result += now.getDate().toString(); break;
          case 'MES': result += (now.getMonth() + 1).toString(); break;
          case 'ANIO': result += now.getFullYear().toString(); break;
          default: result += `{{${key}}}`;
        }
      } else {
        result += part;
      }
    }

    return result;
  }
}
