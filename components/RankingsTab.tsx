import React, { useState } from 'react';
import { Tournament, PlayerStats, SkillLevel } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RankingsTabProps {
  tournamentPlayerStats: PlayerStats[];
  overallPlayerStats: PlayerStats[];
  tournaments: Tournament[];
  currentTournamentId?: string;
  darkMode: boolean;
}

const RankingsTab: React.FC<RankingsTabProps> = ({
  tournamentPlayerStats,
  overallPlayerStats,
  tournaments,
  currentTournamentId,
  darkMode
}) => {
  const [filter, setFilter] = useState<SkillLevel | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'TOURNAMENT' | 'OVERALL'>('TOURNAMENT');
  const [sortBy, setSortBy] = useState<'points' | 'matchesWon' | 'setsWon'>('points');

  // Determinare quale set di statistiche usare in base al viewMode
  const statsToUse = viewMode === 'TOURNAMENT' ? tournamentPlayerStats : overallPlayerStats;

  // Applicare i filtri e ordinare
  const filteredStats = statsToUse
    .filter(p => filter === 'ALL' || p.skillLevel === filter)
    .sort((a, b) => {
      if (b[sortBy] !== a[sortBy]) return b[sortBy] - a[sortBy];
      if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
      const aSetQuotient = a.setsLost === 0 ? (a.setsWon > 0 ? Infinity : 0) : a.setsWon / a.setsLost;
      const bSetQuotient = b.setsLost === 0 ? (b.setsWon > 0 ? Infinity : 0) : b.setsWon / b.setsLost;
      if (bSetQuotient !== aSetQuotient) return bSetQuotient - aSetQuotient;
      return (a.name + a.surname).localeCompare(b.name + b.surname);
    });

  // Preparare i dati per il grafico
  const chartData = filteredStats
    .slice(0, 10)
    .map(p => ({
      name: p.nickname || `${p.name} ${p.surname.charAt(0)}.`,
      Punti: p.points,
      'Partite Vinte': p.matchesWon,
      'Set Vinti': p.setsWon
    }));

  // Trovare il nome del torneo corrente
  const currentTournament = tournaments.find(t => t.id === currentTournamentId);
  const currentTournamentName = currentTournament?.name || 'Nessun torneo selezionato';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-400">
          {viewMode === 'TOURNAMENT' 
            ? `Classifica: ${currentTournamentName}`
            : 'Classifica Generale'}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('TOURNAMENT')}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md 
                ${viewMode === 'TOURNAMENT' 
                  ? 'bg-primary-600 text-white dark:bg-primary-500' 
                  : 'bg-white text-slate-700 border border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}
            >
              Torneo
            </button>
            <button
              type="button"
              onClick={() => setViewMode('OVERALL')}
              className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md 
                ${viewMode === 'OVERALL' 
                  ? 'bg-primary-600 text-white dark:bg-primary-500' 
                  : 'bg-white text-slate-700 border border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}
            >
              Generale
            </button>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as SkillLevel | 'ALL')}
            className="inline-flex rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">Tutte le fasce</option>
            <option value={SkillLevel.A}>{SkillLevel.A}</option>
            <option value={SkillLevel.B}>{SkillLevel.B}</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'points' | 'matchesWon' | 'setsWon')}
            className="inline-flex rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="points">Ordina per Punti</option>
            <option value="matchesWon">Ordina per Partite Vinte</option>
            <option value="setsWon">Ordina per Set Vinti</option>
          </select>
        </div>
      </div>

      {filteredStats.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow">
          <p className="text-slate-500 dark:text-slate-400">
            {viewMode === 'TOURNAMENT' && !currentTournamentId
              ? 'Seleziona un torneo per visualizzare la classifica'
              : 'Nessun dato disponibile per la classifica'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800 shadow-md rounded-lg">
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
                {filteredStats.map((player, index) => {
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

          {chartData.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400 mb-4">
                Top 10 Giocatori
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" className="text-xs fill-slate-600 dark:fill-slate-400" />
                  <YAxis allowDecimals={false} className="text-xs fill-slate-600 dark:fill-slate-400" />
                  <Tooltip 
                    wrapperClassName="!bg-white dark:!bg-slate-700 !border-slate-300 dark:!border-slate-600 !rounded-md shadow-lg"
                    contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                    labelStyle={{ color: darkMode ? '#cbd5e1' : '#334155', fontWeight: 'bold' }}
                    itemStyle={{ color: darkMode ? '#94a3b8' : '#475569' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.875rem', color: darkMode ? '#e2e8f0' : '#1e293b' }}/>
                  <Bar dataKey="Punti" className="fill-primary-500 dark:fill-primary-600" radius={[4, 4, 0, 0]} />
                  {sortBy !== 'points' && (
                    <Bar 
                      dataKey={sortBy === 'matchesWon' ? 'Partite Vinte' : 'Set Vinti'} 
                      className="fill-secondary-500 dark:fill-secondary-600" 
                      radius={[4, 4, 0, 0]} 
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RankingsTab;