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

// Settings
export const getSettingsDB = async (): Promise<AppSettings | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournament_settings')
    .select('*')
    .eq('id', SETTINGS_ID) 
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
     console.error('Error fetching settings:', error); 
     return null;
  }
  return data as AppSettings | null;
};

export const updateSettingsDB = async (settings: AppSettings): Promise<AppSettings | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournament_settings')
    .upsert({ ...settings, id: SETTINGS_ID }, { onConflict: 'id' })
    .select()
    .single();
    
  if (error) {
    console.error('Error updating settings:', error);
    return null;
  }
  
  return data as AppSettings;
};

// Players
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
  return data as Player[];
};

export const addPlayerDB = async (player: Player): Promise<Player | null> => {
  if (!supabase) return null;
  
  // Rimuoviamo l'id se è stato generato dal client, lasciamo che sia il database a generarlo
  const { id, ...playerData } = player;
  
  const { data, error } = await supabase
    .from('players')
    .insert(playerData)
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
  const { data, error } = await supabase
    .from('players')
    .update(player)
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
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);
    
  if (error) {
    console.error('Error deleting player:', error);
    return false;
  }
  return true;
};

// Tournaments
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

// Player Stats
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
  
  // Converti i nomi delle colonne dal formato snake_case al formato camelCase
  return data.map(stat => ({
    id: stat.id,
    tournamentId: stat.tournament_id,
    ...stat.players,
    matchesPlayed: stat.matches_played,
    matchesWon: stat.matches_won,
    setsWon: stat.sets_won,
    setsLost: stat.sets_lost,
    gamesWon: stat.games_won,
    gamesLost: stat.games_lost,
    points: stat.points,
  })) as PlayerStats[];
};

export const getOverallPlayerStatsDB = async (): Promise<PlayerStats[]> => {
  if (!supabase) return [];
  // Ottieni tutte le statistiche e raggruppale per giocatore
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      player_id,
      matches_played,
      matches_won,
      sets_won,
      sets_lost,
      games_won,
      games_lost,
      points,
      players:player_id (*)
    `);
    
  if (error) { 
    console.error('Error fetching overall player stats:', error); 
    return []; 
  }
  
  // Raggruppa per giocatore e somma le statistiche
  const playerStatsMap = new Map<string, PlayerStats>();
  
  data.forEach(stat => {
    const playerId = stat.player_id;
    const player = stat.players;
    
    if (!playerStatsMap.has(playerId)) {
      playerStatsMap.set(playerId, {
        id: playerId,
        tournamentId: 'overall',
        ...player,
        matchesPlayed: 0,
        matchesWon: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        points: 0
      });
    }
    
    const currentStats = playerStatsMap.get(playerId)!;
    currentStats.matchesPlayed += stat.matches_played;
    currentStats.matchesWon += stat.matches_won;
    currentStats.setsWon += stat.sets_won;
    currentStats.setsLost += stat.sets_lost;
    currentStats.gamesWon += stat.games_won;
    currentStats.gamesLost += stat.games_lost;
    currentStats.points += stat.points;
  });
  
  return Array.from(playerStatsMap.values());
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
  
  // Restituisci le statistiche originali dato che non abbiamo i dati completi dal database
  return playerStats;
};

// Matches
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
    matchFormat: match.matchformat, // Mappa matchformat -> matchFormat
    winnerTeamId: match.winnerteamid // Mappa winnerteamid -> winnerTeamId
  }));
  
  return matches as Match[];
};

export const addMatchesDB = async (matches: Match[]): Promise<Match[]> => {
  if (!supabase) return [];
  
  try {
    // Preparazione dei dati per l'inserimento
    const matchesToInsert = matches.map(match => {
      return {
        id: match.id,
        tournament_id: match.tournamentId,
        round: match.round,
        team1: match.team1, // Supabase gestisce automaticamente la conversione in JSONB
        team2: match.team2,
        scores: match.scores || [],
        status: match.status,
        matchformat: match.matchFormat,
        court: match.court,
        winnerteamid: match.winnerTeamId // Ora dovrebbe essere di tipo text, quindi è ok
      };
    });
    
    console.log('Inserting matches:', matchesToInsert);
    
    const { data, error } = await supabase
      .from('matches')
      .insert(matchesToInsert)
      .select();
      
    if (error) {
      console.error('Error adding matches:', error);
      return [];
    }
    
    // Converti i dati restituiti nel formato previsto dall'app
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
    console.log("Tentativo di aggiornamento match:", match);
    
    // Prepara i dati per l'aggiornamento
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
      winnerteamid: match.winnerTeamId // Ora dovrebbe essere di tipo text, quindi è ok
    };
    
    console.log("Dati preparati per l'aggiornamento:", matchToUpdate);
    
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
    
    // Converti i dati restituiti nel formato previsto dall'app
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
  // Cancella le partite che NON hanno lo status 'COMPLETED'
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
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Usa un UUID valido come trucco
    
  if (error) {
    console.error('Error deleting all players:', error);
    return false;
  }
  return true;
};