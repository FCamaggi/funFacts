import { useState, useEffect } from 'react';
import './Game.css';
import Modal from './Modal';

function Game({ socket, lobbyCode, gameState, playerId, onLeave }) {
  const [answer, setAnswer] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [previewPosition, setPreviewPosition] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    actions: null,
  });

  // Limpiar preview cuando cambia la fase o cuando el jugador ya colocó
  useEffect(() => {
    if (gameState?.phase !== 'placing') {
      setPreviewPosition(null);
      setSelectedPosition(null);
    } else {
      const currentPlayer = gameState.players.find((p) => p.id === playerId);
      if (currentPlayer?.position !== null) {
        setPreviewPosition(null);
        setSelectedPosition(currentPlayer.position);
      }
    }
  }, [gameState, playerId]);

  if (!gameState) {
    return <div className="game loading">Cargando...</div>;
  }

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const showModal = (title, message, type = 'info', actions = null) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      actions,
    });
  };

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const isStartPlayer =
    gameState.players[gameState.startPlayerIndex]?.id === playerId;
  const sortedAnswers = [...gameState.players]
    .filter((p) => p.position !== null)
    .sort((a, b) => a.position - b.position);

  const handleSubmitAnswer = () => {
    const num = parseFloat(answer);
    if (isNaN(num) || answer.trim() === '') {
      showModal('Error', 'Por favor ingresa un número válido', 'error');
      return;
    }

    if (gameState.currentCard?.scale0to100 && (num < 0 || num > 100)) {
      showModal('Error', 'La respuesta debe estar entre 0 y 100', 'error');
      return;
    }

    socket.emit('submit-answer', {
      lobbyCode,
      playerId,
      answer: num,
    });

    setAnswer('');
  };

  const handleSkipQuestion = () => {
    showModal(
      'Cambiar pregunta',
      '¿Estás seguro de que quieres cambiar esta pregunta? Todos deberán responder de nuevo.',
      'confirm',
      [
        {
          label: 'Cancelar',
          className: 'btn-ghost',
          onClick: () => {},
        },
        {
          label: 'Cambiar',
          className: 'btn-primary',
          onClick: () => {
            socket.emit('skip-question', { lobbyCode, playerId });
          },
        },
      ]
    );
  };

  const handleSelectPosition = (position) => {
    setPreviewPosition(position);
  };

  const handleConfirmPlacement = () => {
    if (previewPosition === null) return;
    
    setSelectedPosition(previewPosition);
    socket.emit('place-arrow', {
      lobbyCode,
      playerId,
      position: previewPosition,
    });
  };

  const handleCancelPlacement = () => {
    setPreviewPosition(null);
  };

  const handleReveal = () => {
    socket.emit('reveal-answers', { lobbyCode });
  };

  const calculateScore = () => {
    // Ordenar jugadores por posición
    const sorted = [...gameState.players]
      .filter((p) => p.position !== null)
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
      roundScore: score,
    });
  };

  // Fase: Respondiendo
  if (gameState.phase === 'answering') {
    const allAnswered = gameState.players.every((p) => p.hasAnswered);
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
              <p className="card-category">
                {gameState.currentCard?.categoryName}
              </p>
            </div>
          </div>

          {isStartPlayer && !iAnswered && (
            <div className="skip-question-container">
              <button
                className="btn btn-ghost btn-small"
                onClick={handleSkipQuestion}
              >
                🔄 Cambiar pregunta
              </button>
            </div>
          )}

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
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitAnswer}
                >
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
                Esperando a los demás jugadores... (
                {gameState.players.filter((p) => p.hasAnswered).length}/
                {gameState.players.length})
              </p>
              <PlayerList
                players={gameState.players}
                playerId={playerId}
                showAnswered={true}
              />
            </div>
          )}
        </div>

        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          actions={modal.actions}
        />
      </div>
    );
  }

  // Fase: Colocando flechas
  if (gameState.phase === 'placing') {
    const allPlaced = gameState.players.every((p) => p.hasPlaced);
    const iPlaced = currentPlayer?.hasPlaced;
    const canMove = isStartPlayer && gameState.canMoveStartPlayer;
    
    // Determinar si es el turno de este jugador
    const currentPlayerIndex = gameState.players.findIndex((p) => p.id === playerId);
    const isMyTurn =
      gameState.currentPlayerTurn !== null &&
      gameState.currentPlayerTurn !== undefined &&
      gameState.currentPlayerTurn === currentPlayerIndex;
    const currentTurnPlayer = 
      gameState.currentPlayerTurn !== null && gameState.currentPlayerTurn !== undefined
        ? gameState.players[gameState.currentPlayerTurn]
        : null;

    return (
      <div className="game">
        <GameHeader gameState={gameState} onLeave={onLeave} />

        <div className="game-content">
          <div className="placing-section">
            <h3>Coloca tu respuesta</h3>
            <p className="instruction">
              {canMove
                ? previewPosition !== null
                  ? '¡Ya casi! Confirma tu posición o cancela para elegir otra'
                  : '¡Eres el jugador inicial! Puedes ajustar tu posición o revelar las respuestas'
                : isMyTurn
                  ? previewPosition !== null
                    ? '¡Perfecto! Confirma donde quieres colocar tu respuesta'
                    : '¡Es tu turno! Predice dónde va tu respuesta en orden ascendente (menor a mayor)'
                  : currentTurnPlayer
                    ? `Esperando a ${currentTurnPlayer.name}...`
                    : 'Esperando a que todos coloquen sus respuestas...'}
            </p>

            <div className="arrows-container">
              {(isMyTurn || canMove) && (
                <>
                  {previewPosition === 0 ? (
                    <div
                      className="preview-arrow"
                      style={{ borderColor: currentPlayer?.color }}
                    >
                      <div
                        className="arrow-color-indicator"
                        style={{ backgroundColor: currentPlayer?.color }}
                      />
                      <span className="arrow-name">{currentPlayer?.name} (TÚ)</span>
                      <span className="arrow-icon">👤</span>
                    </div>
                  ) : (
                    <button
                      className={`position-slot ${selectedPosition === 0 ? 'placed' : ''}`}
                      onClick={() => handleSelectPosition(0)}
                      disabled={selectedPosition !== null}
                    >
                      <span className="slot-number">#1</span>
                      {selectedPosition === 0 ? '✓ Colocado aquí' : '➕ Colocar aquí (posición 1)'}
                    </button>
                  )}
                </>
              )}

              {sortedAnswers.map((player, index) => (
                <div key={player.id}>
                  <div
                    className="placed-arrow"
                    style={{ borderColor: player.color }}
                  >
                    <div
                      className="arrow-color-indicator"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="arrow-name">{player.name}</span>
                    <span className="arrow-icon">🎯</span>
                  </div>

                  {(isMyTurn || canMove) && (
                    <>
                      {previewPosition === index + 1 ? (
                        <div
                          className="preview-arrow"
                          style={{ borderColor: currentPlayer?.color }}
                        >
                          <div
                            className="arrow-color-indicator"
                            style={{ backgroundColor: currentPlayer?.color }}
                          />
                          <span className="arrow-name">{currentPlayer?.name} (TÚ)</span>
                          <span className="arrow-icon">👤</span>
                        </div>
                      ) : (
                        <button
                          className={`position-slot ${selectedPosition === index + 1 ? 'placed' : ''}`}
                          onClick={() => handleSelectPosition(index + 1)}
                          disabled={selectedPosition !== null}
                        >
                          <span className="slot-number">#{index + 2}</span>
                          {selectedPosition === index + 1
                            ? '✓ Colocado aquí'
                            : `➕ Colocar aquí (posición ${index + 2})`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {previewPosition !== null && (
              <div className="placement-controls">
                <button
                  className="btn btn-ghost"
                  onClick={handleCancelPlacement}
                >
                  ❌ Cancelar
                </button>
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleConfirmPlacement}
                >
                  ✓ Confirmar Posición
                </button>
              </div>
            )}

            {canMove && previewPosition === null && (
              <button
                className="btn btn-primary btn-large"
                onClick={handleReveal}
              >
                Revelar Respuestas
              </button>
            )}

            <PlayerList
              players={gameState.players}
              playerId={playerId}
              showPlaced={true}
            />
          </div>
        </div>

        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          actions={modal.actions}
        />
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
              <button
                className="btn btn-primary btn-large"
                onClick={handleNextRound}
              >
                {gameState.currentRound >= gameState.maxRounds
                  ? 'Ver Resultados Finales'
                  : 'Siguiente Ronda'}
              </button>
            )}

            {!isStartPlayer && (
              <p className="waiting-text">Esperando al jugador inicial...</p>
            )}
          </div>
        </div>

        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          actions={modal.actions}
        />
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
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="player-final"
                  style={{ borderColor: player.color }}
                >
                  <div
                    className="player-color"
                    style={{ backgroundColor: player.color }}
                  />
                  {player.name}
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-large" onClick={onLeave}>
              Volver al Inicio
            </button>
          </div>
        </div>

        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          actions={modal.actions}
        />
      </div>
    );
  }

  return null;
}

function GameHeader({ gameState, onLeave }) {
  return (
    <div className="game-header">
      <div className="game-info">
        <span>
          Ronda {gameState.currentRound}/{gameState.maxRounds}
        </span>
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
      {players.map((player) => (
        <div
          key={player.id}
          className={`player-status ${player.id === playerId ? 'current' : ''}`}
          style={{ borderColor: player.color }}
        >
          <div
            className="player-color"
            style={{ backgroundColor: player.color }}
          />
          <span>{player.name}</span>
          {showAnswered && (
            <span className="status-icon">
              {player.hasAnswered ? '✅' : '⏳'}
            </span>
          )}
          {showPlaced && (
            <span className="status-icon">
              {player.hasPlaced ? '✅' : '⏳'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function calculateIsCorrect(player, sortedAnswers) {
  const index = sortedAnswers.findIndex((p) => p.id === player.id);
  if (index === 0) return true;

  const prevPlayer = sortedAnswers[index - 1];
  return player.answer >= prevPlayer.answer;
}

function getRating(score, playerCount) {
  const ratings = {
    4: [
      {
        max: 12,
        label: 'Bajo',
        description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!',
      },
      {
        max: 19,
        label: 'Medio',
        description: 'En la media, pero podéis hacerlo mejor.',
      },
      {
        max: 26,
        label: 'Bueno',
        description: 'Buena partida, le estáis pillando el truco.',
      },
      {
        max: 31,
        label: 'Excelente',
        description: '¡Excelente! ¡A un paso de la perfección!',
      },
      {
        max: 32,
        label: 'Perfecto',
        description: '¡Perfecto! Entre vosotros ya no hay secretos.',
      },
    ],
    5: [
      {
        max: 13,
        label: 'Bajo',
        description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!',
      },
      {
        max: 23,
        label: 'Medio',
        description: 'En la media, pero podéis hacerlo mejor.',
      },
      {
        max: 33,
        label: 'Bueno',
        description: 'Buena partida, le estáis pillando el truco.',
      },
      {
        max: 39,
        label: 'Excelente',
        description: '¡Excelente! ¡A un paso de la perfección!',
      },
      {
        max: 40,
        label: 'Perfecto',
        description: '¡Perfecto! Entre vosotros ya no hay secretos.',
      },
    ],
    6: [
      {
        max: 15,
        label: 'Bajo',
        description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!',
      },
      {
        max: 27,
        label: 'Medio',
        description: 'En la media, pero podéis hacerlo mejor.',
      },
      {
        max: 39,
        label: 'Bueno',
        description: 'Buena partida, le estáis pillando el truco.',
      },
      {
        max: 47,
        label: 'Excelente',
        description: '¡Excelente! ¡A un paso de la perfección!',
      },
      {
        max: 48,
        label: 'Perfecto',
        description: '¡Perfecto! Entre vosotros ya no hay secretos.',
      },
    ],
    7: [
      {
        max: 17,
        label: 'Bajo',
        description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!',
      },
      {
        max: 31,
        label: 'Medio',
        description: 'En la media, pero podéis hacerlo mejor.',
      },
      {
        max: 45,
        label: 'Bueno',
        description: 'Buena partida, le estáis pillando el truco.',
      },
      {
        max: 55,
        label: 'Excelente',
        description: '¡Excelente! ¡A un paso de la perfección!',
      },
      {
        max: 56,
        label: 'Perfecto',
        description: '¡Perfecto! Entre vosotros ya no hay secretos.',
      },
    ],
    8: [
      {
        max: 19,
        label: 'Bajo',
        description: 'Por algún sitio hay que empezar. ¡Intentadlo de nuevo!',
      },
      {
        max: 35,
        label: 'Medio',
        description: 'En la media, pero podéis hacerlo mejor.',
      },
      {
        max: 51,
        label: 'Bueno',
        description: 'Buena partida, le estáis pillando el truco.',
      },
      {
        max: 63,
        label: 'Excelente',
        description: '¡Excelente! ¡A un paso de la perfección!',
      },
      {
        max: 64,
        label: 'Perfecto',
        description: '¡Perfecto! Entre vosotros ya no hay secretos.',
      },
    ],
  };

  const ratingTable = ratings[playerCount] || ratings[4];
  return (
    ratingTable.find((r) => score <= r.max) ||
    ratingTable[ratingTable.length - 1]
  );
}

export default Game;
