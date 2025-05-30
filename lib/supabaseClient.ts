import { createClient } from '@supabase/supabase-js';
import { AppSettings, Player, Match, SETTINGS_ID } from '../types';

// Queste variabili dovrebbero essere configurate nel tuo ambiente (es. .env file o nelle impostazioni di Vercel/Netlify)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase URL o Anon Key non definite. L'app funzionerà senza persistenza backend. " +
    "Configura SUPABASE_URL e SUPABASE_ANON_KEY nel tuo ambiente se desideri utilizzare Supabase."
  );
  
  // @ts-ignore Property 'env' does not exist on type 'ImportMeta'.
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    // console.warn("Suggerimento: definisci le variabili d'ambiente per abilitare Supabase.");
  }
}

// Esporta il client Supabase. Sarà `null` se le chiavi non sono definite.
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Utility per convertire stringhe UUID in formato corretto per Supabase
// Rimuove i trattini se presenti (alcuni database UUID non li accettano)
const formatUUID = (id: string): string => {
  return id.replace(/-/g, '');
};

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

// Matches
export const getMatchesDB = async (): Promise<Match[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) { 
    console.error('Error fetching matches:', error); 
    return []; 
  }
  
  // Converti i campi JSONB in oggetti JavaScript
  const matches = data.map(match => ({
    ...match,
    team1: typeof match.team1 === 'string' ? JSON.parse(match.team1) : match.team1,
    team2: typeof match.team2 === 'string' ? JSON.parse(match.team2) : match.team2,
    scores: typeof match.scores === 'string' ? JSON.parse(match.scores) : (match.scores || [])
  }));
  
  return matches as Match[];
};

export const addMatchesDB = async (matches: Match[]): Promise<Match[]> => {
  if (!supabase) return [];
  
  try {
    // Preparazione dei dati per l'inserimento
    const matchesToInsert = matches.map(match => {
      // Rimuovi l'id generato dal client per farlo generare dal database se non è necessario mantenere l'id specifico
      // const { id, ...matchWithoutId } = match;
      
      return {
        // Se vuoi mantenere l'id generato dal client:
        id: match.id, // Supabase potrebbe avere problemi se l'id non è in formato UUID valido
        round: match.round,
        team1: match.team1, // Supabase gestisce automaticamente la conversione in JSONB
        team2: match.team2,
        scores: match.scores || [],
        status: match.status,
        matchformat: match.matchFormat,
        court: match.court,
        winnerteamid: match.winnerTeamId // Potrebbe essere necessario formattare l'UUID
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
    
    // Modifica qui: Non passare direttamente winnerTeamId ma lo imposteremo in modo condizionale
    const matchToUpdate = {
      id: match.id,
      round: match.round,
      team1: match.team1,
      team2: match.team2,
      scores: match.scores || [],
      status: match.status,
      matchformat: match.matchFormat,
      court: match.court
      // winnerteamid: rimosso da qui
    };
    
    // Gestione speciale per winnerTeamId
    if (match.winnerTeamId) {
      // Verifica se il team vincitore è team1 o team2
      if (match.winnerTeamId === match.team1.id) {
        // Se il vincitore è team1, usa l'ID del player1 di team1 come valore per winnerteamid
        // In alternativa, potresti usare null o un valore speciale per indicare che team1 ha vinto
        matchToUpdate['winnerteamid'] = match.team1.player1.id; // UUID valido
      } else if (match.winnerTeamId === match.team2.id) {
        // Se il vincitore è team2, usa l'ID del player1 di team2 come valore per winnerteamid
        matchToUpdate['winnerteamid'] = match.team2.player1.id; // UUID valido
      } else {
        // Se winnerTeamId non corrisponde a nessuno dei due team, rimuovilo
        console.warn("winnerTeamId non corrisponde a nessun team:", match.winnerTeamId);
      }
    }
    
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
    // Importante: Mantieni il winnerTeamId originale qui
    const updatedMatch = {
      id: data.id,
      round: data.round,
      team1: data.team1,
      team2: data.team2,
      scores: data.scores || [],
      status: data.status,
      matchFormat: data.matchformat,
      court: data.court,
      winnerTeamId: match.winnerTeamId // Usa il valore originale, NON data.winnerteamid
    } as Match;
    
    return updatedMatch;
  } catch (err) {
    console.error('Exception during match update:', err);
    return null;
  }
};

export const deleteMatchesByStatusDB = async (statusToKeep: 'COMPLETED'): Promise<boolean> => {
  if (!supabase) return false;
  // Cancella le partite che NON hanno lo status 'COMPLETED'
  const { error } = await supabase
    .from('matches')
    .delete()
    .neq('status', statusToKeep);
    
  if (error) {
    console.error('Error deleting non-completed matches:', error);
    return false;
  }
  return true;
};

export const deleteAllMatchesDB = async (): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('matches')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Usa un UUID valido come trucco
    
  if (error) {
    console.error('Error deleting all matches:', error);
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