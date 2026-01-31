-- ============================================
-- 8. PRÁCTICAS PROFESIONALES (tmpl-008)
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO DE PRÁCTICAS PROFESIONALES
Decreto Legislativo N° 1401

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

La empresa {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, representada por {{NOMBRE_GERENTE}}, con DNI {{DNI_GERENTE}}, domiciliada en {{DIRECCION_EMPRESA}}, en adelante "EL CENTRO DE PRÁCTICAS", y usted, {{NOMBRE_COMPLETO}}, con grado de bachiller/título profesional de {{PROFESION}}, registrado en el Colegio de Profesionales bajo N° {{NUMERO_COLEGIATURA}}, en adelante "EL PRACTICANTE PROFESIONAL", celebran el presente CONTRATO DE PRÁCTICAS PROFESIONALES, al amparo del D.L. N° 1401, en los términos siguientes:

CLAÚSULA PRIMERA: OBJETO
El PRACTICANTE PROFESIONAL realizará prácticas profesionales en el área de {{AREA_TRABAJO}}, bajo la supervisión de {{NOMBRE_SUPERVISOR}}, con la finalidad de adquirir experiencia profesional calificada.

CLAÚSULA SEGUNDA: DURACIÓN
El presente contrato rige desde el {{FECHA_INICIO}} hasta el {{FECHA_FIN}}, por un período de {{DURACION_MESES}} meses, renovable hasta un máximo de veinticuatro (24) meses.

CLAÚSULA TERCERA: HORARIO
Horario de prácticas: {{HORAS_SEMANALES}} horas semanales en {{DIAS_TRABAJO}} días.

CLAÚSULA CUARTA: REMUNERACIÓN Y BENEFICIOS
El PRACTICANTE PROFESIONAL tiene derecho a:
- Gratificación mínima del 30% de la RMV mensual
- Cobertura de ESSALUD por accidentes de trabajo
- Movilidad gratuita o subsidios de transporte
- Refrigerio según jornada
- Constancia de prácticas profesionales

CLAÚSULA QUINTA: OBLIGACIONES
Del PRACTICANTE: cumplir cronograma, asistir puntualmente, respetar normas, mantener confidencialidad, entregar informes.

Del CENTRO DE PRÁCTICAS: proporcionar medios, supervisar, evaluar, pagar beneficios, emitir constancia.

CLAÚSULA SEXTA: NATURALEZA
NO genera vínculo laboral. Es un régimen especial de formación laboral.

En señal de conformidad, las partes firman en {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
CENTRO DE PRÁCTICAS                            EL PRACTICANTE

{{NOMBRE_GERENTE}}                              {{NOMBRE_COMPLETO}}
Gerente/Representante                           {{PROFESION}}
DNI: {{DNI_GERENTE}}                            DNI: {{NUMERO_DOCUMENTO}}
RUC: {{RUC_EMPRESA}}                            Colegiatura N°: {{NUMERO_COLEGIATURA}}

{{#if REQUIERE_FIRMA_DIGITAL}}
FIRMA DIGITAL PENDIENTE: {{BANCO}} - {{NUMERO_CCI}}
{{/if}}
