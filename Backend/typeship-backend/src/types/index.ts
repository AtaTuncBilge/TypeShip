export interface GameType {
  id: string;
  name: string;
  players: PlayerType[];
  status: 'waiting' | 'in-progress' | 'completed';
}

export interface PlayerType {
  id: string;
  name: string;
  score: number;
  gameId: string;
}