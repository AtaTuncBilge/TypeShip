import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import About from '../about/About';

export const MainMenu = ({ onPlay, onSettings }) => {
  const { settings, audioManager } = useGameContext();
  const [showOptions, setShowOptions] = useState(false);
  const [buttonHover, setButtonHover] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [showAbout, setShowAbout] = useState(false); // New state for About component
  const [showMore, setShowMore] = useState(false); // New state for More options

  useEffect(() => {
    // Load saved player name
    const savedName = localStorage.getItem('typingGamePlayerName');
    if (savedName) {
      setPlayerName(savedName);
      setIsSaved(true);
    }
  }, []);

  const theme = settings?.theme || 'dark';

  const handlePlay = () => {
    // Only allow play if name is at least 3 characters and saved
    if (playerName.trim().length >= 3 && isSaved) {
      if (audioManager) {
        audioManager.playSound('hit'); // replaced 'click'
      }
      onPlay();
    }
  };

  const handleButtonClick = (action) => {
    if (audioManager) {
      audioManager.playSound('hit'); // replaced 'click'
    }

    switch (action) {
      case 'settings':
        onSettings();
        break;
      case 'about':
        setShowAbout(true); // Show About component
        break;
      case 'github':
        window.open('https://github.com/AtaTuncBilge/TypeShip.v2', '_blank'); // Updated link
        break;
      case 'more':
        setShowMore(!showMore);
        break;
      default:
        if (audioManager) {
          audioManager.playSound('hit'); // replaced 'click'
        }
        setShowOptions(!showOptions);
        break;
    }
  };

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
    setIsSaved(false);
  };

  const handleSaveName = () => {
    if (playerName.trim().length >= 3) {
      localStorage.setItem('typingGamePlayerName', playerName.trim());
      setIsSaved(true);
      if (audioManager) {
        audioManager.playSound('hit'); // replaced 'click'
      }
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
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, ${theme === 'dark' ? 'rgba(32, 41, 64, 0.8)' : 'rgba(230, 240, 255, 0.8)'} 0%, ${theme === 'dark' ? 'rgba(18, 18, 18, 1)' : 'rgba(245, 245, 245, 1)'} 100%)`,
        zIndex: 0,
      }} />

      {/* Stars background - only in dark mode */}
      {theme === 'dark' && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 800 800\'%3E%3Cg fill=\'none\' stroke=\'%23404\' stroke-width=\'1\'%3E%3Cpath d=\'M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63\'/%3E%3Cpath d=\'M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764\'/%3E%3Cpath d=\'M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880\'/%3E%3Cpath d=\'M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382\'/%3E%3Cpath d=\'M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269\'/%3E%3C/g%3E%3Cg fill=\'%23505\'%3E%3Ccircle cx=\'769\' cy=\'229\' r=\'5\'/%3E%3Ccircle cx=\'539\' cy=\'269\' r=\'5\'/%3E%3Ccircle cx=\'603\' cy=\'493\' r=\'5\'/%3E%3Ccircle cx=\'731\' cy=\'737\' r=\'5\'/%3E%3Ccircle cx=\'520\' cy=\'660\' r=\'5\'/%3E%3Ccircle cx=\'309\' cy=\'538\' r=\'5\'/%3E%3Ccircle cx=\'295\' cy=\'764\' r=\'5\'/%3E%3Ccircle cx=\'40\' cy=\'599\' r=\'5\'/%3E%3Ccircle cx=\'102\' cy=\'382\' r=\'5\'/%3E%3Ccircle cx=\'127\' cy=\'80\' r=\'5\'/%3E%3Ccircle cx=\'370\' cy=\'105\' r=\'5\'/%3E%3Ccircle cx=\'578\' cy=\'42\' r=\'5\'/%3E%3Ccircle cx=\'237\' cy=\'261\' r=\'5\'/%3E%3Ccircle cx=\'390\' cy=\'382\' r=\'5\'/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
          zIndex: 0,
        }} />
      )}

      {/* Content container */}
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
      }}>
        {/* Game Title */}
        <h1 style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          textShadow: theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.7)' : '0 0 10px rgba(0, 135, 198, 0.4)',
          letterSpacing: '5px',
        }}>
          TYPE SHIP
        </h1>

        {playerName && isSaved && (
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
          }}>
            Welcome, {playerName}!
          </h2>
        )}

        {!playerName || !isSaved ? (
          <div style={{
            marginBottom: '2rem',
            width: '280px',
          }}>
            <input
              type="text"
              placeholder="Enter your name (min 3 characters)"
              value={playerName}
              onChange={handleNameChange}
              minLength={3}
              maxLength={15}
              style={{
                width: '100%',
                padding: '12px 15px',
                marginBottom: '10px',
                backgroundColor: theme === 'dark' ? 'rgba(60, 70, 90, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                color: theme === 'dark' ? '#e0e0e0' : '#333',
                border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
                borderRadius: '30px',
                fontSize: '1.1rem',
                outline: 'none',
                fontFamily: '"Exo 2", sans-serif',
              }}
            />
            {playerName.trim().length > 0 && playerName.trim().length < 3 && (
              <div style={{
                color: '#ff4444',
                fontSize: '0.8rem',
                marginBottom: '10px',
                textAlign: 'left',
                paddingLeft: '15px'
              }}>
                Name must be at least 3 characters long
              </div>
            )}
            <button
              onClick={handleSaveName}
              disabled={playerName.trim().length < 3}
              style={{
                padding: '15px 25px',
                fontSize: '1.2rem',
                backgroundColor: theme === 'dark' ? '#4bd5ee' : '#0087c6',
                color: theme === 'dark' ? '#121212' : 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: playerName.trim().length >= 3 ? 'pointer' : 'not-allowed',
                opacity: playerName.trim().length >= 3 ? 1 : 0.5,
                fontWeight: 'bold',
                boxShadow: theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.5)' : '0 0 10px rgba(0, 135, 198, 0.3)',
                transform: 'none',
                transition: 'all 0.2s ease-in-out',
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              SAVE NAME
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '280px',
          }}>
            <button
              onClick={handlePlay}
              onMouseEnter={() => setButtonHover('play')}
              onMouseLeave={() => setButtonHover(null)}
              style={{
                padding: '15px 25px',
                fontSize: '1.2rem',
                backgroundColor: buttonHover === 'play' 
                  ? (theme === 'dark' ? '#5be8fa' : '#0098d9') 
                  : (theme === 'dark' ? '#4bd5ee' : '#0087c6'),
                color: theme === 'dark' ? '#121212' : 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: buttonHover === 'play'
                  ? (theme === 'dark' ? '0 0 15px rgba(75, 213, 238, 0.9)' : '0 0 15px rgba(0, 135, 198, 0.6)')
                  : (theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.5)' : '0 0 10px rgba(0, 135, 198, 0.3)'),
                transform: buttonHover === 'play' ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease-in-out',
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              PLAY GAME
            </button>

            <button
              onClick={() => handleButtonClick('settings')}
              onMouseEnter={() => setButtonHover('settings')}
              onMouseLeave={() => setButtonHover(null)}
              style={{
                padding: '15px 25px',
                fontSize: '1.2rem',
                backgroundColor: 'transparent',
                color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
                border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: buttonHover === 'settings'
                  ? (theme === 'dark' ? '0 0 15px rgba(75, 213, 238, 0.5)' : '0 0 15px rgba(0, 135, 198, 0.3)')
                  : 'none',
                transform: buttonHover === 'settings' ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease-in-out',
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              SETTINGS
            </button>

            {/* Add MORE button */}
            <button
              onClick={() => handleButtonClick('more')}
              onMouseEnter={() => setButtonHover('options')}
              onMouseLeave={() => setButtonHover(null)}
              style={{
                padding: '15px 25px',
                fontSize: '1.2rem',
                backgroundColor: 'transparent',
                color: theme === 'dark' ? '#a0a0a0' : '#555',
                border: `2px solid ${theme === 'dark' ? '#a0a0a0' : '#555'}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: 'none',
                transform: buttonHover === 'options' ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease-in-out',
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              {showMore ? '↑ LESS' : '↓ MORE'}
            </button>

            {/* Display ABOUT and GITHUB if showMore is true */}
            {showMore && (
              <div style={{
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                width: '100%',
              }}>
                <button
                  onClick={() => handleButtonClick('about')}
                  onMouseEnter={() => setButtonHover('about')}
                  onMouseLeave={() => setButtonHover(null)}
                  style={{
                    padding: '12px 20px',
                    fontSize: '1rem',
                    backgroundColor: 'transparent',
                    color: theme === 'dark' ? '#b0b0b0' : '#777',
                    border: `1px solid ${theme === 'dark' ? '#505050' : '#ddd'}`,
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transform: buttonHover === 'about' ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s ease-in-out',
                    fontFamily: '"Exo 2", sans-serif',
                  }}
                >
                  ABOUT
                </button>

                <button
                  onClick={() => handleButtonClick('github')}
                  onMouseEnter={() => setButtonHover('github')}
                  onMouseLeave={() => setButtonHover(null)}
                  style={{
                    padding: '12px 20px',
                    fontSize: '1rem',
                    backgroundColor: 'transparent',
                    color: theme === 'dark' ? '#b0b0b0' : '#777',
                    border: `1px solid ${theme === 'dark' ? '#505050' : '#ddd'}`,
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transform: buttonHover === 'github' ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s ease-in-out',
                    fontFamily: '"Exo 2", sans-serif',
                  }}
                >
                  GITHUB
                </button>
              </div>
            )}
          </div>
        )}

        {/* Render About component if showAbout is true */}
        {showAbout && <About onClose={() => setShowAbout(false)} />}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        fontSize: '0.8rem',
        color: theme === 'dark' ? '#777' : '#999',
        zIndex: 1,
      }}>
        &copy; 2023 Type Ship | Made with 💙
      </div>

      {/* Ship icon */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        fontSize: '3rem',
        animation: 'float 5s ease-in-out infinite',
        zIndex: 1,
        transform: 'rotate(-15deg)',
        opacity: 0.7,
      }}>
        🚀
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Exo+2:wght@400;700&display=swap');

        @keyframes float {
          0% { transform: translate(0, 0) rotate(-15deg); }
          50% { transform: translate(-20px, -10px) rotate(-20deg); }
          100% { transform: translate(0, 0) rotate(-15deg); }
        }
      `}</style>
    </div>
  );
};