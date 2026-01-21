# 🎮 Ejemplos de Uso - Fun Facts

## Escenario 1: Desarrollo Local (Primera Vez)

```bash
# Terminal 1: Iniciar MongoDB
brew services start mongodb-community

# Terminal 2: Proyecto
cd /home/fabrizio/code/gameboards/funFacts
npm run install:all
npm run dev

# Ahora abre http://localhost:5173 en tu navegador
```

## Escenario 2: Desarrollo Local (Días Siguientes)

```bash
# Si MongoDB ya está corriendo, solo:
cd /home/fabrizio/code/gameboards/funFacts
npm run dev

# O por separado:
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

## Escenario 3: Jugar con Amigos en la Misma Red WiFi

```bash
# 1. Obtener tu IP local
ifconfig | grep "inet " | grep -v 127.0.0.1

# Ejemplo: 192.168.1.100

# 2. Actualizar frontend/.env
VITE_API_URL=http://192.168.1.100:3001
VITE_WS_URL=http://192.168.1.100:3001

# 3. Reiniciar
npm run dev

# 4. Compartir con amigos: http://192.168.1.100:5173
```

## Escenario 4: Probar la Reconexión

```bash
# 1. Inicia el juego con 3 jugadores (3 pestañas del navegador)
# 2. En una pestaña, cierra y vuelve a abrir
# 3. Deberías ver "Reconectando..." y luego volver a la partida

# 4. Prueba recargando la página (F5)
# 5. Prueba bloqueando el móvil y desbloqueándolo
```

## Escenario 5: Agregar Tus Propias Preguntas

```bash
# 1. Crear nuevo archivo en cards/
cat > cards/11_mi_categoria.json << 'EOF'
{
  "categoryId": "mi_categoria",
  "categoryName": "Mi Categoría Personalizada",
  "cards": [
    {
      "id": "MC-001",
      "scale0to100": false,
      "text": "¿Cuántas veces al día piensas en pizza?"
    },
    {
      "id": "MC-002",
      "scale0to100": true,
      "text": "Del 0 al 100, ¿cuánto te gustan los gatos?"
    }
  ]
}
EOF

# 2. Reiniciar el backend
# Las nuevas preguntas se cargarán automáticamente
```

## Escenario 6: Debugging de Problemas

### Problema: Backend no conecta a MongoDB

```bash
# Verificar que MongoDB esté corriendo
# macOS
brew services list | grep mongodb

# Si no está corriendo
brew services start mongodb-community

# Verificar conexión manual
mongosh

# Si todo falla, usa MongoDB Atlas:
# 1. Crea cuenta en https://mongodb.com/cloud/atlas
# 2. Obtén connection string
# 3. Actualiza backend/.env:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/funfacts
```

### Problema: Frontend no conecta con Backend

```bash
# 1. Verificar que el backend esté corriendo
curl http://localhost:3001/health
# Debería responder: {"status":"ok",...}

# 2. Verificar logs del backend
# Mira la terminal donde corre npm run dev:backend

# 3. Verificar variables de entorno
cat frontend/.env
# Debe tener: VITE_API_URL=http://localhost:3001
```

### Problema: Puerto en uso

```bash
# Liberar puerto 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Liberar puerto 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# O cambiar puertos en .env
```

## Escenario 7: Ver Datos en MongoDB

```bash
# Conectar a MongoDB local
mongosh

# Cambiar a base de datos
use funfacts

# Ver todas las partidas
db.gamestates.find().pretty()

# Ver partida específica
db.gamestates.findOne({ lobbyCode: "ABC123" })

# Ver cuántas partidas activas
db.gamestates.countDocuments({ status: "active" })

# Eliminar partida específica (para testing)
db.gamestates.deleteOne({ lobbyCode: "ABC123" })

# Limpiar todas las partidas (cuidado!)
db.gamestates.deleteMany({})
```

## Escenario 8: Preparar para Despliegue

```bash
# 1. Crear cuenta en MongoDB Atlas
# https://mongodb.com/cloud/atlas

# 2. Crear cuenta en Render
# https://render.com

# 3. Crear cuenta en Netlify
# https://netlify.com

# 4. Actualizar frontend/.env.production
cat > frontend/.env.production << 'EOF'
VITE_API_URL=https://tu-backend.onrender.com
VITE_WS_URL=https://tu-backend.onrender.com
EOF

# 5. Commit y push a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/funfacts.git
git push -u origin main

# 6. Seguir pasos en DEPLOYMENT.md
```

## Escenario 9: Testing Rápido de Funcionalidades

### Test 1: Crear y Unirse a Lobby
```bash
# 1. Abre http://localhost:5173
# 2. Crear Nueva Sala → Nombre: "Jugador1"
# 3. Anota el código (ej: "XYZ789")
# 4. Abre nueva pestaña en incógnito
# 5. Unirse a Sala → Código: "XYZ789", Nombre: "Jugador2"
# 6. Repite para un tercer jugador
# 7. El primer jugador puede iniciar
```

### Test 2: Juego Completo
```bash
# Con 3 jugadores en diferentes pestañas:
# 1. Iniciar Juego
# 2. Responder pregunta (cada jugador responde diferente)
# 3. Colocar flechas (intentar ordenar correctamente)
# 4. Jugador inicial: Revelar Respuestas
# 5. Ver puntuación
# 6. Siguiente Ronda
# 7. Repetir hasta completar 8 rondas
# 8. Ver resultados finales
```

### Test 3: Reconexión
```bash
# 1. Inicia juego con 3 jugadores
# 2. En fase "Responder", cierra pestaña de un jugador
# 3. Reabre pestaña → ir a http://localhost:5173
# 4. Debería decir "Reconectando..." y volver a la partida
# 5. Completar la respuesta normalmente
```

## Escenario 10: Monitoreo en Producción

### Ver logs de Render
```bash
# 1. Ve a https://dashboard.render.com
# 2. Selecciona tu servicio
# 3. Click en "Logs"
# 4. Ver peticiones en tiempo real
```

### Ver logs de Netlify
```bash
# 1. Ve a https://app.netlify.com
# 2. Selecciona tu sitio
# 3. "Deploys" → Click en el último deploy
# 4. Ver logs de build
```

### Verificar MongoDB Atlas
```bash
# 1. Ve a https://cloud.mongodb.com
# 2. Tu cluster → "Metrics"
# 3. Ver:
#    - Conexiones activas
#    - Operaciones/segundo
#    - Uso de almacenamiento
```

## Escenario 11: Performance Testing

```bash
# Simular múltiples jugadores (requiere instalar bombardier)
# macOS: brew install bombardier
# Linux: go install github.com/codesenberg/bombardier@latest

# Test de creación de lobbies
bombardier -c 10 -n 100 -m POST http://localhost:3001/api/lobby/create

# Ver memoria del backend
ps aux | grep node

# Ver conexiones de MongoDB
mongosh
> db.serverStatus().connections
```

## Escenario 12: Backup de Preguntas

```bash
# Crear backup de todas las preguntas
tar -czf cards-backup-$(date +%Y%m%d).tar.gz cards/

# Restaurar backup
tar -xzf cards-backup-20260121.tar.gz

# Exportar a CSV (para análisis)
cd cards
for file in *.json; do
    echo "Processing $file"
    jq -r '.cards[] | [.id, .text, .scale0to100] | @csv' "$file" >> all-questions.csv
done
```

## Consejos Útiles

### Desarrollo más Rápido
```bash
# Instalar extensión de VS Code para reload automático
# Thunder Client para probar API
# ES7+ React snippets para componentes React
```

### Debugging del Frontend
```javascript
// En la consola del navegador:
localStorage.getItem('funfacts_player') // Ver sesión guardada
localStorage.removeItem('funfacts_player') // Limpiar sesión
```

### Debugging del Backend
```javascript
// Agregar en server.js para debug:
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.onAny((event, ...args) => {
    console.log('📨 Event:', event, 'Args:', args);
  });
});
```

## Scripts Útiles Adicionales

```bash
# Ver todas las partidas activas
mongosh funfacts --eval "db.gamestates.find({status:'active'}).pretty()"

# Contar preguntas por categoría
for file in cards/*.json; do
  echo -n "$(basename $file): "
  jq '.cards | length' "$file"
done

# Buscar pregunta específica
grep -r "cuánto te gusta" cards/
```

---

**Tip**: Mantén este archivo abierto mientras desarrollas para referencia rápida.
