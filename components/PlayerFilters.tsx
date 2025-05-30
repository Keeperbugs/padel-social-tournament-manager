import React from 'react';
import { SkillLevel, Tournament } from '../types';

interface PlayerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterSkillLevel: SkillLevel | 'ALL';
  onSkillLevelChange: (value: SkillLevel | 'ALL') => void;
  filterTournament: string | 'ALL' | 'NONE';
  onTournamentChange: (value: string | 'ALL' | 'NONE') => void;
  sortBy: 'name' | 'skillLevel' | 'points' | 'matchesWon';
  onSortByChange: (value: 'name' | 'skillLevel' | 'points' | 'matchesWon') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  tournaments: Tournament[];
  totalPlayers: number;
  filteredCount: number;
}

const PlayerFilters: React.FC<PlayerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterSkillLevel,
  onSkillLevelChange,
  filterTournament,
  onTournamentChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  tournaments,
  totalPlayers,
  filteredCount
}) => {
  const clearFilters = () => {
    onSearchChange('');
    onSkillLevelChange('ALL');
    onTournamentChange('ALL');
    onSortByChange('name');
    onSortOrderChange('asc');
  };

  const hasActiveFilters = searchTerm || filterSkillLevel !== 'ALL' || filterTournament !== 'ALL' || sortBy !== 'name' || sortOrder !== 'asc';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400">
          Filtri e Ordinamento
        </h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Visualizzando {filteredCount} di {totalPlayers} giocatori
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Pulisci filtri
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Ricerca */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cerca giocatori
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              placeholder="Nome, cognome o nickname..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtro Fascia */}
        <div>
          <label htmlFor="skillLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Fascia di abilità
          </label>
          <select
            id="skillLevel"
            value={filterSkillLevel}
            onChange={(e) => onSkillLevelChange(e.target.value as SkillLevel | 'ALL')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
          >
            <option value="ALL">Tutte le fasce</option>
            <option value={SkillLevel.A}>{SkillLevel.A}</option>
            <option value={SkillLevel.B}>{SkillLevel.B}</option>
            <option value={SkillLevel.UNASSIGNED}>{SkillLevel.UNASSIGNED}</option>
          </select>
        </div>

        {/* Filtro Torneo */}
        <div>
          <label htmlFor="tournament" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Torneo
          </label>
          <select
            id="tournament"
            value={filterTournament}
            onChange={(e) => onTournamentChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
          >
            <option value="ALL">Tutti</option>
            <option value="NONE">Nessun torneo</option>
            {tournaments.map(tournament => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ordinamento */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Ordina per
          </label>
          <div className="flex space-x-1">
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as 'name' | 'skillLevel' | 'points' | 'matchesWon')}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            >
              <option value="name">Nome</option>
              <option value="skillLevel">Fascia</option>
              <option value="points">Punti</option>
              <option value="matchesWon">Vittorie</option>
            </select>
            <button
              type="button"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-2 border border-l-0 border-slate-300 dark:border-slate-600 rounded-r-md bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400"
              title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sortOrder === 'asc' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerFilters;