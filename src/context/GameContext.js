import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const GameContext = createContext(null);

// Game settings default values
const defaultSettings = {
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
  theme: 'dark', // dark, light
  wordSets: ['common', 'gaming'], // active word sets
};

export const GameProvider = ({ children, audioManager, initialSettings }) => {
  // State for game settings
  const [settings, setSettings] = useState(() => {
    // Try to load settings from localStorage
    const savedSettings = localStorage.getItem('typeShipSettings');
    // Use initialSettings as fallback if provided, otherwise use defaultSettings
    return savedSettings ? JSON.parse(savedSettings) : (initialSettings || defaultSettings);
  });
  
  // State for player stats
  const [stats, setStats] = useState({
    highScore: 0,
    totalWordsTyped: 0,
    totalCharsTyped: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    gamesPlayed: 0,
    lastPlayed: null,
  });

  // State for player name
  const [playerName, setPlayerName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);

  const [playerNameConfirmed, setPlayerNameConfirmed] = useState(() => {
    const savedName = localStorage.getItem('typingGamePlayerName');
    return Boolean(savedName && savedName.length >= 3);
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('typeShipSettings', JSON.stringify(settings));
    
    // Apply settings to audio manager
    if (audioManager) {
      audioManager.setVolume(settings.volume);
      audioManager.setMusicEnabled(settings.musicEnabled);
      audioManager.setSoundEnabled(settings.soundEnabled);
    }
  }, [settings, audioManager]);

  // Load player stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('typeShipStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);
  
  // Update settings helper function
  const updateSettings = (newSettings) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  };
  
  // Update player stats and save to localStorage
  const updateStats = (newStats) => {
    const updatedStats = {
      ...stats,
      ...newStats,
      lastPlayed: new Date().toISOString(),
    };
    setStats(updatedStats);
    localStorage.setItem('typeShipStats', JSON.stringify(updatedStats));
  };
  
  // Calculate session stats based on game results
  const recordGameResults = (score, wordsTyped, accuracy, wpm, duration) => {
    const newGamesPlayed = stats.gamesPlayed + 1;
    const newTotalWords = stats.totalWordsTyped + wordsTyped;
    const newTotalChars = stats.totalCharsTyped + wordsTyped * 5; // Approximate chars
    const newHighScore = Math.max(stats.highScore, score);
    
    // Calculate running average
    const newAvgWPM = ((stats.averageWPM * stats.gamesPlayed) + wpm) / newGamesPlayed;
    const newAvgAccuracy = ((stats.averageAccuracy * stats.gamesPlayed) + accuracy) / newGamesPlayed;
    
    updateStats({
      highScore: newHighScore,
      totalWordsTyped: newTotalWords,
      totalCharsTyped: newTotalChars,
      averageWPM: Math.round(newAvgWPM),
      averageAccuracy: Math.round(newAvgAccuracy * 100) / 100,
      gamesPlayed: newGamesPlayed,
    });
  };

  // Start game with player name
  const startGame = (name) => {
    setPlayerName(name);
    setShowNameModal(false);
  };

  // Context value
  const value = {
    settings,
    updateSettings,
    stats,
    recordGameResults,
    audioManager,
    playerName,
    showNameModal,
    startGame,
    playerNameConfirmed,
    setPlayerNameConfirmed,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};