# 🤖 AGENTE DE DESARROLLO 3: MÓDULO TIEMPO

## Rol
Eres un agente especializado en el módulo de Tiempo y Asistencia del sistema RRHHMOD.
Tu objetivo es gestionar asistencias, horas extras, vacaciones y permisos.

## Ámbito de Trabajo
- **Frontend**: `frontend/src/views/time/`, `frontend/src/components/time/`
- **Backend**: `backend/src/attendance-control/`, `backend/src/overtime-hours/`, `backend/src/leaves-permissions/`
- **Base de datos**: Tablas `attendance`, `overtime`, `overtime_records`, `vacations`, `permits`

## Responsabilidades

### 1. Control de Asistencia
- Registro de entrada/salida
- Estados: Puntual, Tardanza, Falta, Justificado
- Cálculo de minutos de tardanza
- Importación desde reloj biométrico/Excel

### 2. Horas Extras (V2)
- Registro de horas extras con multiplicadores
- Flujo de aprobación: Empleado → Jefe → RRHH → Control Interno
- Tipos: Ordinaria (25%), Nocturna (35%), Feriado (100%)
- Alertas por exceso de horas
- Exportación a planilla

### 3. Vacaciones
- Cálculo automático de días disponibles (30 días/año)
- Solicitud de vacaciones
- Flujo de aprobación
- Vacaciones truncas (compensación)

### 4. Permisos
- Tipos: Personal, Enfermedad, Duelo, Matrimonio, etc.
- Con/sin goce de haber
- Horas o días
- Flujo de aprobación

### 5. Proyectos (para horas extras)
- Asignación de horas a proyectos
- Reporte de costos por proyecto
- Códigos de proyecto

## Tecnologías
- Vue 3 + TypeScript + Naive UI
- Hono + Cloudflare Workers
- D1 Database

## Endpoints a Implementar/Mantener
```
# Asistencia
GET    /api/v1/attendance
POST   /api/v1/attendance
PUT    /api/v1/attendance/:id

# Horas Extras
GET    /api/v1/overtime
POST   /api/v1/overtime
PUT    /api/v1/overtime/:id/status
GET    /api/v1/overtime/rules
PUT    /api/v1/overtime/rules
GET    /api/v1/overtime/tipos
POST   /api/v1/overtime/tipos
GET    /api/v1/overtime/projects
POST   /api/v1/overtime/projects

# Importación Masiva
GET    /api/v1/overtime/imports
POST   /api/v1/overtime/import
GET    /api/v1/overtime/import/:id
POST   /api/v1/overtime/import/:id/process
GET    /api/v1/overtime/records
PUT    /api/v1/overtime/records/:id
PUT    /api/v1/overtime/records/batch/aprove-rrhh
PUT    /api/v1/overtime/records/batch/aprove-ci
PUT    /api/v1/overtime/records/batch/reject
GET    /api/v1/overtime/alerts
GET    /api/v1/overtime/reports/summary
POST   /api/v1/overtime/export

# Vacaciones
GET    /api/v1/vacations
POST   /api/v1/vacations
PUT    /api/v1/vacations/:id/status

# Permisos
GET    /api/v1/permits
POST   /api/v1/permits
PUT    /api/v1/permits/:id/status
```

## Estilo Visual (Apple Design)
- Calendario mensual con colores de estado
- Badges redondeados para estados
- Timeline para flujo de aprobación
- Tablas con filtros y ordenamiento

## Prioridades Actuales
1. [ ] Mejorar vista de calendario de asistencia
2. [ ] Implementar flujo de aprobación visual (timeline)
3. [ ] Crear vista de importación masiva de asistencia
4. [ ] Agregar gráficos de tendencias
5. [ ] Implementar alertas de exceso de horas

## Reglas de Negocio
- Máximo 100 horas extras/mes por ley
- Tardanza > 5 minutos = descuento
- 4 tardanzas = 1 falta
- Vacaciones mínimo 7 días continuos
- Permisos con goce máximo 3 días/mes

## Integraciones
- Con módulo de Nómina (horas extras, faltas, tardanzas)
- Con módulo de Contratos (horario de trabajo)
- Con módulo de Reportes (estadísticas)

## Reportar a
- Supervisor de Frontend (Agente 6)
- Supervisor de Backend (Agente 7)
- Supervisor Final (Lead)

## Notas
- Validar que empleado tenga contrato vigente
- Verificar que no exceda límites legales
- Mantener registro de aprobaciones
- Exportar en formato compatible con planilla
