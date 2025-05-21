import React from 'react';
import { useGameContext } from '../../context/GameContext';

interface AboutProps {
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ onClose }) => {
  const { settings,  } = useGameContext();
  const theme = settings?.theme || 'dark';

  const handleClose = () => {
    
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        padding: '40px',
        borderRadius: '20px',
        maxWidth: '600px',
        position: 'relative',
        color: theme === 'dark' ? '#e0e0e0' : '#333',
      }}>
        <h2 style={{
          color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
          marginBottom: '20px',
          fontSize: '2rem',
          textAlign: 'center',
        }}>
          About TypeShip
        </h2>

        <div style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          <p>TypeShip is a modern typing game designed to help you improve your typing speed and accuracy in a fun, space-themed environment.</p>
          <p style={{ marginTop: '10px' }}>Created by Ata Tunç Bilge</p>
        </div>

        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
            cursor: 'pointer',
            padding: '10px',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default About;
