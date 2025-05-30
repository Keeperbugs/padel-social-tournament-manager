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

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  days: number;
  matchesPerDay: number;
  maxPlayers: number;
  currentRound: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DRAFT';
  playerIds: string[]; // IDs dei giocatori partecipanti
  created_at?: string;
  updated_at?: string;
}

export interface PlayerStats extends Omit<Player, 'matchesPlayed' | 'matchesWon' | 'setsWon' | 'setsLost' | 'gamesWon' | 'gamesLost' | 'points'> {
  tournamentId: string;
  matchesPlayed: number;
  matchesWon: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
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
  id: string;
  tournamentId: string;
  round: number;
  team1: Team;
  team2: Team;
  court?: string;
  scores: MatchSetScore[];
  winnerTeamId?: string;
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
  matchFormat: MatchFormat;
  created_at?: string;
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
  currentTournamentId?: string; // Torneo attualmente selezionato
  updated_at?: string;
}

export type TabKey = 'tournaments' | 'players' | 'matches' | 'rankings';