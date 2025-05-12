export const DIFFICULTY_SETTINGS = {
  easy: {
    spawnRate: 3000,
    wordSpeed: 0.5,
    wordMinLength: 3,
    wordMaxLength: 6,
  },
  normal: {
    spawnRate: 2000,
    wordSpeed: 1,
    wordMinLength: 4,
    wordMaxLength: 8,
  },
  hard: {
    spawnRate: 1500,
    wordSpeed: 1.5,
    wordMinLength: 5,
    wordMaxLength: 12,
  }
};

// Expanded word list with 350+ common words
export const WORD_LIST = [
  // ...existing basic words...
  'abandon', 'ability', 'absolute', 'academic', 'accept', 'access',
  'accident', 'accurate', 'achieve', 'acquire', 'adapt', 'addition',
  'address', 'adequate', 'adjust', 'advanced', 'advice', 'affect',
  // ... add more words to make it 350+ ...
];

export const THEME_COLORS = {
  dark: {
    primary: '#4bd5ee',
    secondary: '#2a2d3e',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    border: 'rgba(75, 213, 238, 0.3)',
    buttonBg: 'rgba(75, 213, 238, 0.1)',
    buttonHover: 'rgba(75, 213, 238, 0.2)'
  },
  light: {
    primary: '#0087c6',
    secondary: '#e8f5ff',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#333333',
    border: 'rgba(0, 135, 198, 0.3)',
    buttonBg: 'rgba(0, 135, 198, 0.1)',
    buttonHover: 'rgba(0, 135, 198, 0.2)'
  }
};
