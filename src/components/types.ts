import { AudioManager } from '../utils/AudioManager';

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

export interface TypingGameProps {
  onComplete?: () => void;
}
