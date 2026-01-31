-- ============================================
-- 9. RÉGIMEN AGRARIO - DL 1053 (tmpl-009)
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO DE TRABAJO BAJO EL RÉGIMEN AGRARIO
Decreto Legislativo N° 1053

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

La empresa {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, dedicada a actividades agrícolas/pecuarias, representada por {{NOMBRE_GERENTE}}, con DNI {{DNI_GERENTE}}, domiciliada en {{DIRECCION_EMPRESA}}, en adelante "EL EMPLEADOR", y usted, {{NOMBRE_COMPLETO}}, con DNI {{NUMERO_DOCUMENTO}}, en adelante "EL TRABAJADOR", celebran el presente CONTRATO DE TRABAJO bajo el Régimen Agrario, al amparo del Decreto Legislativo N° 1053 y su Reglamento, en los términos siguientes:

CLAÚSULA PRIMERA: OBJETO
El TRABAJADOR prestará servicios personales en el cargo de {{CARGO}}, desempeñando funciones en {{UBICACION_CAMPO}} (zona agrícola/pecuaria), bajo la dirección y supervisión del EMPLEADOR.

CLAÚSULA SEGUNDA: DURACIÓN
El presente contrato tiene vigencia desde el {{FECHA_INICIO}} hasta el {{FECHA_FIN}} (si es plazo fijo), o sin plazo determinado si es indeterminado, según las necesidades de las actividades agrícolas/pecuarias.

CLAÚSULA TERCERA: REMUNERACIÓN
La remuneración mensual es de S/ {{SALARIO_BASE}} ({{MONTO_LETRAS}} SOLES), pagadera vía {{MEDIO_PAGO}} en cuenta N° {{NUMERO_CUENTA}} del {{BANCO}} (CCI: {{NUMERO_CCI}}).

CLAÚSULA CUARTA: JORNADA LABORAL
La jornada laboral es de {{HORAS_SEMANALES}} horas semanales, distribuidas en {{DIAS_TRABAJO}} días, pudiendo variar según las necesidades de las actividades agrícolas (siembra, cosecha, riego, etc.), con respeto a los límites legales.

CLAÚSULA QUINTA: BENEFICIOS - RÉGIMEN AGRARIO
Conforme al D.L. N° 1053, el TRABAJADOR tiene derecho a:
- Vacaciones truncas proporcionales (15 días por año)
- Cobertura integral de ESSALUD
- Indemnización por despido: 15 días de remuneración por año (máximo 90 días)
- NO goza de CTS ni Gratificaciones (excepto por negociación colectiva)
- Descanso semanal obligatorio

CLAÚSULA SEXTA: CARÁCTER ESPECIAL
El régimen agrario tiene características especiales por la naturaleza de las actividades agrícolas y pecuarias, incluyendo posible suspensión de la relación laboral por períodos de inactividad productiva, con compensación correspondiente.

CLAÚSULA SÉPTIMA: SEGURIDAD Y SALUD
El EMPLEADOR se compromete a cumplir con todas las normas de seguridad y salud en el trabajo aplicables al sector agrario, proporcionando los equipos de protección personal necesarios.

En señal de conformidad, las partes firman en {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
EL EMPLEADOR                                   EL TRABAJADOR

{{NOMBRE_GERENTE}}                             {{NOMBRE_COMPLETO}}
Gerente/Representante                          DNI: {{NUMERO_DOCUMENTO}}
DNI: {{DNI_GERENTE}}
RUC: {{RUC_EMPRESA}}
Actividad: Agrícola/Pecuaria

{{#if REQUIERE_FIRMA_DIGITAL}}
FIRMA DIGITAL PENDIENTE: {{BANCO}} - {{NUMERO_CCI}}
{{/if}}
