import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

export const LoadingScreen = ({ progress = 0 }) => {
  const { settings } = useGameContext();
  const theme = settings?.theme || 'dark';
  const [dots, setDots] = useState('...');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
      color: theme === 'dark' ? '#e0e0e0' : '#333',
      fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, ${theme === 'dark' ? 'rgba(32, 41, 64, 0.8)' : 'rgba(230, 240, 255, 0.8)'} 0%, ${theme === 'dark' ? 'rgba(18, 18, 18, 1)' : 'rgba(245, 245, 245, 1)'} 100%)`,
        zIndex: 1,
      }} />
      
      {/* Stars background */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: theme === 'dark' ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 800 800\'%3E%3Cg fill=\'none\' stroke=\'%23404\' stroke-width=\'1\'%3E%3Cpath d=\'M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63\'/%3E%3Cpath d=\'M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764\'/%3E%3Cpath d=\'M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880\'/%3E%3Cpath d=\'M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382\'/%3E%3Cpath d=\'M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269\'/%3E%3C/g%3E%3Cg fill=\'%23505\'%3E%3Ccircle cx=\'769\' cy=\'229\' r=\'5\'/%3E%3Ccircle cx=\'539\' cy=\'269\' r=\'5\'/%3E%3Ccircle cx=\'603\' cy=\'493\' r=\'5\'/%3E%3Ccircle cx=\'731\' cy=\'737\' r=\'5\'/%3E%3Ccircle cx=\'520\' cy=\'660\' r=\'5\'/%3E%3Ccircle cx=\'309\' cy=\'538\' r=\'5\'/%3E%3Ccircle cx=\'295\' cy=\'764\' r=\'5\'/%3E%3Ccircle cx=\'40\' cy=\'599\' r=\'5\'/%3E%3Ccircle cx=\'102\' cy=\'382\' r=\'5\'/%3E%3Ccircle cx=\'127\' cy=\'80\' r=\'5\'/%3E%3Ccircle cx=\'370\' cy=\'105\' r=\'5\'/%3E%3Ccircle cx=\'578\' cy=\'42\' r=\'5\'/%3E%3Ccircle cx=\'237\' cy=\'261\' r=\'5\'/%3E%3Ccircle cx=\'390\' cy=\'382\' r=\'5\'/%3E%3C/g%3E%3C/svg%3E")' : 'none',
        opacity: 0.3,
        zIndex: 0,
      }} />

      <h1 style={{
        fontSize: '3rem',
        margin: '0 0 2rem 0',
        textShadow: theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.7)' : '0 0 10px rgba(0, 135, 198, 0.4)',
        zIndex: 2,
        letterSpacing: '3px',
      }}>
        TYPE SHIP
      </h1>

      <div style={{ 
        width: '70%', 
        maxWidth: '300px', 
        height: '10px', 
        backgroundColor: theme === 'dark' ? '#2a2a2a' : '#d4d4d4',
        borderRadius: '5px',
        marginBottom: '1.5rem',
        overflow: 'hidden',
        zIndex: 2,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: theme === 'dark' ? '#4bd5ee' : '#0087c6',
          borderRadius: '5px',
          transition: 'width 0.3s ease-in-out',
          boxShadow: theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.5)' : '0 0 10px rgba(0, 135, 198, 0.3)',
        }} />
      </div>

      <div style={{
        fontSize: '1.2rem',
        zIndex: 2,
        fontFamily: '"Exo 2", Arial, sans-serif',
        letterSpacing: '1px',
      }}>
        <span>Loading{dots}</span>
      </div>
      
      {/* Rocket ship animation */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        animation: 'float 3s ease-in-out infinite',
        zIndex: 2,
        transform: 'rotate(45deg)',
        opacity: 0.8,
      }}>
        🚀
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Exo+2:wght@400;700&display=swap');
        
        @keyframes float {
          0% { transform: translate(0, 0) rotate(45deg); }
          50% { transform: translate(10px, -10px) rotate(45deg); }
          100% { transform: translate(0, 0) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};