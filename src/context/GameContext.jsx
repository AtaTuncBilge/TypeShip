import React, { createContext, useState, useContext, useEffect } from 'react';
// Define theme colors for the application
export const themeColors = {
  primary: '#E40046', // Magenta
  lightBg: '#E2DCDD', // Light grey
  darkBg: '#1C1A1B',  // Dark grey
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
const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);
export const GameProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.5,
    theme: 'dark',
    difficulty: 'normal',
    colors: themeColors
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showAds, setShowAds] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Load leaderboard from localStorage on component mount
  useEffect(() => {
    const savedScores = localStorage.getItem('typingGameLeaderboard');
    if (savedScores) {
      try {
        setLeaderboard(JSON.parse(savedScores));
      } catch (e) {
        console.error('Error parsing leaderboard data:', e);
      }
    }
    
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('typingGameSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Merge with default colors to ensure they're always available
        setSettings(prev => ({
          ...prev,
          ...parsedSettings,
          colors: themeColors
        }));
      } catch (e) {
        console.error('Error parsing settings data:', e);
      }
    }
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    // Create a copy without the colors object to avoid circular references
    const settingsToSave = { ...settings };
    delete settingsToSave.colors;
    
    localStorage.setItem('typingGameSettings', JSON.stringify(settingsToSave));
  }, [settings]);
  
  const toggleSound = () => {
    setSettings(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };
  
  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };
  
  const toggleSettings = () => setShowSettings(!showSettings);
  const toggleAds = () => setShowAds(!showAds);
  
  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  // Add a new score to the leaderboard
  const addScore = (wpm, accuracy) => {
    // Get player name (default to "Player" if not provided)
    let playerName = localStorage.getItem('typingGamePlayerName') || "Player";
    
    const newScore = {
      playerName,
      wpm,
      accuracy,
      date: new Date().toISOString(),
      highlight: true
    };
    // Reset highlight for all previous scores
    const resetHighlight = leaderboard.map(score => ({
      ...score,
      highlight: false
    }));
    
    const updatedLeaderboard = [...resetHighlight, newScore]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 10); // Keep only top 10 scores
    // Save to localStorage
    localStorage.setItem('typingGameLeaderboard', JSON.stringify(updatedLeaderboard));
    setLeaderboard(updatedLeaderboard);
  };

  // Helper function to get current theme colors
  const getThemeColors = () => {
    return settings.theme === 'light' ? themeColors.light : themeColors.dark;
  };
  
  const value = {
    settings,
    showSettings,
    showAds,
    leaderboard,
    toggleSound,
    toggleTheme,
    toggleSettings,
    toggleAds,
    updateSettings,
    addScore,
    themeColors,
    currentTheme: getThemeColors()
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};