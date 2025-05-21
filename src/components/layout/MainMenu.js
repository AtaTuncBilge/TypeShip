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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);

  useEffect(() => {
    // Load saved player name
    const savedName = localStorage.getItem('typingGamePlayerName');
    if (savedName) {
      setPlayerName(savedName);
      setIsSaved(true);
    }
  }, []);

  useEffect(() => {
    if (showLeaderboard) {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);
      fetch('http://localhost:3001/results')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch leaderboard');
          return res.json();
        })
        .then(data => setLeaderboard(
          [...data].sort((a, b) => b.wpm - a.wpm) // Sort by WPM descending
        ))
        .catch(err => setLeaderboardError('Could not load leaderboard.'))
        .finally(() => setLoadingLeaderboard(false));
    }
  }, [showLeaderboard]);

  const theme = settings?.theme || 'dark';

  const handlePlay = () => {
    // Only allow play if name is at least 3 characters and saved
    if (playerName.trim().length >= 3 && isSaved) {
      if (audioManager) {
        audioManager.playSound('hit');
      }
      onPlay(playerName.trim()); // playerName'i gönder
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
      // Use the same background as SettingsMenu for consistency
      background: theme === 'dark'
        ? 'radial-gradient(circle, rgba(32, 41, 64, 0.8) 0%, #0a0d13 100%)'
        : 'radial-gradient(circle, rgba(230, 240, 255, 0.8) 0%, #f5f5f5 100%)',
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Background elements */}
      {/* Remove old backgroundColor, keep only the new background */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, ${theme === 'dark' ? 'rgba(32, 41, 64, 0.8)' : 'rgba(230, 240, 255, 0.8)'} 0%, ${theme === 'dark' ? 'rgba(18, 18, 18, 1)' : 'rgba(245, 245, 245, 1)'} 100%)`,
        zIndex: 0,
      }} />

      {/* Animated meteors, spaceships, and stars (floating in place) */}
      <div
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* Spaceship 1 - top right, floating */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            fontSize: '3rem',
            animation: 'float 5s ease-in-out infinite',
            zIndex: 0,
            opacity: 0.85,
            transform: 'rotate(-15deg)',
            filter: 'drop-shadow(0 0 20px #4bd5ee)',
            userSelect: 'none',
          }}
        >🚀</div>
        {/* Spaceship 2 - bottom left, floating */}
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '10%',
            fontSize: '2.7rem',
            animation: 'float2 6s ease-in-out infinite',
            zIndex: 0,
            opacity: 0.8,
            transform: 'rotate(20deg) scaleX(-1)',
            filter: 'drop-shadow(0 0 18px #4bd5ee)',
            userSelect: 'none',
          }}
        >🚀</div>
        {/* Spaceship 3 - center left, floating */}
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: '7%',
            fontSize: '2.2rem',
            animation: 'float3 7s ease-in-out infinite',
            zIndex: 0,
            opacity: 0.7,
            transform: 'rotate(-5deg)',
            filter: 'drop-shadow(0 0 14px #4bd5ee)',
            userSelect: 'none',
          }}
        >🚀</div>
        {/* Meteor 1 - top left, floating, correct direction */}
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '8%',
            fontSize: '2.5rem',
            animation: 'meteor-float-1 6s ease-in-out infinite',
            zIndex: 0,
            opacity: 0.8,
            transform: 'rotate(-35deg)',
            filter: 'drop-shadow(0 0 16px #ff9800)',
            userSelect: 'none',
          }}
        >☄️</div>
        {/* Meteor 2 - mid left, floating, correct direction */}
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '12%',
            fontSize: '2.2rem',
            animation: 'meteor-float-2 7s ease-in-out infinite',
            zIndex: 0,
            opacity: 0.7,
            transform: 'rotate(-25deg)',
            filter: 'drop-shadow(0 0 12px #ff9800)',
            userSelect: 'none',
          }}
        >☄️</div>
        {/* Meteor 3 - bottom left, floating, correct direction */}
        <div
          style={{
            position: 'absolute',
            top: '75%',
            left: '18%',
            fontSize: '1.8rem',
            animation: 'meteor-float-3 8s ease-in-out infinite',
            zIndex: 0,
            opacity: 0.6,
            transform: 'rotate(-45deg)',
            filter: 'drop-shadow(0 0 10px #ff9800)',
            userSelect: 'none',
          }}
        >☄️</div>
        {/* Meteor 4 - bottom right, floating, correct direction */}
        <div
          style={{
            position: 'absolute',
            top: '80%',
            right: '15%',
            fontSize: '2.1rem',
            animation: 'meteor-float-4 9s ease-in-out infinite',
            zIndex: 0,
            opacity: 0.7,
            transform: 'rotate(-30deg)',
            filter: 'drop-shadow(0 0 12px #ff9800)',
            userSelect: 'none',
          }}
        >☄️</div>
        {/* Stars - scattered, floating */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '25%',
            fontSize: '1.2rem',
            animation: 'star-float-1 5s ease-in-out infinite',
            opacity: 0.7,
            userSelect: 'none',
          }}
        >✨</div>
        <div
          style={{
            position: 'absolute',
            top: '60%',
            left: '60%',
            fontSize: '1.5rem',
            animation: 'star-float-2 7s ease-in-out infinite',
            opacity: 0.8,
            userSelect: 'none',
          }}
        >⭐</div>
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '20%',
            fontSize: '1.1rem',
            animation: 'star-float-3 6s ease-in-out infinite',
            opacity: 0.6,
            userSelect: 'none',
          }}
        >🌟</div>
        <div
          style={{
            position: 'absolute',
            bottom: '18%',
            left: '55%',
            fontSize: '1.3rem',
            animation: 'star-float-4 8s ease-in-out infinite',
            opacity: 0.7,
            userSelect: 'none',
          }}
        >✨</div>
      </div>

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
            width: '240px', // Reduced width
          }}>
            <button
              onClick={handlePlay}
              onMouseEnter={() => setButtonHover('play')}
              onMouseLeave={() => setButtonHover(null)}
              style={{
                padding: '10px 20px', // Reduced padding
                fontSize: '1rem', // Reduced font size
                backgroundColor: theme === 'dark' ? '#4bd5ee' : '#0087c6',
                color: theme === 'dark' ? '#121212' : 'white',
                border: 'none',
                borderRadius: '20px', // Reduced border radius
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: theme === 'dark' ? '0 0 8px rgba(75, 213, 238, 0.5)' : '0 0 8px rgba(0, 135, 198, 0.3)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              PLAY GAME
            </button>

            <button
              onClick={() => handleButtonClick('settings')}
              onMouseEnter={() => setButtonHover('settings')}
              onMouseLeave={() => setButtonHover(null)}
              style={{
                padding: '10px 20px', // Reduced padding
                fontSize: '1rem', // Reduced font size
                backgroundColor: 'transparent',
                color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
                border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
                borderRadius: '20px', // Reduced border radius
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: 'none',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              SETTINGS
            </button>

            {/* Leaderboard button */}
            <button
              onClick={() => setShowLeaderboard(true)}
              onMouseEnter={() => setButtonHover('leaderboard')}
              onMouseLeave={() => setButtonHover(null)}
              style={{
                padding: '15px 25px',
                fontSize: '1.2rem',
                backgroundColor: 'transparent',
                color: theme === 'dark' ? '#ffd700' : '#b8860b',
                border: `2px solid ${theme === 'dark' ? '#ffd700' : '#b8860b'}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: buttonHover === 'leaderboard'
                  ? (theme === 'dark' ? '0 0 15px rgba(255, 215, 0, 0.7)' : '0 0 15px rgba(184, 134, 11, 0.5)')
                  : 'none',
                transform: buttonHover === 'leaderboard' ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease-in-out',
                fontFamily: 'Orbitron, sans-serif',
                marginBottom: '0.5rem'
              }}
            >
              🏆 LEADERBOARD
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

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #0a0f1a 0%, #10131a 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e2e2e2 100%)',
            backgroundBlendMode: 'multiply',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto'
          }}>
            <div style={{
              background: theme === 'dark' ? '#181d26' : '#fff',
              color: theme === 'dark' ? '#e0e0e0' : '#222',
              borderRadius: '24px',
              boxShadow: theme === 'dark'
                ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #4bd5ee33'
                : '0 8px 40px 0 #0002',
              padding: '40px 32px 32px 32px',
              minWidth: '340px',
              maxWidth: '95vw',
              width: '440px',
              position: 'relative',
              border: `2px solid ${theme === 'dark' ? '#232b3b' : '#e0e0e0'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h2 style={{
                color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
                fontSize: '2.1rem',
                marginBottom: '18px',
                letterSpacing: '2px',
                fontWeight: 700,
                textShadow: theme === 'dark'
                  ? '0 0 12px #4bd5ee99'
                  : '0 0 10px #0087c699'
              }}>
                🏆 Leaderboard
              </h2>
              {loadingLeaderboard && <div style={{textAlign:'center', color:theme==='dark'?'#fff':'#333'}}>Loading...</div>}
              {leaderboardError && <div style={{color:'#ff4444', textAlign:'center'}}>{leaderboardError}</div>}
              {!loadingLeaderboard && !leaderboardError && (
                <table style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  background: 'none',
                  marginBottom: '18px'
                }}>
                  <thead>
                    <tr style={{ color: theme === 'dark' ? '#4bd5ee' : '#0087c6', fontWeight: 700, fontSize: '1.1rem' }}>
                      <th style={{ padding: '8px 0', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '8px 0', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '8px 0', textAlign: 'center' }}>WPM</th>
                      <th style={{ padding: '8px 0', textAlign: 'center' }}>Accuracy</th>
                      <th style={{ padding: '8px 0', textAlign: 'center' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{
                          textAlign: 'center',
                          color: theme === 'dark' ? '#e0e0e0' : '#333',
                          padding: '24px 0',
                          fontStyle: 'italic'
                        }}>
                          No scores yet.
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry, i) => {
                        const isYou = entry.name === playerName;
                        return (
                          <tr key={`${entry.name}-${entry.created_at}`}
                            style={{
                              background: isYou
                                ? (theme === 'dark' ? '#4bd5ee22' : '#0087c622')
                                : (i % 2 === 0
                                  ? (theme === 'dark' ? '#232b3b44' : '#f5f5f5')
                                  : 'transparent'),
                              color: isYou
                                ? (theme === 'dark' ? '#4bd5ee' : '#0087c6')
                                : (theme === 'dark' ? '#e0e0e0' : '#333'),
                              fontWeight: isYou ? 700 : (i === 0 ? 600 : 400),
                              fontSize: isYou || i === 0 ? '1.08rem' : '1rem',
                              borderRadius: isYou ? 8 : 0
                            }}>
                            <td style={{
                              padding: '10px 0',
                              textAlign: 'left',
                              color: isYou ? (theme === 'dark' ? '#4bd5ee' : '#0087c6') : (i === 0 ? '#ffd700' : undefined)
                            }}>{i + 1}</td>
                            <td style={{
                              padding: '10px 0',
                              textAlign: 'left'
                            }}>{entry.name}</td>
                            <td style={{
                              padding: '10px 0',
                              textAlign: 'center'
                            }}>{entry.wpm}</td>
                            <td style={{
                              padding: '10px 0',
                              textAlign: 'center'
                            }}>{entry.accuracy}%</td>
                            <td style={{
                              padding: '10px 0',
                              textAlign: 'center'
                            }}>{formatDate(entry.created_at)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
              <button
                onClick={() => setShowLeaderboard(false)}
                style={{
                  marginTop: '10px',
                  padding: '12px 32px',
                  background: `linear-gradient(90deg, ${theme === 'dark' ? '#4bd5ee' : '#0087c6'} 0%, ${theme === 'dark' ? '#232b3b' : '#e8f5ff'} 100%)`,
                  color: theme === 'dark' ? '#181d26' : '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: theme === 'dark'
                    ? '0 0 18px #4bd5ee55'
                    : '0 0 10px #0087c655',
                  transition: 'all 0.2s'
                }}
              >
                Close
              </button>
              <span style={{
                position: 'absolute',
                top: '18px',
                right: '24px',
                fontSize: '1.5rem',
                color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
                cursor: 'pointer',
                fontWeight: 700,
                background: 'none',
                border: 'none'
              }} onClick={() => setShowLeaderboard(false)}>×</span>
            </div>
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
        &copy; 2025 Type Ship | Made with 💙
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
          0% { transform: translateY(0) rotate(-15deg);}
          50% { transform: translateY(-18px) rotate(-15deg);}
          100% { transform: translateY(0) rotate(-15deg);}
        }
        @keyframes float2 {
          0% { transform: translateY(0) rotate(20deg) scaleX(-1);}
          50% { transform: translateY(-14px) rotate(20deg) scaleX(-1);}
          100% { transform: translateY(0) rotate(20deg) scaleX(-1);}
        }
        @keyframes float3 {
          0% { transform: translateY(0) rotate(-5deg);}
          50% { transform: translateY(-10px) rotate(-5deg);}
          100% { transform: translateY(0) rotate(-5deg);}
        }
        @keyframes meteor-float-1 {
          0% { transform: translateY(0) rotate(-35deg);}
          50% { transform: translateY(-10px) rotate(-35deg);}
          100% { transform: translateY(0) rotate(-35deg);}
        }
        @keyframes meteor-float-2 {
          0% { transform: translateY(0) rotate(-25deg);}
          50% { transform: translateY(-12px) rotate(-25deg);}
          100% { transform: translateY(0) rotate(-25deg);}
        }
        @keyframes meteor-float-3 {
          0% { transform: translateY(0) rotate(-45deg);}
          50% { transform: translateY(-8px) rotate(-45deg);}
          100% { transform: translateY(0) rotate(-45deg);}
        }
        @keyframes meteor-float-4 {
          0% { transform: translateY(0) rotate(-30deg);}
          50% { transform: translateY(-14px) rotate(-30deg);}
          100% { transform: translateY(0) rotate(-30deg);}
        }
        @keyframes star-float-1 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-6px);}
          100% { transform: translateY(0);}
        }
        @keyframes star-float-2 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-10px);}
          100% { transform: translateY(0);}
        }
        @keyframes star-float-3 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-8px);}
          100% { transform: translateY(0);}
        }
        @keyframes star-float-4 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-12px);}
          100% { transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

// Yardımcı fonksiyon
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}