# Guía de Despliegue - Fun Facts

## 📋 Prerequisitos

1. Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuita)
2. Cuenta en [Render](https://render.com) (gratuita)
3. Cuenta en [Netlify](https://www.netlify.com) (gratuita)
4. Repositorio Git (GitHub, GitLab, etc.)

---

## 🗄️ Paso 1: Configurar MongoDB Atlas

### 1.1 Crear Cluster

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y crea una cuenta
2. Click en "Build a Database"
3. Selecciona el plan **FREE** (M0)
4. Elige la región más cercana a tus usuarios
5. Nombra tu cluster (ej: "funfacts-cluster")
6. Click en "Create"

### 1.2 Configurar Acceso

1. **Database Access**:
   - Ve a "Database Access" en el menú lateral
   - Click en "Add New Database User"
   - Elige "Password" como método de autenticación
   - Crea un usuario (ej: `funfacts-user`)
   - Genera una contraseña segura y **guárdala**
   - En "Database User Privileges", selecciona "Read and write to any database"
   - Click en "Add User"

2. **Network Access**:
   - Ve a "Network Access" en el menú lateral
   - Click en "Add IP Address"
   - Click en "Allow Access from Anywhere" (0.0.0.0/0)
   - Esto es necesario para que Render pueda conectarse
   - Click en "Confirm"

### 1.3 Obtener Connection String

1. Ve a "Database" en el menú lateral
2. Click en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Copia el connection string, se ve así:
   ```
   mongodb+srv://funfacts-user:<password>@funfacts-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Importante**: Reemplaza `<password>` con la contraseña de tu usuario
6. Agrega el nombre de la base de datos después de `.net/`: 
   ```
   mongodb+srv://funfacts-user:tu_password@funfacts-cluster.xxxxx.mongodb.net/funfacts?retryWrites=true&w=majority
   ```

---

## 🖥️ Paso 2: Desplegar Backend en Render

### 2.1 Preparar el Repositorio

1. Sube tu código a GitHub/GitLab
2. Asegúrate de que la estructura sea:
   ```
   /backend
   /frontend
   /cards
   ```

### 2.2 Crear Web Service

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio
4. Configura el servicio:

   **General**:
   - **Name**: `funfacts-backend` (o el nombre que prefieras)
   - **Region**: Elige la más cercana
   - **Branch**: `main` (o tu rama principal)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Environment Variables** (muy importante):
   - Click en "Add Environment Variable"
   - Agrega estas variables:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |
   | `MONGODB_URI` | Tu connection string de MongoDB Atlas |
   | `CORS_ORIGIN` | `https://tu-sitio.netlify.app` (lo configuraremos después) |

5. **Plan**: Selecciona "Free"
6. Click en "Create Web Service"

### 2.3 Esperar el Despliegue

- Render instalará las dependencias y desplegará tu backend
- Esto puede tardar 5-10 minutos
- Una vez completado, verás tu URL (ej: `https://funfacts-backend.onrender.com`)
- **Guarda esta URL**, la necesitarás para el frontend

### 2.4 Verificar

- Ve a: `https://tu-backend.onrender.com/health`
- Deberías ver: `{"status":"ok","timestamp":"..."}`

⚠️ **Nota importante sobre el plan gratuito de Render**:
- Tu backend se "dormirá" después de 15 minutos de inactividad
- La primera petición tardará ~30 segundos en despertar
- Considera usar un servicio de "keep-alive" o actualizar a un plan de pago

---

## 🌐 Paso 3: Desplegar Frontend en Netlify

### 3.1 Preparar Configuración de Producción

Antes de desplegar, actualiza el archivo `.env.production` en `frontend/`:

```env
VITE_API_URL=https://tu-backend.onrender.com
VITE_WS_URL=https://tu-backend.onrender.com
```

**Importante**: Usa la URL de tu backend de Render (sin barra final)

### 3.2 Subir Cambios a Git

```bash
git add .
git commit -m "Update production URLs"
git push
```

### 3.3 Crear Sitio en Netlify

1. Ve a [Netlify](https://app.netlify.com/)
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu proveedor Git
4. Selecciona tu repositorio

### 3.4 Configurar Build

En la configuración del sitio:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

**Environment Variables**:
- Click en "Show advanced" → "New variable"
- Agrega:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://tu-backend.onrender.com` |
| `VITE_WS_URL` | `https://tu-backend.onrender.com` |

### 3.5 Desplegar

1. Click en "Deploy site"
2. Espera 2-3 minutos
3. Una vez completado, verás tu URL (ej: `https://random-name-123.netlify.app`)

### 3.6 Personalizar Dominio (Opcional)

1. Ve a "Site settings" → "Domain management"
2. Click en "Options" → "Edit site name"
3. Cambia a algo memorable (ej: `funfacts-game`)
4. Tu sitio será: `https://funfacts-game.netlify.app`

---

## 🔄 Paso 4: Actualizar CORS en Backend

Ahora que tienes la URL de Netlify, actualiza el backend:

1. Ve a tu servicio en Render
2. Ve a "Environment"
3. Edita la variable `CORS_ORIGIN`:
   ```
   https://tu-sitio.netlify.app
   ```
   ⚠️ Sin barra final
4. Guarda los cambios
5. Render redesplegará automáticamente el backend

---

## ✅ Paso 5: Probar la Aplicación

1. Abre tu sitio de Netlify
2. Crea una nueva sala
3. Comparte el código con amigos
4. ¡Juega!

### Problemas Comunes

**"Lobby not found"**:
- El backend puede estar "dormido" (plan gratuito de Render)
- Espera 30 segundos y vuelve a intentar

**Error de CORS**:
- Verifica que `CORS_ORIGIN` en Render tenga la URL correcta de Netlify
- Asegúrate de que no haya barra final ni espacios

**WebSocket no conecta**:
- Verifica las variables `VITE_WS_URL` en Netlify
- Asegúrate de usar `https://` (no `http://`)

**"Reconectando..." infinito**:
- El backend probablemente está caído
- Verifica los logs en Render

---

## 🔍 Monitoreo y Logs

### Logs de Backend (Render)

1. Ve a tu servicio en Render
2. Click en "Logs"
3. Verás todas las peticiones y errores en tiempo real

### Logs de Frontend (Netlify)

1. Ve a tu sitio en Netlify
2. Click en "Deploys"
3. Click en el último deploy para ver los logs

### Monitoreo de MongoDB

1. Ve a MongoDB Atlas
2. Click en tu cluster → "Metrics"
3. Verás conexiones, operaciones, etc.

---

## 💰 Límites del Plan Gratuito

### Render (Backend)
- ✅ 750 horas/mes (suficiente)
- ⚠️ Se duerme después de 15 min sin uso
- ✅ 100GB de ancho de banda/mes

### Netlify (Frontend)
- ✅ 100GB de ancho de banda/mes
- ✅ 300 minutos de build/mes
- ✅ Sin límite de despliegues

### MongoDB Atlas
- ✅ 512MB de almacenamiento
- ✅ Conexiones compartidas
- ✅ Backups diarios (con limitaciones)

---

## 🚀 Mejoras para Producción

Si quieres llevar esto a producción real:

1. **Dominio personalizado**: Compra un dominio y conéctalo a Netlify
2. **Plan de pago en Render**: Elimina el "sleep" del backend ($7/mes)
3. **MongoDB dedicado**: Para mejor rendimiento
4. **CDN**: Netlify ya incluye CDN global
5. **Monitoreo**: Agrega Sentry o LogRocket para tracking de errores
6. **Analytics**: Google Analytics o Plausible

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render y Netlify
2. Verifica las variables de entorno
3. Asegúrate de que MongoDB esté accesible
4. Prueba las URLs manualmente:
   - `https://tu-backend.onrender.com/health` → debe responder
   - `https://tu-sitio.netlify.app` → debe cargar la app

---

## 🎉 ¡Listo!

Tu juego Fun Facts está ahora desplegado y accesible desde cualquier lugar del mundo. Comparte la URL y disfruta jugando con tus amigos.
