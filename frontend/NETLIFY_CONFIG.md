# Configuración de Netlify para Fun Facts Frontend

## Variables de Entorno Requeridas

Cuando despliegues en Netlify, necesitas configurar estas variables:

### Variables Obligatorias:

1. **VITE_API_URL**
   - Valor: `https://tu-backend.onrender.com`
   - Descripción: URL de tu backend desplegado en Render
   - ⚠️ Sin barra final

2. **VITE_WS_URL**
   - Valor: `https://tu-backend.onrender.com`
   - Descripción: URL de WebSocket (la misma que API)
   - ⚠️ Sin barra final

## Pasos para Configurar en Netlify:

1. Ve a https://app.netlify.com/
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu proveedor Git (GitHub, GitLab, etc.)
4. Selecciona tu repositorio `funfacts`
5. Configuración del Build:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Branch to deploy**: `main`

6. Click en "Show advanced" → "New variable"
7. Agrega las 2 variables de arriba
8. Click en "Deploy site"
9. Espera 2-3 minutos
10. Tu sitio estará en: `https://random-name-123.netlify.app`

## Personalizar URL:

1. Ve a "Site settings" → "Domain management"
2. Click en "Options" → "Edit site name"
3. Cambia a algo memorable: `funfacts-game`
4. Tu sitio será: `https://funfacts-game.netlify.app`

## Actualizar CORS en Backend:

Después de desplegar el frontend:

1. Ve a Render Dashboard → Tu servicio backend
2. Ve a "Environment" tab
3. Edita la variable `CORS_ORIGIN`
4. Cambia de `*` a tu URL de Netlify: `https://funfacts-game.netlify.app`
5. Guarda (Render redesplegará automáticamente)

## Verificar que Funciona:

1. Abre tu sitio de Netlify
2. Deberías ver la pantalla de inicio de Fun Facts
3. Intenta crear una sala
4. Si hay problemas, abre la consola del navegador (F12) para ver errores

## Solución de Problemas:

### Error: "Failed to fetch" o "Network error"

- Verifica que VITE_API_URL esté correcto
- Asegúrate de usar `https://` (no `http://`)
- Verifica que el backend esté funcionando: `https://tu-backend.onrender.com/health`

### Error: "Lobby not found" inmediatamente

- El backend puede estar "dormido" (plan gratuito)
- Espera 30 segundos y vuelve a intentar
- Ve a los logs de Render para ver qué está pasando

### WebSocket no conecta

- Verifica VITE_WS_URL
- Asegúrate de que CORS_ORIGIN esté configurado en el backend
- Revisa la consola del navegador para más detalles

### La página se ve en blanco

- Verifica que el build haya terminado exitosamente
- Ve a Netlify → Deploys → Click en el último deploy → Ver logs
- Busca errores de build

## Redeployar Cambios:

Para hacer cambios al frontend:

1. Edita los archivos localmente
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push
   ```
3. Netlify redesplegará automáticamente
4. Espera 2-3 minutos

## Variables de Entorno de Producción:

El archivo `.env.production` ya está configurado, pero asegúrate de actualizarlo:

```env
VITE_API_URL=https://tu-backend.onrender.com
VITE_WS_URL=https://tu-backend.onrender.com
```

Commit y push este archivo para que Netlify lo use.
