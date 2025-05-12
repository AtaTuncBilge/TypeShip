import React from 'react';
import ReactDOM from 'react-dom/client';
import { TypingGame } from './components';
import { GameProvider, useGameContext } from './context/GameContext';
import { AudioManager } from './utils/AudioManager';
import { themeColors } from './config/theme';

// Initialize AudioManager
const audioManager = new AudioManager();

// App component that has access to theme context
const AppContent = () => {
  const { settings } = useGameContext();
  const theme = settings.theme || 'dark';
  const currentTheme = theme === 'light' ? settings.colors.light : settings.colors.dark;
  
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: currentTheme.background,
      borderRadius: '8px',
      boxShadow: theme === 'light' 
        ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
        : '0 4px 12px rgba(0, 0, 0, 0.3)',
      color: currentTheme.text,
      transition: 'all 0.3s ease'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        color: settings.colors.primary 
      }}>
        Satisfying Typing Game
      </h1>
      <TypingGame />
    </div>
  );
};

const App = () => {
  const initialSettings = {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.7,
    theme: 'dark',
    difficulty: 'normal',
    colors: themeColors
  };

  return (
    <GameProvider audioManager={audioManager} initialSettings={initialSettings}>
      <AppContent />
    </GameProvider>
  );
};

const container = document.getElementById('renderDiv');
const root = ReactDOM.createRoot(container);
root.render(<App />);