import React from 'react';
import { useGameContext } from '../../context/GameContext';

const Ads = () => {
  const { theme } = useGameContext();
  
  return (
    <div style={{
      marginTop: '20px',
      padding: '15px',
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#2a2a2a',
      borderRadius: '6px',
      textAlign: 'center',
      borderLeft: '4px solid #ff9800'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>SPONSOR</div>
      <p style={{ margin: 0 }}>
        Want to improve your typing skills even further? 
        Try our premium typing courses! (Mock Ad)
      </p>
    </div>
  );
};

export default Ads;