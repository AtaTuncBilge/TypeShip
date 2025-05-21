import React from 'react';

const GameOverScreen = ({ onRestart }) => (
  <div>
    <h2>Game Over</h2>
    <button onClick={onRestart}>Restart</button>
  </div>
);

export default GameOverScreen;
