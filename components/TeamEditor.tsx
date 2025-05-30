// components/TeamEditor.tsx
import React, { useState } from 'react';
import { Player, Team, Match } from '../types';

interface TeamEditorProps {
  match: Match;
  availablePlayers: Player[];
  onSave: (updatedMatch: Match) => void;
  onCancel: () => void;
}

const TeamEditor: React.FC<TeamEditorProps> = ({ 
  match, 
  availablePlayers, 
  onSave, 
  onCancel 
}) => {
  const [team1Player1, setTeam1Player1] = useState<string>(match.team1.player1.id);
  const [team1Player2, setTeam1Player2] = useState<string>(match.team1.player2.id);
  const [team2Player1, setTeam2Player1] = useState<string>(match.team2.player1.id);
  const [team2Player2, setTeam2Player2] = useState<string>(match.team2.player2.id);
  const [court, setCourt] = useState<string>(match.court || '');
  const [error, setError] = useState<string | null>(null);

  const validateAndSave = () => {
    // Verifica che non ci siano giocatori duplicati
    const playerIds = [team1Player1, team1Player2, team2Player1, team2Player2];
    const uniquePlayerIds = [...new Set(playerIds)];
    
    if (uniquePlayerIds.length !== 4) {
      setError('Ogni giocatore può essere selezionato una sola volta');
      return;
    }

    // Trova i giocatori dagli ID
    const p1t1 = availablePlayers.find(p => p.id === team1Player1);
    const p2t1 = availablePlayers.find(p => p.id === team1Player2);
    const p1t2 = availablePlayers.find(p => p.id === team2Player1);
    const p2t2 = availablePlayers.find(p => p.id === team2Player2);

    if (!p1t1 || !p2t1 || !p1t2 || !p2t2) {
      setError('Errore nel trovare i giocatori selezionati');
      return;
    }

    // Crea le nuove squadre
    const updatedTeam1: Team = {
      ...match.team1,
      player1: p1t1,
      player2: p2t1
    };

    const updatedTeam2: Team = {
      ...match.team2,
      player1: p1t2,
      player2: p2t2
    };

    // Crea la partita aggiornata
    const updatedMatch: Match = {
      ...match,
      team1: updatedTeam1,
      team2: updatedTeam2,
      court: court || undefined
    };

    onSave(updatedMatch);
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400">Modifica Squadre</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Squadra 1 */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700 dark:text-slate-300">Squadra 1</h4>
          
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Giocatore 1</label>
            <select
              value={team1Player1}
              onChange={(e) => setTeam1Player1(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
            >
              {availablePlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.nickname || `${player.name} ${player.surname}`} ({player.skillLevel})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Giocatore 2</label>
            <select
              value={team1Player2}
              onChange={(e) => setTeam1Player2(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
            >
              {availablePlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.nickname || `${player.name} ${player.surname}`} ({player.skillLevel})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Squadra 2 */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700 dark:text-slate-300">Squadra 2</h4>
          
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Giocatore 1</label>
            <select
              value={team2Player1}
              onChange={(e) => setTeam2Player1(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
            >
              {availablePlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.nickname || `${player.name} ${player.surname}`} ({player.skillLevel})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Giocatore 2</label>
            <select
              value={team2Player2}
              onChange={(e) => setTeam2Player2(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
            >
              {availablePlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.nickname || `${player.name} ${player.surname}`} ({player.skillLevel})
                </option>
              ))}
            </select>
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
          onClick={validateAndSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          Salva Modifiche
        </button>
      </div>
    </div>
  );
};

export default TeamEditor;