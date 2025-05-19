import React, { createContext, useContext, useState, useEffect } from 'react';
import { AudioManager } from '../services/AudioManager';
import { GameSettings, GameContextProps } from '../types';

export const themeColors = {
  primary: '#E40046',
  lightBg: '#E2DCDD',
  darkBg: '#1C1A1B',
  light: {
    text: '#1C1A1B',
    background: '#E2DCDD',
    border: '#BDBABB',
    accent: '#E40046',
    correct: '#E40046',
    incorrect: '#FF6B6B',
    neutral: '#999',
    highlight: '#F8F1F2'
  },
  dark: {
    text: '#E2DCDD',
    background: '#1C1A1B',
    border: '#333',
    accent: '#E40046',
    correct: '#E40046',
    incorrect: '#FF6B6B',
    neutral: '#777',
    highlight: '#2A2425'
  }
};

const audioManager = new AudioManager();

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{
  children: React.ReactNode;
  initialSettings: GameSettings;
}> = ({ children, initialSettings }) => {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    audioManager.soundEnabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  const toggleSettings = () => setShowSettings(prev => !prev);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if ('soundEnabled' in newSettings) {
        audioManager.soundEnabled = updated.soundEnabled;
      }
      return updated;
    });
  };

  return (
    <GameContext.Provider value={{ 
      settings,
      showSettings,
      updateSettings,
      audioManager,
      toggleSettings,
      addScore: (wpm, accuracy) => console.log(`Score: ${wpm} WPM, ${accuracy}% accuracy`)
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
