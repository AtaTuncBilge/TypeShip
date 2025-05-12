import React, { useState, useEffect } from 'react';
import { useGameContext } from 'GameContext';

const PlayerNameInput = () => {
  const { theme } = useGameContext();
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Load the player name from localStorage when component mounts
  useEffect(() => {
    const savedName = localStorage.getItem('typingGamePlayerName');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (playerName.trim()) {
      localStorage.setItem('typingGamePlayerName', playerName.trim());
      setIsSaved(true);
      
      // Hide the success message after 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    }
  };

  return (
    <div style={{
      marginTop: '15px',
      padding: '15px',
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#2a2a2a',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 10px 0',
        color: theme === 'light' ? '#333' : '#f1f1f1',
        fontSize: '1rem'
      }}>
        Set Your Leaderboard Name
      </h3>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={playerName}
          onChange={handleNameChange}
          placeholder="Enter your name"
          maxLength={15}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '4px',
            border: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
            backgroundColor: theme === 'light' ? '#fff' : '#333',
            color: theme === 'light' ? '#333' : '#f1f1f1',
            fontSize: '0.9rem'
          }}
        />
        
        <button
          onClick={handleSave}
          disabled={!playerName.trim() || isSaved}
          style={{
            padding: '8px 16px',
            backgroundColor: isSaved ? '#4CAF50' : (theme === 'light' ? '#007bff' : '#0069d9'),
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: playerName.trim() ? 'pointer' : 'not-allowed',
            opacity: playerName.trim() ? 1 : 0.7,
            transition: 'background-color 0.2s ease',
            fontSize: '0.9rem'
          }}
        >
          {isSaved ? 'Saved!' : 'Save'}
        </button>
      </div>
      
      {playerName.trim() && (
        <div style={{ 
          marginTop: '8px',
          fontSize: '0.8rem',
          color: theme === 'light' ? '#666' : '#aaa'
        }}>
          Your scores will appear as "<strong>{playerName.trim()}</strong>" on the leaderboard
        </div>
      )}
    </div>
  );
};

export default PlayerNameInput;