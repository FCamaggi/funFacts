# Configuración de Render para Fun Facts Backend

## Variables de Entorno Requeridas

Cuando despliegues en Render, necesitas configurar estas variables:

### Variables Obligatorias:

1. **NODE_ENV**
   - Valor: `production`
   - Descripción: Modo de producción

2. **PORT**
   - Valor: `3001`
   - Descripción: Puerto del servidor (Render lo asignará automáticamente)

3. **MONGODB_URI**
   - Valor: `mongodb+srv://TU_USUARIO:TU_PASSWORD@tu-cluster.xxxxx.mongodb.net/funfacts?retryWrites=true&w=majority`
   - Descripción: Connection string de MongoDB Atlas
   - ⚠️ **IMPORTANTE**: Reemplaza TU_USUARIO, TU_PASSWORD y la URL con tus datos reales

4. **CORS_ORIGIN**
   - Valor temporal: `*`
   - Valor final: `https://tu-sitio.netlify.app`
   - Descripción: URL de tu frontend en Netlify
   - 📝 Actualízalo después de desplegar el frontend

## Pasos para Configurar en Render:

1. Ve a https://dashboard.render.com/
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: `funfacts-backend`
   - **Region**: Elige la más cercana
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. En "Environment Variables", agrega las 4 variables de arriba
6. Click en "Create Web Service"
7. Espera 5-10 minutos a que se despliegue
8. Tu backend estará en: `https://funfacts-backend-xxxx.onrender.com`

## Verificar que Funciona:

Una vez desplegado, visita:
```
https://tu-backend.onrender.com/health
```

Deberías ver:
```json
{"status":"ok","timestamp":"2026-01-21T..."}
```

## ⚠️ Notas Importantes:

- El plan gratuito de Render "duerme" después de 15 minutos de inactividad
- La primera petición tardará ~30 segundos en despertar
- Esto es normal y no afecta la funcionalidad
- Para evitarlo, puedes actualizar a un plan de pago ($7/mes)

## Solución de Problemas:

### Error: "Application failed to respond"
- Verifica que el Puerto esté configurado correctamente
- Revisa los logs en Render Dashboard → Tu servicio → Logs

### Error: "MongoServerError"
- Verifica que MONGODB_URI esté correcto
- Asegúrate de haber reemplazado `<password>` con tu contraseña real
- Verifica que 0.0.0.0/0 esté en Network Access de MongoDB Atlas

### Error de CORS
- Actualiza CORS_ORIGIN con la URL exacta de tu frontend
- No incluyas barra final: ✅ `https://sitio.netlify.app` ❌ `https://sitio.netlify.app/`
