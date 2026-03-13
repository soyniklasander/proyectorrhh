# Comandos para Resetear Cloudflare D1

## Nuevo Schema (coincide con drizzle-orm)

### Paso 1: Borrar todas las tablas existentes

```bash
cd backend
npx wrangler d1 execute --remote --command="
DROP TABLE IF EXISTS logic_matrix;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS legal_entities;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;
" db_mchk
```

### Paso 2: Aplicar el nuevo schema

```bash
cd backend
npx wrangler d1 execute --remote --file=schema.sql db_mchk
```

### Verificar que las tablas fueron creadas

```bash
npx wrangler d1 execute --remote --command="SELECT name FROM sqlite_master WHERE type='table';" db_mchk
```

## Para desarrollo local

```bash
# Resetear base local
npx wrangler d1 execute --local --command="
DROP TABLE IF EXISTS logic_matrix;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS legal_entities;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;
" db_mchk

# Aplicar schema local
npx wrangler d1 execute --local --file=schema.sql db_mchk

# Verificar tablas locales
npx wrangler d1 execute --local --command="SELECT name FROM sqlite_master WHERE type='table';" db_mchk

# Iniciar servidor local
npm run dev
```

## Deploy a producción

```bash
npm run deploy
```

## Verificar datos en producción

```bash
# Ver tenants
npx wrangler d1 execute --remote --command="SELECT * FROM tenants;" db_mchk

# Ver usuarios
npx wrangler d1 execute --remote --command="SELECT id, email, role, tenant_id FROM users;" db_mchk

# Ver empleados
npx wrangler d1 execute --remote --command="SELECT * FROM employees;" db_mchk
```
