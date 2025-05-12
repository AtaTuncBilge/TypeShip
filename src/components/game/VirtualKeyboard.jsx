import React, { useEffect, useState } from 'react';

const VirtualKeyboard = ({ theme, lastKeyPressed }) => {
  const [activeKey, setActiveKey] = useState(null);
  
  const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  useEffect(() => {
    if (lastKeyPressed) {
      setActiveKey(lastKeyPressed.toLowerCase());
      const timer = setTimeout(() => setActiveKey(null), 200);
      return () => clearTimeout(timer);
    }
  }, [lastKeyPressed]);

  const getKeyStyle = (key) => ({
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}`,
    borderRadius: '8px',
    backgroundColor: activeKey === key 
      ? (theme === 'dark' ? '#4bd5ee' : '#0087c6') 
      : 'rgba(75, 213, 238, 0.1)',
    color: activeKey === key 
      ? '#fff' 
      : (theme === 'dark' ? '#4bd5ee' : '#0087c6'),
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    fontSize: '14px',
    fontWeight: '500',
    opacity: activeKey === key ? 1 : 0.8,
    boxShadow: activeKey === key 
      ? `0 0 15px ${theme === 'dark' ? '#4bd5ee' : '#0087c6'}` 
      : 'none',
    backdropFilter: 'blur(5px)',
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50px',
      background: theme === 'dark' 
        ? 'linear-gradient(180deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.95) 100%)'
        : 'linear-gradient(180deg, rgba(240,240,240,0.9) 0%, rgba(220,220,220,0.95) 100%)',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: theme === 'dark'
        ? '0 4px 20px rgba(0,0,0,0.4)'
        : '0 4px 20px rgba(0,0,0,0.15)',
      border: `1px solid ${theme === 'dark' ? 'rgba(75,213,238,0.3)' : 'rgba(0,135,198,0.3)'}`,
      width: '500px',
      backdropFilter: 'blur(10px)',
    }}>
      {keyboardLayout.map((row, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '8px',
          paddingLeft: i === 1 ? '25px' : i === 2 ? '50px' : '0'
        }}>
          {row.map(key => (
            <div key={key} style={getKeyStyle(key)}>
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
