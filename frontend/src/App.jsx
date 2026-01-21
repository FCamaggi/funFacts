import { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { initSocket, api, storage, generatePlayerId } from './services/api';

function App() {
  const [screen, setScreen] = useState('home'); // home, lobby, game
  const [lobbyCode, setLobbyCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState(null);
  const [socket, setSocket] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    // Intentar recuperar sesión anterior
    const savedPlayer = storage.getPlayer();
    if (savedPlayer) {
      setReconnecting(true);
      attemptReconnect(savedPlayer);
    }
  }, []);

  const attemptReconnect = async (savedPlayer) => {
    try {
      // Verificar que el lobby siga existiendo
      await api.checkLobby(savedPlayer.lobbyCode);
      
      // Reconectar
      const sock = initSocket();
      setSocket(sock);
      setPlayerId(savedPlayer.playerId);
      setPlayerName(savedPlayer.playerName);
      setLobbyCode(savedPlayer.lobbyCode);
      
      sock.emit('join-lobby', {
        lobbyCode: savedPlayer.lobbyCode,
        playerName: savedPlayer.playerName,
        playerId: savedPlayer.playerId
      });
      
      setScreen('lobby');
      setReconnecting(false);
    } catch (error) {
      console.error('Failed to reconnect:', error);
      storage.clearPlayer();
      setReconnecting(false);
    }
  };

  const handleCreateLobby = async (name) => {
    try {
      const { lobbyCode: code } = await api.createLobby();
      const pid = generatePlayerId();
      
      setPlayerName(name);
      setLobbyCode(code);
      setPlayerId(pid);
      
      const sock = initSocket();
      setSocket(sock);
      setupSocketListeners(sock);
      
      sock.emit('join-lobby', {
        lobbyCode: code,
        playerName: name,
        playerId: pid
      });
      
      storage.savePlayer(pid, name, code);
      setScreen('lobby');
    } catch (error) {
      console.error('Error creating lobby:', error);
      alert('Error al crear la sala. Intenta de nuevo.');
    }
  };

  const handleJoinLobby = async (code, name) => {
    try {
      await api.checkLobby(code);
      
      const pid = generatePlayerId();
      setPlayerName(name);
      setLobbyCode(code);
      setPlayerId(pid);
      
      const sock = initSocket();
      setSocket(sock);
      setupSocketListeners(sock);
      
      sock.emit('join-lobby', {
        lobbyCode: code,
        playerName: name,
        playerId: pid
      });
      
      storage.savePlayer(pid, name, code);
      setScreen('lobby');
    } catch (error) {
      console.error('Error joining lobby:', error);
      alert('Sala no encontrada. Verifica el código.');
    }
  };

  const setupSocketListeners = (sock) => {
    sock.on('joined-lobby', (data) => {
      setGameState(data.gameState);
      if (data.gameState.phase !== 'waiting') {
        setScreen('game');
      }
    });

    sock.on('game-update', (data) => {
      setGameState(data);
      if (data.phase !== 'waiting' && screen !== 'game') {
        setScreen('game');
      }
    });

    sock.on('error', (data) => {
      console.error('Socket error:', data);
      alert(data.message || 'Error de conexión');
    });

    sock.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    sock.on('reconnect', () => {
      console.log('Reconnected to server');
      // Reintentar unirse al lobby
      if (lobbyCode && playerId && playerName) {
        sock.emit('join-lobby', {
          lobbyCode,
          playerName,
          playerId
        });
      }
    });
  };

  const handleStartGame = () => {
    if (socket && gameState?.players?.length >= 3) {
      socket.emit('start-game', { lobbyCode, playerId });
    } else {
      alert('Necesitas al menos 3 jugadores para empezar');
    }
  };

  const handleLeaveGame = () => {
    storage.clearPlayer();
    if (socket) {
      socket.disconnect();
    }
    setScreen('home');
    setLobbyCode('');
    setPlayerId('');
    setPlayerName('');
    setGameState(null);
  };

  if (reconnecting) {
    return (
      <div className="app">
        <div className="reconnecting">
          <h2>Reconectando...</h2>
          <p>Recuperando tu partida</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <Home 
          onCreateLobby={handleCreateLobby}
          onJoinLobby={handleJoinLobby}
        />
      )}
      
      {screen === 'lobby' && (
        <Lobby 
          lobbyCode={lobbyCode}
          gameState={gameState}
          playerId={playerId}
          onStartGame={handleStartGame}
          onLeave={handleLeaveGame}
        />
      )}
      
      {screen === 'game' && (
        <Game 
          socket={socket}
          lobbyCode={lobbyCode}
          gameState={gameState}
          playerId={playerId}
          onLeave={handleLeaveGame}
        />
      )}
    </div>
  );
}

export default App;
