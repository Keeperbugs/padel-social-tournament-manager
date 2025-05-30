import React, { useState } from 'react';
import { Player, SkillLevel } from '../types';
import PlayerForm from './PlayerForm';
import PlayerCard from './PlayerCard';
import PlayerFilters from './PlayerFilters';
import { useTournament } from '../contexts/TournamentContext';

interface PlayersManagementPageProps {
  onPlayerFormSubmit: (playerData: any) => void;
  onPlayerUpdate: (player: Player) => void;
  onPlayerDelete: (playerId: string) => void;
}

const PlayersManagementPage: React.FC<PlayersManagementPageProps> = ({
  onPlayerFormSubmit,
  onPlayerUpdate,
  onPlayerDelete
}) => {
  const { players, tournaments, getPlayerTournament } = useTournament();
  
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkillLevel, setFilterSkillLevel] = useState<SkillLevel | 'ALL'>('ALL');
  const [filterTournament, setFilterTournament] = useState<string | 'ALL' | 'NONE'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'skillLevel' | 'points' | 'matchesWon'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtri e ordinamento
  const filteredAndSortedPlayers = players
    .filter(player => {
      // Filtro per ricerca
      const matchesSearch = `${player.name} ${player.surname} ${player.nickname || ''}`.toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      // Filtro per livello abilità
      const matchesSkill = filterSkillLevel === 'ALL' || player.skillLevel === filterSkillLevel;
      
      // Filtro per torneo
      let matchesTournament = true;
      if (filterTournament === 'NONE') {
        matchesTournament = !getPlayerTournament(player.id);
      } else if (filterTournament !== 'ALL') {
        const playerTournament = getPlayerTournament(player.id);
        matchesTournament = playerTournament?.id === filterTournament;
      }
      
      return matchesSearch && matchesSkill && matchesTournament;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`);
          break;
        case 'skillLevel':
          comparison = a.skillLevel.localeCompare(b.skillLevel);
          break;
        case 'points':
          comparison = b.points - a.points;
          break;
        case 'matchesWon':
          comparison = b.matchesWon - a.matchesWon;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setShowPlayerForm(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handlePlayerFormSubmit = (playerData: any) => {
    onPlayerFormSubmit(playerData);
    setShowPlayerForm(false);
    setEditingPlayer(null);
  };

  const handlePlayerFormCancel = () => {
    setShowPlayerForm(false);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId: string, playerName: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare il giocatore "${playerName}"? Questa azione non può essere annullata.`)) {
      onPlayerDelete(playerId);
    }
  };

  const activeTournaments = tournaments.filter(t => t.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
          Gestione Giocatori
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Totale: {players.length} giocatori
          </span>
          <button
            onClick={handleAddPlayer}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-sm"
          >
            + Aggiungi Giocatore
          </button>
        </div>
      </div>

      {/* Form per aggiunta/modifica giocatore */}
      {showPlayerForm && (
        <PlayerForm
          onSubmit={handlePlayerFormSubmit}
          initialData={editingPlayer}
          onCancel={handlePlayerFormCancel}
        />
      )}

      {/* Filtri */}
      <PlayerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterSkillLevel={filterSkillLevel}
        onSkillLevelChange={setFilterSkillLevel}
        filterTournament={filterTournament}
        onTournamentChange={setFilterTournament}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        tournaments={activeTournaments}
        totalPlayers={players.length}
        filteredCount={filteredAndSortedPlayers.length}
      />

      {/* Lista giocatori */}
      {filteredAndSortedPlayers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            {searchTerm || filterSkillLevel !== 'ALL' || filterTournament !== 'ALL' 
              ? 'Nessun giocatore trovato' 
              : 'Nessun giocatore registrato'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || filterSkillLevel !== 'ALL' || filterTournament !== 'ALL'
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia aggiungendo il primo giocatore'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              tournament={getPlayerTournament(player.id)}
              onEdit={() => handleEditPlayer(player)}
              onDelete={() => handleDeletePlayer(player.id, `${player.name} ${player.surname}`)}
              onUpdate={onPlayerUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayersManagementPage;