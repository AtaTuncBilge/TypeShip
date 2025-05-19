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
  theme: Theme;
  colors: ThemeColors;
  soundEnabled: boolean; // Add this property
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

export interface GameContextProps {
  settings: GameSettings;
  showSettings: boolean;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  audioManager: AudioManager;
  addScore: (wpm: number, accuracy: number) => void;
  toggleSettings: () => void;  // Add this line
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

// Define or export the AudioManager interface to resolve the errors:
export interface AudioManager {
  playSound(soundName: string): void;
  pauseSound(soundName: string): void;
  stopSound?(soundName: string): void;
}
