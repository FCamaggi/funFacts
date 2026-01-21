# Guía de Inicio Rápido

Esta guía te ayudará a tener Fun Facts funcionando en tu máquina local en menos de 10 minutos.

## 📋 Requisitos

- Node.js 18 o superior
- MongoDB instalado localmente O cuenta en MongoDB Atlas
- Git

## 🚀 Inicio Rápido

### Opción A: Con MongoDB Local

```bash
# 1. Clonar/navegar al proyecto
cd /ruta/a/funFacts

# 2. Instalar todas las dependencias
npm run install:all

# 3. Iniciar MongoDB (macOS con Homebrew)
brew services start mongodb-community
# O en Linux/Windows, inicia mongod según tu instalación

# 4. Configurar Backend
cd backend
cp .env.example .env
# El .env por defecto ya apunta a MongoDB local
cd ..

# 5. Configurar Frontend  
cd frontend
cp .env.example .env
# El .env por defecto ya apunta a localhost
cd ..

# 6. Iniciar todo (backend + frontend)
npm run dev
```

### Opción B: Con MongoDB Atlas (Recomendado)

```bash
# 1. Clonar/navegar al proyecto
cd /ruta/a/funFacts

# 2. Instalar todas las dependencias
npm run install:all

# 3. Crear cuenta en MongoDB Atlas
# Ve a https://www.mongodb.com/cloud/atlas
# Sigue los pasos para crear un cluster gratuito
# Obtén tu connection string

# 4. Configurar Backend
cd backend
cp .env.example .env
# Edita .env y actualiza MONGODB_URI con tu connection string de Atlas
# Ejemplo: mongodb+srv://user:password@cluster.xxxxx.mongodb.net/funfacts

# 5. Configurar Frontend
cd frontend
cp .env.example .env
# No necesitas cambiar nada si usas localhost
cd ..

# 6. Iniciar todo
npm run dev
```

## ✅ Verificar que Funciona

1. **Backend**: Abre http://localhost:3001/health
   - Deberías ver: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Abre http://localhost:5173
   - Verás la pantalla de inicio de Fun Facts

3. **Probar el juego**:
   - Click en "Crear Nueva Sala"
   - Ingresa un nombre
   - Verás un código de 6 caracteres
   - Abre otra ventana/pestaña (o usa tu móvil en la misma red)
   - Click en "Unirse a una Sala"
   - Ingresa el código
   - ¡Ya tienes 2 jugadores! Necesitas uno más para empezar

## 🔧 Comandos Disponibles

### Raíz del proyecto
```bash
npm run install:all    # Instala dependencias de backend y frontend
npm run dev            # Inicia backend y frontend simultáneamente
```

### Backend (en /backend)
```bash
npm run dev     # Inicia servidor con nodemon (auto-reload)
npm start       # Inicia servidor en producción
```

### Frontend (en /frontend)
```bash
npm run dev     # Inicia servidor de desarrollo
npm run build   # Construye para producción
npm run preview # Preview del build de producción
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"
```bash
# Si usas MongoDB local:
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB

# Si usas MongoDB Atlas:
# 1. Verifica tu connection string en backend/.env
# 2. Asegúrate de haber configurado Network Access (0.0.0.0/0)
# 3. Verifica que el usuario tenga permisos de lectura/escritura
```

### Error: "Port 3001 already in use"
```bash
# Busca y mata el proceso que usa el puerto
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# O cambia el puerto en backend/.env
PORT=3002
```

### Error: "Port 5173 already in use"
```bash
# Busca y mata el proceso
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# O Vite te ofrecerá usar otro puerto automáticamente
```

### Frontend no conecta con Backend
1. Verifica que el backend esté corriendo: http://localhost:3001/health
2. Revisa `frontend/.env` que tenga las URLs correctas
3. Abre la consola del navegador (F12) para ver errores

### "Lobby not found"
- El backend puede estar recién iniciando, espera 2-3 segundos
- Verifica que MongoDB esté conectado (mira los logs del backend)

## 📱 Probar en Móvil (Misma Red WiFi)

1. Obtén tu IP local:
   ```bash
   # macOS/Linux
   ifconfig | grep inet
   # Busca algo como: 192.168.1.XXX
   
   # Windows
   ipconfig
   # Busca IPv4 Address
   ```

2. Actualiza `frontend/.env`:
   ```env
   VITE_API_URL=http://TU_IP:3001
   VITE_WS_URL=http://TU_IP:3001
   ```

3. Reinicia el frontend

4. En tu móvil, abre: `http://TU_IP:5173`

## 📚 Próximos Pasos

- Lee el [README.md](README.md) para documentación completa
- Revisa [DEPLOYMENT.md](DEPLOYMENT.md) para subir a producción
- Explora [CHANGELOG.md](CHANGELOG.md) para ver características

## 🎮 ¡A Jugar!

Una vez que todo esté funcionando:
1. Crea una sala
2. Comparte el código con 2+ amigos
3. Inicien el juego
4. ¡Descubran qué tan bien se conocen!

---

**¿Necesitas ayuda?** Abre un issue o revisa los logs en la terminal para más detalles de cualquier error.
