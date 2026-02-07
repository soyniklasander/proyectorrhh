# RRHHMod - Guía de Configuración Cloudflare Workers

## 📋 Configuración Completada

Ya he actualizado los archivos de configuración con tus datos de Cloudflare:

### 🔗 Base de Datos D1
- **Nombre**: `db_mchk`
- **ID**: `29660806-f166-4150-b5f1-51d4a3aafe59`
- **Binding**: `DB`

### 🗄️ KV Namespace
- **ID**: `fc77679cb6c94ffbb09a750902e853cc`
- **Binding**: `KV_BINDING`

### 🌐 Dominio Workers
- **URL**: `https://proyectorrhh.rchavezza.workers.dev`

## 🔐 Configuración de Secretos

### ⚠️ Configurar GitHub Secrets (Requerido para Deploy Automático)

Para habilitar el deploy automático desde GitHub Actions, debes configurar los siguientes secretos:

1. Ve a tu repositorio: `https://github.com/soyniklasander/proyectorrhh`
2. Click en **Settings** (Configuración)
3. En el menú lateral: **Secrets and variables** → **Actions**
4. Click en **New repository secret**
5. Agregar el secreto:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Tu API Token de Cloudflare (ejemplo: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
6. Agregar el Account ID:
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: Tu Account ID de Cloudflare (lo encuentras en la página principal del Dashboard)

> **⚠️ IMPORTANTE**: NUNCA expongas tu API Token en el código. Siempre usa GitHub Secrets.

### Obtener tu Cloudflare API Token

Si necesitas crear o regenerar tu API Token:

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **My Profile** → **API Tokens**
3. **Create Token** → Selecciona **Edit Cloudflare Workers** template
4. O crea un token personalizado con permisos:
   - Account Settings: Read
   - Workers Scripts: Edit
   - Workers Routes: Edit
   - D1: Edit
   - Pages: Edit
   - KV Storage: Edit

### Para el backend (.env):
```env
JWT_SECRET=your-super-secret-jwt-key-here
D1_DATABASE_ID=29660806-f166-4150-b5f1-51d4a3aafe59
ENVIRONMENT=production
```

### Para el frontend (.env):
```env
VITE_API_URL=https://proyectorrhh.rchavezza.workers.dev/api/v1
```

## 🚀 Pasos para Deploy

### Deploy Automático (Recomendado)

1. **Configura GitHub Secret** (ver sección anterior)
2. **Push a la rama main**:
   ```bash
   git add .
   git commit -m "tu mensaje"
   git push origin main
   ```
3. El deployment se ejecutará automáticamente vía GitHub Actions
4. Monitorea el progreso en: `https://github.com/soyniklasander/proyectorrhh/actions`

### Deploy Manual

#### 1. Configurar Variables en Cloudflare Dashboard
1. Ir a: https://dash.cloudflare.com/workers
2. Seleccionar el Worker `proyectorrhh`
3. Ir a Settings → Variables and Secrets
4. Agregar:
   - **JWT_SECRET**: Clave secreta para JWT (generar una nueva)
   - **ENVIRONMENT**: `production`

#### 2. Deploy del Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run deploy
```

#### 3. Deploy del Frontend
```bash
cd frontend
npm install
npm run build
# Subir la carpeta dist a Cloudflare Pages o tu hosting preferido
```

#### 4. Migrar Base de Datos
```bash
cd backend
wrangler d1 execute db_mchk --file=./prisma/migrations.sql
```

## 🛠️ Gestión de Workers con Wrangler

### Comandos Útiles para Modificar Workers Fácilmente

```bash
# Ver versiones desplegadas
npx wrangler versions list

# Crear nueva versión (después de hacer cambios)
cd backend
npm run versions

# Ver logs en tiempo real
npx wrangler tail

# Ejecutar rollback a versión anterior
npx wrangler rollback [version-id]

# Ver estado actual del Worker
npx wrangler deployments list

# Ejecutar migraciones de D1
npx wrangler d1 execute db_mchk --file=./schema.sql
```

### Desarrollo Local con Hot Reload

Para hacer cambios y verlos inmediatamente:

```bash
cd backend
npm run dev
```

Esto inicia el Worker en `http://localhost:8787` con recarga automática.

## 🔗 Configuración del Repositorio

### En tu GitHub `soyniklasander/proyectorrhh`:
1. Los archivos ya están configurados para deploy automático
2. El comando de deploy será: `npm run deploy`
3. La rama principal es `main`

## 🔧 Variables de Entorno

### Development (local):
```bash
# backend/.env
DATABASE_URL="file:./db_mchk.db"
JWT_SECRET="dev-secret-key"
D1_DATABASE_ID="29660806-f166-4150-b5f1-51d4a3aafe59"

# frontend/.env
VITE_API_URL=http://localhost:3001/api/v1
```

### Production (Cloudflare):
```bash
# Configurar en Cloudflare Dashboard
JWT_SECRET="your-production-secret-here"
ENVIRONMENT="production"

# frontend/.env.production
VITE_API_URL=https://proyectorrhh.rchavezza.workers.dev/api/v1
```

## 🧪 Testing Local

### Correr en desarrollo:
```bash
# Terminal 1 - Backend
cd backend
wrangler dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### URLs de desarrollo:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Workers Dev: http://localhost:8787

## 📝 Notas Importantes

1. **No exponer claves**: La API key que mencionaste no debe ir en el código
2. **Secret management**: Usa variables de entorno de Cloudflare
3. **Database migrations**: Ejecuta las migraciones antes de deploy
4. **Branch management**: El deploy automático funciona desde tu GitHub

## 🐛 Troubleshooting

### Common Issues:
1. **CORS errors**: Revisar configuración de CORS en `main.ts`
2. **DB connection errors**: Verificar `DATABASE_URL` y D1 bindings
3. **Auth errors**: Revisar `JWT_SECRET` configuration
4. **Build errors**: Ejecutar `npm install` y `npm run prisma:generate`

### Logs y Debug:
```bash
# Ver logs del Worker
wrangler tail

# Debug local
wrangler dev --local
```

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs en Cloudflare Dashboard
2. Verifica las variables de entorno
3. Ejecuta los comandos de deploy manualmente primero

Tu sistema ya está completamente configurado para deploy en Cloudflare Workers con tu D1 y KV específicos.
