const LEADERBOARD_STORAGE_KEY = 'typingGameLeaderboard';
const MAX_ENTRIES = 50;

export interface LeaderboardEntry {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  time: number;
  created_at: string;
  highlight?: boolean;
}

interface SaveScoreInput {
  name: string;
  wpm: number;
  accuracy: number;
  time?: number;
}

const hasWindow = () => typeof window !== 'undefined';

const sanitizeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
};

const normalizeEntry = (entry: Partial<LeaderboardEntry>): LeaderboardEntry => ({
  id: String(entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
  name: String(entry.name || 'anon'),
  wpm: Math.max(0, Math.round(sanitizeNumber(entry.wpm, 0))),
  accuracy: Math.max(0, Math.min(100, Math.round(sanitizeNumber(entry.accuracy, 0)))),
  time: Math.max(0, sanitizeNumber(entry.time, 60)),
  created_at: String(entry.created_at || new Date().toISOString()),
  highlight: Boolean(entry.highlight),
});

export const readLeaderboard = (): LeaderboardEntry[] => {
  if (!hasWindow()) return [];

  try {
    const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => normalizeEntry(entry))
      .sort((a, b) => b.wpm - a.wpm || Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
};

export const writeLeaderboard = (entries: LeaderboardEntry[]): LeaderboardEntry[] => {
  const cleaned = entries
    .map((entry) => normalizeEntry(entry))
    .sort((a, b) => b.wpm - a.wpm || Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, MAX_ENTRIES);

  if (hasWindow()) {
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(cleaned));
  }

  return cleaned;
};

export const saveScoreToLeaderboard = ({
  name,
  wpm,
  accuracy,
  time = 60,
}: SaveScoreInput): LeaderboardEntry[] => {
  const existing = readLeaderboard().map((entry) => ({ ...entry, highlight: false }));
  const nextEntry: LeaderboardEntry = normalizeEntry({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name?.trim() || 'anon',
    wpm,
    accuracy,
    time,
    created_at: new Date().toISOString(),
    highlight: true,
  });

  return writeLeaderboard([nextEntry, ...existing]);
};

