# 🧪 Guía de Pruebas Locales

## ✅ Estado Actual

- ✅ Backend corriendo en: http://localhost:3001
- ✅ Frontend corriendo en: http://localhost:5173
- ✅ MongoDB Atlas conectado
- ✅ Bug de validación corregido

## 🐛 Bug Corregido

**Error anterior:**

```
TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

**Solución:**
Se agregaron validaciones de parámetros en todos los event handlers de Socket.io:

- `join-lobby`: Valida lobbyCode y playerName
- `start-game`: Valida lobbyCode y playerId
- `submit-answer`: Valida lobbyCode, playerId y answer
- `place-arrow`: Valida lobbyCode, playerId y position
- `reveal-answers`: Valida lobbyCode
- `next-round`: Valida lobbyCode y roundScore

## 🎮 Cómo Probar

### 1. Verificar Backend

```bash
curl http://localhost:3001/health
# Debe responder: {"status":"ok","timestamp":"..."}
```

### 2. Crear Lobby de Prueba

```bash
curl -X POST http://localhost:3001/api/lobby/create
# Responde con: {"lobbyCode":"ABC123"}
```

### 3. Verificar Lobby

```bash
curl http://localhost:3001/api/lobby/ABC123
# Responde: {"exists":true,"playerCount":0,...}
```

### 4. Probar en Navegador

**Opción A: Una persona, múltiples pestañas**

1. Abre http://localhost:5173
2. Crear Nueva Sala → Nombre: "Jugador1"
3. Anota el código (ej: "XYZ789")
4. Abre una pestaña en incógnito (Ctrl+Shift+N o Cmd+Shift+N)
5. Unirse a Sala → Código: "XYZ789", Nombre: "Jugador2"
6. Abre otra pestaña normal
7. Unirse a Sala → Código: "XYZ789", Nombre: "Jugador3"
8. En la primera pestaña, click "Iniciar Juego"

**Opción B: Probar con tu móvil (misma WiFi)**

1. Obtén tu IP local:

   ```bash
   # En Linux/Mac:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Busca algo como: 192.168.1.100
   ```

2. En tu móvil, abre: `http://TU_IP:5173`
3. Únete con el código de tu computadora

## ✅ Checklist de Pruebas

### Funcionalidad Básica

- [ ] Crear una sala
- [ ] Ver el código de 6 caracteres
- [ ] Unirse a la sala con el código
- [ ] Ver los jugadores en la sala
- [ ] Iniciar juego con 3+ jugadores

### Fase 1: Responder

- [ ] Ver la pregunta
- [ ] Todos los jugadores responden
- [ ] Ver indicador "✅ Respuesta enviada"
- [ ] Ver contador de jugadores que respondieron

### Fase 2: Colocar

- [ ] Ver opciones para colocar flecha
- [ ] Colocar flecha en posición
- [ ] Jugador inicial puede mover su flecha
- [ ] Botón "Revelar Respuestas" aparece

### Fase 3: Revelar

- [ ] Ver todas las respuestas
- [ ] Respuestas correctas en verde
- [ ] Respuestas incorrectas en rojo
- [ ] Ver puntuación de la ronda
- [ ] Pasar a siguiente ronda

### Persistencia

- [ ] Recargar página (F5) → Reconectar automáticamente
- [ ] Cerrar pestaña y reabrir → Recuperar partida
- [ ] Bloquear móvil y desbloquear → Seguir en partida

### Desconexión/Reconexión

- [ ] Cerrar una pestaña → Jugador marcado como "Desconectado"
- [ ] Reabrir y unirse → Reconectar correctamente
- [ ] Perder WiFi momentáneamente → Reconectar al volver

### Casos Edge

- [ ] Intentar unirse a lobby inexistente → Error claro
- [ ] Iniciar con menos de 3 jugadores → Mensaje de error
- [ ] Respuesta no numérica → Validación
- [ ] Respuesta fuera de rango 0-100 → Validación

## 🔍 Debugging

### Ver Logs del Backend

Los logs aparecen en la terminal donde corriste `npm run dev`:

```
🔌 Client connected: abc123
➕ New player joined: Jugador1 to XYZ789
🔄 Player reconnected: Jugador1 to XYZ789
```

### Ver Errores del Frontend

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo

### Ver Estado en MongoDB

```bash
# Instala mongosh si no lo tienes
# Mac: brew install mongosh
# Linux: sudo apt install mongosh

# Conectar a tu cluster (usa las credenciales de tu .env)
mongosh "mongodb+srv://<username>:<password>@funfactscluster.n3yucr5.mongodb.net/funfacts"

# Ver todas las partidas
db.gamestates.find().pretty()

# Ver partida específica
db.gamestates.findOne({ lobbyCode: "XYZ789" })

# Contar partidas activas
db.gamestates.countDocuments({ status: "active" })

# Limpiar todas las partidas (para testing)
db.gamestates.deleteMany({})
```

## 🚀 Siguiente Paso: Desplegar

Una vez que hayas probado todo localmente y funcione bien:

1. **Commit los cambios:**

   ```bash
   git add .
   git commit -m "Fix: Add parameter validation to socket handlers"
   git push
   ```

2. **Redesplegar en Render:**
   - Ve a: https://dashboard.render.com/
   - Tu servicio se redesplegará automáticamente
   - Espera 5-10 minutos

3. **Verificar producción:**

   ```bash
   # Reemplaza con tu URL de Render
   curl https://tu-backend.onrender.com/health
   ```

4. **Si funciona, actualiza Netlify:**
   - Netlify redesplegará automáticamente con el push
   - O manualmente en: https://app.netlify.com/

## 📝 Notas

- El backend puede tardar ~30 segundos en despertar si está inactivo (plan gratuito)
- MongoDB Atlas tiene 512MB de espacio gratuito (suficiente para miles de partidas)
- Las partidas se eliminan automáticamente después de 24h de inactividad
- Los logs de Render se pueden ver en el dashboard

## 🎯 Si Todo Funciona

¡Felicitaciones! Tu juego está listo. Comparte la URL de Netlify con tus amigos y disfruta.

## 🆘 Si Algo Falla

1. Verifica que ambos servidores estén corriendo
2. Revisa los logs en la terminal
3. Abre la consola del navegador (F12)
4. Verifica la conexión a MongoDB en los logs del backend
