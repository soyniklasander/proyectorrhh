-- ============================================
-- 7. PRÁCTICAS PRE-PROFESIONALES (tmpl-007)
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO DE PRÁCTICAS PRE-PROFESIONALES
Decreto Legislativo N° 1401

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

La empresa {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, representada por {{NOMBRE_GERENTE}}, con DNI {{DNI_GERENTE}}, domiciliada en {{DIRECCION_EMPRESA}}, en adelante "EL CENTRO DE PRÁCTICAS", y usted, {{NOMBRE_COMPLETO}}, estudiante de la carrera profesional de {{CARRERA}} en la {{UNIVERSIDAD}}, con código de estudiante N° {{CODIGO_ESTUDIANTE}}, en adelante "EL PRACTICANTE", celebran el presente CONTRATO DE PRÁCTICAS PRE-PROFESIONALES, al amparo del Decreto Legislativo N° 1401 y su Reglamento, en los términos siguientes:

CLAÚSULA PRIMERA: OBJETO
El objeto del presente contrato es que el PRACTICANTE realice prácticas pre-profesionales en las instalaciones del CENTRO DE PRÁCTICAS, en el área de {{AREA_TRABAJO}}, bajo la supervisión de {{NOMBRE_SUPERVISOR}}, con la finalidad de complementar su formación académica y adquirir experiencia profesional.

CLAÚSULA SEGUNDA: DURACIÓN
El presente contrato tiene vigencia desde el {{FECHA_INICIO}} hasta el {{FECHA_FIN}}, con una duración de {{DURACION_MESES}} meses, renovables por única vez, hasta completar el máximo legal de doce (12) meses.

CLAÚSULA TERCERA: HORARIO
El horario de prácticas será de {{HORAS_SEMANALES}} horas semanales, en {{DIAS_TRABAJO}} días, según el siguiente horario: {{HORARIO}}.

CLAÚSULA CUARTA: BENEFICIOS DEL PRACTICANTE
Conforme al D.L. N° 1401, el PRACTICANTE tiene derecho a:
- Subsidio por transporte (no menor al 30% de la RMV) o movilidad gratuita
- Refrigerio o almuerzo gratuito cuando la jornada sea mayor a 4 horas
- Cobertura de ESSALUD por accidentes de trabajo
- Constancia de prácticas al finalizar el período
- Evaluación y retroalimentación mensual

CLAÚSULA QUINTA: OBLIGACIONES DEL PRACTICANTE
a) Cumplir con el cronograma de actividades establecido
b) Asistir puntualmente según el horario establecido
c) Respetar las normas internas del CENTRO DE PRÁCTICAS
d) Mantener la confidencialidad de la información
e) Entregar informes mensuales de actividades
f) No realizar labores que no estén relacionadas con su carrera

CLAÚSULA SEXTA: NATURALEZA DEL CONTRATO
El presente contrato NO genera vínculo laboral. Las prácticas pre-profesionales son de naturaleza formativa y no crean relación de trabajo ni obligaciones previsionales, a excepción de la cobertura de ESSALUD por accidentes.

CLAÚSULA SÉPTIMA: CERTIFICACIÓN
Al finalizar satisfactoriamente el período de prácticas, el CENTRO DE PRÁCTICAS emitirá la Constancia de Prácticas correspondiente, con indicación de las actividades realizadas y el tiempo de prácticas.

En señal de conformidad, las partes firman en {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
CENTRO DE PRÁCTICAS                            EL PRACTICANTE

{{NOMBRE_GERENTE}}                              {{NOMBRE_COMPLETO}}
Gerente/Representante                           DNI: {{NUMERO_DOCUMENTO}}
DNI: {{DNI_GERENTE}}                            Código: {{CODIGO_ESTUDIANTO}}
RUC: {{RUC_EMPRESA}}                            Carrera: {{CARRERA}}
                                               Universidad: {{UNIVERSIDAD}}

{{#if REQUIERE_FIRMA_DIGITAL}}
FIRMA DIGITAL PENDIENTE: {{BANCO}} - {{NUMERO_CCI}}
{{/if}}
