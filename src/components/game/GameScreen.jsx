import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';
import VirtualKeyboard from './VirtualKeyboard';
import { WORD_LIST } from '../../constants/wordList';

// Update constants
const KEYBOARD_HEIGHT = 250;
const WORD_SPEED = 3.5; // Increased speed for faster movement
const WORD_SPACING = 400;
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

export const GameScreen = ({ onExit, playerName }) => {
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
  const [leaderboard, setLeaderboard] = useState([]);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const gameLoopRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  // Add pause state
  const [isPaused, setIsPaused] = useState(false);

  // ESC ile pause toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isGameActive && !gameOver) {
        setIsPaused(prev => !prev);
        if (settings.soundEnabled && audioManager) {
          audioManager.playSound('hit');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameActive, gameOver, settings.soundEnabled, audioManager]);

  // Pause/resume fonksiyonu
  const handlePauseToggle = () => {
    setIsPaused(prev => !prev);
    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('hit');
    }
  };

  // Move generateWord function definition before it's used
  const generateWord = useCallback((area, laneIndex, laneWords = []) => {
    if (!area) return null;
    const laneHeight = calculateLaneHeight(area, KEYBOARD_HEIGHT);
    const baseY = (laneHeight * laneIndex) + (laneHeight / 2);

    // Estimate word width for spacing
    const getWordWidth = w => (w.word.length * 15) + 30;
    let x = area.clientWidth; // Start at the right edge of the screen

    // Find the last word in the lane
    const lastWord = [...laneWords].reverse().find(w => !w.matched && !w.faded);
    if (lastWord) {
      x = Math.max(area.clientWidth, lastWord.x + getWordWidth(lastWord) + WORD_SPACING); // Ensure consistent spacing
    }

    // Generate a word
    const wordObj = {
      id: Math.random().toString(36).substr(2, 9),
      word: getRandomWord(),
      x,
      y: baseY - 15, // Center the word vertically in the lane
      speed: WORD_SPEED,
      lane: laneIndex,
      matched: false
    };

    return wordObj;
  }, []);

  // --- Helper to check for word collision in a lane (use word width estimation) ---
  function isColliding(newWord, lane, minDistance = 160) {
    // Estimate word width based on character count (monospace, ~15px per char + padding)
    const getWordWidth = w => (w.word.length * 15) + 30;
    return lane.some(word =>
      !word.matched && !word.faded &&
      Math.abs(word.x - newWord.x) < ((getWordWidth(word) + getWordWidth(newWord)) / 2 + minDistance)
    );
  }

  // --- Update gameLoop to use collision-aware word generation with width ---
  const gameLoop = useCallback((timestamp) => {
    if (!isGameActive || gameOver || isPaused) return;

    const deltaTime = timestamp - lastFrameTimeRef.current;
    if (deltaTime < 16) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    lastFrameTimeRef.current = timestamp;

    setLanes(prevLanes => {
      const updatedLanes = prevLanes.map((lane, index) => {
        // Move words and handle fade
        const movedLane = lane.map(word => {
          const newX = word.x - WORD_SPEED;
          if (!word.matched && newX < -180 && !word.faded) {
            return { ...word, x: newX, faded: true };
          }
          if (word.faded) {
            return { ...word, x: newX };
          }
          return { ...word, x: newX };
        }).filter(word => {
          if (word.faded && word.x < -250) return false;
          if (word.matched) return false;
          return true;
        });

        // Add new word if needed, ensuring alignment
        const getWordWidth = w => (w.word.length * 15) + 30;
        const lastWord = movedLane.length > 0 ? movedLane[movedLane.length - 1] : null;
        if (
          !lastWord ||
          lastWord.x < gameAreaRef.current.clientWidth - (getWordWidth(lastWord) + WORD_SPACING)
        ) {
          const newWord = generateWord(gameAreaRef.current, index, movedLane);
          if (newWord && !isColliding(newWord, movedLane, 40)) {
            movedLane.push(newWord);
          }
        }
        return movedLane;
      });

      return updatedLanes;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isGameActive, gameOver, isPaused, generateWord]);

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
  // --- Replace renderWord with fade in/out animation and non-typeable after fade out ---
  const renderWord = useCallback((wordObj) => {
    const { word, x, y, matched } = wordObj; // removed faded

    // Fade out if word is out of screen or matched
    const isFadingOut = matched || x < -180;

    return (
      <div
        key={wordObj.id}
        className={`word-container${isFadingOut ? ' word-fade-out' : ' word-fade-in'}`}
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
          opacity: isFadingOut ? 0 : 1,
          pointerEvents: isFadingOut ? 'none' : 'auto',
          transition: 'opacity 0.45s cubic-bezier(.4,0,.2,1), left 0.02s linear, top 0.02s linear'
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

    // Only match words that are not faded or matched
    const allWords = lanes.flat();
    const exactMatch = allWords.find(w => !w.matched && !w.faded && w.word === value);
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

  // Oyun sonunda skor gönder ve leaderboard'u çek
  useEffect(() => {
    if (!gameOver) return;
    setSubmittingScore(true);
    setLeaderboardError(null);
    const gameDuration = 60; // Süreyi burada ayarla (veya dinamikse state'ten al)
    fetch('http://localhost:3001/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: playerName,
        time: gameDuration,
        wpm: wpm,
        accuracy: accuracy
      })
    })
      .then(() => fetch('http://localhost:3001/results'))
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => setLeaderboard(
        [...data].sort((a, b) => b.wpm - a.wpm) // Sort by WPM descending
      ))
      .catch(() => setLeaderboardError('Could not load leaderboard.'))
      .finally(() => setSubmittingScore(false));
  }, [gameOver, playerName, wpm, accuracy]);

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

  // --- StatBox ve header statlarını yukarıda ortala ---
  const statsDisplay = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      backgroundColor: settings.theme === 'dark' ? 'rgba(60, 70, 90, 0.5)' : 'rgba(240, 245, 255, 0.5)',
      padding: '10px 24px',
      borderRadius: '24px',
      margin: '0 auto',
      marginBottom: '18px',
      fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif'
    }}>
      <StatBox label="WPM" value={wpm} theme={settings.theme} />
      <StatBox label="ACC" value={`${accuracy}%`} theme={settings.theme} />
      <StatBox label="Keys" value={keystrokes} theme={settings.theme} />
      <StatBox label="Time" value={`${timeLeft}s`} theme={settings.theme} />
    </div>
  );

  // --- Fullscreen, Main Menu, Pause tuşları ana menüdeki font ve spacing ile ---
  const headerButtons = (
    <div style={{ display: 'flex', gap: '20px', fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif' }}>
      <button
        onClick={() => {
          handleButtonClick();
          toggleFullscreen();
        }}
        className="game-action-btn"
        style={{
          padding: '10px 20px', // Reduced padding
          fontSize: '1rem', // Reduced font size
          backgroundColor: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
          color: settings.theme === 'dark' ? '#181d26' : '#fff',
          border: 'none',
          borderRadius: '20px', // Reduced border radius
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: settings.theme === 'dark'
            ? '0 0 8px rgba(75, 213, 238, 0.5)'
            : '0 0 8px rgba(0, 135, 198, 0.3)',
          transition: 'all 0.2s',
          letterSpacing: '1px',
        }}
      >
        {isFullscreen ? '🗕 Exit Fullscreen' : '🗖 Fullscreen'}
      </button>
      <button
        onClick={() => {
          handleButtonClick();
          onExit();
        }}
        className="game-action-btn"
        style={{
          padding: '10px 20px', // Reduced padding
          fontSize: '1rem', // Reduced font size
          backgroundColor: 'transparent',
          color: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
          border: `2px solid ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
          borderRadius: '20px', // Reduced border radius
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: 'none',
          transition: 'all 0.2s',
          letterSpacing: '1px',
        }}
      >
        🏠 Main Menu
      </button>
      <button
        onClick={handlePauseToggle}
        className="game-action-btn"
        style={{
          padding: '10px 20px', // Reduced padding
          fontSize: '1rem', // Reduced font size
          backgroundColor: isPaused ? '#ffd700' : (settings.theme === 'dark' ? '#232b3b' : '#e3f2fd'),
          color: isPaused ? '#181d26' : (settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'),
          border: `2px solid ${isPaused ? '#ffd700' : (settings.theme === 'dark' ? '#4bd5ee' : '#0087c6')}`,
          borderRadius: '20px', // Reduced border radius
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: isPaused ? '0 0 8px #ffd70088' : 'none',
          transition: 'all 0.2s',
          letterSpacing: '1px',
        }}
      >
        {isPaused ? '▶️ Resume' : '⏸ Pause'}
      </button>
    </div>
  );

  // --- Oyun başladığında kelimeler hemen gelsin, tüm lane'ler eşit ve dolu başlasın ---
  const startGame = () => {
    // Fill each lane with 6 words, spaced equally, at the right edge
    const initialLanes = Array(LANE_COUNT).fill([]).map((_, laneIndex) => {
      const words = [];
      let x = gameAreaRef.current.clientWidth;
      for (let i = 0; i < 6; i++) {
        const word = generateWord(gameAreaRef.current, laneIndex, words);
        if (word) {
          word.x = x;
          if (!isColliding(word, words, 20)) {
            words.push(word);
            x += (word.word.length * 15) + WORD_SPACING;
          }
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
    setIsPaused(false);
    requestAnimationFrame(gameLoop);

    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('ambient');
    }
  };

  // Add handleReplay before return
  const handleReplay = () => {
    startGame();
  };

  // --- Statları yukarıda ortala, header'da ortada göster ---
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
      {/* Floating meteors on soft edges */}
      <FloatingMeteors theme={settings.theme} />
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        {/* Statları yukarıda ortala */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{
            fontSize: '2rem',
            margin: 0,
            textShadow: settings.theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.7)' : '0 0 10px rgba(0, 135, 198, 0.4)',
            letterSpacing: '2px',
            fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif'
          }}>
            TYPE SHIP
          </h1>
          {statsDisplay}
        </div>
        {/* Header tuşları sağda */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '10px',
          marginTop: '-70px', // statDisplay ile hizalı dursun
          width: '100%'
        }}>
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
            boxShadow: settings.theme === 'dark'
              ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #4bd5ee33'
              : '0 8px 40px 0 #0002',
          }}
        >
          {/* ...gameLayout... */}
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
            background: 'rgba(0,0,0,0.78)',
            zIndex: 100,
          }}>
            <div style={{
              background: settings.theme === 'dark'
                ? 'linear-gradient(135deg, #181d26 0%, #232b3b 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)',
              borderRadius: '32px',
              boxShadow: settings.theme === 'dark'
                ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #4bd5ee33'
                : '0 8px 40px 0 #0002',
              padding: '48px 36px 36px 36px',
              minWidth: '340px',
              maxWidth: '95vw',
              width: '420px',
              textAlign: 'center',
              border: `2px solid ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '2.3rem',
                color: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
                marginBottom: '1.2rem',
                letterSpacing: '2px',
                fontWeight: 700,
                textShadow: settings.theme === 'dark'
                  ? '0 0 12px #4bd5ee99'
                  : '0 0 10px #0087c699'
              }}>
                Ready to Test Your Typing Speed?
              </h2>
              <div style={{
                fontSize: '1.15rem',
                color: settings.theme === 'dark' ? '#e0e0e0' : '#333',
                marginBottom: '2.2rem',
                lineHeight: 1.7,
                letterSpacing: '0.5px'
              }}>
                <span style={{
                  display: 'inline-block',
                  background: settings.theme === 'dark'
                    ? 'rgba(75,213,238,0.08)'
                    : 'rgba(0,135,198,0.08)',
                  borderRadius: '18px',
                  padding: '10px 22px',
                  fontWeight: 500,
                  boxShadow: settings.theme === 'dark'
                    ? '0 0 8px #4bd5ee33'
                    : '0 0 8px #0087c633'
                }}>
                  You have <b>60 seconds</b>.<br />
                  Type as many words as you can!
                </span>
              </div>
              <button
                onClick={startGame}
                style={{
                  padding: '15px 30px',
                  fontSize: '1.2rem',
                  backgroundColor: '#4bd5ee',
                  color: '#181d26',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px rgba(75, 213, 238, 0.7)',
                  letterSpacing: '1px',
                  transition: 'all 0.2s'
                }}
              >
                START TEST
              </button>
            </div>
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
            {/* Game Over Stats */}
            <div style={{
              background: settings.theme === 'dark'
                ? 'linear-gradient(135deg, #181d26 0%, #232b3b 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)',
              borderRadius: '32px',
              boxShadow: settings.theme === 'dark'
                ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #4bd5ee33'
                : '0 8px 40px 0 #0002',
              padding: '36px 36px 24px 36px',
              minWidth: '340px',
              maxWidth: '95vw',
              width: '420px',
              textAlign: 'center',
              border: `2px solid ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '2rem',
                color: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
                marginBottom: '0.8rem',
                letterSpacing: '2px',
                fontWeight: 700,
                textShadow: settings.theme === 'dark'
                  ? '0 0 12px #4bd5ee99'
                  : '0 0 10px #0087c699'
              }}>
                Game Over!
              </h2>
              <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', marginBottom: '1.2rem' }}>
                <StatBox label="WPM" value={wpm} theme={settings.theme} />
                <StatBox label="ACC" value={`${accuracy}%`} theme={settings.theme} />
                <StatBox label="Keys" value={keystrokes} theme={settings.theme} />
              </div>
            </div>
            {/* Leaderboard */}
            <div style={{
              background: settings.theme === 'dark'
                ? 'linear-gradient(135deg, #232b3b 0%, #181d26 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)',
              borderRadius: '24px',
              boxShadow: settings.theme === 'dark'
                ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #4bd5ee33'
                : '0 8px 40px 0 #0002',
              padding: '24px 24px 16px 24px',
              minWidth: '280px',
              maxWidth: '90vw',
              width: '340px',
              textAlign: 'center',
              border: `2px solid ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                color: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
                marginBottom: '0.6rem',
                letterSpacing: '1px',
                fontWeight: 600,
              }}>
                Leaderboard
              </h3>
              {submittingScore ? (
                <div>Loading...</div>
              ) : leaderboardError ? (
                <div style={{ color: 'red' }}>{leaderboardError}</div>
              ) : (
                <ol style={{
                  listStyle: 'decimal',
                  paddingLeft: '1.2em',
                  margin: 0,
                  width: '100%',
                  textAlign: 'left'
                }}>
                  {leaderboard.slice(0, 10).map((entry, idx) => (
                    <li key={entry.name + idx} style={{
                      padding: '6px 0',
                      color: entry.name === playerName ? (settings.theme === 'dark' ? '#ffd700' : '#b8860b') : undefined,
                      fontWeight: entry.name === playerName ? 'bold' : undefined
                    }}>
                      {entry.name}: <b>{entry.wpm}</b> WPM, {entry.accuracy}% ACC
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
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

        {/* Pause overlay */}
        {isPaused && isGameActive && !gameOver && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.75)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: settings.theme === 'dark'
                ? 'linear-gradient(135deg, #232b3b 0%, #181d26 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)',
              borderRadius: '32px',
              boxShadow: settings.theme === 'dark'
                ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #4bd5ee33'
                : '0 8px 40px 0 #0002',
              padding: '48px 36px 36px 36px',
              minWidth: '340px',
              maxWidth: '95vw',
              width: '420px',
              textAlign: 'center',
              border: `2px solid ${settings.theme === 'dark' ? '#ffd700' : '#b8860b'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '2.2rem',
                color: '#ffd700',
                marginBottom: '1.2rem',
                letterSpacing: '2px',
                fontWeight: 700,
                textShadow: '0 0 12px #ffd70099'
              }}>
                Game Paused
              </h2>
              <div style={{
                fontSize: '1.1rem',
                color: settings.theme === 'dark' ? '#e0e0e0' : '#333',
                marginBottom: '2.2rem',
                lineHeight: 1.7,
                letterSpacing: '0.5px'
              }}>
                Press <b>ESC</b> or <b>Resume</b> to continue.
              </div>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button
                  onClick={handlePauseToggle}
                  style={{
                    padding: '12px 24px',
                    fontSize: '1.1rem',
                    backgroundColor: '#ffd700',
                    color: '#181d26',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 0 15px #ffd70077',
                    letterSpacing: '1px',
                    transition: 'all 0.2s'
                  }}
                >
                  ▶️ Resume
                </button>
                <button
                  onClick={handleReplay}
                  style={{
                    padding: '12px 24px',
                    fontSize: '1.1rem',
                    backgroundColor: settings.theme === 'dark' ? '#4bd5ee' : '#0087c6',
                    color: settings.theme === 'dark' ? '#181d26' : '#fff',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: settings.theme === 'dark'
                      ? '0 0 10px #4bd5ee77'
                      : '0 0 10px #0087c677',
                    letterSpacing: '1px',
                    transition: 'all 0.2s'
                  }}
                >
                  🔄 Replay
                </button>
              </div>
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
        @keyframes meteorFloat1 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-12px);}
          100% { transform: translateY(0);}
        }
        @keyframes meteorFloat2 {
          0% { transform: translateY(0);}
          50% { transform: translateY(10px);}
          100% { transform: translateY(0);}
        }
        @keyframes meteorFloat3 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-8px);}
          100% { transform: translateY(0);}
        }
        @keyframes meteorFloat4 {
          0% { transform: translateY(0);}
          50% { transform: translateY(8px);}
          100% { transform: translateY(0);}
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
          background: linear-gradient(90deg, rgba(75,213,238,0.08) 0%, rgba(75,213,238,0.18) 100%);
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
        /* Virtual keyboard style improvements */
        .virtual-keyboard {
          background: ${settings.theme === 'dark' ? 'rgba(30,35,45,0.95)' : 'rgba(255,255,255,0.95)'};
          border-radius: 18px;
          box-shadow: 0 4px 24px ${settings.theme === 'dark' ? '#4bd5ee33' : '#0087c633'};
          padding: 18px 18px 10px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1.5px solid ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'};
        }
        .virtual-keyboard-row {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
        }
        .virtual-key {
          background: ${settings.theme === 'dark' ? '#232b3b' : '#e3f2fd'};
          color: ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'};
          border: none;
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.1rem;
          padding: 8px 13px;
          margin: 0 2px;
          box-shadow: 0 1px 4px ${settings.theme === 'dark' ? '#4bd5ee22' : '#0087c622'};
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .virtual-key.active {
          background: ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'};
          color: ${settings.theme === 'dark' ? '#181d26' : '#fff'};
          box-shadow: 0 0 10px ${settings.theme === 'dark' ? '#4bd5ee' : '#0087c6'};
          font-weight: bold;
        }
        .word-fade-in {
          animation: wordFadeIn 0.25s cubic-bezier(.4,0,.2,1);
        }
        .word-fade-out {
          animation: wordFadeOut 0.45s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes wordFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px);}
          to { opacity: 1; transform: scale(1) translateY(0);}
        }
        @keyframes wordFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Add FloatingMeteors definition here (before GameScreen)
const FloatingMeteors = ({ theme }) => (
  <>
    <div style={{
      position: 'absolute',
      top: '8%',
      left: '3%',
      fontSize: '2.2rem',
      opacity: 0.7,
      filter: 'drop-shadow(0 0 12px #ff9800)',
      pointerEvents: 'none',
      userSelect: 'none',
      animation: 'meteorFloat1 7s ease-in-out infinite'
    }}>☄️</div>
    <div style={{
      position: 'absolute',
      bottom: '10%',
      right: '4%',
      fontSize: '2.1rem',
      opacity: 0.7,
      filter: 'drop-shadow(0 0 10px #ff9800)',
      pointerEvents: 'none',
      userSelect: 'none',
      animation: 'meteorFloat2 8s ease-in-out infinite'
    }}>☄️</div>
    <div style={{
      position: 'absolute',
      top: '15%',
      right: '7%',
      fontSize: '1.7rem',
      opacity: 0.6,
      filter: 'drop-shadow(0 0 8px #ff9800)',
      pointerEvents: 'none',
      userSelect: 'none',
      animation: 'meteorFloat3 9s ease-in-out infinite'
    }}>☄️</div>
    <div style={{
      position: 'absolute',
      bottom: '12%',
      left: '7%',
      fontSize: '1.5rem',
      opacity: 0.6,
      filter: 'drop-shadow(0 0 8px #ff9800)',
      pointerEvents: 'none',
      userSelect: 'none',
      animation: 'meteorFloat4 10s ease-in-out infinite'
    }}>☄️</div>
  </>
);