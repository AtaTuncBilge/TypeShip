import React, { useState } from 'react';
import { useGameContext } from 'GameContext';

const Leaderboard = ({ currentWpm, currentAccuracy }) => {
  const { settings, leaderboard } = useGameContext();
  const { theme, colors } = settings;
  const currentTheme = theme === 'light' ? colors.light : colors.dark;
  const [sortBy, setSortBy] = useState('wpm'); // Default sort by WPM
  
  // Sort the leaderboard based on the selected criteria
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === 'wpm') return b.wpm - a.wpm;
    if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    return 0;
  });

  const handleSortChange = (criteria) => {
    setSortBy(criteria);
  };
  
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
        
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <SortButton 
            active={sortBy === 'wpm'} 
            onClick={() => handleSortChange('wpm')}
            label="WPM"
            currentTheme={currentTheme}
            colors={colors}
          />
          <SortButton 
            active={sortBy === 'accuracy'} 
            onClick={() => handleSortChange('accuracy')}
            label="Accuracy"
            currentTheme={currentTheme}
            colors={colors}
          />
          <SortButton 
            active={sortBy === 'date'} 
            onClick={() => handleSortChange('date')}
            label="Recent"
            currentTheme={currentTheme}
            colors={colors}
          />
        </div>
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
              key={`${entry.playerName}-${entry.date}`}
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
                {entry.playerName}
              </span>
              <span style={{ 
                width: '20%', 
                textAlign: 'center',
                fontWeight: '600',
                color: sortBy === 'wpm' ? colors.primary : currentTheme.text
              }}>
                {entry.wpm}
              </span>
              <span style={{ 
                width: '20%', 
                textAlign: 'center',
                color: sortBy === 'accuracy' ? colors.primary : currentTheme.text
              }}>
                {entry.accuracy}%
              </span>
              <span style={{ 
                width: '20%', 
                textAlign: 'right',
                fontSize: '0.9rem',
                color: sortBy === 'date' ? colors.primary : currentTheme.neutral
              }}>
                {formatDate(entry.date)}
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

// Helper component for sort buttons
const SortButton = ({ active, onClick, label, currentTheme, colors }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 12px',
      backgroundColor: active ? colors.primary : 'transparent',
      color: active ? '#fff' : currentTheme.text,
      border: active ? 'none' : `1px solid ${currentTheme.border}`,
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: active ? '600' : '400',
      transition: 'all 0.2s ease'
    }}
  >
    {label}
  </button>
);

export default Leaderboard;