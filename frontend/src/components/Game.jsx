import { useState, useEffect } from 'react';
import './Game.css';

function Game({ socket, lobbyCode, gameState, playerId, onLeave }) {
  const [answer, setAnswer] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);

  if (!gameState) {
    return <div className="game loading">Cargando...</div>;
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isStartPlayer = gameState.players[gameState.startPlayerIndex]?.id === playerId;
  const sortedAnswers = [...gameState.players]
    .filter(p => p.position !== null)
    .sort((a, b) => a.position - b.position);

  const handleSubmitAnswer = () => {
    const num = parseFloat(answer);
    if (isNaN(num) || answer.trim() === '') {
      alert('Por favor ingresa un número válido');
      return;
    }
    
    if (gameState.currentCard?.scale0to100 && (num < 0 || num > 100)) {
      alert('La respuesta debe estar entre 0 y 100');
      return;
    }
    
    socket.emit('submit-answer', {
      lobbyCode,
      playerId,
      answer: num
    });
    
    setAnswer('');
  };

  const handlePlaceArrow = (position) => {
    setSelectedPosition(position);
    socket.emit('place-arrow', {
      lobbyCode,
      playerId,
      position
    });
  };

  const handleReveal = () => {
    socket.emit('reveal-answers', { lobbyCode });
  };

  const calculateScore = () => {
    // Ordenar jugadores por posición
    const sorted = [...gameState.players]
      .filter(p => p.position !== null)
      .sort((a, b) => a.position - b.position);
    
    // Verificar orden correcto
    let correctCount = 0;
    let lastAnswer = -Infinity;
    
    for (const player of sorted) {
      if (player.answer >= lastAnswer) {
        correctCount++;
        lastAnswer = player.answer;
      } else {
        break; // Se rompe la secuencia
      }
    }
    
    return correctCount;
  };

  const handleNextRound = () => {
    const score = calculateScore();
    socket.emit('next-round', {
      lobbyCode,
      roundScore: score
    });
  };

  // Fase: Respondiendo
  if (gameState.phase === 'answering') {
    const allAnswered = gameState.players.every(p => p.hasAnswered);
    const iAnswered = currentPlayer?.hasAnswered;

    return (
      <div className="game">
        <GameHeader gameState={gameState} onLeave={onLeave} />
        
        <div className="game-content">
          <div className="card-display">
            <div className="card">
              {gameState.currentCard?.scale0to100 && (
                <div className="card-badge">0-100</div>
              )}
              <p className="card-text">{gameState.currentCard?.text}</p>
              <p className="card-category">{gameState.currentCard?.categoryName}</p>
            </div>
          </div>
          
          {!iAnswered ? (
            <div className="answer-section">
              <h3>Tu respuesta</h3>
              <div className="answer-input-group">
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Ingresa un número"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  autoFocus
                />
                <button className="btn btn-primary" onClick={handleSubmitAnswer}>
                  Enviar
                </button>
              </div>
              {gameState.currentCard?.scale0to100 && (
                <p className="hint">Responde con un número del 0 al 100</p>
              )}
            </div>
          ) : (
            <div className="waiting-section">
              <p className="status-message">✅ Respuesta enviada</p>
              <p className="waiting-text">
                Esperando a los demás jugadores... ({gameState.players.filter(p => p.hasAnswered).length}/{gameState.players.length})
              </p>
              <PlayerList players={gameState.players} playerId={playerId} showAnswered={true} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fase: Colocando flechas
  if (gameState.phase === 'placing') {
    const allPlaced = gameState.players.every(p => p.hasPlaced);
    const iPlaced = currentPlayer?.hasPlaced;
    const canMove = isStartPlayer && gameState.canMoveStartPlayer;

    return (
      <div className="game">
        <GameHeader gameState={gameState} onLeave={onLeave} />
        
        <div className="game-content">
          <div className="placing-section">
            <h3>Coloca tu respuesta</h3>
            <p className="instruction">
              {!iPlaced 
                ? 'Predice dónde va tu respuesta en orden ascendente (de menor a mayor)'
                : canMove
                ? '¡Eres el jugador inicial! Puedes mover tu respuesta o revelar'
                : 'Esperando a que todos coloquen sus respuestas...'
              }
            </p>
            
            <div className="arrows-container">
              {(!iPlaced || canMove) && (
                <button
                  className={`position-slot ${selectedPosition === 0 ? 'selected' : ''}`}
                  onClick={() => handlePlaceArrow(0)}
                >
                  {selectedPosition === 0 ? '⬇️ Tu respuesta' : '➕ Colocar aquí'}
                </button>
              )}
              
              {sortedAnswers.map((player, index) => (
                <div key={player.id}>
                  <div 
                    className="placed-arrow"
                    style={{ backgroundColor: player.color }}
                  >
                    <span className="arrow-name">{player.name}</span>
                    <span className="arrow-icon">❓</span>
                  </div>
                  
                  {(!iPlaced || canMove) && (
                    <button
                      className={`position-slot ${selectedPosition === index + 1 ? 'selected' : ''}`}
                      onClick={() => handlePlaceArrow(index + 1)}
                    >
                      {selectedPosition === index + 1 ? '⬇️ Tu respuesta' : '➕ Colocar aquí'}
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {canMove && (
              <button className="btn btn-primary btn-large" onClick={handleReveal}>
                Revelar Respuestas
              </button>
            )}
            
            <PlayerList players={gameState.players} playerId={playerId} showPlaced={true} />
          </div>
        </div>
      </div>
    );
  }

  // Fase: Revelando
  if (gameState.phase === 'revealing') {
    const score = calculateScore();
    
    return (
      <div className="game">
        <GameHeader gameState={gameState} onLeave={onLeave} />
        
        <div className="game-content">
          <div className="reveal-section">
            <h3>¡Resultados!</h3>
            
            <div className="revealed-arrows">
              {sortedAnswers.map((player) => {
                const isCorrect = calculateIsCorrect(player, sortedAnswers);
                return (
                  <div 
                    key={player.id}
                    className={`revealed-arrow ${isCorrect ? 'correct' : 'incorrect'}`}
                    style={{ borderColor: player.color }}
                  >
                    <div 
                      className="arrow-color" 
                      style={{ backgroundColor: player.color }}
                    />
                    <div className="arrow-info">
                      <span className="arrow-name">{player.name}</span>
                      <span className="arrow-answer">{player.answer}</span>
                    </div>
                    <span className="arrow-status">
                      {isCorrect ? '✅' : '❌'}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="round-score">
              <h2>Puntos esta ronda: {score}</h2>
              <p>Total acumulado: {gameState.totalScore + score}</p>
            </div>
            
            {isStartPlayer && (
              <button className="btn btn-primary btn-large" onClick={handleNextRound}>
                {gameState.currentRound >= gameState.maxRounds ? 'Ver Resultados Finales' : 'Siguiente Ronda'}
              </button>
            )}
            
            {!isStartPlayer && (
              <p className="waiting-text">Esperando al jugador inicial...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fase: Juego terminado
  if (gameState.phase === 'finished') {
    const playerCount = gameState.players.length;
    const totalScore = gameState.totalScore;
    const rating = getRating(totalScore, playerCount);

    return (
      <div className="game">
        <div className="game-content">
          <div className="finished-section">
            <h1>🎉 ¡Juego Terminado!</h1>
            
            <div className="final-score">
              <h2>{totalScore} puntos</h2>
              <p className="rating">{rating.label}</p>
              <p className="rating-description">{rating.description}</p>
            </div>
            
            <div className="round-summary">
              <h3>Resumen de rondas:</h3>
              {gameState.roundScores.map((score, index) => (
                <div key={index} className="round-item">
                  Ronda {index + 1}: {score} puntos
                </div>
              ))}
            </div>
            
            <div className="players-final">
              <h3>Jugadores:</h3>
              {gameState.players.map(player => (
                <div key={player.id} className="player-final" style={{ borderColor: player.color }}>
                  <div className="player-color" style={{ backgroundColor: player.color }} />
                  {player.name}
                </div>
              ))}
            </div>
            
            <button className="btn btn-primary btn-large" onClick={onLeave}>
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function GameHeader({ gameState, onLeave }) {
  return (
    <div className="game-header">
      <div className="game-info">
        <span>Ronda {gameState.currentRound}/{gameState.maxRounds}</span>
        <span>Puntos: {gameState.totalScore}</span>
      </div>
      <button className="btn btn-ghost btn-small" onClick={onLeave}>
        Salir
      </button>
    </div>
  );
}

function PlayerList({ players, playerId, showAnswered, showPlaced }) {
  return (
    <div className="players-status">
      {players.map(player => (
        <div 
          key={player.id}
          className={`player-status ${player.id === playerId ? 'current' : ''}`}
          style={{ borderColor: player.color }}
        >
          <div className="player-color" style={{ backgroundColor: player.color }} />
          <span>{player.name}</span>
          {showAnswered && (
            <span className="status-icon">{player.hasAnswered ? '✅' : '⏳'}</span>
          )}
          {showPlaced && (
            <span className="status-icon">{player.hasPlaced ? '✅' : '⏳'}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function calculateIsCorrect(player, sortedAnswers) {
  const index = sortedAnswers.findIndex(p => p.id === player.id);
  if (index === 0) return true;
  
  const prevPlayer = sortedAnswers[index - 1];
  return player.answer >= prevPlayer.answer;
}

function getRating(score, playerCount) {
  const ratings = {
    4: [
      { max: 12, label: 'Bajo', description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!' },
      { max: 19, label: 'Medio', description: 'En la media, pero podéis hacerlo mejor.' },
      { max: 26, label: 'Bueno', description: 'Buena partida, le estáis pillando el truco.' },
      { max: 31, label: 'Excelente', description: '¡Excelente! ¡A un paso de la perfección!' },
      { max: 32, label: 'Perfecto', description: '¡Perfecto! Entre vosotros ya no hay secretos.' }
    ],
    5: [
      { max: 13, label: 'Bajo', description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!' },
      { max: 23, label: 'Medio', description: 'En la media, pero podéis hacerlo mejor.' },
      { max: 33, label: 'Bueno', description: 'Buena partida, le estáis pillando el truco.' },
      { max: 39, label: 'Excelente', description: '¡Excelente! ¡A un paso de la perfección!' },
      { max: 40, label: 'Perfecto', description: '¡Perfecto! Entre vosotros ya no hay secretos.' }
    ],
    6: [
      { max: 15, label: 'Bajo', description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!' },
      { max: 27, label: 'Medio', description: 'En la media, pero podéis hacerlo mejor.' },
      { max: 39, label: 'Bueno', description: 'Buena partida, le estáis pillando el truco.' },
      { max: 47, label: 'Excelente', description: '¡Excelente! ¡A un paso de la perfección!' },
      { max: 48, label: 'Perfecto', description: '¡Perfecto! Entre vosotros ya no hay secretos.' }
    ],
    7: [
      { max: 17, label: 'Bajo', description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!' },
      { max: 31, label: 'Medio', description: 'En la media, pero podéis hacerlo mejor.' },
      { max: 45, label: 'Bueno', description: 'Buena partida, le estáis pillando el truco.' },
      { max: 55, label: 'Excelente', description: '¡Excelente! ¡A un paso de la perfección!' },
      { max: 56, label: 'Perfecto', description: '¡Perfecto! Entre vosotros ya no hay secretos.' }
    ],
    8: [
      { max: 19, label: 'Bajo', description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!' },
      { max: 35, label: 'Medio', description: 'En la media, pero podéis hacerlo mejor.' },
      { max: 51, label: 'Bueno', description: 'Buena partida, le estáis pillando el truco.' },
      { max: 63, label: 'Excelente', description: '¡Excelente! ¡A un paso de la perfección!' },
      { max: 64, label: 'Perfecto', description: '¡Perfecto! Entre vosotros ya no hay secretos.' }
    ]
  };

  const ratingTable = ratings[playerCount] || ratings[4];
  return ratingTable.find(r => score <= r.max) || ratingTable[ratingTable.length - 1];
}

export default Game;
