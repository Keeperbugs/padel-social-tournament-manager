import { AppSettings, PairingStrategy, MatchFormat, SETTINGS_ID } from './types';

export const MAX_PLAYERS = 32; // Limite massimo giocatori
export const MIN_PLAYERS_FOR_TOURNAMENT = 4;

export const DEFAULT_SETTINGS: AppSettings = {
  id: SETTINGS_ID,
  darkMode: false,
  pairingStrategy: PairingStrategy.BALANCED_AB,
  matchFormat: MatchFormat.BEST_OF_THREE,
  pointsWin: 3,
  pointsTieBreakLoss: 1,
  pointsLoss: 0,
  currentTournamentRound: 1, // Round iniziale
};

export const TAB_NAMES: { [key: string]: string } = {
  players: 'Giocatori',
  matches: 'Incontri',
  rankings: 'Classifiche',
};