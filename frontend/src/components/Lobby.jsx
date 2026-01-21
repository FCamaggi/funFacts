import './Lobby.css';

function Lobby({ lobbyCode, gameState, playerId, onStartGame, onLeave }) {
  if (!gameState) {
    return <div className="lobby loading">Cargando...</div>;
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isFirstPlayer = gameState.players[0]?.id === playerId;
  const canStart = gameState.players.length >= 3 && isFirstPlayer;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(lobbyCode);
    alert('¡Código copiado!');
  };

  return (
    <div className="lobby">
      <div className="lobby-container">
        <h1>Sala de Espera</h1>
        
        <div className="lobby-code-section">
          <p>Código de la sala:</p>
          <div className="lobby-code" onClick={copyCodeToClipboard}>
            {lobbyCode}
            <span className="copy-hint">📋 Click para copiar</span>
          </div>
        </div>
        
        <div className="players-section">
          <h2>Jugadores ({gameState.players.length}/8)</h2>
          <div className="players-list">
            {gameState.players.map((player, index) => (
              <div 
                key={player.id} 
                className={`player-card ${player.id === playerId ? 'current' : ''} ${!player.connected ? 'disconnected' : ''}`}
                style={{ borderColor: player.color }}
              >
                <div 
                  className="player-color" 
                  style={{ backgroundColor: player.color }}
                />
                <div className="player-info">
                  <span className="player-name">
                    {player.name}
                    {player.id === playerId && ' (Tú)'}
                    {index === 0 && ' 👑'}
                  </span>
                  {!player.connected && (
                    <span className="player-status">Desconectado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lobby-info">
          {gameState.players.length < 3 && (
            <p className="warning">⚠️ Se necesitan al menos 3 jugadores para empezar</p>
          )}
          {isFirstPlayer && gameState.players.length >= 3 && (
            <p className="info">✅ ¡Listo para empezar! Tú eres el host.</p>
          )}
          {!isFirstPlayer && gameState.players.length >= 3 && (
            <p className="info">⏳ Esperando a que el host inicie la partida...</p>
          )}
        </div>
        
        <div className="lobby-actions">
          <button className="btn btn-ghost" onClick={onLeave}>
            Salir
          </button>
          {canStart && (
            <button className="btn btn-primary btn-large" onClick={onStartGame}>
              Iniciar Juego
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lobby;
