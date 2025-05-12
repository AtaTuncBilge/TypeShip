import React from 'react';
import { useGameContext } from 'GameContext';

const Stats = ({ wpm, accuracy }) => {
  const { theme, toggleSettings } = useGameContext();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ 
          padding: '8px 15px',
          borderRadius: '20px',
          backgroundColor: theme === 'light' ? '#e3f2fd' : '#2c3e50',
          color: theme === 'light' ? '#0d47a1' : '#ecf0f1'
        }}>
          <span style={{ fontWeight: 'bold' }}>WPM: </span>{wpm}
        </div>
        <div style={{ 
          padding: '8px 15px',
          borderRadius: '20px',
          backgroundColor: theme === 'light' ? '#e8f5e9' : '#2c3e50',
          color: theme === 'light' ? '#1b5e20' : '#ecf0f1'
        }}>
          <span style={{ fontWeight: 'bold' }}>Accuracy: </span>{accuracy}%
        </div>
      </div>
      <button 
        onClick={toggleSettings}
        style={{
          padding: '8px 15px',
          backgroundColor: theme === 'light' ? '#f1f1f1' : '#444',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: theme === 'light' ? '#333' : '#f1f1f1'
        }}
      >
        ⚙️ Settings
      </button>
    </div>
  );
};

export default Stats;