import { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { THEME_COLORS } from '../../constants/theme';

const PlayerNameModal = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { settings } = useGameContext();
  const colors = settings.theme === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length >= 3) { // Ensure minimum 3 characters
      setIsSubmitting(true);
      localStorage.setItem('typingGamePlayerName', name.trim());
      onSubmit(name.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: colors.surface,
        padding: '30px',
        borderRadius: '15px',
        boxShadow: `0 0 30px ${colors.border}`,
        width: '90%',
        maxWidth: '400px',
      }}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter at least 3 characters..."
            minLength={3}
            maxLength={15}
            required
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: colors.buttonBg,
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              color: colors.text,
              fontSize: '1.1rem'
            }}
          />
          
          <div style={{ 
            color: colors.text,
            fontSize: '0.8rem',
            marginBottom: '20px'
          }}>
            {name.trim().length < 3 && 'Name must be at least 3 characters long'}
          </div>

          <button
            type="submit"
            disabled={name.trim().length < 3 || isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: colors.primary,
              opacity: name.trim().length < 3 ? 0.5 : 1,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1.1rem',
              cursor: name.trim().length < 3 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameModal;
