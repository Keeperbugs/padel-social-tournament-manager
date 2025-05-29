
import React, { useState } from 'react';
import { Player, SkillLevel } from '../types';

interface RankingsTableProps {
  players: Player[];
}

const RankingsTable: React.FC<RankingsTableProps> = ({ players }) => {
  const [filter, setFilter] = useState<SkillLevel | 'ALL'>('ALL');

  const filteredPlayers = players
    .filter(p => filter === 'ALL' || p.skillLevel === filter)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
      const aSetQuotient = a.setsLost === 0 ? (a.setsWon > 0 ? Infinity : 0) : a.setsWon / a.setsLost;
      const bSetQuotient = b.setsLost === 0 ? (b.setsWon > 0 ? Infinity : 0) : b.setsWon / b.setsLost;
      if (bSetQuotient !== aSetQuotient) return bSetQuotient - aSetQuotient;
      // Potremmo aggiungere quoziente game se tracciati
      return (a.name + a.surname).localeCompare(b.name + b.surname);
    });

  return (
    <div className="p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400">Classifica Individuale</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as SkillLevel | 'ALL')}
          className="pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
        >
          <option value="ALL">Tutti</option>
          <option value={SkillLevel.A}>{SkillLevel.A}</option>
          <option value={SkillLevel.B}>{SkillLevel.B}</option>
        </select>
      </div>
      {filteredPlayers.length === 0 ? (
         <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nessun giocatore in classifica o che corrisponde ai filtri.</p>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">#</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Giocatore</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell">Fascia</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Punti</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">PG</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">PV</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell">SV</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell">SP</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider hidden lg:table-cell">QS</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filteredPlayers.map((player, index) => {
              const setQuotient = player.setsLost === 0 ? (player.setsWon > 0 ? 'Inf' : '0.00') : (player.setsWon / player.setsLost).toFixed(2);
              return (
                <tr key={player.id} className={`${index < 3 ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{index + 1}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {player.nickname ? `${player.nickname} (${player.name} ${player.surname})` : `${player.name} ${player.surname}`}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{player.skillLevel}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-semibold text-slate-900 dark:text-slate-100">{player.points}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-slate-500 dark:text-slate-400">{player.matchesPlayed}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-slate-500 dark:text-slate-400">{player.matchesWon}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-slate-500 dark:text-slate-400 hidden md:table-cell">{player.setsWon}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-slate-500 dark:text-slate-400 hidden md:table-cell">{player.setsLost}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-slate-500 dark:text-slate-400 hidden lg:table-cell">{setQuotient}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default RankingsTable;
