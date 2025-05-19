import React, { useState, useEffect, useRef } from 'react';
import TextDisplay from '../typing/TextDisplay';
import TypingInput from '../typing/TypingInput';
import Stats from '../stats/Stats';
import Settings from '../settings/Settings';
import { AudioManager } from '../../services/AudioManager';
import { useGameContext } from '../../context/GameContext';
import { getRandomText } from '../../utils/TextUtils';
import Leaderboard from '../game/Leaderboard';

export const TypingGame: React.FC = () => {
  const [text, setText] = useState(getRandomText());
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [completed, setCompleted] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  const { settings, showSettings, addScore } = useGameContext();
  const audioManager = useRef<AudioManager>(new AudioManager());

  useEffect(() => {
    // removed: audioManager.current.init();
  }, []);

  const handleInputChange = (value: string) => {
    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }

    setInput(value);
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (i < text.length && value[i] === text[i]) {
        correctChars++;
      }
    }
    const newAccuracy = value.length > 0 ? Math.floor((correctChars / value.length) * 100) : 100;
    setAccuracy(newAccuracy);

    // Calculate WPM
    if (startTime) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const words = value.length / 5; // Approximate words typed
      if (elapsedMinutes > 0) {
        const calculatedWpm = Math.floor(words / elapsedMinutes);
        setWpm(calculatedWpm);
        
      
      }
    }

    const isExactMatch = value === text && value.length > 0;

    if (isExactMatch) {
      setCompleted(true);
      if (audioManager) {
        audioManager.current.playSound('hit');
      }
      
      if (wpm > 0 && !scoreSaved) {
        addScore(wpm, accuracy);
        setScoreSaved(true);
      }
    }
  };

  const resetGame = () => {
    setText(getRandomText());
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setCompleted(false);
    setScoreSaved(false);
   
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: settings.colors[settings.theme].background,
      color: settings.colors[settings.theme].text,
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    }}>
      {showSettings && <Settings onClose={undefined} />}
      
      <TextDisplay text={text} userInput={input} />
      
      <TypingInput 
        value={input}
        onChange={handleInputChange}
        completed={completed}
        audioManager={audioManager.current}
      />
      
      <Stats wpm={wpm} accuracy={accuracy} />
      
      {completed && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              backgroundColor: settings.colors[settings.theme].correct,
              color: settings.colors[settings.theme].background,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            onMouseDown={() => audioManager.current.playSound('click')}
          >
            Try Again
          </button>
        </div>
      )}
      
   
      
      <Leaderboard currentWpm={wpm} currentAccuracy={accuracy} />
      
      
    </div>
  );
};

export default TypingGame;
