-- ============================================
-- 4. PEQUEÑA EMPRESA - DL 1448 (tmpl-004)
-- ============================================
UPDATE "contract_templates" SET 
    "plantillaTexto" = 'CONTRATO DE TRABAJO BAJO EL RÉGIMEN DE PEQUEÑA EMPRESA
Decreto Legislativo N° 1448

Señor(a):
{{NOMBRE_COMPLETO}}
DNI: {{NUMERO_DOCUMENTO}}
Dirección: {{DIRECCION}}

De mi consideración:

La empresa {{NOMBRE_EMPRESA}}, con RUC {{RUC_EMPRESA}}, debidamente representada, con domicilio en {{DIRECCION_EMPRESA}}, en adelante "EL EMPLEADOR", reconocida como Pequeña Empresa según el D.L. N° 1448, y usted, {{NOMBRE_COMPLETO}}, con DNI {{NUMERO_DOCUMENTO}}, en adelante "EL TRABAJADOR", celebran el presente contrato:

CLAÚSULA PRIMERA: OBJETO
El TRABAJADOR prestará servicios en el cargo de {{CARGO}}, en el área de {{AREA_TRABAJO}}, por un plazo de {{DURACION_MESES}} meses (del {{FECHA_INICIO}} al {{FECHA_FIN}}), pudiendo renovarse de común acuerdo.

CLAÚSULA SEGUNDA: REMUNERACIÓN
Sueldo mensual de S/ {{SALARIO_BASE}} ({{MONTO_LETRAS}} SOLES), pagadero vía {{MEDIO_PAGO}} en cuenta N° {{NUMERO_CUENTA}} del {{BANCO}} (CCI: {{NUMERO_CCI}}).

CLAÚSULA TERCERA: BENEFICIOS - PEQUEÑA EMPRESA
Conforme al régimen de Pequeña Empresa:
- Vacaciones truncas proporcionales (15 días por año)
- ESSALUD al 100%
- CTS progresiva: 50% del depósito standard (0.5 salario/año) los primeros 3 años, 75% del año 4 al 7, 100% a partir del año 8
- Gratificaciones: 50% del standard los primeros 4 años, 75% del año 5 al 7, 100% a partir del año 8
- Indemnización por despido: 20 días por año (máximo 120 días)

CLAÚSULA CUARTA: JORNADA LABORAL
{{HORAS_SEMANALES}} horas semanales en {{DIAS_TRABAJO}} días.

En señal de conformidad, las partes firman en {{LUGAR_FIRMA}} a los {{DIA_FIRMA}} días del mes de {{MES_FIRMA}} del año {{AÑO_FIRMA}}.

______________________________         ______________________________
EL EMPLEADOR                                   EL TRABAJADOR

{{NOMBRE_GERENTE}}                             {{NOMBRE_COMPLETO}}
Gerente General                                DNI: {{NUMERO_DOCUMENTO}}
DNI: {{DNI_GERENTE}}
RUC: {{RUC_EMPRESA}} (Régimen Pequeña Empresa)

{{#if REQUIERE_FIRMA_DIGITAL}}
FIRMA DIGITAL PENDIENTE: {{BANCO}} - {{NUMERO_CCI}}
{{/if}}
