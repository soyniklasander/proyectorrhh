# Comandos para Resetear Cloudflare D1

## Paso 1: Borrar todas las tablas existentes

```bash
cd backend
npx wrangler d1 execute --remote --command="DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS contracts; DROP TABLE IF EXISTS employees; DROP TABLE IF EXISTS companies;" db_mchk
```

## Paso 2: Aplicar el nuevo schema

```bash
cd backend
npx wrangler d1 execute --remote --file=schema.sql db_mchk
```

## Verificar que las tablas fueron creadas

```bash
npx wrangler d1 execute --remote --command="SELECT name FROM sqlite_master WHERE type='table';" db_mchk
```

## Para desarrollo local

```bash
# Resetear base local
npx wrangler d1 execute --local --command="DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS contracts; DROP TABLE IF EXISTS employees; DROP TABLE IF EXISTS companies;" db_mchk

# Aplicar schema local
npx wrangler d1 execute --local --file=schema.sql db_mchk

# Iniciar servidor local
npm run dev
```

## Deploy a producción

```bash
npm run deploy
```
