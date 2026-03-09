import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AudioManager } from '../services/AudioManager';
import { LeaderboardEntry, readLeaderboard, saveScoreToLeaderboard } from '../utils/localLeaderboard';
import { DEFAULT_CONTEXT_ID, DEFAULT_LANGUAGE_ID, TypingContextId } from '../constants/typingCatalog';

export const themeColors = {
  primary: '#FF1E3C',
  lightBg: '#EDEDEF',
  darkBg: '#050506',
  light: {
    text: '#111317',
    background: '#EDEDEF',
    border: '#C7CBD1',
    accent: '#FF1E3C',
    correct: '#FFFFFF',
    incorrect: '#FF7F91',
    neutral: '#6B7280',
    highlight: '#FFFFFF',
  },
  dark: {
    text: '#EDEDEF',
    background: '#050506',
    border: 'rgba(255, 255, 255, 0.06)',
    accent: '#FF1E3C',
    correct: '#FFFFFF',
    incorrect: '#FF7F91',
    neutral: '#A0A5AE',
    highlight: 'rgba(255, 255, 255, 0.05)',
  },
};

type ThemeName = 'light' | 'dark';

export interface GameSettings {
  theme: ThemeName;
  colors: typeof themeColors;
  soundEnabled: boolean;
  volume?: number;
  musicEnabled?: boolean;
  playerName?: string;
  language?: string;
  typingContext?: TypingContextId;
  [key: string]: unknown;
}

interface GameContextValue {
  settings: GameSettings;
  showSettings: boolean;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  audioManager: AudioManager;
  toggleSettings: () => void;
  themeColors: typeof themeColors;
  currentTheme: (typeof themeColors)['light'] | (typeof themeColors)['dark'];
  leaderboard: LeaderboardEntry[];
  addScore: (wpm: number, accuracy: number) => void;
  refreshLeaderboard: () => void;
}

interface GameProviderProps {
  children: React.ReactNode;
  initialSettings?: Partial<GameSettings>;
}

const STORAGE_SETTINGS_KEY = 'typingGameSettings';
const audioManagerInstance = new AudioManager();

const defaultSettings: GameSettings = {
  theme: 'dark',
  colors: themeColors,
  soundEnabled: true,
  volume: 0.7,
  musicEnabled: true,
  language: DEFAULT_LANGUAGE_ID,
  typingContext: DEFAULT_CONTEXT_ID,
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

const getSavedSettings = (): Partial<GameSettings> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    delete parsed.difficulty;
    return parsed;
  } catch {
    return {};
  }
};

export const GameProvider: React.FC<GameProviderProps> = ({ children, initialSettings = {} }) => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = getSavedSettings();
    const resolvedTheme = (saved.theme || initialSettings.theme || defaultSettings.theme) as ThemeName;

    return {
      ...defaultSettings,
      ...initialSettings,
      ...saved,
      theme: resolvedTheme === 'light' ? 'light' : 'dark',
      colors: themeColors,
    };
  });

  const [showSettings, setShowSettings] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => readLeaderboard());

  useEffect(() => {
    const { colors, ...settingsToSave } = settings;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settingsToSave));
    }
    audioManagerInstance.setSoundEnabled(Boolean(settings.soundEnabled));
    audioManagerInstance.setVolume(Number(settings.volume ?? 0.7));
  }, [settings]);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings, colors: themeColors }));
  }, []);

  const refreshLeaderboard = useCallback(() => {
    setLeaderboard(readLeaderboard());
  }, []);

  const addScore = useCallback((wpm: number, accuracy: number) => {
    const fallbackName =
      typeof window !== 'undefined' ? window.localStorage.getItem('typingGamePlayerName') || 'anon' : 'anon';
    const updated = saveScoreToLeaderboard({
      name: fallbackName,
      wpm,
      accuracy,
      time: 60,
    });
    setLeaderboard(updated);
  }, []);

  const currentTheme = settings.theme === 'light' ? themeColors.light : themeColors.dark;

  const value = useMemo<GameContextValue>(
    () => ({
      settings,
      showSettings,
      updateSettings,
      audioManager: audioManagerInstance,
      toggleSettings,
      themeColors,
      currentTheme,
      leaderboard,
      addScore,
      refreshLeaderboard,
    }),
    [addScore, currentTheme, leaderboard, refreshLeaderboard, settings, showSettings, toggleSettings, updateSettings],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextValue => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
