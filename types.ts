export enum SkillLevel {
  A = 'Fascia A (Alto)',
  B = 'Fascia B (Medio/Basso)',
  UNASSIGNED = 'Non Assegnato',
}

export interface Player {
  id: string; // UUID generato dal client o da Supabase
  name: string;
  surname: string;
  nickname?: string;
  contact?: string;
  skillLevel: SkillLevel;
  matchesPlayed: number;
  matchesWon: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  created_at?: string; // Aggiunto per Supabase
}

export interface Team {
  id: string; 
  player1: Player;
  player2: Player;
}

export interface MatchSetScore {
  setNumber: number;
  team1Score: number | string;
  team2Score: number | string;
}

export enum MatchFormat {
  BEST_OF_THREE = 'Al Meglio dei 3 Set',
  GOLDEN_POINT = 'Golden Point',
}

export interface Match {
  id: string; // UUID generato dal client o da Supabase
  round: number;
  team1: Team; // JSONB in Supabase
  team2: Team; // JSONB in Supabase
  court?: string;
  scores: MatchSetScore[]; // JSONB in Supabase
  winnerTeamId?: string;
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
  matchFormat: MatchFormat;
  created_at?: string; // Aggiunto per Supabase
}

export enum PairingStrategy {
  BALANCED_AB = 'Equilibrato (A+B)',
  SKILL_A = 'Solo Fascia A (A+A)',
  SKILL_B = 'Solo Fascia B (B+B)',
  MIXED = 'Misto Casuale',
}

export const SETTINGS_ID = 'main_settings'; // ID fisso per la riga delle impostazioni

export interface AppSettings {
  id?: string; // Dovrebbe essere SETTINGS_ID
  darkMode: boolean;
  pairingStrategy: PairingStrategy;
  matchFormat: MatchFormat;
  pointsWin: number;
  pointsTieBreakLoss: number;
  pointsLoss: number;
  currentTournamentRound: number; // Aggiunto per persistere il round corrente
  updated_at?: string; // Aggiunto per Supabase
}

export type TabKey = 'players' | 'matches' | 'rankings';