# 🚀 Instrucciones para Configurar tu Cloudflare API Key

## ¿Qué he hecho?

He configurado tu proyecto para que tenga deploy automático a Cloudflare Workers y Pages usando GitHub Actions. Ahora cada vez que hagas push a la rama `main`, tu aplicación se desplegará automáticamente.

## 🔐 Paso 1: Configurar tu API Key en GitHub (MUY IMPORTANTE)

Tu API Key de Cloudflare **NO** debe estar en el código por seguridad. Debes agregarla como un secreto en GitHub:

### Pasos detallados:

1. **Ve a tu repositorio en GitHub**:
   - URL: https://github.com/soyniklasander/proyectorrhh

2. **Click en "Settings" (Configuración)**
   - Está en la barra superior del repositorio

3. **En el menú lateral izquierdo**:
   - Click en "Secrets and variables"
   - Luego click en "Actions"

4. **Agregar el secreto**:
   - Click en el botón verde "New repository secret"

5. **Llenar el formulario**:
   - **Name** (Nombre): Escribe exactamente esto: `CLOUDFLARE_API_TOKEN`
   - **Secret** (Valor): Pega tu API key de Cloudflare (obtenla de tu Cloudflare Dashboard)
   - Click en "Add secret"

## ✅ Paso 2: Verificar que todo funciona

Una vez que hayas agregado el secreto, haz lo siguiente:

1. **Haz cualquier cambio pequeño** (puede ser solo un espacio en el README)

2. **Haz commit y push**:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```

3. **Monitorea el deployment**:
   - Ve a: https://github.com/soyniklasander/proyectorrhh/actions
   - Verás el workflow "Deploy ERP to Cloudflare" ejecutándose
   - Espera a que termine (tarda unos 2-3 minutos)
   - Si todo está en verde ✅, tu aplicación está desplegada!

## 🎯 ¿Qué se despliega automáticamente?

Cada vez que hagas push a `main`:

1. **Backend** → Se despliega a Cloudflare Workers
   - URL: https://proyectorrhh.rchavezza.workers.dev

2. **Frontend** → Se despliega a Cloudflare Pages
   - URL: Configurada en tu proyecto de Pages

## 🛠️ Comandos útiles para gestionar tus Workers

Una vez configurado, puedes usar estos comandos para gestionar tus Workers fácilmente:

### Ver logs en tiempo real:
```bash
npx wrangler tail
```

### Ver todas las versiones desplegadas:
```bash
npx wrangler versions list
```

### Hacer rollback a una versión anterior:
```bash
npx wrangler rollback [version-id]
```

### Desarrollo local (ver cambios inmediatamente):
```bash
cd backend
npm run dev
```
Esto abrirá tu Worker en http://localhost:8787

## 📝 Notas importantes sobre la deploy key SSH

La deploy key SSH que mencionaste (`SHA256:Wzk0Cnm2W2FbnC/OOk5r3ariAWPTILXSvAspMpPECVU`) generalmente se usa para:

- Clonar repositorios privados
- Dar acceso a GitHub Actions para hacer push

**En tu caso**, como estamos usando GitHub Actions y el API Token de Cloudflare, no necesitas configurar esta deploy key manualmente. GitHub Actions ya tiene acceso al repositorio.

Si en el futuro necesitas configurar una deploy key SSH:
1. Ve a Settings → Deploy keys en GitHub
2. Click en "Add deploy key"
3. Pega la clave pública SSH
4. Marca "Allow write access" si es necesario

## 🆘 ¿Problemas?

### Error: "Authentication error"
- Verifica que el secreto `CLOUDFLARE_API_TOKEN` esté configurado correctamente
- Asegúrate de que copiaste el token completo sin espacios extras

### Error: "Account ID mismatch"
- Tu `wrangler.toml` ya está configurado con tu Account ID correcto
- No necesitas cambiar nada

### Error al desplegar
- Ve a la pestaña "Actions" en GitHub
- Click en el workflow que falló
- Lee los logs para ver qué salió mal
- La mayoría de veces es porque falta el secreto de GitHub

## 📚 Documentación completa

Para más detalles, revisa:
- [docs/CLOUDFLARE_SETUP.md](./docs/CLOUDFLARE_SETUP.md) - Guía completa de configuración
- [README.md](./README.md) - Documentación general del proyecto

## ✨ ¡Listo!

Una vez que configures el secreto `CLOUDFLARE_API_TOKEN` en GitHub, tu aplicación se desplegará automáticamente cada vez que hagas push a `main`.

No tienes que hacer nada más manualmente, solo:
1. Hacer cambios en tu código
2. Commit y push
3. GitHub Actions se encarga del resto

¡Tu proyecto ahora tiene deployment automático a Cloudflare! 🎉
