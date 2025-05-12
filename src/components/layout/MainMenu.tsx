import React from 'react';
import { useGameContext } from '../../context/GameContext';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onSettings }) => {
  const { audioManager, settings } = useGameContext();

  return (
    <div>
      <h1>Main Menu</h1>
      <button onClick={onPlay}>Play</button>
      <button onClick={onSettings}>Settings</button>
    </div>
  );
};

export default MainMenu;
