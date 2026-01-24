import { useState } from 'react';
import './Home.css';
import Modal from './Modal';

function Home({ onCreateLobby, onJoinLobby }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState(''); // '', 'create', 'join'
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const showModal = (title, message, type = 'info') => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showModal('Error', 'Por favor ingresa tu nombre', 'error');
      return;
    }

    if (mode === 'create') {
      onCreateLobby(name.trim());
    } else if (mode === 'join') {
      if (!joinCode.trim()) {
        showModal('Error', 'Por favor ingresa el código de la sala', 'error');
        return;
      }
      onJoinLobby(joinCode.trim().toUpperCase(), name.trim());
    }
  };

  return (
    <div className="home">
      <div className="home-container">
        <h1 className="title">🎯 Fun Facts</h1>
        <p className="subtitle">¿Qué tan bien conoces a tus amigos?</p>

        {mode === '' && (
          <div className="mode-selection">
            <button
              className="btn btn-primary btn-large"
              onClick={() => setMode('create')}
            >
              Crear Nueva Sala
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => setMode('join')}
            >
              Unirse a una Sala
            </button>
          </div>
        )}

        {mode !== '' && (
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Tu nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre"
                maxLength={20}
                autoFocus
              />
            </div>

            {mode === 'join' && (
              <div className="form-group">
                <label>Código de sala</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  maxLength={6}
                  style={{
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    fontSize: '1.5em',
                  }}
                />
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setMode('')}
              >
                Volver
              </button>
              <button type="submit" className="btn btn-primary">
                {mode === 'create' ? 'Crear Sala' : 'Unirse'}
              </button>
            </div>
          </form>
        )}

        <div className="game-info">
          <h3>¿Cómo se juega?</h3>
          <ul>
            <li>3-8 jugadores responden preguntas con números</li>
            <li>Intenta ordenar las respuestas de menor a mayor</li>
            <li>Gana puntos por cada respuesta bien colocada</li>
            <li>8 rondas para demostrar cuánto se conocen</li>
          </ul>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}

export default Home;
