import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';
import VirtualKeyboard from './VirtualKeyboard';
import { WORD_LIST } from '../../constants/wordList';

// Update constants
const KEYBOARD_HEIGHT = 250;
const WORD_SPEED = 2.5; // Balanced speed
const WORD_SPACING = 500; // Optimal spacing
const LANE_COUNT = 3;

// Enhanced StatBox component for better visualization
const StatBox = ({ label, value, theme }) => (
  <div className="stat-box" style={{
    padding: '8px 15px',
    backgroundColor: theme === 'dark' ? 'rgba(75, 213, 238, 0.15)' : 'rgba(0, 135, 198, 0.1)',
    borderRadius: '12px',
    border: `1px solid ${theme === 'dark' ? 'rgba(75, 213, 238, 0.3)' : 'rgba(0, 135, 198, 0.2)'}`,
    backdropFilter: 'blur(5px)',
  }}>
    <div style={{ fontSize: '12px', opacity: 0.8 }}>{label}</div>
    <div style={{ 
      fontSize: '18px', 
      fontWeight: 'bold',
      color: theme === 'dark' ? '#4bd5ee' : '#0087c6' 
    }}>{value}</div>
  </div>
);

// Update SpaceshipEmoji component
const SpaceshipEmoji = ({ theme }) => (
  <div style={{
    fontSize: '45px',
    filter: `drop-shadow(0 0 8px ${theme === 'dark' ? '#4bd5ee' : '#0087c6'})`,
    animation: 'floatShip 3s ease-in-out infinite',
    transform: 'rotate(45deg)', // Changed from 90deg to 45deg for better orientation
    willChange: 'transform',
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px'
  }}>
    🚀
  </div>
);

// Replace random word generation with word list selection
const getRandomWord = () => {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
};

const calculateLaneHeight = (area, keyboardHeight) => {
  if (!area) return 0;
  const usableHeight = area.clientHeight - keyboardHeight;
  return usableHeight / LANE_COUNT;
};

export const GameScreen = ({ onExit }) => {
  const { settings = {}, audioManager } = useGameContext();
  const gameContainerRef = useRef(null);
  const inputRef = useRef(null);
  const gameAreaRef = useRef(null);
  const shipRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Remove unused state variables
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [typed, setTyped] = useState('');
  const [lastKeyPressed, setLastKeyPressed] = useState('');
  const [lanes, setLanes] = useState([[], [], []]);
  const [keystrokes, setKeystrokes] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [lasers, setLasers] = useState([]); // Keep this and remove totalTypedChars
  const gameLoopRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  // Move generateWord function definition before it's used
  const generateWord = useCallback((area, laneIndex) => {
    if (!area) return null;
    const laneHeight = calculateLaneHeight(area, KEYBOARD_HEIGHT);
    const baseY = (laneHeight * laneIndex) + (laneHeight / 2);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      word: getRandomWord(), // Use getRandomWord instead of generateRandomWord
      x: area.clientWidth,
      y: baseY,
      speed: WORD_SPEED,
      lane: laneIndex,
      matched: false
    };
  }, []);

  const gameLoop = useCallback((timestamp) => {
    if (!isGameActive || gameOver) return;
    
    const deltaTime = timestamp - lastFrameTimeRef.current;
    if (deltaTime < 16) { // Cap to ~60fps
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    lastFrameTimeRef.current = timestamp;

    setLanes(prevLanes => {
      const updatedLanes = prevLanes.map(lane => 
        lane.filter(word => {
          if (word.matched) return false;
          word.x -= WORD_SPEED;  // Simplified speed calculation
          return word.x > -200;
        })
      );

      updatedLanes.forEach((lane, index) => {
        const lastWord = lane[lane.length - 1];
        if (!lastWord || lastWord.x < gameAreaRef.current.clientWidth - WORD_SPACING) {
          const newWord = generateWord(gameAreaRef.current, index);
          if (newWord) lane.push(newWord);
        }
      });

      return updatedLanes;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isGameActive, gameOver, generateWord]);

  // Move handleGameOver inside useEffect to avoid dependency issue
  useEffect(() => {
    if (!isGameActive || timeLeft <= 0) return;

    const handleGameOver = () => {
      setGameOver(true);
      setIsGameActive(false);
    };

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleGameOver();
          clearInterval(timer);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  // Correct WPM calculation function
  const calculateWPM = () => {
    const timeElapsed = (60 - timeLeft) / 60; // Time elapsed in minutes
    if (timeElapsed <= 0) return 0;
    return Math.round((correctChars / 5) / timeElapsed);
  };

  // Explosion effect creation function        
  const createExplosion = (x, y, color) => {
    if (!gameAreaRef.current) return;

    const particles = 12;
    const area = gameAreaRef.current;

    for (let i = 0; i < particles; i++) {
      const particle = document.createElement('div');
      const angle = (i / particles) * Math.PI * 2;
      const velocity = 3;
      
      particle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        opacity: 1;
        box-shadow: 0 0 10px ${color};
        transition: all 0.5s ease-out;
      `;

      area.appendChild(particle);

      // Particle animation
      requestAnimationFrame(() => {
        particle.style.transform = `translate(
          ${Math.cos(angle) * 50 * velocity}px,
          ${Math.sin(angle) * 50 * velocity}px
        )`;
        particle.style.opacity = '0';
      });

      // Clean up particle
      setTimeout(() => particle.remove(), 500);
    }
  };

  // Add handleButtonClick function
  const handleButtonClick = () => {
    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('hit'); // replaced 'click'
    }
  };

  // Function to handle word completion
  const handleWordComplete = (wordObj) => {
    // Play hit sound for word completion
    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('hit');
    }

    // Add laser effect
    const shipPos = shipRef.current.getBoundingClientRect();
    const laserStart = {
      x: shipPos.left + shipPos.width / 2,
      y: shipPos.top + shipPos.height / 2
    };

    const laserEnd = {
      x: wordObj.x,
      y: wordObj.y
    };

    setLasers(prev => [...prev, {
      id: Date.now(),
      start: laserStart,
      end: laserEnd
    }]);

    const color = settings.theme === 'dark' ? '#4bd5ee' : '#0087c6';
    createExplosion(wordObj.x + 20, wordObj.y + 10, color);
    setCorrectChars(prev => prev + wordObj.word.length);
    setWpm(calculateWPM());
  };

  useEffect(() => {
    if (isGameActive && !gameOver) {
      // Initialize lanes with words when game starts
      const initializeLanes = () => {
        setLanes(prevLanes => {
          const newLanes = [...prevLanes];
          for (let i = 0; i < LANE_COUNT; i++) {
            if (newLanes[i].length === 0) {
              const newWord = generateWord(gameAreaRef.current, i);
              if (newWord) {
                newLanes[i] = [newWord];
              }
            }
          }
          return newLanes;
        });
      };

      initializeLanes();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isGameActive, gameOver, gameLoop, generateWord]);

  // Optimize word rendering with memoization

  // Fix the renderWord component syntax by adding a semicolon
  const renderWord = useCallback((wordObj) => {
    const { word, x, y, matched } = wordObj;
    
    return (
      <div
        key={wordObj.id}
        className={`word-container ${matched ? 'word-matched' : ''}`}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          fontSize: '26px',
          fontFamily: 'JetBrains Mono, monospace',
          color: settings.theme === 'dark' ? '#e0e0e0' : '#333',
          textShadow: `0 0 10px ${settings.theme === 'dark' ? 'rgba(75, 213, 238, 0.5)' : 'rgba(0, 135, 198, 0.3)'}`,
          letterSpacing: '1px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          transform: 'translateZ(0)',
          opacity: matched ? 0 : 1,
          transition: 'all 0.2s ease-out'
        }}
      >
        {word}
      </div>
    );  
  }, [settings.theme]);

  // Optimize input handling
  const handleInputChange = (e) => {
    if (!isGameActive || gameOver) return;
    const value = e.target.value.toLowerCase();
    
    // Play typing sound for each keypress
    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('type'); // keep for typing
    }

    setTyped(value);
    setLastKeyPressed(value.slice(-1));
    setKeystrokes(prev => prev + 1);

    // Check for word match
    const allWords = lanes.flat();
    const exactMatch = allWords.find(w => !w.matched && w.word === value);
    if (exactMatch) {
      handleWordComplete(exactMatch);
      setTyped('');
      setLanes(prevLanes => prevLanes.map(lane =>
        lane.map(word =>
          word.id === exactMatch.id ? { ...word, matched: true } : word
        )
      ));
      setCorrectKeystrokes(prev => prev + value.length);
    }
    
    setAccuracy(Math.round((correctKeystrokes / keystrokes) * 100) || 0);
  };

  // Update startGame function
  const startGame = () => {
    // Initialize all lanes immediately with words
    const initialLanes = Array(LANE_COUNT).fill([]).map((_, laneIndex) => {
      const words = [];
      const spacing = gameAreaRef.current.clientWidth / 3;
      
      // Pre-populate 3 words per lane with proper spacing
      for (let i = 0; i < 3; i++) {
        const word = generateWord(gameAreaRef.current, laneIndex);
        if (word) {
          word.x = gameAreaRef.current.clientWidth + (i * spacing);
          words.push(word);
        }
      }
      return words;
    });

    setLanes(initialLanes);
    setIsGameActive(true);
    setTimeLeft(60);
    setLasers([]);
    setCorrectChars(0);
    setWpm(0);
    setGameOver(false);
    setTyped('');
    
    // Start game loop immediately
    requestAnimationFrame(gameLoop);

    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('ambient'); // keep for background
    }
  };

  useEffect(() => {
    if (gameOver && audioManager) {
      audioManager.pauseSound('ambient'); // Stop ambient on game over
    }
  }, [gameOver, audioManager]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    };
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const layoutStyles = {
    container: {
      width: '100%',
      height: '100vh',
      background: 'radial-gradient(circle at center, rgba(30,40,50,0.8) 0%, rgba(18,18,18,0.95) 100%)',
      overflow: 'hidden',
      position: 'relative'
    },
    gameArea: {
      flex: 1,
      position: 'relative',
      backgroundColor: 'rgba(20, 25, 40, 0.4)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)',
      overflow: 'hidden'
    },
    inputContainer: {
      position: 'fixed',
      left: '50px',
      top: '40%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '20px',
      width: '300px',
      zIndex: 10,
    },
    wordContainer: {
      marginLeft: '400px',
      height: `calc(100% - ${KEYBOARD_HEIGHT}px)`,
      position: 'relative',
      overflow: 'hidden'
    }
  };

  // Update gameLayout to include laser effects
  const gameLayout = (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Add laser effects rendering */}
      {lasers.map(laser => (
        <div
          key={laser.id}
          style={{
            position: 'absolute',
            left: laser.start.x,
            top: laser.start.y,
            width: `${laser.end.x - laser.start.x}px`,
            height: '2px',
            backgroundColor: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
            boxShadow: `0 0 8px ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
            transform: `rotate(${Math.atan2(laser.end.y - laser.start.y, laser.end.x - laser.start.x)}rad)`,
            transformOrigin: 'left center',
            animation: 'laserShoot 0.3s forwards',
            zIndex: 10
          }}
          onAnimationEnd={() => setLasers(prev => prev.filter(l => l.id !== laser.id))}
        />
      ))}
      
      <div style={layoutStyles.inputContainer}>
        <div
          ref={shipRef}
          style={{
            position: 'relative',
            marginBottom: '20px'
          }}
        >
          <SpaceshipEmoji theme={settings.theme} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleInputChange}
          className="input-shine"
          style={{
            width: '100%',
            padding: '15px 20px',
            fontSize: '20px',
            backgroundColor: settings.theme === 'dark' ? 'rgba(30, 35, 45, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            color: settings.theme === 'dark' ? '#e0e0e0' : '#333',
            border: `2px solid ${settings.theme === 'dark' ? 'rgba(75, 213, 238, 0.5)' : 'rgba(0, 135, 198, 0.5)'}`,
            borderRadius: '12px',
            outline: 'none',
            boxShadow: `0 0 20px ${settings.theme === 'dark' ? 'rgba(75, 213, 238, 0.2)' : 'rgba(0, 135, 198, 0.15)'}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
          }}
        />
      </div>

      <div style={layoutStyles.wordContainer}>
        {lanes.map(lane => lane.map(word => renderWord(word)))}
      </div>

      <div style={{
        position: 'fixed',
        left: '50px',
        bottom: '20px',
        zIndex: 10,
      }}>
        <VirtualKeyboard theme={settings.theme} lastKeyPressed={lastKeyPressed} />
      </div>
    </div>
  );

  const headerButtons = (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button 
        onClick={() => {
          handleButtonClick();
          toggleFullscreen();
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
          color: settings.theme === 'dark' ? '#121212' : '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          fontWeight: 'bold',
        }}
      >
        {isFullscreen ? '🗕 Exit Fullscreen' : '🗖 Fullscreen'}
      </button>
      
      <button 
        onClick={() => {
          handleButtonClick();
          onExit();
        }}
        style={{
          padding: '8px 12px',
          backgroundColor: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
          color: settings.theme === 'dark' ? '#121212' : '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          fontWeight: 'bold',
        }}
      >
        🏠 Main Menu
      </button>
    </div>
  );

  // Update header stats display
  const statsDisplay = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: settings.theme === 'dark' ? 'rgba(60, 70, 90, 0.5)' : 'rgba(240, 245, 255, 0.5)',
      padding: '5px 10px',
      borderRadius: '20px',
    }}>
      <StatBox label="WPM" value={wpm} theme={settings.theme} />
      <StatBox label="ACC" value={`${accuracy}%`} theme={settings.theme} />
      <StatBox label="Keys" value={keystrokes} theme={settings.theme} />
      <StatBox label="Time" value={`${timeLeft}s`} theme={settings.theme} />
    </div>
  );

  // Update game over screen stats
  const gameOverStats = (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Test Complete!
      </h2>
      <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
        <div>Speed: {wpm} WPM</div>
        <div>Accuracy: {accuracy}%</div>
        <div>Total Keystrokes: {keystrokes}</div>
        <div>Correct Characters: {correctChars}</div>
      </div>
    </div>
  );

  // Clean up the return statement to use single header
  return (
    <div ref={gameContainerRef} style={{
      width: '100%',
      height: '100vh',
      background: settings.theme === 'dark' 
        ? 'linear-gradient(-45deg, #121212, #1a1a1a, #242424, #1a1a1a)'
        : 'linear-gradient(-45deg, #f0f8ff, #ffffff, #f5f5f5, #ffffff)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
      color: settings.theme === 'dark' ? '#e0e0e0' : '#333',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
    }}>
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        {/* Single header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          marginBottom: '10px',
        }}>
          <h1 style={{
            fontSize: '2rem',
            margin: 0,
            textShadow: settings.theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.7)' : '0 0 10px rgba(0, 135, 198, 0.4)',
            letterSpacing: '2px',
          }}>
            TYPE SHIP
          </h1>
          {statsDisplay}
          {headerButtons}
        </div>

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor: settings.theme === 'dark' ? 'rgba(20, 25, 40, 0.3)' : 'rgba(240, 245, 255, 0.3)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {gameLayout}
        </div>

        {/* Overlays */}
        {!isGameActive && !gameOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            zIndex: 100,
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              marginBottom: '1rem',
              textShadow: '0 0 10px rgba(75, 213, 238, 0.7)',
            }}>
              Ready to Test Your Typing Speed?
            </h2>
            <p style={{ 
              marginBottom: '2rem', 
              maxWidth: '600px',
              textAlign: 'center',
              lineHeight: '1.5',
            }}>
              You have 60 seconds. Type as many words as you can!
            </p>
            <button
              onClick={startGame}
              style={{
                padding: '15px 30px',
                fontSize: '1.2rem',
                backgroundColor: '#4bd5ee',
                color: '#121212',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 0 15px rgba(75, 213, 238, 0.7)',
              }}
            >
              START TEST
            </button>
          </div>
        )}

        {gameOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            zIndex: 100,
          }}>
            {gameOverStats}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={startGame}
                style={{
                  padding: '12px 25px',
                  fontSize: '1.1rem',
                  backgroundColor: '#4bd5ee',
                  color: '#121212',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px rgba(75, 213, 238, 0.5)',
                }}
              >
                TRY AGAIN
              </button>
              <button
                onClick={onExit}
                style={{
                  padding: '12px 25px',
                  fontSize: '1.1rem',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '2px solid #fff',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                MAIN MENU
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes wordFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes laserShoot {
          0% { transform: scaleX(0); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0; }
        }

        .word-container {
          animation: wordFloat 2s ease-in-out infinite;
        }
        
        .word-matched {
          animation: destroy 0.3s ease-out forwards !important;
        }

        @keyframes destroy {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(0); opacity: 0; }
        }
        
        .stat-box {
          transform: translateY(0);
          transition: transform 0.2s ease;
        }
        
        .stat-box:hover {
          transform: translateY(-2px);
        }

        .game-button {
          transition: all 0.3s ease;
          transform: translateY(0);
        }

        .game-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px ${settings.theme === 'dark' ? 'rgba(75, 213, 238, 0.4)' : 'rgba(0, 135, 198, 0.3)'};
        }

        @keyframes wordEnter {
          from {
            transform: translateX(50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .word-enter {
          animation: wordEnter 0.3s ease-out forwards;
        }

        @keyframes shine {
          0% { background-position: -100px; }
          100% { background-position: 200px; }
        }

        .input-shine {
          position: relative;
          overflow: hidden;
        }

        .input-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100px;
          width: 50px;
          height: 100%;
          background: linear-gradient(
            90deg, 
            transparent, 
            ${settings.theme === 'dark' ? 'rgba(75, 213, 238, 0.2)' : 'rgba(255, 255, 255, 0.4)'},
            transparent
          );
          animation: shine 3s infinite linear;
        }

        @keyframes floatShip {
          0%, 100% { transform: rotate(45deg) translateY(0); }
          50% { transform: rotate(45deg) translateY(-10px); }
        }
      `}</style>
    </div>
  );
};