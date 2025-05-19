import React from 'react';
import { useGameContext } from 'GameContext';
import PlayerNameInput from 'PlayerNameInput';

export const Settings = ({ onClose }) => {
  const { settings, updateSettings } = useGameContext();
  const playerName = localStorage.getItem('typingGamePlayerName');

  // Only show settings if player name exists
  if (!playerName) {
    onClose(); // Return to main menu if no name set
    return null;
  }

  const { 
    soundEnabled, toggleSound, 
    volume, setVolume,
    theme, toggleTheme,
    toggleSettings,
    showAds, toggleAds
  } = settings;
  
  const handleVolumeChange = (value) => {
    updateSettings({ volume: value });
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
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            checked={soundEnabled} 
            onChange={toggleSound}
            style={{ marginRight: '10px' }}
          />
          Sound Effects
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Volume: {Math.round(volume * 100)}%
        </label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
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
      <PlayerNameInput />
      
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