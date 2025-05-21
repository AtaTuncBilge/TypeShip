import React from 'react';
import { useGameContext } from '../../context/GameContext';

const Leaderboard = ({ currentWpm, currentAccuracy }) => {
  const { settings, leaderboard } = useGameContext();
  const { theme, colors } = settings;
  const currentTheme = theme === 'light' ? colors.light : colors.dark;

  // Always sort by WPM descending
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.wpm - a.wpm);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{
      marginTop: '30px',
      padding: '20px',
      backgroundColor: currentTheme.background,
      borderRadius: '12px',
      boxShadow: theme === 'light' 
        ? '0 4px 12px rgba(28, 26, 27, 0.1)' 
        : '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: `1px solid ${currentTheme.border}`,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h2 style={{ 
          color: currentTheme.text,
          margin: '0',
          fontSize: '1.5rem',
          fontWeight: '600',
        }}>
          Leaderboard
        </h2>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 15px',
        borderBottom: `2px solid ${currentTheme.border}`,
        color: currentTheme.neutral,
        fontSize: '0.9rem',
        fontWeight: '600'
      }}>
        <span style={{ width: '10%' }}>#</span>
        <span style={{ width: '30%' }}>Player</span>
        <span style={{ width: '20%', textAlign: 'center' }}>WPM</span>
        <span style={{ width: '20%', textAlign: 'center' }}>Accuracy</span>
        <span style={{ width: '20%', textAlign: 'right' }}>Date</span>
      </div>
      
      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {sortedLeaderboard.length > 0 ? (
          sortedLeaderboard.map((entry, index) => (
            <div 
              key={`${entry.name}-${entry.created_at}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 15px',
                borderBottom: `1px solid ${currentTheme.border}`,
                backgroundColor: entry.highlight 
                  ? currentTheme.highlight 
                  : 'transparent',
                color: currentTheme.text,
                transition: 'background-color 0.2s ease'
              }}
            >
              <span style={{ width: '10%', fontWeight: entry.highlight ? '700' : '400' }}>
                {index + 1}
              </span>
              <span style={{ 
                width: '30%', 
                fontWeight: entry.highlight ? '700' : '400',
                color: entry.highlight ? colors.primary : currentTheme.text
              }}>
                {entry.name}
              </span>
              <span style={{ 
                width: '20%', 
                textAlign: 'center',
                fontWeight: '600',
                color: colors.primary
              }}>
                {entry.wpm}
              </span>
              <span style={{ 
                width: '20%', 
                textAlign: 'center'
              }}>
                {entry.accuracy}%
              </span>
              <span style={{ 
                width: '20%', 
                textAlign: 'right',
                fontSize: '0.9rem'
              }}>
                {formatDate(entry.created_at)}
              </span>
            </div>
          ))
        ) : (
          <div style={{
            padding: '30px 0',
            textAlign: 'center',
            color: currentTheme.neutral,
            fontStyle: 'italic'
          }}>
            No scores recorded yet. Start typing to get on the board!
          </div>
        )}
      </div>
      
      {currentWpm > 0 && !leaderboard.some(score => score.highlight) && (
        <div style={{
          margin: '15px 0 0',
          padding: '10px 15px',
          backgroundColor: `${colors.primary}15`,
          color: colors.primary,
          borderRadius: '6px',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Your current score: {currentWpm} WPM with {currentAccuracy}% accuracy</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Finish the text to save!</span>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;