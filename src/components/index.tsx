import { GameScreen } from './game/GameScreen';
import { LoadingScreen } from './game/LoadingScreen';
import { MainMenu } from './layout/MainMenu';
import { SettingsMenu } from './settings/SettingsMenu';
import { TextDisplay } from './typing/TextDisplay';
import { TypingInput } from './typing/TypingInput';
import { TypingGame } from './typing/TypingGame';

export {
  GameScreen,
  LoadingScreen,
  MainMenu,
  SettingsMenu,
  TextDisplay,
  TypingInput,
  TypingGame
};

// Export component types from global types
export type { 
  GameScreenProps,
  LoadingScreenProps,
  MainMenuProps,
  SettingsMenuProps,
  TextDisplayProps,
  TypingInputProps,
  TypingGameProps 
} from '../types'; // Fixed the semicolon typo
