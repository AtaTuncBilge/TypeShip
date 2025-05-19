import React, { useRef, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { TypingInputProps } from '../../types';

export const TypingInput: React.FC<TypingInputProps> = ({ value, onChange, completed, audioManager }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings } = useGameContext(); // Add this line to get settings from context

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings.soundEnabled && audioManager) {
      audioManager.playSound('keypress');
    }
    onChange(e.target.value);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
