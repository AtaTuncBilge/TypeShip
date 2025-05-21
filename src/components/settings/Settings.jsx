import React, { useState } from 'react';
import { useGameContext } from '../../context/GameContext';

export const Settings = ({ onClose }) => {
  const { settings } = useGameContext();
  const playerName = localStorage.getItem('typingGamePlayerName');
  const [name, setName] = useState(playerName || '');
  const [nameSaved, setNameSaved] = useState(false);

  // Only show settings if player name exists
  if (!playerName) {
    onClose(); // Return to main menu if no name set
    return null;
  }

  const { 
    theme, toggleTheme,
    toggleSettings,
    showAds, toggleAds
  } = settings;

  const handleNameSave = () => {
    if (name.trim().length >= 3) {
      localStorage.setItem('typingGamePlayerName', name.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: theme === 'light' ? 'white' : '#333',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      zIndex: 100,
      width: '300px'
    }}>
      <h3 style={{ marginTop: 0 }}>Game Settings</h3>
      
      {/* Remove sound and volume settings */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            checked={theme === 'dark'} 
            onChange={toggleTheme}
            style={{ marginRight: '10px' }}
          />
          Dark Theme
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            checked={showAds} 
            onChange={toggleAds}
            style={{ marginRight: '10px' }}
          />
          Show Ads
        </label>
      </div>
      
      {/* Player Name Input Component */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Change Leaderboard Name:
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
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
            onClick={handleNameSave}
            disabled={name.trim().length < 3}
            style={{
              padding: '8px 16px',
              backgroundColor: name.trim().length < 3 ? '#aaa' : (theme === 'light' ? '#007bff' : '#4bd5ee'),
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: name.trim().length < 3 ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Save
          </button>
        </div>
        {nameSaved && (
          <div style={{
            marginTop: '8px',
            color: theme === 'light' ? '#007bff' : '#4bd5ee',
            fontSize: '0.9rem'
          }}>
            Name changed!
          </div>
        )}
      </div>
      
      <button 
        onClick={toggleSettings}
        style={{
          padding: '8px 15px',
          backgroundColor: theme === 'light' ? '#f1f1f1' : '#444',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: theme === 'light' ? '#333' : '#f1f1f1',
          width: '100%',
          marginTop: '15px'
        }}
      >
        Close Settings
      </button>
    </div>
  );
};

export default Settings;