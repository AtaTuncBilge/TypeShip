import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

const Countdown = ({ onComplete, audioManager }) => {
  const [count, setCount] = useState(3);
  const { settings } = useGameContext();

  useEffect(() => {
    if (count > 0) {
      // Just use playSound directly with keypress sound
      if (settings.soundEnabled && audioManager) {
        audioManager.playSound('keypress');
      }
      
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete, settings.soundEnabled, audioManager]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 100
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: 'bold',
        color: '#4bd5ee',
        textShadow: '0 0 20px rgba(75, 213, 238, 0.7)',
        animation: 'pulse 0.5s ease-in-out'
      }}>
        {count === 0 ? 'GO!' : count}
      </div>
    </div>
  );
};

export default Countdown;
