import React, { useState } from 'react';
import { Player, Team, MatchFormat } from '../types';
import PlayerSelector from './PlayerSelector';

interface ManualMatchCreatorProps {
  availablePlayers: Player[];
  onCreateMatch: (team1: Team, team2: Team, matchFormat: MatchFormat, court?: string) => void;
  onCancel: () => void;
  matchFormat: MatchFormat;
}

const ManualMatchCreator: React.FC<ManualMatchCreatorProps> = ({
  availablePlayers,
  onCreateMatch,
  onCancel,
  matchFormat
}) => {
  const [team1Players, setTeam1Players] = useState<string[]>([]);
  const [team2Players, setTeam2Players] = useState<string[]>([]);
  const [court, setCourt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateMatch = () => {
    // Validazione
    if (team1Players.length !== 2 || team2Players.length !== 2) {
      setError('Ogni squadra deve avere esattamente 2 giocatori');
      return;
    }

    // Verifica che lo stesso giocatore non sia presente in entrambe le squadre
    const allPlayerIds = [...team1Players, ...team2Players];
    const uniquePlayerIds = [...new Set(allPlayerIds)];
    if (uniquePlayerIds.length !== 4) {
      setError('Un giocatore non può essere in entrambe le squadre');
      return;
    }

    // Crea gli oggetti Team
    const player1Team1 = availablePlayers.find(p => p.id === team1Players[0]);
    const player2Team1 = availablePlayers.find(p => p.id === team1Players[1]);
    const player1Team2 = availablePlayers.find(p => p.id === team2Players[0]);
    const player2Team2 = availablePlayers.find(p => p.id === team2Players[1]);

    if (!player1Team1 || !player2Team1 || !player1Team2 || !player2Team2) {
      setError('Errore nella selezione dei giocatori');
      return;
    }

    const team1: Team = {
      id: `t-${crypto.randomUUID()}`,
      player1: player1Team1,
      player2: player2Team1
    };

    const team2: Team = {
      id: `t-${crypto.randomUUID()}`,
      player1: player1Team2,
      player2: player2Team2
    };

    onCreateMatch(team1, team2, matchFormat, court || undefined);
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400">Crea Partita Manualmente</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prima squadra */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">Squadra 1</h4>
          <PlayerSelector
            availablePlayers={availablePlayers}
            selectedPlayerIds={team1Players}
            onSelectionChange={setTeam1Players}
            maxSelections={2}
          />
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Giocatori selezionati:</h5>
            {team1Players.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nessun giocatore selezionato</p>
            ) : (
              <ul className="space-y-1">
                {team1Players.map(id => {
                  const player = availablePlayers.find(p => p.id === id);
                  return player ? (
                    <li key={id} className="text-sm">
                      {player.nickname || `${player.name} ${player.surname}`} 
                      <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">({player.skillLevel})</span>
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </div>
        </div>
        
        {/* Seconda squadra */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">Squadra 2</h4>
          <PlayerSelector
            availablePlayers={availablePlayers}
            selectedPlayerIds={team2Players}
            onSelectionChange={setTeam2Players}
            maxSelections={2}
          />
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Giocatori selezionati:</h5>
            {team2Players.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nessun giocatore selezionato</p>
            ) : (
              <ul className="space-y-1">
                {team2Players.map(id => {
                  const player = availablePlayers.find(p => p.id === id);
                  return player ? (
                    <li key={id} className="text-sm">
                      {player.nickname || `${player.name} ${player.surname}`}
                      <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">({player.skillLevel})</span>
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Campo */}
      <div>
        <label htmlFor="court" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Campo (opzionale)
        </label>
        <input
          type="text"
          id="court"
          value={court}
          onChange={(e) => setCourt(e.target.value)}
          placeholder="Es. Campo 1"
          className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={handleCreateMatch}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          Crea Partita
        </button>
      </div>
    </div>
  );
};

export default ManualMatchCreator;