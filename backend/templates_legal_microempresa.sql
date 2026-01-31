-- ============================================
-- 3. MICROEMPRESA - DL 1276 (tmpl-003)
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO DE TRABAJO BAJO EL RÉGIMEN DE MICROEMPRESA
Decreto Legislativo N° 1276

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

La empresa {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, debidamente representada, con domicilio en {{DIRECCION_EMPRESA}}, en adelante "EL EMPLEADOR", y usted, {{NOMBRE_COMPLETO}}, con DNI {{NUMERO_DOCUMENTO}}, con domicilio en {{DIRECCION}}, en adelante "EL TRABAJADOR", celebran el presente contrato de trabajo bajo el Régimen de Microempresa, conforme al Decreto Legislativo N° 1276 y su Reglamento, en los términos siguientes:

CLAÚSULA PRIMERA: OBJETO
El TRABAJADOR prestará servicios personales en el cargo de {{CARGO}}, desempeñando funciones en {{AREA_TRABAJO}}, por un plazo determinado de {{DURACION_MESES}} meses, contados desde el {{FECHA_INICIO}} hasta el {{FECHA_FIN}}.

CLAÚSULA SEGUNDA: REMUNERACIÓN
La remuneración mensual es de S/ {{SALARIO_BASE}} ({{MONTO_LETRAS}} SOLES), pagaderos vía {{MEDIO_PAGO}} en cuenta N° {{NUMERO_CUENTA}} del {{BANCO}} (CCI: {{NUMERO_CCI}}).

CLAÚSULA TERCERA: BENEFICIOS BAJO EL RÉGIMEN DE MICROEMPRESA
De conformidad con el artículo 5° del D.L. N° 1276, el TRABAJADOR tendrá los siguientes beneficios:
- Vacaciones truncas proporcionales al tiempo de servicios (15 días por año completo de servicios)
- Cobertura integral de ESSALUD al 100% por parte del EMPLEADOR
- Indemnización por despido: 1.5 remuneraciones por cada año completo de servicios, con un máximo de 6 remuneraciones
- No goza de CTS, gratificaciones ni utilidades

CLAÚSULA CUARTA: JORNADA LABORAL
Jornada de {{HORAS_SEMANALES}} horas semanales en {{DIAS_TRABAJO}} días, según el acuerdo entre las partes.

CLAÚSULA QUINTA: CARÁCTER DEL CONTRATO
Este contrato se celebra bajo el régimen especial de Microempresa. Al vencimiento del plazo estipulado, la relación laboral concluye automáticamente sin obligación de pago de indemnización por extinción, salvo pacto en contrario. La Microempresa no está obligada a registrada en el REMYPE.

CLAÚSULA SEXTA: SUSPENSIÓN PERMITIDA
Conforme al artículo 6° del D.L. N° 1276, se permite la suspensión perfectiva del vínculo laboral por causas objetivas tales como: falta de recursos económicos, fuerza mayor, caso fortuito, o circunstancias que impidan el normal desarrollo de las actividades, previa comunicación a la autoridad de trabajo.

CLAÚSULA SÉPTIMA: TERMINACIÓN
La relación laboral puede terminar por:
a) Vencimiento del plazo contractual
b) Mutuo acuerdo entre las partes
c) Causales de resolución previstas en el contrato y la ley
d) Fuerza mayor o caso fortuito

En señal de conformidad, las partes firman en {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
EL EMPLEADOR                                   EL TRABAJADOR

{{NOMBRE_GERENTE}}                             {{NOMBRE_COMPLETO}}
Gerente General                                DNI: {{NUMERO_DOCUMENTO}}
DNI: {{DNI_GERENTE}}
RUC: {{RUC_EMPRESA}}

{{#if REQUIERE_FIRMA_DIGITAL}}
FIRMA DIGITAL PENDIENTE: {{BANCO}} - {{NUMERO_CCI}}
{{/if}}
