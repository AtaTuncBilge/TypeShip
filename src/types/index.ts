import { AudioManager } from '../utils/AudioManager';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type Theme = 'dark' | 'light';

export interface ThemeColors {
  primary: string;
  secondary: string;
  light: {
    text: string;
    background: string;
    border: string;
    accent: string;
    correct: string;
    incorrect: string;
    neutral: string;
    highlight: string;
  };
  dark: {
    text: string;
    background: string;
    border: string;
    accent: string;
    correct: string;
    incorrect: string;
    neutral: string;
    highlight: string;
  };
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  difficulty: Difficulty;
  theme: Theme;
  wordSets: string[];
  colors: ThemeColors;
}

export interface AudioManagerProps {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

export interface GameStats {
  highScore: number;
  totalWordsTyped: number;
  totalCharsTyped: number;
  averageWPM: number;
  averageAccuracy: number;
  gamesPlayed: number;
  lastPlayed: string | null;
}

export interface GameContextValue {
  settings: GameSettings;
  stats: GameStats;
  updateSettings: (settings: Partial<GameSettings>) => void;
  recordGameResults: (score: number, wordsTyped: number, accuracy: number, wpm: number, duration: number) => void;
  audioManager: AudioManager;
}

export interface TextDisplayProps {
  text: string;
  userInput: string;
}

export interface TypingInputProps {
  value: string;
  onChange: (value: string) => void;
  completed: boolean;
  audioManager: AudioManager;
}

// Component Props Types
export interface GameScreenProps {
  onExit: () => void;
}

export interface LoadingScreenProps {
  progress?: number;
}

export interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
}

export interface SettingsMenuProps {
  onBack: () => void;
}

export interface TypingGameProps {
  onComplete?: () => void;
}
