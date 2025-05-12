import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../context/GameContext';
import VirtualKeyboard from './VirtualKeyboard';

const WORD_LIST = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 
  'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
  'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
  'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
];

const SHIP_SIZE = 40; // Ship size in pixels
const WORD_SPEED = 1.5; // Reduced speed
const VIEWPORT_PADDING = 100; // Padding for word spawn

// Constants for lane configuration
const LANE_COUNT = 3;
const LANE_SPACING = 80; // Vertical spacing between lanes
const WORD_VERTICAL_VARIANCE = 20; // Random vertical position variance
const WORDS_PER_LANE = 1;
const WORD_SPACING = 400; // Minimum space between words

// Spaceship SVG component
const SpaceshipSVG = ({ theme }) => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path
      d="M20 5 L35 30 L20 25 L5 30 Z"
      fill={theme === 'dark' ? '#4bd5ee' : '#0087c6'}
      filter="url(#glow)"
      opacity="0.9"
    />
    <circle
      cx="20"
      cy="20"
      r="2"
      fill={theme === 'dark' ? '#fff' : '#fff'}
      filter="url(#glow)"
    />
  </svg>
);

// Add new laser effect component
const LaserEffect = ({ startPos, endPos, theme, onComplete }) => (
  <div 
    style={{
      position: 'absolute',
      left: startPos.x,
      top: startPos.y,
      width: `${endPos.x - startPos.x}px`,
      height: '2px',
      backgroundColor: theme === 'dark' ? '#4bd5ee' : '#0087c6',
      boxShadow: `0 0 8px ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
      transform: `rotate(${Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x)}rad)`,
      transformOrigin: 'left center',
      animation: 'laserShoot 0.3s forwards',
      zIndex: 10
    }}
    onAnimationEnd={onComplete}
  />
);

export const GameScreen = ({ onExit }) => {
  const { settings = {}, audioManager } = useGameContext();
  const gameContainerRef = useRef(null);
  const inputRef = useRef(null);
  const gameAreaRef = useRef(null);
  const shipRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [typed, setTyped] = useState('');
  const [wordElements, setWordElements] = useState([]);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [lastKeyPressed, setLastKeyPressed] = useState('');
  const [lanes, setLanes] = useState([[], [], []]); // Updated lanes state
  const [lasers, setLasers] = useState([]);
  const gameLoopRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  const gameLoop = (timestamp) => {
    if (!isGameActive || gameOver) return;
    
    const deltaTime = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    setLanes(prevLanes => {
      const updatedLanes = prevLanes.map(lane => 
        lane.filter(word => {
          word.x -= word.speed * (deltaTime / 16);
          if (word.x < -100 && !word.matched) {
            word.expired = true;
          }
          return word.x > -200;
        })
      );

      updatedLanes.forEach((lane, index) => {
        const lastWord = lane[lane.length - 1];
        if (!lastWord || 
            (lastWord.x < gameAreaRef.current.clientWidth - WORD_SPACING && 
             lastWord.x < gameAreaRef.current.clientWidth - 300)) {
          const newWord = generateWord(gameAreaRef.current, index);
          if (newWord) {
            lane.push({ ...newWord, isNew: true });
          }
        }
      });

      return updatedLanes;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (!isGameActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setIsGameActive(false);
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

  // Function to handle word completion
  const handleWordComplete = (wordObj) => {
    // Play success sound for completed word
    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('correct');
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

  const generateWord = (area, laneIndex) => {
    if (!area) return null;

    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const laneHeight = area.clientHeight / LANE_COUNT;
    const baseY = (laneHeight * laneIndex) + (laneHeight / 2);
    const randomY = baseY + (Math.random() * WORD_VERTICAL_VARIANCE - WORD_VERTICAL_VARIANCE / 2);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      word,
      x: area.clientWidth,
      y: randomY,
      speed: WORD_SPEED * (0.8 + Math.random() * 0.4), // Random speed variation
      lane: laneIndex,
      matched: false,
      floatOffset: Math.random() * Math.PI * 2, // Random starting phase for floating animation
    };
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
  }, [isGameActive, gameOver]);

  const renderWord = (wordObj) => {
    const { word, x, y, matched, expired, isNew } = wordObj;
    
    return (
      <div
        key={wordObj.id}
        className={`
          word-container
          ${isNew ? 'word-enter' : ''}
          ${matched ? 'word-matched' : ''}
          ${expired ? 'word-expired' : ''}
        `}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          fontSize: '24px',
          fontFamily: 'Roboto Mono, monospace',
          color: settings.theme === 'dark' ? '#e0e0e0' : '#333',
          pointerEvents: 'none'
        }}
      >
        {word}
      </div>
    );
  };

  const handleInputChange = (e) => {
    if (!isGameActive || gameOver) return;
    const value = e.target.value.toLowerCase();
    setTyped(value);
    setLastKeyPressed(value.slice(-1));

    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('keypress');
    }

    // Find matching word in lanes
    if (value.endsWith(' ')) {
      const trimmedValue = value.trim();
      const allWords = lanes.flat();
      const matchingWord = allWords.find(word => 
        !word.matched && word.word === trimmedValue
      );

      if (matchingWord) {
        handleWordComplete(matchingWord);
        
        // Update lanes to remove matched word
        setLanes(prevLanes => prevLanes.map(lane =>
          lane.map(word =>
            word.id === matchingWord.id ? { ...word, matched: true } : word
          )
        ));
        
        setTyped('');
      }
    }
  };

  const startGame = () => {
    // Play button sound
    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('button');
    }
    
    setIsGameActive(true);
    setTimeLeft(60);
    setTotalTypedChars(0);
    setCorrectChars(0);
    setWpm(0);
    setGameOver(false);
    setTyped('');
    setWordElements([]);
    inputRef.current?.focus();
  };

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
      height: '100%',
      position: 'relative',
    }
  };

  const gameLayout = (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={layoutStyles.inputContainer}>
        <div
          ref={shipRef}
          className="floating-ship"
          style={{
            transform: 'rotate(90deg)',
            filter: 'drop-shadow(0 0 10px rgba(75, 213, 238, 0.5))',
          }}
        >
          <SpaceshipSVG theme={settings.theme} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '15px 20px',
            fontSize: '20px',
            backgroundColor: settings.theme === 'dark' ? 'rgba(60, 70, 90, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            color: settings.theme === 'dark' ? '#e0e0e0' : '#333',
            border: `2px solid ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
            borderRadius: '12px',
            outline: 'none',
            boxShadow: `0 0 20px ${settings.theme === 'dark' ? 'rgba(75, 213, 238, 0.3)' : 'rgba(0, 135, 198, 0.2)'}`,
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
        onClick={toggleFullscreen}
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
        onClick={onExit}
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

  return (
    <div>
      <div 
        ref={gameContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: settings.theme === 'dark' ? '#121212' : '#f5f5f5',
          color: settings.theme === 'dark' ? '#e0e0e0' : '#333',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
        }}
      >
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, ${settings.theme === 'dark' ? 'rgba(32, 41, 64, 0.8)' : 'rgba(230, 240, 255, 0.8)'} 0%, ${settings.theme === 'dark' ? 'rgba(18, 18, 18, 1)' : 'rgba(245, 245, 245, 1)'} 100%)`,
          zIndex: 0,
        }} />
        
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h1 style={{
                fontSize: '2rem',
                margin: 0,
                textShadow: settings.theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.7)' : '0 0 10px rgba(0, 135, 198, 0.4)',
                letterSpacing: '2px',
              }}>
                TYPE SHIP
              </h1>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: settings.theme === 'dark' ? 'rgba(60, 70, 90, 0.5)' : 'rgba(240, 245, 255, 0.5)',
                padding: '5px 10px',
                borderRadius: '20px',
              }}>
                <div style={{
                  padding: '3px 8px',
                  backgroundColor: settings.theme === 'dark' ? 'rgba(75, 213, 238, 0.2)' : 'rgba(0, 135, 198, 0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}>
                  WPM: {wpm}
                </div>

                <div style={{
                  padding: '3px 8px',
                  backgroundColor: settings.theme === 'dark' ? 'rgba(75, 213, 238, 0.2)' : 'rgba(0, 135, 198, 0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'
                }}>
                  Time: {timeLeft}s
                </div>
              </div>
            </div>
            
            {headerButtons}
          </div>
          
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
              <h2 style={{ 
                fontSize: '2.5rem', 
                marginBottom: '1rem',
                textShadow: '0 0 10px rgba(255, 100, 100, 0.7)',
              }}>
                Test Complete!
              </h2>
              <p style={{ 
                fontSize: '1.5rem',
                marginBottom: '0.5rem',
              }}>
                Your typing speed: {wpm} WPM
              </p>
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
      </div>
      <style>{`
        @keyframes float {
          0% { transform: rotate(90deg) translateY(0); }
          50% { transform: rotate(90deg) translateY(-10px); }
          100% { transform: rotate(90deg) translateY(0); }
        }

        @keyframes laserShoot {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        .floating-ship {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};