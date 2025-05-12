import React from 'react';
import { useGameContext } from 'GameContext';
const TextDisplay = ({ text, userInput }) => {
  const { settings } = useGameContext();
  const theme = settings.theme || 'light';
  
  const renderText = () => {
    return text.split('').map((char, index) => {
      let color;
      if (index < userInput.length) {
        // Correct character is magenta, incorrect is a softer red
        color = userInput[index] === char ? '#E40046' : '#FF6B6B';
      } else {
        // Untyped characters use the theme appropriate color
        color = theme === 'light' ? '#1C1A1B' : '#E2DCDD';
      }
      
      return (
        <span 
          key={index} 
          style={{ 
            color, 
            fontWeight: index === userInput.length ? 'bold' : 'normal',
            textDecoration: index === userInput.length ? 'underline' : 'none'
          }}
        >
          {char}
        </span>
      );
    });
  };
  
  return (
    <div style={{ 
      fontSize: '1.4rem', 
      lineHeight: '1.6', 
      letterSpacing: '0.5px',
      marginBottom: '30px',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: theme === 'light' ? '#E2DCDD' : '#1C1A1B',
      boxShadow: theme === 'light' 
        ? 'inset 0 2px 8px rgba(28, 26, 27, 0.15)' 
        : 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
      border: `2px solid ${theme === 'light' ? '#ccc' : '#333'}`,
      transition: 'all 0.3s ease'
    }}>
      {renderText()}
    </div>
  );
};
export default TextDisplay;