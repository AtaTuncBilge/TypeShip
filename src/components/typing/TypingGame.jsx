import React, { useState, useEffect, useRef } from 'react';
import TextDisplay from 'TextDisplay';
import TypingInput from 'TypingInput';
import Stats from 'Stats';
import Settings from 'Settings';
import { AudioManager } from 'AudioManager';
import Ads from 'Ads';
import { useGameContext } from 'GameContext';
import { getRandomText } from 'TextUtils';
import Leaderboard from 'Leaderboard';
const TypingGame = () => {
  const [text, setText] = useState(getRandomText());
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [completed, setCompleted] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showCheatDetector, setShowCheatDetector] = useState(false);
  const [isPossibleCheater, setIsPossibleCheater] = useState(false);
  const { settings, showSettings, showAds, addScore } = useGameContext();
  const audioManager = useRef(new AudioManager());
  
  useEffect(() => {
    audioManager.current.init();
  }, []);
  const handleInputChange = (value) => {
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
        
        // Check for suspiciously high WPM (potential cheating)
        if (calculatedWpm > 110 && !isPossibleCheater && !completed) {
          setShowCheatDetector(true);
          setIsPossibleCheater(true);
        }
      }
    }

    // Check if completed
    if (value === text) {
      setCompleted(true);
      audioManager.current.playComplete();
      
      // Save score to leaderboard if we have valid metrics
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
    setIsPossibleCheater(false);
  };
  
  const handleCheatResponse = (isCheating) => {
    setShowCheatDetector(false);
    
    if (isCheating) {
      // They admitted to cheating - reset the game
      resetGame();
    } else {
      // They denied cheating - let them continue
      // We could add additional logic here if needed
    }
  };
  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: settings.theme === 'light' ? '#ffffff' : '#2d2d2d',
      color: settings.theme === 'light' ? '#333' : '#f1f1f1',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    }}>
      {showSettings && <Settings />}
      
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
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Try Again
          </button>
        </div>
      )}
      
      {showAds && <Ads />}
      
      <Leaderboard currentWpm={wpm} currentAccuracy={accuracy} />

    
    </div>
  );
};

export default TypingGame;