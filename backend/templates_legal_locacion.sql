-- ============================================
-- 6. LOCACIÓN DE SERVICIOS (tmpl-006)
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO DE LOCACIÓN DE SERVICIOS
Código Civil Peruano - Artículo 1764

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

La empresa {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, representada por {{NOMBRE_GERENTE}}, con DNI {{DNI_GERENTE}}, domiciliada en {{DIRECCION_EMPRESA}}, en adelante "EL COMITENTE", y usted, {{NOMBRE_COMPLETO}}, con DNI {{NUMERO_DOCUMENTO}}, en adelante "EL LOCADOR", celebran el presente CONTRATO DE LOCACIÓN DE SERVICIOS, al amparo del Código Civil Peruano, en los términos siguientes:

CLAÚSULA PRIMERA: OBJETO
EL LOCADOR se compromete a prestar servicios de {{SERVICIO}} a favor de EL COMITENTE, con autonomía e independencia, sin subordinación ni dependencia laboral. Los servicios consisten en: [DESCRIBIR SERVICIOS ESPECÍFICOS].

CLAÚSULA SEGUNDA: DURACIÓN
El presente contrato tiene vigencia desde el {{FECHA_INICIO}} hasta el {{FECHA_FIN}}, por un período de {{DURACION_MESES}} meses.

CLAÚSULA TERCERA: REMUNERACIÓN
La retribución por los servicios prestados asciende a S/ {{SALARIO_BASE}} ({{MONTO_LETRAS}} SOLES), pagaderos vía {{MEDIO_PAGO}} en cuenta N° {{NUMERO_CUENTA}} del {{BANCO}} (CCI: {{NUMERO_CCI}}), contra presentación de voucher de servicios.

CLAÚSULA CUARTA: NATURALEZA CIVIL
El presente es un contrato de locación de servicios de naturaleza civil, que no genera vínculo laboral, ni relación de dependencia, ni Goce de beneficios sociales (CTS, Gratificaciones, Vacaciones, ESSALUD). EL LOCADOR es responsable de su own tributario y previsional.

CLAÚSULA QUINTA: OBLIGACIONES DEL LOCADOR
a) Prestar los servicios contratados con la diligencia ordinaria
b) Entregar el trabajo en el plazo establecido
c) Comunicar cualquier impedimento que surja
d) No transferir el contrato sin consentimiento escrito

CLAÚSULA SEXTA: OBLIGACIONES DEL COMITENTE
a) Pagar la retribución acordada en los plazos pactados
b) Proporcionar los medios necesarios para la prestación del servicio
c) Supervisar y aprobar los trabajos realizados

CLAÚSULA SÉPTIMA: RESOLUCIÓN
El contrato puede resolverse por:
a) Mutuo acuerdo
b) Incumplimiento grave de las obligaciones
c) Fuerza mayor o caso fortuito
d) Vencimiento del plazo

En señal de conformidad, las partes firman en {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
EL COMITENTE                                    EL LOCADOR

{{NOMBRE_GERENTE}}                              {{NOMBRE_COMPLETO}}
Representante Legal                             DNI: {{NUMERO_DOCUMENTO}}
DNI: {{DNI_GERENTE}}
RUC: {{RUC_EMPRESA}}

{{#if REQUIERE_FIRMA_DIGITAL}}
FIRMA DIGITAL PENDIENTE: {{BANCO}} - {{NUMERO_CCI}}
{{/if}}
