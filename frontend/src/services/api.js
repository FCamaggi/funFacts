import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

let socket = null;

export const initSocket = () => {
    if (!socket) {
        socket = io(WS_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            withCredentials: true
        });
    }
    return socket;
};

export const getSocket = () => socket;

export const api = {
    createLobby: async () => {
        const response = await fetch(`${API_URL}/api/lobby/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        return response.json();
    },

    checkLobby: async (code) => {
        const response = await fetch(`${API_URL}/api/lobby/${code}`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Lobby not found');
        }
        return response.json();
    }
};

// Gestión de persistencia local
export const storage = {
    savePlayer: (playerId, playerName, lobbyCode) => {
        localStorage.setItem('funfacts_player', JSON.stringify({
            playerId,
            playerName,
            lobbyCode,
            timestamp: Date.now()
        }));
    },

    getPlayer: () => {
        const data = localStorage.getItem('funfacts_player');
        if (!data) return null;

        const player = JSON.parse(data);
        // Verificar que no sea muy antiguo (más de 24 horas)
        if (Date.now() - player.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('funfacts_player');
            return null;
        }

        return player;
    },

    clearPlayer: () => {
        localStorage.removeItem('funfacts_player');
    }
};

// Generar ID único para el jugador
export const generatePlayerId = () => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
