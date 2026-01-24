import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

import GameState from './models/GameState.js';
import cardManager from './utils/cardManager.js';
import { generateLobbyCode, getNextColor } from './utils/helpers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Lista de orígenes permitidos (localhost y 127.0.0.1 son diferentes para CORS)
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Permitir peticiones sin origin (como desde Postman o curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

const io = new Server(httpServer, {
    cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Logging middleware para debugging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
    next();
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/funfacts')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Crear un nuevo lobby
app.post('/api/lobby/create', async (req, res) => {
    try {
        let lobbyCode;
        let exists = true;

        // Generar código único
        while (exists) {
            lobbyCode = generateLobbyCode();
            exists = await GameState.findOne({ lobbyCode, status: 'active' });
        }

        const gameState = new GameState({ lobbyCode });
        await gameState.save();

        res.json({ lobbyCode });
    } catch (error) {
        console.error('Error creating lobby:', error);
        res.status(500).json({ error: 'Failed to create lobby' });
    }
});

// Verificar si un lobby existe
app.get('/api/lobby/:code', async (req, res) => {
    try {
        const gameState = await GameState.findOne({
            lobbyCode: req.params.code.toUpperCase(),
            status: { $in: ['active', 'finished'] }
        });

        if (!gameState) {
            return res.status(404).json({ error: 'Lobby not found' });
        }

        res.json({
            exists: true,
            playerCount: gameState.players.length,
            phase: gameState.phase,
            status: gameState.status
        });
    } catch (error) {
        console.error('Error checking lobby:', error);
        res.status(500).json({ error: 'Failed to check lobby' });
    }
});

// WebSocket handlers
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Unirse a un lobby
    socket.on('join-lobby', async ({ lobbyCode, playerName, playerId }) => {
        try {
            // Validar parámetros requeridos
            if (!lobbyCode || !playerName) {
                socket.emit('error', { message: 'Código de sala y nombre son requeridos' });
                return;
            }

            lobbyCode = lobbyCode.toUpperCase();
            const gameState = await GameState.findOne({ lobbyCode, status: { $in: ['active', 'finished'] } });

            if (!gameState) {
                socket.emit('error', { message: 'Lobby not found' });
                return;
            }

            socket.join(lobbyCode);

            // Verificar si el jugador ya existe (reconexión)
            let player = gameState.players.find(p => p.id === playerId);

            if (player) {
                // Reconexión
                player.connected = true;
                player.lastSeen = new Date();
                console.log(`🔄 Player reconnected: ${playerName} to ${lobbyCode}`);
            } else {
                // Nuevo jugador
                const usedColors = gameState.players.map(p => p.color);
                const color = getNextColor(usedColors);

                player = {
                    id: playerId || nanoid(),
                    name: playerName,
                    color,
                    connected: true,
                    lastSeen: new Date(),
                    answer: null,
                    position: null
                };

                gameState.players.push(player);
                console.log(`➕ New player joined: ${playerName} to ${lobbyCode}`);
            }

            gameState.lastActivity = new Date();
            await gameState.save();

            // Enviar estado completo al jugador que se une
            socket.emit('joined-lobby', {
                playerId: player.id,
                gameState: formatGameState(gameState, player.id)
            });

            // Notificar a todos los jugadores
            io.to(lobbyCode).emit('game-update', formatGameState(gameState));

        } catch (error) {
            console.error('Error joining lobby:', error);
            socket.emit('error', { message: 'Failed to join lobby' });
        }
    });

    // Iniciar juego
    socket.on('start-game', async ({ lobbyCode, playerId }) => {
        try {
            if (!lobbyCode || !playerId) {
                socket.emit('error', { message: 'Datos incompletos' });
                return;
            }

            const gameState = await GameState.findOne({ lobbyCode });

            if (!gameState) {
                socket.emit('error', { message: 'Lobby not found' });
                return;
            }

            if (gameState.players.length < 3) {
                socket.emit('error', { message: 'Necesitas al menos 3 jugadores para empezar' });
                return;
            }

            // Sacar primera carta
            const card = cardManager.getRandomCard();
            gameState.currentCard = card;
            gameState.usedCardIds.push(card.id);
            gameState.phase = 'answering';
            gameState.lastActivity = new Date();

            await gameState.save();

            io.to(lobbyCode).emit('game-update', formatGameState(gameState));

        } catch (error) {
            console.error('Error starting game:', error);
            socket.emit('error', { message: 'Failed to start game' });
        }
    });

    // Enviar respuesta
    socket.on('submit-answer', async ({ lobbyCode, playerId, answer }) => {
        try {
            if (!lobbyCode || !playerId || answer === undefined) {
                socket.emit('error', { message: 'Datos incompletos' });
                return;
            }

            const gameState = await GameState.findOne({ lobbyCode });

            if (!gameState || gameState.phase !== 'answering') {
                return;
            }

            const player = gameState.players.find(p => p.id === playerId);
            if (player) {
                player.answer = answer;
                gameState.lastActivity = new Date();
                await gameState.save();

                // Verificar si todos han respondido
                const allAnswered = gameState.players.every(p => p.answer !== null);
                if (allAnswered) {
                    gameState.phase = 'placing';
                    await gameState.save();
                }

                io.to(lobbyCode).emit('game-update', formatGameState(gameState));
            }

        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    });

    // Colocar flecha
    socket.on('place-arrow', async ({ lobbyCode, playerId, position }) => {
        try {
            if (!lobbyCode || !playerId || position === undefined) {
                socket.emit('error', { message: 'Datos incompletos' });
                return;
            }

            const gameState = await GameState.findOne({ lobbyCode });

            if (!gameState || gameState.phase !== 'placing') {
                return;
            }

            const player = gameState.players.find(p => p.id === playerId);
            if (player) {
                player.position = position;
                gameState.lastActivity = new Date();

                // Si es el jugador inicial y ya había colocado, marca que puede mover
                const startPlayer = gameState.players[gameState.startPlayerIndex];
                if (startPlayer && startPlayer.id === playerId && player.position !== null) {
                    // Verificar si todos los demás han colocado
                    const othersPlaced = gameState.players.every((p, idx) =>
                        idx === gameState.startPlayerIndex || p.position !== null
                    );
                    if (othersPlaced) {
                        gameState.canMoveStartPlayer = true;
                    }
                }

                await gameState.save();

                // Verificar si todos han colocado
                const allPlaced = gameState.players.every(p => p.position !== null);
                if (allPlaced && !gameState.canMoveStartPlayer) {
                    gameState.canMoveStartPlayer = true;
                    await gameState.save();
                }

                io.to(lobbyCode).emit('game-update', formatGameState(gameState));
            }

        } catch (error) {
            console.error('Error placing arrow:', error);
        }
    });

    // Cambiar pregunta
    socket.on('skip-question', async ({ lobbyCode, playerId }) => {
        try {
            if (!lobbyCode || !playerId) {
                socket.emit('error', { message: 'Datos incompletos' });
                return;
            }

            const gameState = await GameState.findOne({ lobbyCode });

            if (!gameState || gameState.phase !== 'answering') {
                return;
            }

            // Solo el jugador inicial puede cambiar la pregunta
            const startPlayer = gameState.players[gameState.startPlayerIndex];
            if (!startPlayer || startPlayer.id !== playerId) {
                return;
            }

            // Obtener una nueva carta
            const card = cardManager.getRandomCard(gameState.usedCardIds);
            
            if (!card) {
                socket.emit('error', { message: 'No hay más preguntas disponibles' });
                return;
            }

            gameState.currentCard = card;
            gameState.usedCardIds.push(card.id);

            // Reset de respuestas
            gameState.players.forEach(p => {
                p.answer = null;
            });

            gameState.lastActivity = new Date();
            await gameState.save();

            io.to(lobbyCode).emit('game-update', formatGameState(gameState));

        } catch (error) {
            console.error('Error skipping question:', error);
        }
    });

    // Revelar respuestas
    socket.on('reveal-answers', async ({ lobbyCode }) => {
        try {
            if (!lobbyCode) {
                socket.emit('error', { message: 'Código de sala requerido' });
                return;
            }

            const gameState = await GameState.findOne({ lobbyCode });

            if (!gameState || gameState.phase !== 'placing') {
                return;
            }

            gameState.phase = 'revealing';
            gameState.lastActivity = new Date();
            await gameState.save();

            io.to(lobbyCode).emit('game-update', formatGameState(gameState));

        } catch (error) {
            console.error('Error revealing answers:', error);
        }
    });

    // Calcular puntuación y pasar a siguiente ronda
    socket.on('next-round', async ({ lobbyCode, roundScore }) => {
        try {
            if (!lobbyCode || roundScore === undefined) {
                socket.emit('error', { message: 'Datos incompletos' });
                return;
            }

            const gameState = await GameState.findOne({ lobbyCode });

            if (!gameState) {
                return;
            }

            // Guardar puntuación de la ronda
            gameState.roundScores.push(roundScore);
            gameState.totalScore += roundScore;

            // Reset de respuestas y posiciones
            gameState.players.forEach(p => {
                p.answer = null;
                p.position = null;
            });

            // Pasar al siguiente jugador inicial
            gameState.startPlayerIndex = (gameState.startPlayerIndex + 1) % gameState.players.length;
            gameState.canMoveStartPlayer = false;

            // Verificar si el juego terminó
            if (gameState.currentRound >= gameState.maxRounds) {
                gameState.phase = 'finished';
                gameState.status = 'finished';
            } else {
                // Siguiente ronda
                gameState.currentRound++;
                const card = cardManager.getRandomCard(gameState.usedCardIds);

                if (card) {
                    gameState.currentCard = card;
                    gameState.usedCardIds.push(card.id);
                    gameState.phase = 'answering';
                } else {
                    gameState.phase = 'finished';
                    gameState.status = 'finished';
                }
            }

            gameState.lastActivity = new Date();
            await gameState.save();

            io.to(lobbyCode).emit('game-update', formatGameState(gameState));

        } catch (error) {
            console.error('Error next round:', error);
        }
    });

    // Desconexión
    socket.on('disconnect', async () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);

        // Aquí podrías marcar al jugador como desconectado pero no eliminarlo
        // para permitir reconexión. La limpieza se hace automáticamente por TTL en MongoDB
    });
});

// Helper para formatear el estado del juego
function formatGameState(gameState, requestingPlayerId = null) {
    const formatted = {
        lobbyCode: gameState.lobbyCode,
        players: gameState.players.map(p => ({
            id: p.id,
            name: p.name,
            color: p.color,
            connected: p.connected,
            hasAnswered: p.answer !== null,
            hasPlaced: p.position !== null,
            // Solo mostrar respuestas en fase revealing
            answer: gameState.phase === 'revealing' ? p.answer : null,
            position: p.position
        })),
        currentRound: gameState.currentRound,
        maxRounds: gameState.maxRounds,
        totalScore: gameState.totalScore,
        phase: gameState.phase,
        currentCard: gameState.currentCard,
        startPlayerIndex: gameState.startPlayerIndex,
        canMoveStartPlayer: gameState.canMoveStartPlayer,
        roundScores: gameState.roundScores,
        status: gameState.status
    };

    return formatted;
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
