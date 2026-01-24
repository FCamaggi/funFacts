# Fun Facts - Digital Game

Versión digital del juego de mesa "Fun Facts". Juego cooperativo de fiesta para 3-8 jugadores donde demuestran qué tan bien se conocen respondiendo preguntas con números.

## 🎯 Características

- **Sistema de Lobbies**: Crea o únete a salas con códigos únicos
- **Persistencia**: Reconexión automática si pierdes conexión o cierras el navegador
- **Tiempo Real**: Actualizaciones instantáneas con WebSockets
- **Responsive**: Funciona en móviles, tablets y desktop
- **195 preguntas**: 10 categorías diferentes de preguntas

## 🏗️ Arquitectura

### Frontend

- **React + Vite**: Interfaz de usuario moderna y rápida
- **Socket.io-client**: Comunicación en tiempo real
- **LocalStorage**: Persistencia de sesión del jugador
- **Despliegue**: Netlify

### Backend

- **Node.js + Express**: API REST y servidor WebSocket
- **Socket.io**: Gestión de conexiones en tiempo real
- **MongoDB**: Base de datos para persistencia de partidas
- **Despliegue**: Render

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- MongoDB (local o MongoDB Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus configuraciones
npm run dev
```

Variables de entorno necesarias:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/funfacts
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edita .env con la URL de tu backend
npm run dev
```

Variables de entorno:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## 📦 Despliegue

### Backend en Render

1. Crea un nuevo Web Service en [Render](https://render.com)
2. Conecta tu repositorio
3. Configura:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     - `MONGODB_URI`: Tu string de conexión de MongoDB Atlas
     - `CORS_ORIGIN`: URL de tu frontend en Netlify
     - `NODE_ENV`: `production`

### Frontend en Netlify

1. Crea un nuevo sitio en [Netlify](https://netlify.com)
2. Conecta tu repositorio
3. Configura:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Environment Variables**:
     - `VITE_API_URL`: URL de tu backend en Render
     - `VITE_WS_URL`: URL de tu backend en Render

### MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Configura el acceso de red (IP Whitelist: 0.0.0.0/0 para Render)
4. Crea un usuario de base de datos
5. Obtén el string de conexión

## 🎮 Cómo Jugar

1. **Crear sala**: Un jugador crea una nueva sala y comparte el código
2. **Unirse**: Otros jugadores se unen con el código de 6 caracteres
3. **Iniciar**: El host inicia cuando hay al menos 3 jugadores
4. **Responder**: Todos responden en secreto con un número
5. **Colocar**: Predicen dónde va su respuesta en orden ascendente
6. **Revelar**: Se revelan las respuestas y se obtienen puntos
7. **8 rondas**: Después de 8 rondas, ven su puntuación final

## 🔧 Características Técnicas

### Persistencia y Reconexión

- **LocalStorage**: Guarda ID de jugador, nombre y código de lobby
- **Reconexión automática**: Socket.io reintenta conectar automáticamente
- **Restauración de sesión**: Al recargar la página, recupera la partida activa
- **Detección de desconexión**: Marca jugadores como desconectados sin eliminarlos

### Gestión de Lobbies

- **Códigos únicos**: Genera códigos de 6 caracteres únicos
- **Limpieza automática**: MongoDB TTL elimina partidas antiguas (24h)
- **Estados**: waiting, answering, placing, revealing, finished
- **Validaciones**: Mínimo 3 jugadores, máximo 8

### WebSocket Events

**Cliente → Servidor**:

- `join-lobby`: Unirse a una sala
- `start-game`: Iniciar partida
- `submit-answer`: Enviar respuesta
- `place-arrow`: Colocar posición
- `reveal-answers`: Revelar respuestas
- `next-round`: Pasar a siguiente ronda

**Servidor → Cliente**:

- `joined-lobby`: Confirmación de unión
- `game-update`: Actualización del estado
- `error`: Mensaje de error

## 📁 Estructura del Proyecto

```
funFacts/
├── backend/
│   ├── models/
│   │   └── GameState.js       # Modelo de MongoDB
│   ├── utils/
│   │   ├── cardManager.js     # Gestión de cartas
│   │   └── helpers.js         # Funciones auxiliares
│   ├── server.js              # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx       # Pantalla inicial
│   │   │   ├── Lobby.jsx      # Sala de espera
│   │   │   └── Game.jsx       # Juego principal
│   │   ├── services/
│   │   │   └── api.js         # API y WebSocket
│   │   └── App.jsx
│   └── package.json
├── cards/                     # 10 categorías de cartas
│   ├── 01_habitos_cotidianos.json
│   ├── 02_escala_de_gustos_0_100.json
│   └── ...
└── docs/
    ├── manual.md
    └── categorías.md
```

## 🎨 Personalización

### Colores

Los colores de los jugadores se definen en `backend/utils/helpers.js`:

```javascript
export const PLAYER_COLORS = [
  '#FF6B6B', // Rojo
  '#4ECDC4', // Turquesa
  // ... añade más colores
];
```

### Número de Rondas

Cambia en `backend/models/GameState.js`:

```javascript
maxRounds: { type: Number, default: 8 }
```

### Agregar Cartas

Crea nuevos archivos JSON en la carpeta `cards/` siguiendo el formato:

```json
{
  "categoryId": "tu_categoria",
  "categoryName": "Tu Categoría",
  "cards": [
    {
      "id": "TC-001",
      "scale0to100": false,
      "text": "Tu pregunta aquí"
    }
  ]
}
```

## 🐛 Troubleshooting

### Error de CORS

- Verifica que `CORS_ORIGIN` en el backend coincida con tu URL de frontend
- Asegúrate de incluir el protocolo (https://)

### WebSocket no conecta

- Verifica que ambas URLs (API y WS) sean correctas
- Revisa que Render permita conexiones WebSocket (debe usar WS/WSS)

### Sesión no persiste

- Verifica que el navegador permita LocalStorage
- Comprueba que las cookies no estén bloqueadas

## 📝 Licencia

MIT

## 👥 Créditos

- **Juego original**: Kasper Lapp
- **Desarrollo digital**: Versión web del juego de mesa Fun Facts
