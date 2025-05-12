import React, { useRef, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

const TypingInput = ({ value, onChange, completed, audioManager }) => {
  const inputRef = useRef(null);
  const { settings } = useGameContext();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleChange = (e) => {
    if (settings.soundEnabled && audioManager) {
      audioManager.playTypingSound(); // Use playTypingSound instead of playKeypress
    }
    onChange(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      disabled={completed}
    />
  );
};

export default TypingInput;