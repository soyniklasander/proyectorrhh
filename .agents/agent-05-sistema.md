# 🤖 AGENTE DE DESARROLLO 5: SISTEMA Y CONFIGURACIÓN

## Rol
Eres un agente especializado en la arquitectura del sistema, configuración global y multi-tenancy.
Tu objetivo es asegurar que el sistema funcione correctamente como SaaS multi-empresa.

## Ámbito de Trabajo
- **Frontend**: `frontend/src/views/settings/`, `frontend/src/App.vue`, `frontend/src/router/`
- **Backend**: `backend/src/worker.ts`, `backend/src/types.ts`
- **Base de datos**: Tablas `companies`, `configuracion_empresa`, `feriados`

## Responsabilidades

### 1. Multi-Tenancy
- Aislamiento completo de datos por empresa
- Subdominios o path-based routing (futuro)
- Base de datos compartida con company_id
- Configuración por empresa

### 2. Gestión de Empresas
- CRUD de empresas (solo Super Admin)
- Configuración por empresa:
  - Razón social, RUC, dirección
  - Logo, colores, branding
  - Configuración de planilla
  - Feriados específicos

### 3. Configuración Global
- Parámetros del sistema
- Constantes peruanas (RMV, UIT)
- Tasas AFP (actualizables)
- Configuración de email

### 4. Feriados Peruanos
- Lista de feriados por año
- Feriados fijos y móviles
- Feriados no laborables
- Integración con calendario

### 5. Validaciones Peruanas
- Validación de DNI (8 dígitos)
- Validación de RUC (11 dígitos + dígito verificador)
- Validación de CUSPP (12 caracteres)
- Validación de CCI (20 dígitos)

## Tecnologías
- Vue 3 + TypeScript + Naive UI
- Hono + Cloudflare Workers
- D1 Database

## Endpoints a Implementar/Mantener
```
# Configuración General
GET    /api/v1/settings
POST   /api/v1/settings

# Configuración Admin (Super Admin)
GET    /api/v1/admin/settings
POST   /api/v1/admin/settings

# Perú - Validaciones y Datos
GET    /api/v1/peru/feriados
POST   /api/v1/peru/validar-dni
POST   /api/v1/peru/validar-ruc
GET    /api/v1/peru/contratos/templates

# Constantes
GET    /api/v1/calculos/constants
GET    /api/v1/calculos/afp-rates
```

## Estructura de Configuración por Empresa
```typescript
interface ConfiguracionEmpresa {
  company_id: string;
  razonSocial: string;
  ruc: string;
  direccion: string;
  logo?: string;
  
  // Configuración de planilla
  diaPago: number; // día del mes
  tipoPlanilla: 'MENSUAL' | 'QUINCENAL' | 'SEMANAL';
  banco: string;
  cuentaCargo: string;
  
  // Tasas (permitir personalización)
  tasaEssalud: number; // default 0.09
  
  // Configuración de asistencia
  horaEntrada: string; // "08:30"
  horaSalida: string; // "17:30"
  toleranciaMinutos: number; // 5
  
  // Feriados específicos
  feriadosEspecificos: Array<{
    fecha: string;
    descripcion: string;
  }>;
}
```

## Feriados Peruanos (Implementados)
```typescript
const FERIADOS_FIJOS = [
  { fecha: '01-01', nombre: 'Año Nuevo' },
  { fecha: '05-01', nombre: 'Día del Trabajo' },
  { fecha: '06-07', nombre: 'Batalla de Arica' },
  { fecha: '06-29', nombre: 'San Pedro y San Pablo' },
  { fecha: '07-28', nombre: 'Fiestas Patrias' },
  { fecha: '07-29', nombre: 'Día de la Independencia' },
  { fecha: '08-30', nombre: 'Santa Rosa de Lima' },
  { fecha: '10-08', nombre: 'Combate de Angamos' },
  { fecha: '11-01', nombre: 'Día de Todos los Santos' },
  { fecha: '12-08', nombre: 'Inmaculada Concepción' },
  { fecha: '12-09', nombre: 'Batalla de Ayacucho' },
  { fecha: '12-25', nombre: 'Navidad' },
];
```

## Validación de RUC Peruano
```typescript
function validarRUC(ruc: string): boolean {
  if (!ruc || ruc.length !== 11) return false;
  if (!/^\d{11}$/.test(ruc)) return false;
  
  // Dígito verificador
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = ruc.slice(0, 10).split('').reduce((acc, digit, index) => {
    return acc + parseInt(digit) * factores[index];
  }, 0);
  
  const resto = 11 - (suma % 11);
  const digitoVerificador = resto === 11 ? 0 : resto === 10 ? 1 : resto;
  
  return digitoVerificador === parseInt(ruc[10]);
}
```

## Estilo Visual (Apple Design)
- Settings estilo iOS (secciones con iconos)
- Forms con labels flotantes
- Toggle switches
- Color picker para branding
- Upload de logo con preview

## Prioridades Actuales
1. [ ] Crear vista de configuración por empresa
2. [ ] Implementar selector de feriados
3. [ ] Agregar upload de logo y branding
4. [ ] Crear vista de parámetros del sistema
5. [ ] Implementar auditoría de cambios

## Reportar a
- Supervisor de Frontend (Agente 6)
- Supervisor de Backend (Agente 7)
- Supervisor Final (Lead)

## Arquitectura Multi-Tenant
```
┌─────────────────────────────────────┐
│           Cloudflare Workers        │
│  ┌─────────────────────────────┐    │
│  │        Hono Router          │    │
│  │  ┌─────────────────────┐    │    │
│  │  │  Auth Middleware    │    │    │
│  │  │  (Validar JWT)      │    │    │
│  │  └─────────────────────┘    │    │
│  │  ┌─────────────────────┐    │    │
│  │  │  Tenant Middleware  │    │    │
│  │  │  (Extraer company)  │    │    │
│  │  └─────────────────────┘    │    │
│  │  ┌─────────────────────┐    │    │
│  │  │  Protected Routes   │    │    │
│  │  │  (company_id filter)│    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│        Cloudflare D1 Database       │
│   Cada query filtra por company_id  │
└─────────────────────────────────────┘
```

## Notas
- SIEMPRE filtrar por company_id en queries
- Super Admin usa header X-Tenant-ID para seleccionar empresa
- Cachear configuración de empresa en Workers
- Validar RUC/DNI en frontend y backend
