import React, { createContext, useContext, useState } from 'react';
import { AudioManager } from '../utils/AudioManager';

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

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  theme: 'light' | 'dark';
  difficulty: string;
  colors: typeof themeColors;
}

interface GameContextProps {
  settings: GameSettings;
  showSettings: boolean;
  showAds: boolean;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  audioManager: AudioManager;
  addScore: (wpm: number, accuracy: number) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{
  children: React.ReactNode;
  audioManager: AudioManager;
  initialSettings: GameSettings;
}> = ({ children, audioManager, initialSettings }) => {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showAds, setShowAds] = useState(true);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addScore = (wpm: number, accuracy: number) => {
    // Implement score addition logic here
    console.log(`Score added: ${wpm} WPM, ${accuracy}% accuracy`);
  };

  return (
    <GameContext.Provider value={{ 
      settings, 
      showSettings,
      showAds,
      updateSettings, 
      audioManager,
      addScore 
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
