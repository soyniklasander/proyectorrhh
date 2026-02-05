/**
 * Servicio de Email
 * Envío de boletas de pago usando Cloudflare Email/Resend
 */

export interface EmailBoletaConfig {
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface EmailTemplateData {
  empleadoNombre: string;
  empleadoEmail: string;
  periodo: string;
  empresaNombre: string;
  netoPagar: number;
  boletaHTML?: string;
  boletaPDFBase64?: string;
}

/**
 * Plantilla de email para boleta de pago
 */
export function generarEmailBoletaTemplate(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = `Boleta de Pago - ${formatearPeriodo(data.periodo)} - ${data.empresaNombre}`;
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .boleta-preview {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 20px 0;
    }
    .neto-box {
      background: #e8f5e9;
      border: 2px solid #4caf50;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    }
    .neto-label {
      font-size: 14px;
      color: #2e7d32;
      margin-bottom: 5px;
    }
    .neto-amount {
      font-size: 28px;
      font-weight: bold;
      color: #1b5e20;
    }
    .footer {
      background: #333;
      color: #ccc;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      border-radius: 0 0 10px 10px;
    }
    .footer a {
      color: #fff;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .disclaimer {
      font-size: 11px;
      color: #666;
      margin-top: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>💼 Boleta de Pago</h1>
    <p>${escapeHtml(data.empresaNombre)}</p>
  </div>
  
  <div class="content">
    <p>Estimado(a) <strong>${escapeHtml(data.empleadoNombre)}</strong>,</p>
    
    <p>Le enviamos su boleta de pago correspondiente al período <strong>${formatearPeriodo(data.periodo)}</strong>.</p>
    
    <div class="neto-box">
      <div class="neto-label">NETO A PAGAR</div>
      <div class="neto-amount">S/ ${data.netoPagar.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
    
    ${data.boletaHTML ? `
    <div class="boleta-preview">
      ${data.boletaHTML}
    </div>
    ` : ''}
    
    <div class="info-box">
      <strong>📋 Información Importante:</strong><br>
      • Su boleta de pago está disponible adjunta en formato PDF.<br>
      • Para consultas o reclamos, contacte a RRHH dentro de los 15 días hábiles.<br>
      • Este es un mensaje automático, por favor no responda a este correo.
    </div>
    
    <p style="text-align: center;">
      <a href="#" class="button">Ver Boleta en Línea</a>
    </p>
    
    <div class="disclaimer">
      <strong>Confidencialidad:</strong> Este correo contiene información personal y confidencial. 
      Si ha recibido este mensaje por error, por favor elimínelo y notifique al remitente inmediatamente.
      Esta boleta constituye comprobante de pago de acuerdo con la normativa laboral peruana (D.S. 001-98-TR).
    </div>
  </div>
  
  <div class="footer">
    <p>${escapeHtml(data.empresaNombre)} - Sistema de Gestión de Recursos Humanos</p>
    <p>Este correo fue enviado automáticamente por RRHHMOD</p>
  </div>
</body>
</html>`;

  const text = `Boleta de Pago - ${formatearPeriodo(data.periodo)}

Estimado(a) ${data.empleadoNombre},

Le enviamos su boleta de pago correspondiente al período ${formatearPeriodo(data.periodo)}.

NETO A PAGAR: S/ ${data.netoPagar.toFixed(2)}

Para consultas o reclamos, contacte a RRHH dentro de los 15 días hábiles.

---
${data.empresaNombre}
Sistema de Gestión de Recursos Humanos
`;

  return { subject, html, text };
}

/**
 * Enviar email usando Cloudflare Email API
 */
export async function enviarEmail(
  config: EmailBoletaConfig,
  apiKey?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Si tenemos API key de Resend, usarla
    if (apiKey) {
      return await enviarEmailResend(config, apiKey);
    }
    
    // Usar Cloudflare Email Workers
    // Nota: Esto requiere configuración adicional en Cloudflare
    return { success: false, error: 'No email provider configured' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Enviar email usando Resend
 */
async function enviarEmailResend(
  config: EmailBoletaConfig,
  apiKey: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RRHH <boletas@tuempresa.com>',
        to: config.to,
        subject: config.subject,
        html: config.htmlBody,
        text: config.body,
        attachments: config.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, messageId: result.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Enviar boleta por email (función completa)
 */
export async function enviarBoletaPorEmail(
  emailConfig: {
    to: string;
    empleadoNombre: string;
    periodo: string;
    empresaNombre: string;
    netoPagar: number;
    boletaHTML?: string;
    boletaPDFBase64?: string;
  },
  apiKey?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = generarEmailBoletaTemplate({
    empleadoNombre: emailConfig.empleadoNombre,
    empleadoEmail: emailConfig.to,
    periodo: emailConfig.periodo,
    empresaNombre: emailConfig.empresaNombre,
    netoPagar: emailConfig.netoPagar,
    boletaHTML: emailConfig.boletaHTML,
    boletaPDFBase64: emailConfig.boletaPDFBase64,
  });

  const attachments = emailConfig.boletaPDFBase64
    ? [{
        filename: `boleta_${emailConfig.periodo}_${emailConfig.empleadoNombre.replace(/\s+/g, '_')}.pdf`,
        content: emailConfig.boletaPDFBase64,
        contentType: 'application/pdf',
      }]
    : undefined;

  return enviarEmail(
    {
      to: emailConfig.to,
      subject: template.subject,
      body: template.text,
      htmlBody: template.html,
      attachments,
    },
    apiKey
  );
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

function formatearPeriodo(periodo: string): string {
  if (!periodo) return '-';
  const [año, mes] = periodo.split('-');
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesNombre = meses[parseInt(mes) - 1] || mes;
  return `${mesNombre} ${año}`;
}

export default {
  generarEmailBoletaTemplate,
  enviarEmail,
  enviarBoletaPorEmail,
};
