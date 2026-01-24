# 🎯 Fun Facts - Resumen del Proyecto

## ✨ ¿Qué se ha creado?

Una **versión digital completa** del juego de mesa Fun Facts con:

- ✅ Sistema de lobbies con códigos únicos
- ✅ 195 preguntas en 10 categorías
- ✅ Soporte para 3-8 jugadores
- ✅ **Persistencia total**: No pierdes tu partida si cierras el navegador
- ✅ **Reconexión automática**: Te reconecta si pierdes conexión
- ✅ Tiempo real con WebSockets
- ✅ Diseño responsive para móviles y desktop
- ✅ Listo para desplegar en Netlify y Render (gratis)

## 📁 Estructura del Proyecto

```
funFacts/
├── 📱 frontend/              # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx      # Pantalla inicial
│   │   │   ├── Lobby.jsx     # Sala de espera
│   │   │   ├── Game.jsx      # Juego principal
│   │   │   └── *.css         # Estilos
│   │   ├── services/
│   │   │   └── api.js        # API + WebSocket + Persistencia
│   │   └── App.jsx           # Componente principal
│   ├── .env                  # ✅ Ya configurado para localhost
│   └── package.json
│
├── 🖥️ backend/               # Node.js + Express + Socket.io
│   ├── models/
│   │   └── GameState.js      # Modelo MongoDB
│   ├── utils/
│   │   ├── cardManager.js    # Gestión de cartas
│   │   └── helpers.js        # Utilidades
│   ├── server.js             # Servidor principal
│   ├── .env                  # ✅ Ya configurado para localhost
│   └── package.json
│
├── 🎴 cards/                 # 10 categorías JSON
│   ├── 01_habitos_cotidianos.json (50 preguntas)
│   ├── 02_escala_de_gustos_0_100.json (50 preguntas)
│   └── ... (8 archivos más)
│
├── 📚 Documentación
│   ├── README.md             # Documentación completa
│   ├── QUICKSTART.md         # ⭐ Empieza aquí para desarrollo local
│   ├── DEPLOYMENT.md         # Guía paso a paso para producción
│   └── CHANGELOG.md          # Historial de versiones
│
└── package.json              # Scripts para todo el proyecto

```

## 🚀 Iniciar Desarrollo (3 pasos)

### Opción 1: Con MongoDB Atlas (Recomendado - No requiere instalar nada)

```bash
# 1. Crear cuenta gratuita en MongoDB Atlas
#    https://www.mongodb.com/cloud/atlas
#    Obtener connection string

# 2. Actualizar backend/.env con tu connection string
#    MONGODB_URI=mongodb+srv://...

# 3. Instalar y ejecutar
npm run install:all  # Instala todo
npm run dev          # Inicia backend + frontend
```

### Opción 2: Con MongoDB Local

```bash
# 1. Iniciar MongoDB
brew services start mongodb-community  # macOS
# o
sudo systemctl start mongod            # Linux

# 2. Instalar y ejecutar
npm run install:all
npm run dev
```

Abre: http://localhost:5173

## 🌐 Desplegar a Producción

**Todo está listo para desplegar en servicios gratuitos:**

1. **MongoDB Atlas** (Base de datos) - Gratis hasta 512MB
2. **Render** (Backend) - Gratis (con limitaciones)
3. **Netlify** (Frontend) - Gratis 100GB/mes

📖 **Guía completa**: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🎮 Flujo del Juego

```
1. 🏠 Home
   ↓
   [Crear Sala] o [Unirse con código]
   ↓
2. 👥 Lobby (Sala de Espera)
   - Esperar mínimo 3 jugadores
   - Host inicia la partida
   ↓
3. 🎯 Juego (8 rondas)
   ↓
   3.1 📝 Responder
       - Aparece una pregunta
       - Todos responden con un número (en secreto)
   ↓
   3.2 📍 Colocar
       - Predecir dónde va tu respuesta en orden ascendente
       - Jugador inicial puede mover su respuesta al final
   ↓
   3.3 👁️ Revelar
       - Se revelan las respuestas
       - Puntos por cada respuesta bien colocada
   ↓
   [Repetir 3.1-3.3 hasta completar 8 rondas]
   ↓
4. 🏆 Resultados Finales
   - Puntuación total
   - Evaluación según número de jugadores
   - Resumen de rondas
```

## 🔑 Características Clave de Persistencia

### 1. **Reconexión Automática**

```javascript
// Al recargar la página, recupera tu sesión
localStorage: {
  playerId: "player_123...",
  playerName: "Tu Nombre",
  lobbyCode: "ABC123",
  timestamp: 1234567890
}
```

### 2. **Socket.io Reconnection**

```javascript
socket.io({
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});
```

### 3. **MongoDB TTL**

```javascript
// Las partidas se eliminan automáticamente después de 24h
lastActivity: {
  type: Date,
  expireAfterSeconds: 86400
}
```

## 📊 Categorías de Preguntas

1. **Hábitos Cotidianos** (50) - Rutinas diarias
2. **Escala de Gustos** (50) - Del 0 al 100
3. **Experiencias y Viajes** (50) - Vivencias acumuladas
4. **Autoevaluación Personalidad** (50) - Rasgos de carácter
5. **Conocimientos y Habilidades** (50) - Qué tan experto eres
6. **Vida Digital** (50) - Tecnología y redes
7. **Relaciones Sociales** (50) - Interacción con otros
8. **Hipotéticos y Fantasía** (50) - Situaciones imaginarias
9. **Secretos y Picardía** (50) - Preguntas atrevidas (adultos)
10. **Intimidad y Pareja** (50) - Relaciones románticas (adultos)

**Total: 195 preguntas**

## 🛠️ Stack Tecnológico

### Frontend

- **React 18** - UI Library
- **Vite** - Build tool ultra rápido
- **Socket.io-client** - WebSockets
- **CSS Modules** - Estilos

### Backend

- **Node.js + Express** - Servidor
- **Socket.io** - WebSockets real-time
- **Mongoose** - ODM para MongoDB
- **nanoid** - Generador de códigos únicos

### Base de Datos

- **MongoDB** - NoSQL document database
- **TTL Indexes** - Auto-limpieza de datos viejos

### Deploy

- **Netlify** - Frontend (CDN global)
- **Render** - Backend (Contenedor Node.js)
- **MongoDB Atlas** - Base de datos en la nube

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Backend + Frontend simultáneamente
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Producción
npm run build            # Build del frontend
npm run start:backend    # Backend en modo producción

# Instalación
npm run install:all      # Instala backend + frontend
```

## 🔒 Seguridad y Mejores Prácticas

✅ Variables de entorno para configuración sensible
✅ CORS configurado correctamente
✅ Validación de datos en backend
✅ Limpieza automática de datos antiguos
✅ Manejo de errores en todas las operaciones
✅ Reconexión resiliente ante fallos

## 📈 Límites del Plan Gratuito

| Servicio          | Límite Gratuito                | Suficiente para      |
| ----------------- | ------------------------------ | -------------------- |
| **Render**        | 750h/mes, se duerme tras 15min | Desarrollo y pruebas |
| **Netlify**       | 100GB/mes, builds ilimitados   | Miles de usuarios    |
| **MongoDB Atlas** | 512MB storage                  | Miles de partidas    |

## 🎯 Estado del Proyecto

- ✅ **100% Funcional** para desarrollo local
- ✅ **Listo para deploy** a producción
- ✅ **Totalmente documentado**
- ✅ **Persistencia completa** implementada
- ✅ **UI/UX pulida** y responsive

## 📞 Próximos Pasos Recomendados

1. **Probar localmente**: `npm run dev`
2. **Desplegar a Atlas + Render + Netlify**: Ver [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Compartir con amigos**: Jugar y obtener feedback
4. **Personalizar**: Agregar tus propias preguntas en `/cards`

## 🎉 ¡Listo para Jugar!

Todo el código está completo y funcional. Solo necesitas:

1. MongoDB (Atlas o local)
2. Ejecutar `npm run dev`
3. Abrir http://localhost:5173
4. ¡Invitar amigos y jugar!

---

**Documentación**: Lee [QUICKSTART.md](QUICKSTART.md) para empezar
**Deploy**: Lee [DEPLOYMENT.md](DEPLOYMENT.md) para producción
