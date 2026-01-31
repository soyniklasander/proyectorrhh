-- ============================================
-- 2. RÉGIMEN GENERAL - PLAZO FIJO (tmpl-002)
-- Decreto Legislativo N° 728
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO DE TRABAJO A PLAZO FIJO

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

Por medio de la presente, la empresa {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, representada por su Gerente General {{NOMBRE_GERENTE}}, identificada con DNI {{DNI_GERENTE}}, ubicada en {{DIRECCION_EMPRESA}}, en adelante denominada "EL EMPLEADOR", y usted, {{NOMBRE_COMPLETO}}, identificado(a) con DNI {{NUMERO_DOCUMENTO}}, domiciliado(a) en {{DIRECCION}}, en adelante "EL TRABAJADOR", celebramos el presente CONTRATO DE TRABAJO A PLAZO FIJO, al amparo del Decreto Legislativo N° 728, Ley de Productividad y Competitividad Laboral, en los siguientes términos:

CLAÚSULA PRIMERA: OBJETO Y DURACIÓN
El presente contrato tiene por objeto la prestación de servicios personales del TRABAJADOR en el cargo de {{CARGO}}, desempeñando funciones en el área de {{AREA_TRABAJO}}. Este contrato es a plazo fijo, con una duración de {{DURACION_MESES}} meses, contados desde el {{FECHA_INICIO}} hasta el {{FECHA_FIN}}, renovables expresamente de común acuerdo entre las partes, por escrito, con una anticipación mínima de treinta (30) días al vencimiento.

CLAÚSULA SEGUNDA: REMUNERACIÓN
La remuneración mensual pactada asciende a S/ {{SALARIO_BASE}} ({{MONTO_LETRAS}} SOLES), cantidad que será abonada en forma mensual, los últimos días de cada mes, vía {{MEDIO_PAGO}} en la cuenta bancaria N° {{NUMERO_CUENTA}} del {{BANCO}} (CCI: {{NUMERO_CCI}}).

CLAÚSULA TERCERA: JORNADA LABORAL
La jornada laboral será de {{HORAS_SEMANALES}} horas semanales, distribuidas en {{DIAS_TRABAJO}} días a la semana, en el horario establecido por EL EMPLEADOR.

CLAÚSULA CUARTA: PERIODO DE PRUEBA
El período de prueba será de tres (3) meses conforme al artículo 10° del D.L. N° 728. Si el contrato supera dicho período sin resolución, se entenderá automáticamente convertido a plazo indeterminado, conforme al segundo párrafo del artículo 10° de la LPCL.

CLAÚSULA QUINTA: BENEFICIOS SOCIALES
EL TRABAJADOR tendrá derecho a:
- Cobertura integral de ESSALUD (9%)
- Compensación por Tiempo de Servicios (CTS) proporcional al tiempo de servicios
- Vacaciones truncas proporcionales al tiempo de servicios (1.25 días por mes)
- Gratificaciones legales en forma proporcional al tiempo de servicios
- Asignación familiar (si corresponde)

CLAÚSULA SEXTA: OBLIGACIONES DEL TRABAJADOR
Son obligaciones del TRABAJADOR:
a) Cumplir estrictamente las normas internas de trabajo y reglamentos internos
b) Observar buena conducta durante la prestación de servicios
c) Cumplir con las tareas asignadas con eficiencia y diligencia
d) Guardar reserva de toda información confidencial de la empresa
e) No realizar actividades que interfieran con sus funciones

CLAÚSULA SÉPTIMA: CAUSALES DE TÉRMINO
El presente contrato concluirá por las siguientes causales:
a) Vencimiento del plazo estipulado
b) Mutuo acuerdo entre las partes, formalizado por escrito
c) Causales justas previstas en el artículo 22° del D.L. N° 728 (falta grave, incumplimiento, etc.)
d) Fuerza mayor o caso fortuito debidamente acreditado

CLAÚSULA OCTAVA: PREAVISO
En caso de resolución del contrato antes del vencimiento por iniciativa del EMPLEADOR sin causa justificada, deberá pagar al TRABAJADOR una indemnización equivalente a treinta (30) días de remuneración por cada año pendiente de cumplimiento, proporcional al tiempo. El TRABAJADOR que desee resolver el contrato antes del plazo deberá comunicar con quince (15) días de anticipación.

CLAÚSULA NOVENA: CONVERSIÓN A INDETERMINADO
Si el TRABAJADOR continua laborando después de vencida la duración del contrato, este se entenderá automáticamente renovado por plazo indeterminado, conforme al artículo 77° de la LPCL.

CLAÚSULA DÉCIMA: DOMICILIO
Las partes fijan sus domicilios en los indicados en la introducción. Cualquier cambio deberá ser comunicado por escrito.

En señal de conformidad, las partes firman en {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
EL EMPLEADOR                                   EL TRABAJADOR

{{NOMBRE_GERENTE}}                             {{NOMBRE_COMPLETO}}
Gerente General                                DNI: {{NUMERO_DOCUMENTO}}
DNI: {{DNI_GERENTE}}

{{#if REQUIERE_FIRMA_DIGITAL}}
═══════════════════════════════════════════════════════════════
FIRMA DIGITAL PENDIENTE - {{BANCO}} - CCI: {{NUMERO_CCI}}
═══════════════════════════════════════════════════════════════
{{/if}}
