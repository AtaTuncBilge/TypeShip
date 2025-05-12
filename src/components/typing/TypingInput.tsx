import React, { useRef, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { TypingInputProps } from '../../types';

export const TypingInput: React.FC<TypingInputProps> = ({ value, onChange, completed, audioManager }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={completed}
    />
  );
};

export default TypingInput;
