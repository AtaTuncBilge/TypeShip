import React, { useState } from 'react';
import { useGameContext } from '../../context/GameContext';

export const SettingsMenu = ({ onBack }) => {
  const { settings, updateSettings, audioManager } = useGameContext();
  const [buttonHover, setButtonHover] = useState(null);
  const theme = settings?.theme || 'dark';

  const handleSettingChange = (setting, value) => {
    updateSettings({ [setting]: value });
    if (audioManager && setting !== 'soundEnabled') {
      audioManager.playSound('keypress');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, ${theme === 'dark' ? 'rgba(32, 41, 64, 0.8)' : 'rgba(230, 240, 255, 0.8)'} 0%, ${theme === 'dark' ? 'rgba(18, 18, 18, 1)' : 'rgba(245, 245, 245, 1)'} 100%)`,
        zIndex: 0,
      }} />

      {/* Content container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '90%',
        maxWidth: '500px',
        padding: '30px',
        backgroundColor: theme === 'dark' ? 'rgba(30, 34, 40, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        boxShadow: theme === 'dark' ? '0 0 30px rgba(0, 0, 0, 0.3)' : '0 0 30px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          textAlign: 'center',
          marginBottom: '30px',
          color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
          textShadow: `0 0 10px ${theme === 'dark' ? 'rgba(75, 213, 238, 0.3)' : 'rgba(0, 135, 198, 0.3)'}`,
        }}>SETTINGS</h1>

        {/* Settings Grid */}
        <div style={{
          display: 'grid',
          gap: '20px',
          marginBottom: '30px',
        }}>
          {/* Sound Toggle */}
          <SettingToggle
            label="Sound Effects"
            value={settings.soundEnabled}
            onChange={(value) => handleSettingChange('soundEnabled', value)}
            theme={theme}
          />

          {/* Volume Slider */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
              className="volume-slider"
              style={{ width: '100%' }}
            />
          </div>

          {/* Theme Toggle */}
          <SettingToggle
            label="Dark Theme"
            value={settings.theme === 'dark'}
            onChange={(value) => handleSettingChange('theme', value ? 'dark' : 'light')}
            theme={theme}
          />
        </div>

        {/* Back Button */}
        <button
          onClick={() => {
            audioManager?.playSound('keypress');
            onBack();
          }}
          onMouseEnter={() => setButtonHover(true)}
          onMouseLeave={() => setButtonHover(false)}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '1.1rem',
            backgroundColor: buttonHover 
              ? (theme === 'dark' ? '#5be8fa' : '#0098d9')
              : (theme === 'dark' ? '#4bd5ee' : '#0087c6'),
            color: theme === 'dark' ? '#121212' : '#ffffff',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            fontFamily: 'Orbitron, sans-serif',
            boxShadow: `0 0 15px ${theme === 'dark' ? 'rgba(75, 213, 238, 0.3)' : 'rgba(0, 135, 198, 0.3)'}`,
          }}
        >
          BACK TO MENU
        </button>
      </div>

      <style>{`
        .volume-slider {
          -webkit-appearance: none;
          height: 8px;
          border-radius: 4px;
          background: ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'};
          outline: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${theme === 'dark' ? '#4bd5ee' : '#0087c6'};
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 10px ${theme === 'dark' ? 'rgba(75, 213, 238, 0.5)' : 'rgba(0, 135, 198, 0.5)'};
        }
      `}</style>
    </div>
  );
};

// Helper component for toggles
const SettingToggle = ({ label, value, onChange, theme }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}>
    <span>{label}</span>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '60px',
        height: '30px',
        backgroundColor: value 
          ? (theme === 'dark' ? '#4bd5ee' : '#0087c6')
          : (theme === 'dark' ? '#2a2a2a' : '#e0e0e0'),
        border: 'none',
        borderRadius: '15px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '3px',
        left: value ? '33px' : '3px',
        width: '24px',
        height: '24px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        transition: 'all 0.3s ease',
      }} />
    </button>
  </div>
);
