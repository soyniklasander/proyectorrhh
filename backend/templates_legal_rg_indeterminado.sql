-- ============================================
-- ACTUALIZAR PLANTILLAS DEL SISTEMA CON TEXTO LEGAL COMPLETO
-- PERÚ - Leyes laborales vigentes 2024-2025
-- ============================================

-- ============================================
-- 1. RÉGIMEN GENERAL - PLAZO INDETERMINADO (tmpl-001)
-- Decreto Legislativo N° 728
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO DE TRABAJO A PLAZO INDETERMINADO

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

Por medio de la presente, la empresa {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, representada por su Gerente General {{NOMBRE_GERENTE}}, identificada con DNI {{DNI_GERENTE}}, ubicada en {{DIRECCION_EMPRESA}}, en adelante denominada "EL EMPLEADOR", y usted, {{NOMBRE_COMPLETO}}, identificado(a) con DNI {{NUMERO_DOCUMENTO}}, domiciliado(a) en {{DIRECCION}}, en adelante "EL TRABAJADOR", celebramos el presente CONTRATO DE TRABAJO A PLAZO INDETERMINADO, al amparo del Decreto Legislativo N° 728, Ley de Productividad y Competitividad Laboral, en los siguientes términos:

CLAÚSULA PRIMERA: OBJETO
El TRABAJADOR se obliga a prestar servicios personales en el cargo de {{CARGO}}, desempeñando funciones en el área de {{AREA_TRABAJO}} y bajo la dependencia directa del EMPLEADOR, dedicando todo su esfuerzo y capacidad a la ejecución de las tareas que le sean asignadas, dentro del marco de las normas de conducta y disciplina que rigen la institución.

CLAÚSULA SEGUNDA: REMUNERACIÓN
La remuneración mensual pactada asciende a S/ {{SALARIO_BASE}} ({{MONTO_LETRAS}} SOLES), cantidad que será abonada en forma mensual, los últimos días de cada mes, vía {{MEDIO_PAGO}} en la cuenta bancaria N° {{NUMERO_CUENTA}} del {{BANCO}} (CCI: {{NUMERO_CCI}}). Esta remuneración incluye todos los beneficios de ley.

CLAÚSULA TERCERA: JORNADA LABORAL
La jornada laboral será de {{HORAS_SEMANALES}} horas semanales, distribuidas en {{DIAS_TRABAJO}} días a la semana, en el horario establecido por EL EMPLEADOR, pudiendo ser modificado según las necesidades del servicio, previa comunicación al TRABAJADOR.

CLAÚSULA CUARTA: PERIODO DE PRUEBA
El período de prueba será de tres (3) meses, contados a partir de la fecha de inicio de labores, conforme al artículo 10° del Decreto Legislativo N° 728. Durante este período, cualquiera de las partes puede resolver el contrato sin expresión de causa ni derecho a indemnización.

CLAÚSULA QUINTA: BENEFICIOS SOCIALES
EL TRABAJADOR tendrá derecho a los siguientes beneficios:
- Cobertura integral de ESSALUD (9% de la remuneración)
- Compensación por Tiempo de Servicios (CTS), equivalente a un salario mensual por año, depositable en los meses de mayo y noviembre
- Vacaciones anuales de treinta (30) días calendario
- Gratificaciones legales de Fiestas Patrias (julio) y Navidad (diciembre), equivalentes a una remuneración cada una
- Asignación familiar equivalente al 10% de la Remuneración Mínima Vital, si corresponde
- Participación en las utilidades de la empresa, cuando corresponda según ley

CLAÚSULA SEXTA: OBLIGACIONES DEL TRABAJADOR
Son obligaciones del TRABAJADOR, entre otras:
a) Cumplir estrictamente las normas internas de trabajo y reglamentos internos de trabajo
b) Observar buena conducta durante la prestación de servicios
c) Cumplir con las tareas asignadas con eficiencia, eficacia y diligencia
d) Guardar reserva de toda información confidencial de la empresa
e) No realizar actividades que interfieran con sus funciones o que sean competencia de la empresa
f) Concurrir puntualmente al centro de trabajo
g) Usar adecuadamente los bienes y equipos de la empresa
h) Informar cualquier irregularidad que observe en el desarrollo de sus funciones

CLAÚSULA SÉPTIMA: FACULTADES DEL EMPLEADOR
EL EMPLEADOR tiene la facultad de dirigir y supervisar el trabajo, modificar turnos, asignar nuevas funciones, cambiar de área de trabajo y aplicar sanciones disciplinarias en caso de incumplimiento de las normas internas, conforme al régimen disciplinario establecido.

CLAÚSULA OCTAVA: VIGENCIA
El presente contrato entra en vigencia a partir del {{FECHA_INICIO}} y tendrá carácter indefinido, pudiendo ser resuelto por cualquiera de las partes conforme a las normas legales vigentes, con observancia de los plazos de preaviso establecidos.

CLAÚSULA NOVENA: RESOLUCIÓN
El contrato podrá ser resuelto por las causales establecidas en los artículos 16° y 22° del Decreto Legislativo N° 728, con sujeción a las normas de protección del trabajador. La terminación de la relación laboral dará lugar al pago de los beneficios sociales proporcionales.

CLAÚSULA DÉCIMA: EXCLUSIVIDAD
Durante la vigencia del presente contrato, el TRABAJADOR no podrá prestar servicios a otras empresas o personas naturales que realicen actividades similares o competitivas a las del EMPLEADOR, sin autorización previa y escrita de este último.

CLAÚSULA DÉCIMA PRIMERA: CONFIDENCIALIDAD
El TRABAJADOR se compromete a mantener estricta confidencialidad sobre toda información, documentación, procesos, sistemas y know-how de la empresa a la que tenga acceso durante su vínculo laboral. Esta obligación se mantiene vigente por un período de cinco (5) años después de la culminación de la relación laboral.

CLAÚSULA DÉCIMA SEGUNDA: DOMICILIO
Para todos los efectos legales del presente contrato, las partes fijan sus domicilios en los indicados en la introducción de este documento. Cualquier cambio de domicilio deberá ser comunicado por escrito a la otra parte con una anticipación de quince (15) días calendario.

En señal de conformidad, las partes firman el presente documento en la ciudad de {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
EL EMPLEADOR                                   EL TRABAJADOR

{{NOMBRE_GERENTE}}                             {{NOMBRE_COMPLETO}}
Gerente General                                DNI: {{NUMERO_DOCUMENTO}}
DNI: {{DNI_GERENTE}}

{{#if REQUIERE_FIRMA_DIGITAL}}
═══════════════════════════════════════════════════════════════
FIRMA DIGITAL PENDIENTE DE AUTORIZACIÓN
Banco emisor: {{BANCO}}
Número de cuenta CCI: {{NUMERO_CCI}}
Fecha programada para firma digital: [PENDIENTE]
Nota: Esta funcionalidad estará disponible en una futura actualización
═══════════════════════════════════════════════════════════════
{{/if}}

---
Contrato registrado en el sistema RRHHMod
Fecha de generación: {{FECHA_GENERACION}}
