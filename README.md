# RRHHMod - ERP de Gestión de Personal para Perú

Sistema completo de gestión de recursos humanos diseñado específicamente para empresas en Perú, con todas las funcionalidades necesarias para administrar personal, contratos, nómina y cumplimiento normativo.

## 🚀 Características Principales

### 📋 Gestión de Personal
- **Datos completos del empleado**: Información personal, familiar, educativa y profesional
- **Validación de DNI peruano**: Formato y verificación automática
- **Gestión de documentos**: Fotos, DNI, RUC y otros documentos
- **Estados y control**: Activo, Inactivo, Suspendido, Cesado

### 📄 Gestión de Contratos
- **Tipos de contrato**: Indeterminado, Plazo Fijo, CAS, Locación de Servicios, Prácticas
- **Régimenes laborales**: General, Microempresa, Pequeña Empresa, Agrario, Pesquero
- **Configuración completa**: Salarios, beneficios, AFP/ONP, CUSPP
- **Control de vencimientos**: Alertas automáticas de contratos por expirar

### 💰 Nómina y Planilla
- **Cálculo automático**: Salarios, horas extras, bonificaciones, asignaciones
- **Descuentos peruanos**: AFP/ONP, Essalud, SCTR, 5ta categoría
- **Beneficios sociales**: CTS, vacaciones, gratificaciones, utilidades
- **Exportación Excel**: Formato listo para contabilidad y bancos

### ⏰ Horas Extras
- **Registro y aprobación**: Flujo completo de solicitud y autorización
- **Tipos de horas**: 25%, 35%, 100%, feriados
- **Cálculo automático**: Según normativa peruana
- **Control y auditoría**: Historial completo y reportes

### 💳 Préstamos a Personal
- **Gestión completa**: Solicitud, aprobación, desembolso y amortización
- **Tipos de préstamo**: Liquidación, quitas, adicionales, emergencia
- **Plan de pagos**: Cuotas automáticas con intereses y moras
- **Control de saldos**: Seguimiento en tiempo real

### 🏖️ Vacaciones y Permisos
- **Tipos de permisos**: Programadas, truncas, enfermedad, maternidad, paternidad
- **Control de días**: Disponibles, utilizados, acumulados
- **Aprobación workflow**: Flujo de autorización automático
- **Integración con nómina**: Descuentos automáticos

### 📊 Control de Asistencia
- **Registro de asistencia**: Entradas, salidas, faltas, tardanzas
- **Justificaciones**: Documentos médicos y permisos
- **Reportes detallados**: Estadísticas y análisis de asistencia
- **Integración con nómina**: Descuentos por faltas y tardanzas

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: NestJS (TypeScript)
- **Base de Datos**: Cloudflare D1 (SQLite distribuido)
- **ORM**: Prisma
- **Autenticación**: JWT
- **Exportación**: ExcelJS
- **Deploy**: Cloudflare Workers

### Frontend
- **Framework**: Vue 3 + Composition API
- **Build Tool**: Vite
- **UI Library**: Naive UI
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios

### Infraestructura
- **Hosting**: Cloudflare Workers + Pages
- **Base de Datos**: Cloudflare D1
- **CDN**: Cloudflare
- **Dominio**: Configurable

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Cloudflare

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Configurar API URL
npm run dev
```

### Variables de Entorno
```env
# Backend
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
D1_DATABASE_ID="your-d1-id"

# Frontend
VITE_API_URL="https://your-worker.your-subdomain.workers.dev"
```

## 🌐 Deploy en Cloudflare

### Deploy Automático (Recomendado) ⚡

El proyecto está configurado para deploy automático usando GitHub Actions.

**Configuración rápida:**
1. Ve a **Settings** → **Secrets and variables** → **Actions** en GitHub
2. Agrega el secreto `CLOUDFLARE_API_TOKEN` con tu API Token de Cloudflare
3. Haz push a la rama `main` y el deploy se ejecutará automáticamente

**📖 Documentación completa**: Ver [docs/CLOUDFLARE_SETUP.md](./docs/CLOUDFLARE_SETUP.md)

### Deploy Manual

#### 1. Crear Base de Datos D1
```bash
wrangler d1 create rrhhmod-db
# Copiar el ID y configurar en wrangler.toml
```

#### 2. Deploy Backend
```bash
cd backend
npm run deploy
```

#### 3. Deploy Frontend
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name proyectorrhh --branch main
```

### Gestión de Workers

```bash
# Desarrollo local con hot reload
cd backend && npm run dev

# Ver logs en tiempo real
npx wrangler tail

# Ver versiones desplegadas
npx wrangler versions list

# Rollback a versión anterior
npx wrangler rollback [version-id]
```

## 📋 Migración de Datos

### Importar desde Excel
1. Preparar archivo Excel con columnas requeridas
2. Usar herramienta de importación
3. Validar y mapear campos
4. Procesar y confirmar

### Migración desde otro sistema
1. Exportar datos del sistema actual
2. Formatear según esquema RRHHMod
3. Importar usando API o herramienta
4. Validar integridad de datos

## 🔐 Seguridad

### Autenticación
- JWT con refresh tokens
- Tiempo de expiración configurable
- Almacenamiento seguro en localStorage

### Permisos
- Roles: Admin, HR, Manager, Viewer
- Permisos granulares por módulo
- Control de acceso a datos sensibles

### Datos Sensibles
- Encriptación de información personal
- Máscara de datos financieros
- Auditoría de cambios

## 📊 Reportes y Exportación

### Reportes Disponibles
- **Planilla mensual**: Detalle completo para contabilidad
- **Resumen de nómina**: Totales por conceptos
- **Contratos por vencer**: Alertas y seguimiento
- **Control de asistencia**: Estadísticas y tendencias
- **Préstamos activos**: Saldos y pagos pendientes

### Exportación Excel
- Formato estándar para bancos peruanos
- Datos bancarios completos
- Cálculos validados
- Listo para SUNAT y contabilidad

## 🇵🇪 Cumplimiento Normativo Perú

### Aspectos Legales Cubiertos
- **Ley de Productividad**: Horas extras y bonificaciones
- **CTS**: Cálculo y depósito automático
- **Gratificaciones**: Julio y diciembre
- **Vacaciones**: 30 días por año trabajado
- **AFP/ONP**: Aportes obligatorios
- **Essalud**: 9% del salario
- **5ta Categoría**: Retenciones por renta

### Documentación
- Contratos según ley peruana
- Boletas de pago
- Certificados de trabajo
- Constancias de AFP/ONP

## 🤝 Contribución

### Desarrollo Local
```bash
# Clonar repositorio
git clone https://github.com/soyniklasander/proyectorrhh.git
cd proyectorrhh

# Instalar dependencias
npm run install:all

# Iniciar desarrollo
npm run dev
```

### Estructura del Proyecto
```
RRHHMOD/
├── backend/          # NestJS + Prisma
├── frontend/         # Vue 3 + Naive UI
├── shared/           # Tipos compartidos
├── docs/             # Documentación
└── README.md
```

## 📞 Soporte

### Documentación
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [User Manual](./docs/USER_GUIDE.md)

### Contacto
- Email: soporte@rrhhmod.com
- Issues: [GitHub Issues](https://github.com/soyniklasander/proyectorrhh/issues)
- Wiki: [GitHub Wiki](https://github.com/soyniklasander/proyectorrhh/wiki)

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**RRHHMod** - La solución completa de gestión de personal para empresas peruanas. 🇵🇪