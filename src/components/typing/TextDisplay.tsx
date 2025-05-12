import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { TextDisplayProps } from '../../types';

export const TextDisplay: React.FC<TextDisplayProps> = ({ text, userInput }) => {
  const { settings } = useGameContext();
  
  return (
    <div>
      {text}
    </div>
  );
};

export default TextDisplay;
