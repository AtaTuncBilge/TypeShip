import React, { useCallback, useEffect, useState } from 'react';
import { GameProvider } from './context/GameContext';
import { GameScreen } from './components/game/GameScreen';
import { MainMenu } from './components/layout/MainMenu';
import SettingsMenu from './components/settings/SettingsMenu';
import { LoadingScreen } from './components/game/LoadingScreen';
import LeaderboardModal from './components/game/LeaderboardModal';

export const App = () => {
  const [gameState, setGameState] = useState('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [transition, setTransition] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('typingGamePlayerName') || '');

  useEffect(() => {
    let cancelled = false;
    const steps = [12, 26, 38, 54, 68, 82, 93, 100];

    const loadResources = async () => {
      for (let index = 0; index < steps.length; index += 1) {
        if (cancelled) return;
        await new Promise((resolve) => setTimeout(resolve, index === steps.length - 1 ? 420 : 220));
        setLoadingProgress(steps[index]);
      }

      if (cancelled) return;
      setTransition(true);
      window.setTimeout(() => {
        if (cancelled) return;
        setGameState('menu');
        setTransition(false);
      }, 280);
    };

    loadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  const transitionToScreen = useCallback((nextScreen) => {
    setTransition(true);
    window.setTimeout(() => {
      setGameState(nextScreen);
      setTransition(false);
    }, 260);
  }, []);

  const handleNameChange = useCallback((nextName) => {
    setPlayerName(nextName);
  }, []);

  const renderScreen = () => {
    switch (gameState) {
      case 'loading':
        return <LoadingScreen progress={loadingProgress} />;
      case 'menu':
        return (
          <MainMenu
            playerName={playerName}
            onNameChange={handleNameChange}
            onPlay={(name) => {
              setPlayerName(name);
              transitionToScreen('playing');
            }}
            onSettings={() => transitionToScreen('settings')}
            onLeaderboard={() => setShowLeaderboard(true)}
          />
        );
      case 'settings':
        return (
          <SettingsMenu
            onBack={() => transitionToScreen('menu')}
            playerName={playerName}
            onNameChange={handleNameChange}
          />
        );
      case 'playing':
        return <GameScreen onExit={() => transitionToScreen('menu')} playerName={playerName} />;
      default:
        return null;
    }
  };

  return (
    <GameProvider
      initialSettings={{
        theme: 'dark',
        soundEnabled: true,
        volume: 0.7,
      }}
    >
      <div
        className="ts-app-root"
        style={{
          opacity: transition ? 0 : 1,
          transition: 'opacity 260ms ease',
        }}
      >
        {renderScreen()}
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      </div>
    </GameProvider>
  );
};
