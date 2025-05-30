import { createClient } from '@supabase/supabase-js';
import { AppSettings, Player, Match, Tournament, PlayerStats, SETTINGS_ID } from '../types';

// Queste variabili dovrebbero essere configurate nel tuo ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase URL o Anon Key non definite. L'app funzionerà senza persistenza backend. " +
    "Configura SUPABASE_URL e SUPABASE_ANON_KEY nel tuo ambiente se desideri utilizzare Supabase."
  );
}

// Esporta il client Supabase. Sarà `null` se le chiavi non sono definite.
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ============================================================
// SETTINGS FUNCTIONS
// ============================================================

export const getSettingsDB = async (): Promise<AppSettings | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournament_settings')
    .select('*')
    .eq('id', SETTINGS_ID) 
    .single();
    
  if (error && error.code !== 'PGRST116') {
     console.error('Error fetching settings:', error); 
     return null;
  }
  
  if (!data) return null;
  
  // Mappa i nomi delle colonne della tua tabella (camelCase) ai nomi attesi dal codice
  return {
    id: data.id,
    darkMode: data.darkMode,
    pairingStrategy: data.pairingStrategy,
    matchFormat: data.matchFormat,
    pointsWin: data.pointsWin,
    pointsTieBreakLoss: data.pointsTieBreakLoss,
    pointsLoss: data.pointsLoss,
    currentTournamentId: data.current_tournament_id,
    updated_at: data.updated_at
  } as AppSettings;
};

export const updateSettingsDB = async (settings: AppSettings): Promise<AppSettings | null> => {
  if (!supabase) return null;
  
  // Mappa i nomi delle proprietà ai nomi delle colonne della tua tabella
  const settingsData = {
    id: SETTINGS_ID,
    darkMode: settings.darkMode,
    pairingStrategy: settings.pairingStrategy,
    matchFormat: settings.matchFormat,
    pointsWin: settings.pointsWin,
    pointsTieBreakLoss: settings.pointsTieBreakLoss,
    pointsLoss: settings.pointsLoss,
    current_tournament_id: settings.currentTournamentId
  };
  
  const { data, error } = await supabase
    .from('tournament_settings')
    .upsert(settingsData, { onConflict: 'id' })
    .select()
    .single();
    
  if (error) {
    console.error('Error updating settings:', error);
    return null;
  }
  
  return {
    id: data.id,
    darkMode: data.darkMode,
    pairingStrategy: data.pairingStrategy,
    matchFormat: data.matchFormat,
    pointsWin: data.pointsWin,
    pointsTieBreakLoss: data.pointsTieBreakLoss,
    pointsLoss: data.pointsLoss,
    currentTournamentId: data.current_tournament_id,
    updated_at: data.updated_at
  } as AppSettings;
};

// ============================================================
// PLAYERS FUNCTIONS - ADATTATE PER LA TUA STRUTTURA CAMELCASE
// ============================================================

export const getPlayersDB = async (): Promise<Player[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) { 
    console.error('Error fetching players:', error); 
    return []; 
  }
  
  // I tuoi dati sono già in camelCase, quindi li ritorniamo direttamente
  return data.map(player => ({
    id: player.id,
    name: player.name,
    surname: player.surname,
    nickname: player.nickname,
    contact: player.contact,
    skillLevel: player.skillLevel,
    matchesPlayed: player.matchesPlayed,
    matchesWon: player.matchesWon,
    setsWon: player.setsWon,
    setsLost: player.setsLost,
    gamesWon: player.gamesWon,
    gamesLost: player.gamesLost,
    points: player.points,
    created_at: player.created_at,
    updated_at: player.updated_at
  })) as Player[];
};

export const addPlayerDB = async (playerData: Omit<Player, 'id' | 'matchesPlayed' | 'matchesWon' | 'setsWon' | 'setsLost' | 'gamesWon' | 'gamesLost' | 'points'>): Promise<Player | null> => {
  if (!supabase) return null;
  
  // Usa i nomi delle colonne della tua tabella (camelCase)
  const newPlayer = {
    name: playerData.name,
    surname: playerData.surname,
    nickname: playerData.nickname,
    contact: playerData.contact,
    skillLevel: playerData.skillLevel,
    matchesPlayed: 0,
    matchesWon: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    points: 0
  };
  
  const { data, error } = await supabase
    .from('players')
    .insert(newPlayer)
    .select()
    .single();
    
  if (error) { 
    console.error('Error adding player:', error); 
    return null; 
  }
  
  return data as Player;
};

export const updatePlayerDB = async (player: Player): Promise<Player | null> => {
  if (!supabase) return null;
  
  // Usa i nomi delle colonne della tua tabella (camelCase)
  const playerData = {
    name: player.name,
    surname: player.surname,
    nickname: player.nickname,
    contact: player.contact,
    skillLevel: player.skillLevel,
    matchesPlayed: player.matchesPlayed,
    matchesWon: player.matchesWon,
    setsWon: player.setsWon,
    setsLost: player.setsLost,
    gamesWon: player.gamesWon,
    gamesLost: player.gamesLost,
    points: player.points
  };
  
  const { data, error } = await supabase
    .from('players')
    .update(playerData)
    .eq('id', player.id)
    .select()
    .single();
    
  if (error) { 
    console.error('Error updating player:', error); 
    return null;
  }
  
  return data as Player;
};

export const deletePlayerDB = async (playerId: string): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    // Rimuovi il giocatore da tutti i tornei usando la funzione RPC
    const { error: removeError } = await supabase.rpc('remove_player_from_tournaments', {
      player_uuid: playerId
    });
    
    if (removeError) {
      console.warn('Warning removing player from tournaments:', removeError);
    }
    
    // Elimina le statistiche del giocatore
    const { error: statsError } = await supabase
      .from('player_stats')
      .delete()
      .eq('player_id', playerId);
      
    if (statsError) {
      console.warn('Warning deleting player stats:', statsError);
    }
    
    // Elimina il giocatore
    const { error: playerError } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);
      
    if (playerError) {
      console.error('Error deleting player:', playerError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception during player deletion:', err);
    return false;
  }
};

export const searchPlayersDB = async (searchTerm: string, skillLevel?: string): Promise<Player[]> => {
  if (!supabase) return [];
  
  let query = supabase
    .from('players')
    .select('*');
    
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%,nickname.ilike.%${searchTerm}%`);
  }
  
  if (skillLevel && skillLevel !== 'ALL') {
    query = query.eq('skillLevel', skillLevel);
  }
  
  const { data, error } = await query.order('name', { ascending: true });
    
  if (error) { 
    console.error('Error searching players:', error); 
    return []; 
  }
  
  return data as Player[];
};

// ============================================================
// TOURNAMENTS FUNCTIONS
// ============================================================

export const getTournamentsDB = async (): Promise<Tournament[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) { 
    console.error('Error fetching tournaments:', error); 
    return []; 
  }
  
  // Converti i nomi delle colonne dal formato snake_case al formato camelCase
  return data.map(tournament => ({
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    startDate: tournament.start_date,
    endDate: tournament.end_date,
    days: tournament.days,
    matchesPerDay: tournament.matches_per_day,
    maxPlayers: tournament.max_players,
    currentRound: tournament.current_round,
    status: tournament.status,
    playerIds: tournament.player_ids || [],
    created_at: tournament.created_at,
    updated_at: tournament.updated_at
  })) as Tournament[];
};

export const getTournamentByIdDB = async (tournamentId: string): Promise<Tournament | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();
    
  if (error) { 
    console.error('Error fetching tournament:', error); 
    return null; 
  }
  
  // Converti i nomi delle colonne dal formato snake_case al formato camelCase
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    days: data.days,
    matchesPerDay: data.matches_per_day,
    maxPlayers: data.max_players,
    currentRound: data.current_round,
    status: data.status,
    playerIds: data.player_ids || [],
    created_at: data.created_at,
    updated_at: data.updated_at
  } as Tournament;
};

export const addTournamentDB = async (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>): Promise<Tournament | null> => {
  if (!supabase) return null;
  
  // Converti i nomi delle proprietà dal formato camelCase al formato snake_case
  const tournamentData = {
    name: tournament.name,
    description: tournament.description,
    start_date: tournament.startDate,
    end_date: tournament.endDate,
    days: tournament.days,
    matches_per_day: tournament.matchesPerDay,
    max_players: tournament.maxPlayers,
    current_round: tournament.currentRound,
    status: tournament.status,
    player_ids: tournament.playerIds || []
  };
  
  const { data, error } = await supabase
    .from('tournaments')
    .insert(tournamentData)
    .select()
    .single();
    
  if (error) { 
    console.error('Error adding tournament:', error); 
    return null; 
  }
  
  // Converti i nomi delle colonne dal formato snake_case al formato camelCase
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    days: data.days,
    matchesPerDay: data.matches_per_day,
    maxPlayers: data.max_players,
    currentRound: data.current_round,
    status: data.status,
    playerIds: data.player_ids || [],
    created_at: data.created_at,
    updated_at: data.updated_at
  } as Tournament;
};

export const updateTournamentDB = async (tournament: Tournament): Promise<Tournament | null> => {
  if (!supabase) return null;
  
  // Converti i nomi delle proprietà dal formato camelCase al formato snake_case
  const tournamentData = {
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    start_date: tournament.startDate,
    end_date: tournament.endDate,
    days: tournament.days,
    matches_per_day: tournament.matchesPerDay,
    max_players: tournament.maxPlayers,
    current_round: tournament.currentRound,
    status: tournament.status,
    player_ids: tournament.playerIds || []
  };
  
  const { data, error } = await supabase
    .from('tournaments')
    .update(tournamentData)
    .eq('id', tournament.id)
    .select()
    .single();
    
  if (error) { 
    console.error('Error updating tournament:', error); 
    return null; 
  }
  
  // Converti i nomi delle colonne dal formato snake_case al formato camelCase
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    days: data.days,
    matchesPerDay: data.matches_per_day,
    maxPlayers: data.max_players,
    currentRound: data.current_round,
    status: data.status,
    playerIds: data.player_ids || [],
    created_at: data.created_at,
    updated_at: data.updated_at
  } as Tournament;
};

export const deleteTournamentDB = async (tournamentId: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', tournamentId);
    
  if (error) {
    console.error('Error deleting tournament:', error);
    return false;
  }
  return true;
};

// ============================================================
// PLAYER STATS FUNCTIONS
// ============================================================

export const getPlayerStatsByTournamentDB = async (tournamentId: string): Promise<PlayerStats[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      id,
      player_id,
      tournament_id,
      matches_played,
      matches_won,
      sets_won,
      sets_lost,
      games_won,
      games_lost,
      points,
      created_at,
      updated_at,
      players:player_id (*)
    `)
    .eq('tournament_id', tournamentId);
    
  if (error) { 
    console.error('Error fetching player stats:', error); 
    return []; 
  }
  
  // Combina i dati del giocatore con le statistiche
  return data.map(stat => ({
    id: stat.players.id,
    tournamentId: stat.tournament_id,
    name: stat.players.name,
    surname: stat.players.surname,
    nickname: stat.players.nickname,
    contact: stat.players.contact,
    skillLevel: stat.players.skillLevel,
    matchesPlayed: stat.matches_played,
    matchesWon: stat.matches_won,
    setsWon: stat.sets_won,
    setsLost: stat.sets_lost,
    gamesWon: stat.games_won,
    gamesLost: stat.games_lost,
    points: stat.points,
    created_at: stat.players.created_at
  })) as PlayerStats[];
};

export const getOverallPlayerStatsDB = async (): Promise<PlayerStats[]> => {
  if (!supabase) return [];
  
  // Ottieni le statistiche direttamente dalla tabella players (che contiene già i totali)
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('points', { ascending: false });
    
  if (error) { 
    console.error('Error fetching overall player stats:', error); 
    return []; 
  }
  
  return data.map(player => ({
    id: player.id,
    tournamentId: 'overall',
    name: player.name,
    surname: player.surname,
    nickname: player.nickname,
    contact: player.contact,
    skillLevel: player.skillLevel,
    matchesPlayed: player.matchesPlayed,
    matchesWon: player.matchesWon,
    setsWon: player.setsWon,
    setsLost: player.setsLost,
    gamesWon: player.gamesWon,
    gamesLost: player.gamesLost,
    points: player.points,
    created_at: player.created_at
  })) as PlayerStats[];
};

export const updatePlayerStatsBulkDB = async (playerStats: PlayerStats[]): Promise<PlayerStats[]> => {
  if (!supabase) return [];
  
  // Converti le statistiche nel formato del database
  const statsToUpsert = playerStats.map(stat => ({
    player_id: stat.id,
    tournament_id: stat.tournamentId,
    matches_played: stat.matchesPlayed,
    matches_won: stat.matchesWon,
    sets_won: stat.setsWon,
    sets_lost: stat.setsLost,
    games_won: stat.gamesWon,
    games_lost: stat.gamesLost,
    points: stat.points
  }));
  
  const { data, error } = await supabase
    .from('player_stats')
    .upsert(statsToUpsert, { 
      onConflict: 'player_id,tournament_id',
      returning: 'minimal'
    });
    
  if (error) { 
    console.error('Error updating player stats:', error); 
    return []; 
  }
  
  // Aggiorna anche le statistiche generali nella tabella players
  for (const stat of playerStats) {
    if (stat.tournamentId !== 'overall') {
      // Aggiorna le statistiche del giocatore nella tabella players
      const { error: playerError } = await supabase
        .from('players')
        .update({
          matchesPlayed: stat.matchesPlayed,
          matchesWon: stat.matchesWon,
          setsWon: stat.setsWon,
          setsLost: stat.setsLost,
          gamesWon: stat.gamesWon,
          gamesLost: stat.gamesLost,
          points: stat.points
        })
        .eq('id', stat.id);
        
      if (playerError) {
        console.warn('Warning updating player general stats:', playerError);
      }
    }
  }
  
  return playerStats;
};

// ============================================================
// MATCHES FUNCTIONS
// ============================================================

export const getMatchesByTournamentDB = async (tournamentId: string): Promise<Match[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: false });
    
  if (error) { 
    console.error('Error fetching matches:', error); 
    return []; 
  }
  
  // Converti i campi JSONB in oggetti JavaScript
  const matches = data.map(match => ({
    ...match,
    tournamentId: match.tournament_id,
    team1: typeof match.team1 === 'string' ? JSON.parse(match.team1) : match.team1,
    team2: typeof match.team2 === 'string' ? JSON.parse(match.team2) : match.team2,
    scores: typeof match.scores === 'string' ? JSON.parse(match.scores) : (match.scores || []),
    matchFormat: match.matchformat,
    winnerTeamId: match.winnerteamid
  }));
  
  return matches as Match[];
};

export const addMatchesDB = async (matches: Match[]): Promise<Match[]> => {
  if (!supabase) return [];
  
  try {
    const matchesToInsert = matches.map(match => ({
      id: match.id,
      tournament_id: match.tournamentId,
      round: match.round,
      team1: match.team1,
      team2: match.team2,
      scores: match.scores || [],
      status: match.status,
      matchformat: match.matchFormat,
      court: match.court,
      winnerteamid: match.winnerTeamId
    }));
    
    const { data, error } = await supabase
      .from('matches')
      .insert(matchesToInsert)
      .select();
      
    if (error) {
      console.error('Error adding matches:', error);
      return [];
    }
    
    const savedMatches = data.map(match => ({
      id: match.id,
      tournamentId: match.tournament_id,
      round: match.round,
      team1: match.team1,
      team2: match.team2,
      scores: match.scores || [],
      status: match.status,
      matchFormat: match.matchformat,
      court: match.court,
      winnerTeamId: match.winnerteamid
    }));
    
    return savedMatches as Match[];
  } catch (err) {
    console.error('Exception during match insertion:', err);
    return [];
  }
};

export const updateMatchDB = async (match: Match): Promise<Match | null> => {
  if (!supabase) return null;
  
  try {
    const matchToUpdate = {
      id: match.id,
      tournament_id: match.tournamentId,
      round: match.round,
      team1: match.team1,
      team2: match.team2,
      scores: match.scores || [],
      status: match.status,
      matchformat: match.matchFormat,
      court: match.court,
      winnerteamid: match.winnerTeamId
    };
    
    const { data, error } = await supabase
      .from('matches')
      .update(matchToUpdate)
      .eq('id', match.id)
      .select()
      .single();
      
    if (error) { 
      console.error('Error updating match:', error); 
      return null; 
    }
    
    const updatedMatch = {
      id: data.id,
      tournamentId: data.tournament_id,
      round: data.round,
      team1: data.team1,
      team2: data.team2,
      scores: data.scores || [],
      status: data.status,
      matchFormat: data.matchformat,
      court: data.court,
      winnerTeamId: data.winnerteamid
    } as Match;
    
    return updatedMatch;
  } catch (err) {
    console.error('Exception during match update:', err);
    return null;
  }
};

export const deleteMatchesByTournamentAndStatusDB = async (tournamentId: string, statusToKeep: 'COMPLETED'): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('tournament_id', tournamentId)
    .neq('status', statusToKeep);
    
  if (error) {
    console.error('Error deleting non-completed matches:', error);
    return false;
  }
  return true;
};

export const deleteAllMatchesByTournamentDB = async (tournamentId: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('tournament_id', tournamentId);
    
  if (error) {
    console.error(`Error deleting all matches for tournament ${tournamentId}:`, error);
    return false;
  }
  return true;
};

export const deleteAllPlayersDB = async (): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('players')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  if (error) {
    console.error('Error deleting all players:', error);
    return false;
  }
  return true;
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export const getPlayerStatisticsDB = async (playerId: string, tournamentId?: string): Promise<any> => {
  if (!supabase) return null;
  
  const { data, error } = await supabase.rpc('get_player_tournament_stats', {
    player_uuid: playerId,
    tournament_uuid: tournamentId || null
  });
  
  if (error) {
    console.error('Error calculating player statistics:', error);
    return null;
  }
  
  return data[0] || null;
};

export const deleteMatchDB = async (matchId: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);
    
  if (error) {
    console.error('Error deleting match:', error);
    return false;
  }
  return true;
};