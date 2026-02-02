import { z } from 'zod';
import { Env } from '../types';

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const SettingsSchema = z.object({
  // Company Info (Mapped to columns)
  ruc: z.string().length(11, "El RUC debe tener 11 dígitos"),
  razonSocial: z.string().min(2, "La Razón Social es requerida"),
  direccionFiscal: z.object({
    direccion: z.string().min(1, "La dirección es requerida"),
    distrito: z.string().optional(),
    provincia: z.string().optional(),
    departamento: z.string().optional(),
  }),
  representanteLegal: z.object({
    nombre: z.string().min(1, "El nombre del representante es requerido"),
    dni: z.string().length(8, "El DNI del representante debe tener 8 dígitos"),
  }),

  // Config JSON (Mapped to config column)
  config: z.object({
    logoUrl: z.string().url("URL de logo inválida").optional().or(z.literal('')),
    firmaUrl: z.string().url("URL de firma inválida").optional().or(z.literal('')),
    theme: z.enum(['light', 'dark']).default('light'),
    // Payroll Defaults
    payroll: z.object({
      uit: z.number().positive().default(5150), // 2025 Value approx, or 4950
      rmv: z.number().positive().default(1025),
      currency: z.enum(['PEN', 'USD']).default('PEN'),
    }).optional(),
  }).optional(),
});

export type SettingsInput = z.infer<typeof SettingsSchema>;

export class SettingsService {
  constructor(private env: Env, private tenantId: string) {}

  async getSettings() {
    const company = await this.env.DB.prepare(
      'SELECT * FROM companies WHERE id = ?'
    ).bind(this.tenantId).first();

    if (!company) {
      throw new Error('Company not found');
    }

    // Parse JSON fields
    let direccionFiscal = {};
    try {
      direccionFiscal = typeof company.direccion_fiscal === 'string'
        ? JSON.parse(company.direccion_fiscal)
        : company.direccion_fiscal;
    } catch (e) {
      direccionFiscal = { direccion: company.direccion_fiscal };
    }

    let config = {};
    try {
      config = typeof company.config === 'string'
        ? JSON.parse(company.config)
        : company.config;
    } catch (e) {
      config = {};
    }

    return {
      ruc: company.ruc,
      razonSocial: company.razon_social,
      direccionFiscal,
      representanteLegal: {
        nombre: company.representante_legal_nombre,
        dni: company.representante_legal_dni,
      },
      config,
    };
  }

  async updateSettings(data: SettingsInput) {
    const validData = SettingsSchema.parse(data);

    const direccionFiscalJson = JSON.stringify(validData.direccionFiscal);
    const configJson = JSON.stringify(validData.config || {});

    // Update Company Table
    await this.env.DB.prepare(`
      UPDATE companies
      SET
        ruc = ?,
        razon_social = ?,
        direccion_fiscal = ?,
        representante_legal_nombre = ?,
        representante_legal_dni = ?,
        config = ?,
        updatedAt = datetime('now')
      WHERE id = ?
    `).bind(
      validData.ruc,
      validData.razonSocial,
      direccionFiscalJson,
      validData.representanteLegal.nombre,
      validData.representanteLegal.dni,
      configJson,
      this.tenantId
    ).run();

    return {
      success: true,
      message: 'Configuración actualizada correctamente',
      data: validData
    };
  }
}
