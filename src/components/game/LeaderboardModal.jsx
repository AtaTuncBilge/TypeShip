import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const LeaderboardModal = ({ data: initialData, onClose }) => {
  // Temaya göre renkler
  const theme = document.body.classList.contains('light') ? 'light' : 'dark';
  const colors = theme === 'dark'
    ? {
        bg: '#181d26',
        surface: '#232b3b',
        accent: '#4bd5ee',
        text: '#e0e0e0',
        border: '#2a2d3e'
      }
    : {
        bg: '#f5f5f5',
        surface: '#fff',
        accent: '#0087c6',
        text: '#222',
        border: '#e0e0e0'
      };

  const [data, setData] = useState(initialData);

  // 1. Veritabanından skorları çek
  useEffect(() => {
    fetch('http://localhost:3001/results')
      .then(res => res.json())
      .then(scores => setData(scores))
      .catch(() => setData([]));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0a0f1a 0%, #10131a 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e2e2e2 100%)',
      backgroundBlendMode: 'multiply',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto'
    }}>
      <div style={{
        background: colors.surface,
        borderRadius: '24px',
        boxShadow: theme === 'dark'
          ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #4bd5ee33'
          : '0 8px 40px 0 #0002',
        padding: '40px 32px 32px 32px',
        minWidth: '340px',
        maxWidth: '95vw',
        width: '480px',
        position: 'relative',
        border: `2px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{
          color: colors.accent,
          fontSize: '2.1rem',
          marginBottom: '18px',
          letterSpacing: '2px',
          fontWeight: 700,
          textShadow: theme === 'dark'
            ? '0 0 12px #4bd5ee99'
            : '0 0 10px #0087c699'
        }}>
          🏆 Leaderboard
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          background: 'none',
          marginBottom: '18px'
        }}>
          <thead>
            <tr style={{ color: colors.accent, fontWeight: 700, fontSize: '1.1rem' }}>
              <th style={{ padding: '8px 0', textAlign: 'left' }}>#</th>
              <th style={{ padding: '8px 0', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>WPM</th>
              <th style={{ padding: '8px 0', textAlign: 'center' }}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{
                  textAlign: 'center',
                  color: colors.text,
                  padding: '24px 0',
                  fontStyle: 'italic'
                }}>
                  No scores yet.
                </td>
              </tr>
            ) : (
              data.map((entry, index) => (
                <tr key={entry.id || index}
                  style={{
                    background: index % 2 === 0
                      ? (theme === 'dark' ? '#232b3b44' : '#f5f5f5')
                      : 'transparent',
                    color: colors.text,
                    fontWeight: index === 0 ? 700 : 400,
                    fontSize: index === 0 ? '1.15rem' : '1rem',
                    borderRadius: '12px'
                  }}>
                  <td style={{
                    padding: '10px 0',
                    textAlign: 'left',
                    color: index === 0 ? colors.accent : colors.text
                  }}>{index + 1}</td>
                  <td style={{
                    padding: '10px 0',
                    textAlign: 'left',
                    color: index === 0 ? colors.accent : colors.text
                  }}>{entry.name}</td>
                  <td style={{
                    padding: '10px 0',
                    textAlign: 'center',
                    color: index === 0 ? colors.accent : colors.text
                  }}>{entry.wpm}</td>
                  <td style={{
                    padding: '10px 0',
                    textAlign: 'center',
                    color: index === 0 ? colors.accent : colors.text
                  }}>{entry.accuracy}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <button
          onClick={onClose}
          style={{
            marginTop: '10px',
            padding: '12px 32px',
            background: `linear-gradient(90deg, ${colors.accent} 0%, ${theme === 'dark' ? '#232b3b' : '#e8f5ff'} 100%)`,
            color: theme === 'dark' ? '#181d26' : '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: theme === 'dark'
              ? '0 0 18px #4bd5ee55'
              : '0 0 10px #0087c655',
            transition: 'all 0.2s'
          }}
        >
          Close
        </button>
        <span style={{
          position: 'absolute',
          top: '18px',
          right: '24px',
          fontSize: '1.5rem',
          color: colors.accent,
          cursor: 'pointer',
          fontWeight: 700,
          background: 'none',
          border: 'none'
        }} onClick={onClose}>×</span>
      </div>
    </div>
  );
};

LeaderboardModal.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    wpm: PropTypes.number.isRequired,
    accuracy: PropTypes.number.isRequired,
  })).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LeaderboardModal;
