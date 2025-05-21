export {  GameScreen } from './game/GameScreen';
export { LoadingScreen } from './game/LoadingScreen';
export { default as MainMenu } from './layout/MainMenu';
export { default as SettingsMenu } from './settings/SettingsMenu';
export { default as Settings } from './settings/Settings';
export { default as TextDisplay } from './typing/TextDisplay';
export { default as TypingInput } from './typing/TypingInput';
export { default as TypingGame } from './typing/TypingGame';

// Component type'larını eklemek istiyorsan altta type exportları olabilir.
export type { 
  GameScreenProps,
  LoadingScreenProps,
  MainMenuProps,
  SettingsMenuProps,
  TextDisplayProps,
  TypingInputProps,
  TypingGameProps 
} from '../types';
