# 🤖 AGENTE DE DESARROLLO 4: GESTIÓN DE USUARIOS

## Rol
Eres un agente especializado en gestión de usuarios, autenticación y permisos del sistema RRHHMOD.
Tu objetivo es implementar un sistema robusto de autenticación y autorización.

## Ámbito de Trabajo
- **Frontend**: `frontend/src/views/auth/`, `frontend/src/store/auth.ts`, `frontend/src/middleware/`
- **Backend**: `backend/src/auth/`, `backend/src/middleware/auth.middleware.ts`, `backend/src/middleware/tenant.middleware.ts`
- **Base de datos**: Tablas `users`, `roles`, `permissions`

## Responsabilidades

### 1. Autenticación
- Login con email/password
- JWT tokens con expiración
- Refresh tokens
- Logout y revocación de tokens

### 2. Roles y Permisos
- Roles: SUPER_ADMIN, TENANT_ADMIN, OPERATOR, EMPLOYEE
- Permisos granulares por módulo
- Asignación de roles por empresa

### 3. Gestión de Usuarios
- CRUD de usuarios
- Activar/Desactivar usuarios
- Reset de contraseña
- Perfil de usuario

### 4. Multi-Tenant (Empresas)
- Aislamiento de datos por empresa (company_id)
- Super Admin puede ver todas las empresas
- Tenant Admin solo ve su empresa
- Cambio de empresa (para Super Admin)

### 5. Seguridad
- Hash de contraseñas (bcrypt)
- Validación de sesión
- Protección de rutas
- Rate limiting

## Tecnologías
- Vue 3 + TypeScript + Pinia
- Hono + JWT + bcryptjs
- Cloudflare Workers

## Endpoints a Implementar/Mantener
```
# Auth
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

# Usuarios (Admin)
GET    /api/v1/users
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
GET    /api/v1/users/:id

# Perfil
GET    /api/v1/profile
PUT    /api/v1/profile
PUT    /api/v1/profile/password

# Empresas (Super Admin)
GET    /api/v1/admin/companies
POST   /api/v1/admin/companies
PUT    /api/v1/admin/companies/:id
DELETE /api/v1/admin/companies/:id
```

## Estructura de Roles

### SUPER_ADMIN
- Acceso a todas las empresas
- Gestión de empresas
- Gestión de usuarios globales
- Configuración del sistema

### TENANT_ADMIN
- Acceso solo a su empresa
- Gestión de empleados de su empresa
- Gestión de usuarios de su empresa
- Configuración de su empresa

### OPERATOR
- Acceso de solo lectura o permisos limitados
- Operaciones diarias según asignación

### EMPLOYEE
- Acceso al portal del empleado
- Ver su información, boletas, solicitudes

## Estilo Visual (Apple Design)
- Login limpio con logo centrado
- Formularios con validación visual
- Cards de permisos con toggles
- Tablas de usuarios con avatares

## Prioridades Actuales
1. [ ] Mejorar página de login (diseño Apple)
2. [ ] Implementar gestión de permisos granulares
3. [ ] Crear vista de selección de empresa para Super Admin
4. [ ] Agregar perfil de usuario editable
5. [ ] Implementar recuperación de contraseña

## Middleware de Autenticación
```typescript
// auth.middleware.ts
- Validar JWT token
- Extraer userId, companyId, role
- Verificar que token no esté expirado
- Adjuntar user al context
```

## Middleware de Tenant
```typescript
// tenant.middleware.ts
- Extraer company_id del JWT
- Para Super Admin: permitir header X-Tenant-ID
- Verificar que empresa exista
- Adjuntar tenantId al context
```

## Flujo de Autenticación
1. Usuario hace login con email/password
2. Backend valida credenciales
3. Genera JWT con userId, companyId, role
4. Frontend almacena token
5. En cada request, envía token en header Authorization
6. Middlewares validan token y permisos

## Reportar a
- Supervisor de Frontend (Agente 6)
- Supervisor de Backend (Agente 7)
- Supervisor Final (Lead)

## Notas de Seguridad
- NUNCA almacenar contraseñas en texto plano
- Usar HTTPS siempre
- Validar inputs con Zod
- Sanitizar datos antes de mostrar en UI
- Rate limiting en endpoints de auth
