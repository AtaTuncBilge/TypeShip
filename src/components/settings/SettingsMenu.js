import React, { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { THEME_COLORS } from '../../constants/theme';

const getBackgroundStyle = (theme) => ({
  background: theme === 'dark'
    ? 'radial-gradient(circle, rgba(32, 41, 64, 0.8) 0%, #0a0d13 100%)'
    : 'radial-gradient(circle, rgba(230, 240, 255, 0.8) 0%, #f5f5f5 100%)'
});

// MainMenu button style for consistency
const mainMenuButtonStyle = (theme, type = 'primary', active = true) => {
  if (type === 'primary') {
    return {
      padding: '15px 25px',
      fontSize: '1.2rem',
      backgroundColor: theme === 'dark' ? '#4bd5ee' : '#0087c6',
      color: theme === 'dark' ? '#121212' : '#fff',
      border: 'none',
      borderRadius: '30px',
      cursor: active ? 'pointer' : 'not-allowed',
      fontWeight: 'bold',
      boxShadow: theme === 'dark'
        ? '0 0 10px rgba(75, 213, 238, 0.5)'
        : '0 0 10px rgba(0, 135, 198, 0.3)',
      opacity: active ? 1 : 0.5,
      fontFamily: 'Orbitron, sans-serif',
      letterSpacing: '1px',
      marginBottom: '10px',
      transition: 'all 0.2s ease-in-out',
    };
  }
  // secondary/outline
  return {
    padding: '15px 25px',
    fontSize: '1.2rem',
    backgroundColor: 'transparent',
    color: theme === 'dark' ? '#4bd5ee' : '#0087c6',
    border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
    borderRadius: '30px',
    cursor: active ? 'pointer' : 'not-allowed',
    fontWeight: 'bold',
    boxShadow: 'none',
    opacity: active ? 1 : 0.5,
    fontFamily: 'Orbitron, sans-serif',
    letterSpacing: '1px',
    marginBottom: '10px',
    transition: 'all 0.2s ease-in-out',
  };
};

const themeButtonStyle = (theme, selected) => ({
  padding: '15px 25px',
  fontSize: '1.1rem',
  backgroundColor: selected
    ? (theme === 'dark' ? '#4bd5ee' : '#0087c6')
    : 'transparent',
  color: selected
    ? (theme === 'dark' ? '#121212' : '#fff')
    : (theme === 'dark' ? '#4bd5ee' : '#0087c6'),
  border: `2px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
  borderRadius: '30px',
  cursor: 'pointer',
  fontWeight: selected ? 'bold' : 'normal',
  boxShadow: selected
    ? (theme === 'dark'
      ? '0 0 10px rgba(75, 213, 238, 0.5)'
      : '0 0 10px rgba(0, 135, 198, 0.3)')
    : 'none',
  fontFamily: 'Orbitron, sans-serif',
  letterSpacing: '1px',
  marginBottom: 0,
  transition: 'all 0.2s ease-in-out',
});

const SettingsMenu = (props) => {
  const context = useGameContext?.();
  const settings = context?.settings || props.settings;
  const updateSettings = context?.updateSettings;
  const theme = settings?.theme || props.theme || 'dark';
  const colors = THEME_COLORS[theme];

  // Use context or prop for playerName
  const [playerName, setPlayerName] = useState(props.playerName || '');
  const [isSaved, setIsSaved] = useState(true);
  const [notif, setNotif] = useState(null);
  const [notifVisible, setNotifVisible] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    marginBottom: '12px',
    backgroundColor: theme === 'dark' ? 'rgba(30, 35, 45, 0.85)' : 'rgba(255,255,255,0.8)',
    color: colors.text,
    border: `2px solid ${colors.primary}`,
    borderRadius: '30px',
    fontSize: '1.1rem',
    outline: 'none',
    fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: theme === 'dark'
      ? '0 0 10px rgba(75, 213, 238, 0.15)'
      : '0 0 10px rgba(0, 135, 198, 0.08)',
  };

  const buttonStyle = (active = true, isPrimary = false, isSelected = false) => ({
    padding: '15px 28px',
    fontSize: '1.15rem',
    background: isPrimary
      ? `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
      : (isSelected
        ? `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
        : colors.buttonBg),
    color: isPrimary || isSelected ? (theme === 'dark' ? '#181d26' : '#fff') : colors.text,
    border: isPrimary || isSelected ? 'none' : `2px solid ${colors.primary}`,
    borderRadius: '30px',
    cursor: active ? 'pointer' : 'not-allowed',
    fontWeight: isSelected ? 'bold' : 'normal',
    boxShadow: active
      ? (isPrimary || isSelected
        ? `0 0 18px ${colors.primary}55`
        : 'none')
      : 'none',
    opacity: active ? 1 : 0.6,
    marginBottom: '10px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, border 0.2s',
    outline: isSelected ? `2.5px solid ${colors.primary}` : 'none',
    fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
    letterSpacing: '1px',
  });

  const notifStyle = (type) => ({
    padding: '12px 24px',
    borderRadius: '18px',
    background: type === 'success'
      ? 'linear-gradient(90deg, #4bd5ee 0%, #00e676 100%)'
      : 'linear-gradient(90deg, #ff5252 0%, #ffb300 100%)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    margin: '10px 0 0 0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    display: 'inline-block',
    animation: 'notifPop 0.5s cubic-bezier(.4,2,.6,1)',
    fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
  });

  // Save name handler with fade in/out for notification and update context/playerName in localStorage
  const handleSaveName = () => {
    if (playerName.trim().length >= 3) {
      setIsSaved(true);
      setNotif({ type: 'success', msg: 'Name saved! 🚀' });
      setNotifVisible(true);
      if (context?.updateSettings) {
        context.updateSettings({ playerName: playerName.trim() });
      }
      if (props.onNameChange) props.onNameChange(playerName.trim());
      // Update localStorage for main menu
      localStorage.setItem('typingGamePlayerName', playerName.trim());
    } else {
      setNotif({ type: 'error', msg: 'Name must be at least 3 characters.' });
      setNotifVisible(true);
    }
    setTimeout(() => setNotifVisible(false), 1500);
    setTimeout(() => setNotif(null), 2000);
  };

  // Tema değiştirici (context varsa context ile, yoksa prop ile)
  const handleThemeChange = (newTheme) => {
    if (updateSettings) {
      updateSettings({ theme: newTheme });
    } else if (props.onThemeChange) {
      props.onThemeChange(newTheme);
    }
  };

  // Floating emojis
  const floatingEmojis = (
    <div
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Spaceships */}
      <div style={{
        position: 'absolute', top: '10%', right: '10%', fontSize: '2.5rem',
        animation: 'float 5s ease-in-out infinite', opacity: 0.85,
        transform: 'rotate(-15deg)', filter: 'drop-shadow(0 0 16px #4bd5ee)', userSelect: 'none',
      }}>🚀</div>
      <div style={{
        position: 'absolute', bottom: '12%', left: '10%', fontSize: '2.2rem',
        animation: 'float2 6s ease-in-out infinite', opacity: 0.8,
        transform: 'rotate(20deg) scaleX(-1)', filter: 'drop-shadow(0 0 14px #4bd5ee)', userSelect: 'none',
      }}>🚀</div>
      <div style={{
        position: 'absolute', top: '45%', left: '7%', fontSize: '2.2rem',
        animation: 'float3 7s ease-in-out infinite', opacity: 0.7,
        transform: 'rotate(-5deg)', filter: 'drop-shadow(0 0 14px #4bd5ee)', userSelect: 'none',
      }}>🚀</div>
      {/* Meteors */}
      <div style={{
        position: 'absolute', top: '15%', left: '8%', fontSize: '2rem',
        animation: 'meteor-float-1 6s ease-in-out infinite', opacity: 0.8,
        transform: 'rotate(-35deg)', filter: 'drop-shadow(0 0 12px #ff9800)', userSelect: 'none',
      }}>☄️</div>
      <div style={{
        position: 'absolute', top: '80%', right: '15%', fontSize: '1.7rem',
        animation: 'meteor-float-4 9s ease-in-out infinite', opacity: 0.7,
        transform: 'rotate(-30deg)', filter: 'drop-shadow(0 0 10px #ff9800)', userSelect: 'none',
      }}>☄️</div>
      {/* Stars */}
      <div style={{
        position: 'absolute', top: '20%', left: '25%', fontSize: '1.2rem',
        animation: 'star-float-1 5s ease-in-out infinite', opacity: 0.7, userSelect: 'none',
      }}>✨</div>
      <div style={{
        position: 'absolute', top: '60%', left: '60%', fontSize: '1.5rem',
        animation: 'star-float-2 7s ease-in-out infinite', opacity: 0.8, userSelect: 'none',
      }}>⭐</div>
      <div style={{
        position: 'absolute', top: '30%', right: '20%', fontSize: '1.1rem',
        animation: 'star-float-3 6s ease-in-out infinite', opacity: 0.6, userSelect: 'none',
      }}>🌟</div>
      <div style={{
        position: 'absolute', bottom: '18%', left: '55%', fontSize: '1.3rem',
        animation: 'star-float-4 8s ease-in-out infinite', opacity: 0.7, userSelect: 'none',
      }}>✨</div>
    </div>
  );

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100vw',
      ...getBackgroundStyle(theme),
      color: colors.text,
      fontFamily: 'Orbitron, "Exo 2", Arial, sans-serif',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 10px',
    }}>
      {floatingEmojis}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: colors.surface,
        borderRadius: '24px',
        boxShadow: theme === 'dark'
          ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #4bd5ee33'
          : '0 8px 40px 0 #0002',
        padding: '40px 32px 32px 32px',
        minWidth: '320px',
        maxWidth: '95vw',
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2 style={{
          color: colors.primary,
          fontSize: '2.1rem',
          marginBottom: '18px',
          letterSpacing: '2px',
          fontWeight: 700,
          textShadow: theme === 'dark'
            ? '0 0 12px #4bd5ee99'
            : '0 0 10px #0087c699',
          textAlign: 'center'
        }}>
          Settings
        </h2>
        {/* Name input */}
        <div style={{ width: '100%', marginBottom: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label htmlFor="playerName" style={{
            fontWeight: 600,
            marginBottom: '8px',
            display: 'block',
            color: colors.primary,
            letterSpacing: '1px',
            textAlign: 'center'
          }}>
            👤 Change Name
          </label>
          <input
            id="playerName"
            type="text"
            placeholder="Enter your name (min 3 chars)"
            value={playerName}
            onChange={e => {
              setPlayerName(e.target.value);
              setIsSaved(false);
            }}
            minLength={3}
            maxLength={15}
            style={inputStyle}
          />
          <button
            onClick={handleSaveName}
            disabled={playerName.trim().length < 3}
            style={mainMenuButtonStyle(theme, 'primary', playerName.trim().length >= 3)}
          >
            {isSaved ? 'Saved ✔️' : 'Save Name'}
          </button>
          {notif && (
            <div
              style={{
                ...notifStyle(notif.type),
                opacity: notifVisible ? 1 : 0,
                transition: 'opacity 0.5s',
                pointerEvents: 'none'
              }}
            >
              {notif.msg}
            </div>
          )}
        </div>
        {/* Theme toggle */}
        <div style={{
          width: '100%',
          marginBottom: '18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <label style={{
            fontWeight: 600,
            marginBottom: '8px',
            display: 'block',
            color: colors.primary,
            letterSpacing: '1px',
            textAlign: 'center'
          }}>
            Theme
          </label>
          <div style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            width: '100%'
          }}>
            <button
              onClick={() => handleThemeChange('dark')}
              style={themeButtonStyle(theme, theme === 'dark')}
            >
              Dark
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              style={themeButtonStyle(theme, theme === 'light')}
            >
              Light
            </button>
          </div>
        </div>
        {/* Back button */}
        <button
          onClick={props.onBack}
          style={mainMenuButtonStyle(theme, 'secondary', true)}
        >
          ← Back to Menu
        </button>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Exo+2:wght@400;700&display=swap');
        @keyframes float {
          0% { transform: translateY(0) rotate(-15deg);}
          50% { transform: translateY(-18px) rotate(-15deg);}
          100% { transform: translateY(0) rotate(-15deg);}
        }
        @keyframes float2 {
          0% { transform: translateY(0) rotate(20deg) scaleX(-1);}
          50% { transform: translateY(-14px) rotate(20deg) scaleX(-1);}
          100% { transform: translateY(0) rotate(20deg) scaleX(-1);}
        }
        @keyframes float3 {
          0% { transform: translateY(0) rotate(-5deg);}
          50% { transform: translateY(-10px) rotate(-5deg);}
          100% { transform: translateY(0) rotate(-5deg);}
        }
        @keyframes meteor-float-1 {
          0% { transform: translateY(0) rotate(-35deg);}
          50% { transform: translateY(-10px) rotate(-35deg);}
          100% { transform: translateY(0) rotate(-35deg);}
        }
        @keyframes meteor-float-4 {
          0% { transform: translateY(0) rotate(-30deg);}
          50% { transform: translateY(-14px) rotate(-30deg);}
          100% { transform: translateY(0) rotate(-30deg);}
        }
        @keyframes star-float-1 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-6px);}
          100% { transform: translateY(0);}
        }
        @keyframes star-float-2 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-10px);}
          100% { transform: translateY(0);}
        }
        @keyframes star-float-3 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-8px);}
          100% { transform: translateY(0);}
        }
        @keyframes star-float-4 {
          0% { transform: translateY(0);}
          50% { transform: translateY(-12px);}
          100% { transform: translateY(0);}
        }
        @keyframes notifPop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 600px) {
          div[style*="min-width: 320px"] {
            min-width: 0 !important;
            width: 98vw !important;
            padding: 20px 4vw 20px 4vw !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsMenu;