import React, { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import About from '../about/About';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onSettings }) => {
  const { audioManager, settings } = useGameContext();
  const [showAbout, setShowAbout] = useState(false);
  const [showMore, setShowMore] = useState(false); // Changed from showOptions
  const [buttonHover, setButtonHover] = useState<string | null>(null);
  const theme = settings.theme; 

  const handleButtonClick = (action: string) => {
    if (audioManager) {
      audioManager.playSound('click');
    }

    switch (action) {
      case 'settings':
        onSettings();
        break;
      case 'about':
        setShowAbout(true);
        break;
      case 'github':
        window.open('https://github.com/AtaTuncBilge/TypeShip', '_blank', 'noopener,noreferrer');
        break;
      case 'more': // Changed from moreOptions
        setShowMore(!showMore);
        break;
      default:
        break;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <h1>Main Menu</h1>
      <button onClick={onPlay}>Play</button>
      <button onClick={onSettings}>Settings</button>

      <button
        onClick={() => handleButtonClick('more')} // Changed from moreOptions
        style={{
          padding: '12px 25px',
          fontSize: '1.1rem',
          backgroundColor: theme === 'dark' ? 'rgba(75, 213, 238, 0.1)' : 'rgba(0, 135, 198, 0.1)',
          color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
          border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
      >
        {showMore ? '↑ LESS' : '↓ MORE'}
      </button>

      {/* About component */}
      {showAbout && <About onClose={() => setShowAbout(false)} />}

      {/* Options menu */}
      {showMore && (  // Changed from showOptions to showMore
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          width: '260px',
        }}>
          <button
            onClick={() => handleButtonClick('about')}
            onMouseEnter={() => setButtonHover('about')}
            onMouseLeave={() => setButtonHover(null)}
            style={{
              padding: '15px 25px',
              fontSize: '1.1rem',
              backgroundColor: buttonHover === 'about' 
                ? (theme === 'dark' ? 'rgba(75, 213, 238, 0.2)' : 'rgba(0, 135, 198, 0.2)')
                : 'transparent',
              color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
              border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transform: buttonHover === 'about' ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            ℹ️ ABOUT
          </button>

          <button
            onClick={() => handleButtonClick('github')}
            onMouseEnter={() => setButtonHover('github')}
            onMouseLeave={() => setButtonHover(null)}
            style={{
              padding: '15px 25px',
              fontSize: '1.1rem',
              backgroundColor: buttonHover === 'github'
                ? (theme === 'dark' ? 'rgba(75, 213, 238, 0.2)' : 'rgba(0, 135, 198, 0.2)')
                : 'transparent',
              color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
              border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transform: buttonHover === 'github' ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            📦 GITHUB
          </button>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
