import { useEffect } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, message, type = 'info', actions }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-icon ${type}`}>{getIcon()}</div>
        {title && <h2 className="modal-title">{title}</h2>}
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          {actions ? (
            actions.map((action, index) => (
              <button
                key={index}
                className={`btn ${action.className || 'btn-ghost'}`}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
              >
                {action.label}
              </button>
            ))
          ) : (
            <button className="btn btn-primary" onClick={onClose}>
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
