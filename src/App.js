import React, { useState, useEffect, useCallback } from 'react';
import { GameProvider } from './context/GameContext';
import { GameScreen } from './components/game/GameScreen';
import { MainMenu } from './components/layout/MainMenu';
import { SettingsMenu } from './components/settings/SettingsMenu';
import { LoadingScreen } from './components/game/LoadingScreen';
import { THEME_COLORS } from './utils/constants';
import LeaderboardModal from './components/game/LeaderboardModal';
import GameOverScreen from './components/game/GameOverScreen';

export const App = () => {
  const [gameState, setGameState] = useState('loading'); // loading, menu, settings, playing
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [transition, setTransition] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('typingGamePlayerName') || '');

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingProgress(10);
        setLoadingProgress(50);

        // Simulate other resource loading with progress updates
        const steps = [60, 70, 80, 90, 100];
        for (const progress of steps) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setLoadingProgress(progress);
        }

        // Wait a moment at 100% before showing menu
        setTimeout(() => {
          setTransition(true);
          setTimeout(() => {
            setGameState('menu');
            setTransition(false);
          }, 400);
        }, 500);
      } catch (error) {
        console.error('Failed to load game resources:', error);
        // Handle loading error gracefully
        setLoadingProgress(100);
        setTimeout(() => setGameState('menu'), 1000);
      }
    };

    loadResources();
  }, []);

  // Handle screen transitions with fade effect
  const transitionToScreen = useCallback((newScreen) => {
    setTransition(true);
    setTimeout(() => {
      setGameState(newScreen);
      setTransition(false);
    }, 300); // Geçiş süresi (ms)
  }, []);

  // Render different screens based on game state
  const renderScreen = () => {
    switch (gameState) {
      case 'loading':
        return <LoadingScreen progress={loadingProgress} />;
      case 'menu':
        return <MainMenu 
          onPlay={(name) => {
            setPlayerName(name);
            transitionToScreen('playing');
          }} 
          onSettings={() => transitionToScreen('settings')} 
          onLeaderboard={() => setShowLeaderboard(true)}
        />;
      case 'settings':
        return <SettingsMenu onBack={() => transitionToScreen('menu')} />;
      case 'playing':
        return <GameScreen onExit={() => transitionToScreen('menu')} playerName={playerName} />;
      case 'gameover':
        return <GameOverScreen onRestart={() => transitionToScreen('playing')} />;
      default:
        return <MainMenu onPlay={() => transitionToScreen('playing')} />;
    }
  };

  return (
    <GameProvider 
      initialSettings={{
        soundEnabled: true,
        volume: 0.7,
        theme: 'dark',
        colors: THEME_COLORS // Ensure this is imported from constants
      }}
    >
      <div className="app-container" style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        opacity: transition ? 0 : 1,
        transition: 'opacity 300ms ease-in-out'
      }}>
        {renderScreen()}
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      </div>
    </GameProvider>
  );
};