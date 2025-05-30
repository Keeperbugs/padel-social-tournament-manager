import React, { useState } from 'react';
import { Player, Tournament, SkillLevel } from '../types';

interface PlayerCardProps {
  player: Player;
  tournament: Tournament | null;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  tournament, 
  onEdit, 
  onDelete, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState<Player>({ ...player });

  const handleQuickEdit = () => {
    setIsEditing(true);
    setEditedPlayer({ ...player });
  };

  const handleSaveQuickEdit = () => {
    onUpdate(editedPlayer);
    setIsEditing(false);
  };

  const handleCancelQuickEdit = () => {
    setEditedPlayer({ ...player });
    setIsEditing(false);
  };

  const getSkillLevelColor = (skillLevel: SkillLevel) => {
    switch (skillLevel) {
      case SkillLevel.A:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case SkillLevel.B:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const winRate = player.matchesPlayed > 0 ? ((player.matchesWon / player.matchesPlayed) * 100).toFixed(1) : '0.0';
  const setRatio = player.setsLost > 0 ? (player.setsWon / player.setsLost).toFixed(2) : player.setsWon > 0 ? '∞' : '0.00';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header con avatar e azioni */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">
                {player.name.charAt(0)}{player.surname.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {player.nickname || `${player.name} ${player.surname}`}
              </h3>
              {player.nickname && (
                <p className="text-primary-100 text-sm">
                  {player.name} {player.surname}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={handleQuickEdit}
              className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              title="Modifica rapida"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              title="Modifica completa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md hover:bg-red-500/20 transition-colors"
              title="Elimina giocatore"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="p-4 space-y-4">
        {/* Informazioni base */}
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={editedPlayer.name}
                onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                placeholder="Nome"
                className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
              <input
                type="text"
                value={editedPlayer.surname}
                onChange={(e) => setEditedPlayer({ ...editedPlayer, surname: e.target.value })}
                placeholder="Cognome"
                className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
              />
            </div>
            <input
              type="text"
              value={editedPlayer.nickname || ''}
              onChange={(e) => setEditedPlayer({ ...editedPlayer, nickname: e.target.value || undefined })}
              placeholder="Nickname (opzionale)"
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
            />
            <input
              type="text"
              value={editedPlayer.contact || ''}
              onChange={(e) => setEditedPlayer({ ...editedPlayer, contact: e.target.value || undefined })}
              placeholder="Contatto (opzionale)"
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
            />
            <select
              value={editedPlayer.skillLevel}
              onChange={(e) => setEditedPlayer({ ...editedPlayer, skillLevel: e.target.value as SkillLevel })}
              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white"
            >
              {Object.values(SkillLevel).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveQuickEdit}
                className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Salva
              </button>
              <button
                onClick={handleCancelQuickEdit}
                className="flex-1 px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Fascia di abilità */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Fascia:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(player.skillLevel)}`}>
                {player.skillLevel === SkillLevel.A ? 'A' : player.skillLevel === SkillLevel.B ? 'B' : '?'}
              </span>
            </div>

            {/* Contatto */}
            {player.contact && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Contatto:</span>
                <span className="text-sm text-slate-900 dark:text-slate-100 truncate max-w-32">
                  {player.contact}
                </span>
              </div>
            )}

            {/* Torneo attuale */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Torneo:</span>
              {tournament ? (
                <span className="text-sm text-primary-600 dark:text-primary-400 font-medium truncate max-w-32">
                  {tournament.name}
                </span>
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-500 italic">
                  Nessuno
                </span>
              )}
            </div>

            {/* Statistiche */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Statistiche
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                  <div className="text-slate-600 dark:text-slate-400">Punti</div>
                  <div className="font-semibold text-lg text-primary-600 dark:text-primary-400">
                    {player.points}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                  <div className="text-slate-600 dark:text-slate-400">% Vittorie</div>
                  <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                    {winRate}%
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                  <div className="text-slate-600 dark:text-slate-400">Partite</div>
                  <div className="font-medium">
                    <span className="text-green-600 dark:text-green-400">{player.matchesWon}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span>{player.matchesPlayed}</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                  <div className="text-slate-600 dark:text-slate-400">Set Ratio</div>
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {setRatio}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiche dettagliate */}
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Set vinti/persi:</span>
                <span>{player.setsWon}/{player.setsLost}</span>
              </div>
              <div className="flex justify-between">
                <span>Game vinti/persi:</span>
                <span>{player.gamesWon}/{player.gamesLost}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;