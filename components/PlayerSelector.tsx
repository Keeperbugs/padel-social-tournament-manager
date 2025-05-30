import React, { useState, useEffect } from 'react';
import { Player, SkillLevel } from '../types';

interface PlayerSelectorProps {
  availablePlayers: Player[];
  selectedPlayerIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  maxSelections?: number;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  availablePlayers,
  selectedPlayerIds,
  onSelectionChange,
  maxSelections = 32
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkillLevel, setFilterSkillLevel] = useState<SkillLevel | 'ALL'>('ALL');
  
  // Filtro giocatori in base al termine di ricerca e al livello di abilità
  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = `${player.name} ${player.surname} ${player.nickname || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = filterSkillLevel === 'ALL' || player.skillLevel === filterSkillLevel;
    return matchesSearch && matchesSkill;
  });

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      onSelectionChange(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      if (selectedPlayerIds.length < maxSelections) {
        onSelectionChange([...selectedPlayerIds, playerId]);
      } else {
        alert(`Non puoi selezionare più di ${maxSelections} giocatori.`);
      }
    }
  };

  const selectAll = () => {
    const allFilteredIds = filteredPlayers.map(p => p.id);
    const newSelection = [...new Set([...selectedPlayerIds, ...allFilteredIds])];
    
    if (newSelection.length > maxSelections) {
      alert(`Non puoi selezionare più di ${maxSelections} giocatori.`);
      return;
    }
    
    onSelectionChange(newSelection);
  };

  const deselectAll = () => {
    const filteredIds = filteredPlayers.map(p => p.id);
    const newSelection = selectedPlayerIds.filter(id => !filteredIds.includes(id));
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cerca giocatori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
          />
        </div>
        
        <div>
          <select
            value={filterSkillLevel}
            onChange={(e) => setFilterSkillLevel(e.target.value as SkillLevel | 'ALL')}
            className="w-full sm:w-auto px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
          >
            <option value="ALL">Tutte le fasce</option>
            <option value={SkillLevel.A}>{SkillLevel.A}</option>
            <option value={SkillLevel.B}>{SkillLevel.B}</option>
            <option value={SkillLevel.UNASSIGNED}>{SkillLevel.UNASSIGNED}</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600 dark:text-slate-400">
          Selezionati: {selectedPlayerIds.length}/{maxSelections}
        </span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs px-2 py-1 text-primary-600 dark:text-primary-400 hover:underline"
          >
            Seleziona tutti
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs px-2 py-1 text-primary-600 dark:text-primary-400 hover:underline"
          >
            Deseleziona tutti
          </button>
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md">
        {filteredPlayers.length === 0 ? (
          <p className="p-3 text-slate-500 dark:text-slate-400 text-sm">Nessun giocatore trovato</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredPlayers.map(player => (
              <li 
                key={player.id} 
                className={`flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700 ${
                  selectedPlayerIds.includes(player.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <input
                  type="checkbox"
                  id={`player-select-${player.id}`}
                  checked={selectedPlayerIds.includes(player.id)}
                  onChange={() => togglePlayerSelection(player.id)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <label
                  htmlFor={`player-select-${player.id}`}
                  className="ml-3 block font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {player.nickname ? (
                    <>
                      <span className="font-semibold">{player.nickname}</span> ({player.name} {player.surname})
                    </>
                  ) : (
                    <>
                      {player.name} {player.surname}
                    </>
                  )}
                </label>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  player.skillLevel === SkillLevel.A 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : player.skillLevel === SkillLevel.B
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {player.skillLevel === SkillLevel.A ? 'A' : player.skillLevel === SkillLevel.B ? 'B' : '?'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlayerSelector;