import { createClient } from '@supabase/supabase-js';
import { AppSettings, Player, Match } from '../types'; // Assicurati che il percorso sia corretto

// Queste variabili dovrebbero essere configurate nel tuo ambiente (es. .env file o nelle impostazioni di Vercel/Netlify)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase URL o Anon Key non definite. L'app funzionerà senza persistenza backend. " +
    "Configura SUPABASE_URL e SUPABASE_ANON_KEY nel tuo ambiente se desideri utilizzare Supabase."
  );
  // L'alert in modalità DEV può essere invadente, il console.warn è solitamente sufficiente.
  // @ts-ignore Property 'env' does not exist on type 'ImportMeta'.
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    // console.warn("Suggerimento: definisci le variabili d'ambiente per abilitare Supabase.");
    // window.alert("Supabase URL o Anon Key non definite. L'app funzionerà senza persistenza backend. Controlla la console per i dettagli.");
  }
  // NON lanciare un errore qui, permetti all'app di avviarsi con supabase = null.
  // L'app dovrebbe gestire questo caso gracefully.
}

// Esporta il client Supabase. Sarà `null` se le chiavi non sono definite.
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;


// Funzioni helper per Supabase (opzionale, ma può semplificare App.tsx)

// Settings
export const getSettingsDB = async (): Promise<AppSettings | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tournament_settings')
    .select('*')
    .eq('id', 'main_settings') // Assumendo un ID fisso per la singola riga di impostazioni
    .single();
  if (error && error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
     console.error('Error fetching settings:', error); return null;
  }
  return data as AppSettings | null;
};

export const updateSettingsDB = async (settings: AppSettings) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('tournament_settings')
    .upsert({ ...settings, id: 'main_settings' }, { onConflict: 'id' });
  if (error) console.error('Error updating settings:', error);
};

// Players
export const getPlayersDB = async (): Promise<Player[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('players').select('*');
  if (error) { console.error('Error fetching players:', error); return []; }
  return data as Player[];
};

export const addPlayerDB = async (player: Player) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('players').insert(player).select().single();
  if (error) { console.error('Error adding player:', error); return null; }
  return data as Player;
};

export const updatePlayerDB = async (player: Player) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('players').update(player).eq('id', player.id).select().single();
  if (error) { console.error('Error updating player:', error); return null;}
  return data as Player;
};

export const deletePlayerDB = async (playerId: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('players').delete().eq('id', playerId);
  if (error) console.error('Error deleting player:', error);
};

// Matches
export const getMatchesDB = async (): Promise<Match[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('matches').select('*');
  if (error) { console.error('Error fetching matches:', error); return []; }
  return data as Match[];
};

export const addMatchesDB = async (matches: Match[]) => {
  if (!supabase) return [];
  const { error } = await supabase.from('matches').insert(matches);
  if (error) console.error('Error adding matches:', error);
};

export const updateMatchDB = async (match: Match) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('matches').update(match).eq('id', match.id).select().single();
  if (error) { console.error('Error updating match:', error); return null; }
  return data as Match;
};

export const deleteMatchesByStatusDB = async (statusToKeep: 'COMPLETED') => {
  if (!supabase) return;
  // Cancella le partite che NON hanno lo status 'COMPLETED'
  const { error } = await supabase.from('matches').delete().neq('status', statusToKeep);
  if (error) console.error('Error deleting non-completed matches:', error);
};

export const deleteAllMatchesDB = async () => {
    if (!supabase) return;
    const { error } = await supabase.from('matches').delete().neq('id', 'dummy-id-to-delete-all'); // Trick per cancellare tutto
    if (error) console.error('Error deleting all matches:', error);
};

export const deleteAllPlayersDB = async () => {
    if (!supabase) return;
    const { error } = await supabase.from('players').delete().neq('id', 'dummy-id-to-delete-all');
    if (error) console.error('Error deleting all players:', error);
};
