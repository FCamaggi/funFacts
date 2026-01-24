# Changelog

## [1.0.0] - 2026-01-21

### Características Iniciales

#### Core

- ✅ Sistema completo de juego Fun Facts digital
- ✅ 195 preguntas distribuidas en 10 categorías
- ✅ Soporte para 3-8 jugadores
- ✅ 8 rondas de juego con puntuación acumulativa

#### Funcionalidades de Lobby

- ✅ Creación de salas con códigos únicos de 6 caracteres
- ✅ Unirse a salas existentes con código
- ✅ Indicador de jugadores conectados/desconectados
- ✅ Mínimo 3 jugadores para iniciar
- ✅ Sistema de colores para cada jugador

#### Persistencia y Reconexión

- ✅ Guardado automático de sesión en LocalStorage
- ✅ Reconexión automática al recargar la página
- ✅ Recuperación de partida activa tras cerrar navegador
- ✅ Manejo de desconexiones sin perder progreso
- ✅ Limpieza automática de partidas antiguas (24h TTL)

#### Fases del Juego

- ✅ **Fase 1 - Responder**: Todos responden en secreto
- ✅ **Fase 2 - Colocar**: Predicen orden de respuestas
- ✅ **Fase 3 - Revelar**: Mostrar resultados y puntuación
- ✅ Jugador inicial puede mover su respuesta al final
- ✅ Cálculo automático de puntuación

#### UI/UX

- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Tema oscuro moderno
- ✅ Animaciones y transiciones suaves
- ✅ Indicadores visuales de estado
- ✅ Feedback en tiempo real

#### Tecnología

- ✅ Frontend: React + Vite
- ✅ Backend: Node.js + Express
- ✅ Database: MongoDB con Mongoose
- ✅ Comunicación: Socket.io (WebSockets)
- ✅ Deploy: Netlify (frontend) + Render (backend)

### Categorías de Preguntas

1. Hábitos Cotidianos (50 preguntas)
2. Escala de Gustos 0-100 (50 preguntas)
3. Experiencias y Viajes (50 preguntas)
4. Autoevaluación Personalidad 0-100 (50 preguntas)
5. Conocimientos y Habilidades (50 preguntas)
6. Vida Digital y Tecnología (50 preguntas)
7. Relaciones y Entorno Social (50 preguntas)
8. Hipotéticos y Fantasía (50 preguntas)
9. Secretos y Picardía (Adultos) (50 preguntas)
10. Intimidad y Pareja (Adultos) (50 preguntas)

### Documentación

- ✅ README completo con instrucciones
- ✅ Guía de despliegue paso a paso
- ✅ Troubleshooting y mejores prácticas
- ✅ Estructura del proyecto documentada

## Próximas Mejoras (Roadmap)

### v1.1.0 (Planeado)

- [ ] Sistema de salas privadas con contraseña
- [ ] Modo rápido (4 rondas)
- [ ] Estadísticas de jugadores
- [ ] Historial de partidas

### v1.2.0 (Futuro)

- [ ] Categorías personalizadas
- [ ] Modo competitivo (puntos individuales)
- [ ] Chat en vivo durante partidas
- [ ] Achievements/logros

### v2.0.0 (Visión)

- [ ] Modo torneos
- [ ] Ranking global
- [ ] Creador de preguntas por usuarios
- [ ] Temas visuales personalizables
