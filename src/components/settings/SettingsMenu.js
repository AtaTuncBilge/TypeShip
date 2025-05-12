import React, { useState } from 'react';
import { useGameContext } from '../../context/GameContext';

export const SettingsMenu = ({ onBack }) => {
  const { settings, updateSettings, audioManager } = useGameContext();
  const [buttonHover, setButtonHover] = useState(null);
  const theme = settings?.theme || 'dark';
  
  // Play a sound when buttons are clicked
  const handleButtonClick = () => {
    if (audioManager) {
      audioManager.playSound('keypress1');
    }
    onBack();
  };

  // Handle settings changes
  const handleSettingChange = (setting, value) => {
    updateSettings({ [setting]: value });
    
    // Play sound feedback for toggles
    if (audioManager) {
      audioManager.playSound('keypress1');
    }
  };

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
      {/* Background elements - same as main menu for consistency */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, ${theme === 'dark' ? 'rgba(32, 41, 64, 0.8)' : 'rgba(230, 240, 255, 0.8)'} 0%, ${theme === 'dark' ? 'rgba(18, 18, 18, 1)' : 'rgba(245, 245, 245, 1)'} 100%)`,
        zIndex: 0,
      }} />
      
      {/* Stars background - only in dark mode */}
      {theme === 'dark' && (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 800 800\'%3E%3Cg fill=\'none\' stroke=\'%23404\' stroke-width=\'1\'%3E%3Cpath d=\'M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63\'/%3E%3Cpath d=\'M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764\'/%3E%3Cpath d=\'M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880\'/%3E%3Cpath d=\'M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382\'/%3E%3Cpath d=\'M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269\'/%3E%3C/g%3E%3Cg fill=\'%23505\'%3E%3Ccircle cx=\'769\' cy=\'229\' r=\'5\'/%3E%3Ccircle cx=\'539\' cy=\'269\' r=\'5\'/%3E%3Ccircle cx=\'603\' cy=\'493\' r=\'5\'/%3E%3Ccircle cx=\'731\' cy=\'737\' r=\'5\'/%3E%3Ccircle cx=\'520\' cy=\'660\' r=\'5\'/%3E%3Ccircle cx=\'309\' cy=\'538\' r=\'5\'/%3E%3Ccircle cx=\'295\' cy=\'764\' r=\'5\'/%3E%3Ccircle cx=\'40\' cy=\'599\' r=\'5\'/%3E%3Ccircle cx=\'102\' cy=\'382\' r=\'5\'/%3E%3Ccircle cx=\'127\' cy=\'80\' r=\'5\'/%3E%3Ccircle cx=\'370\' cy=\'105\' r=\'5\'/%3E%3Ccircle cx=\'578\' cy=\'42\' r=\'5\'/%3E%3Ccircle cx=\'237\' cy=\'261\' r=\'5\'/%3E%3Ccircle cx=\'390\' cy=\'382\' r=\'5\'/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
          zIndex: 0,
        }} />
      )}
      
      {/* Content container */}
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '500px',
      }}>
        {/* Settings Title */}
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '2rem',
          textShadow: theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.7)' : '0 0 10px rgba(0, 135, 198, 0.4)',
          letterSpacing: '3px',
        }}>
          SETTINGS
        </h1>
        
        {/* Settings Container */}
        <div style={{
          width: '100%',
          backgroundColor: theme === 'dark' ? 'rgba(30, 34, 40, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: theme === 'dark' ? '0 0 20px rgba(0, 0, 0, 0.3)' : '0 0 20px rgba(0, 0, 0, 0.1)',
        }}>
          {/* Sound Effects Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
          }}>
            <span style={{ fontSize: '1.1rem', fontFamily: '"Exo 2", sans-serif' }}>Sound Effects</span>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '60px',
              height: '30px',
            }}>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.soundEnabled ? '#4bd5ee' : '#ccc',
                transition: '0.4s',
                borderRadius: '34px',
                '&:before': {
                  position: 'absolute',
                  content: '""',
                  height: '22px',
                  width: '22px',
                  left: '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%',
                }
              }}>
                <span style={{
                  position: 'absolute',
                  height: '22px',
                  width: '22px',
                  left: settings.soundEnabled ? '34px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%',
                }}></span>
              </span>
            </label>
          </div>
          
          {/* Background Music Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
          }}>
            <span style={{ fontSize: '1.1rem', fontFamily: '"Exo 2", sans-serif' }}>Background Music</span>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '60px',
              height: '30px',
            }}>
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={() => handleSettingChange('musicEnabled', !settings.musicEnabled)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.musicEnabled ? '#4bd5ee' : '#ccc',
                transition: '0.4s',
                borderRadius: '34px',
                '&:before': {
                  position: 'absolute',
                  content: '""',
                  height: '22px',
                  width: '22px',
                  left: '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%',
                }
              }}>
                <span style={{
                  position: 'absolute',
                  height: '22px',
                  width: '22px',
                  left: settings.musicEnabled ? '34px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%',
                }}></span>
              </span>
            </label>
          </div>
          
          {/* Volume Control */}
          <div style={{
            padding: '15px 0',
            borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}>
              <span style={{ fontSize: '1.1rem', fontFamily: '"Exo 2", sans-serif' }}>Volume</span>
              <span style={{ fontSize: '1rem', color: theme === 'dark' ? '#aaa' : '#555' }}>
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '5px',
                appearance: 'none',
                outline: 'none',
                opacity: '0.7',
                transition: 'opacity .2s',
                background: `linear-gradient(to right, ${theme === 'dark' ? '#4bd5ee' : '#0087c6'} 0%, ${theme === 'dark' ? '#4bd5ee' : '#0087c6'} ${settings.volume * 100}%, ${theme === 'dark' ? '#555' : '#ddd'} ${settings.volume * 100}%, ${theme === 'dark' ? '#555' : '#ddd'} 100%)`,
              }}
            />
          </div>
          
          {/* Theme Selection */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
          }}>
            <span style={{ fontSize: '1.1rem', fontFamily: '"Exo 2", sans-serif' }}>Dark Theme</span>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '60px',
              height: '30px',
            }}>
              <input
                type="checkbox"
                checked={settings.theme === 'dark'}
                onChange={() => handleSettingChange('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.theme === 'dark' ? '#4bd5ee' : '#ccc',
                transition: '0.4s',
                borderRadius: '34px',
                '&:before': {
                  position: 'absolute',
                  content: '""',
                  height: '22px',
                  width: '22px',
                  left: '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%',
                }
              }}>
                <span style={{
                  position: 'absolute',
                  height: '22px',
                  width: '22px',
                  left: settings.theme === 'dark' ? '34px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%',
                }}></span>
              </span>
            </label>
          </div>
          
          {/* Difficulty Level */}
          <div style={{
            padding: '15px 0',
            borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}>
              <span style={{ fontSize: '1.1rem', fontFamily: '"Exo 2", sans-serif' }}>Game Difficulty</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px',
            }}>
              {['easy', 'normal', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => handleSettingChange('difficulty', level)}
                  onMouseEnter={() => setButtonHover(level)}
                  onMouseLeave={() => setButtonHover(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: settings.difficulty === level 
                      ? (theme === 'dark' ? '#4bd5ee' : '#0087c6') 
                      : 'transparent',
                    color: settings.difficulty === level 
                      ? (theme === 'dark' ? '#121212' : 'white')
                      : (theme === 'dark' ? '#e0e0e0' : '#333'),
                    border: `2px solid ${settings.difficulty === level 
                      ? (theme === 'dark' ? '#4bd5ee' : '#0087c6') 
                      : (theme === 'dark' ? '#444' : '#ddd')}`,
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease-in-out',
                    transform: buttonHover === level && settings.difficulty !== level ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Back Button */}
        <button
          onClick={handleButtonClick}
          onMouseEnter={() => setButtonHover('back')}
          onMouseLeave={() => setButtonHover(null)}
          style={{
            padding: '15px 25px',
            fontSize: '1.2rem',
            backgroundColor: buttonHover === 'back' 
              ? (theme === 'dark' ? '#5be8fa' : '#0098d9') 
              : (theme === 'dark' ? '#4bd5ee' : '#0087c6'),
            color: theme === 'dark' ? '#121212' : 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: buttonHover === 'back'
              ? (theme === 'dark' ? '0 0 15px rgba(75, 213, 238, 0.9)' : '0 0 15px rgba(0, 135, 198, 0.6)')
              : (theme === 'dark' ? '0 0 10px rgba(75, 213, 238, 0.5)' : '0 0 10px rgba(0, 135, 198, 0.3)'),
            transform: buttonHover === 'back' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s ease-in-out',
            fontFamily: 'Orbitron, sans-serif',
          }}
        >
          BACK TO MENU
        </button>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Exo+2:wght@400;700&display=swap');
        
        /* Custom slider styles */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${theme === 'dark' ? '#4bd5ee' : '#0087c6'};
          cursor: pointer;
        }
        
        input[type=range]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${theme === 'dark' ? '#4bd5ee' : '#0087c6'};
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};