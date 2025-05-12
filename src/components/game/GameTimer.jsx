import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

const GameTimer = () => {
  const { theme, isGameActive } = useGameContext();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (isGameActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '10px 20px',
      backgroundColor: theme === 'dark' ? 'rgba(75, 213, 238, 0.1)' : 'rgba(0, 135, 198, 0.1)',
      border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
      borderRadius: '5px',
      color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      boxShadow: theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.2)' : '0 0 10px rgba(0, 135, 198, 0.2)',
    }}>
      {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
    </div>
  );
};

export default GameTimer;
