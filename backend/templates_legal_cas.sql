-- ============================================
-- 5. CAS - DL 1057 (tmpl-005)
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO ADMINISTRATIVO DE SERVICIOS (CAS)
Decreto Legislativo N° 1057 - Régimen Especial

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

El Estado Peruano, a través de {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, representado por {{NOMBRE_GERENTE}}, con DNI {{DNI_GERENTE}}, con domicilio en {{DIRECCION_EMPRESA}}, en adelante "LA ENTIDAD", y usted, {{NOMBRE_COMPLETO}}, identificado(a) con DNI {{NUMERO_DOCUMENTO}}, en adelante "EL CONTRATISTA", celebramos el presente CONTRATO ADMINISTRATIVO DE SERVICIOS (CAS), bajo el régimen especial del Decreto Legislativo N° 1057 y su Reglamento, en los términos siguientes:

CLAÚSULA PRIMERA: OBJETO
EL CONTRATISTA se compromete a prestar servicios de naturaleza laboral, subordinada y autónoma en el cargo de {{CARGO}}, desempeñando funciones en el área de {{AREA_TRABAJO}}, bajo la dirección y supervisión de LA ENTIDAD.

CLAÚSULA SEGUNDA: VIGENCIA
El presente contrato tiene vigencia desde el {{FECHA_INICIO}} hasta el {{FECHA_FIN}}, pudiendo ser renovado por períodos sucesivos, previa evaluación de desempeño satisfactoria y disponibilidad presupuestal, con una anticipación mínima de treinta (30) días al vencimiento.

CLAÚSULA TERCERA: REMUNERACIÓN
La retribución mensual por los servicios prestados asciende a S/ {{SALARIO_BASE}} ({{MONTO_LETRAS}} SOLES), pagaderos vía {{MEDIO_PAGO}} en cuenta N° {{NUMERO_CUENTA}} del {{BANCO}}.

CLAÚSULA CUARTA: NATURALEZA JURÍDICA
El CAS es un régimen laboral especial de naturaleza civil, que no genera vínculo laboral con el Estado, salvo los derechos inherentes al régimen de seguridad social (ESSALUD). No generaCTS, gratificaciones, vacaciones ni indemnización por tiempo de servicios.

CLAÚSULA QUINTA: SEGURIDAD SOCIAL
EL CONTRATISTA afiliado obligatoriamente al Sistema Nacional de Pensiones o Sistema Privado de Pensiones, según elección, y goza de cobertura de ESSALUD.

CLAÚSULA SEXTA: HORARIO
La jornada laboral será de {{HORAS_SEMANALES}} horas semanales en {{DIAS_TRABAJO}} días, según las necesidades del servicio.

CLAÚSULA SÉPTIMA: CAUSALES DE RESOLUCIÓN
El contrato puede ser resuelto por:
a) Vencimiento del plazo
b) Mutuo acuerdo
c) Incumplimiento grave de las obligaciones
d) Supresión del puesto o reducción de presupuesto
e) Fuerza mayor o caso fortuito

CLAÚSULA OCTAVA: PREAVISO
En caso de resolución por causas imputables a LA ENTIDAD sin mediar incumplimiento, EL CONTRATISTA tiene derecho a una indemnización equivalente a una remuneración por cada mes pendiente hasta el vencimiento del contrato, con un máximo de tres (3) remuneraciones.

En señal de conformidad, las partes firman en {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
LA ENTIDAD                                      EL CONTRATISTA

{{NOMBRE_GERENTE}}                              {{NOMBRE_COMPLETO}}
Representante Legal                             DNI: {{NUMERO_DOCUMENTO}}
DNI: {{DNI_GERENTE}}

{{#if REQUIERE_FIRMA_DIGITAL}}
FIRMA DIGITAL PENDIENTE: {{BANCO}} - {{NUMERO_CCI}}
{{/if}}
