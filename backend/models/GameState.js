import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    connected: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    answer: { type: Number, default: null },
    position: { type: Number, default: null }
});

const gameStateSchema = new mongoose.Schema({
    lobbyCode: { type: String, required: true, unique: true, index: true },
    players: [playerSchema],
    currentRound: { type: Number, default: 1 },
    maxRounds: { type: Number, default: 8 },
    totalScore: { type: Number, default: 0 },
    phase: { type: String, enum: ['waiting', 'answering', 'placing', 'revealing', 'finished'], default: 'waiting' },
    currentCard: {
        id: String,
        categoryId: String,
        categoryName: String,
        text: String,
        scale0to100: Boolean
    },
    usedCardIds: [String],
    startPlayerIndex: { type: Number, default: 0 },
    canMoveStartPlayer: { type: Boolean, default: false },
    roundScores: [Number],
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'finished', 'abandoned'], default: 'active' }
});

// Índice para limpiar partidas antiguas
gameStateSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 }); // 24 horas

const GameState = mongoose.model('GameState', gameStateSchema);

export default GameState;
