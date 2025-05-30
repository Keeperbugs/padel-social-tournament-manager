import React, { useState } from 'react';
import { Tournament } from '../types';

interface TournamentListProps {
  tournaments: Tournament[];
  onSelectTournament: (tournamentId: string) => void;
  onEditTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournamentId: string) => void;
  onCreateTournament: () => void;
  currentTournamentId?: string;
}

const TournamentList: React.FC<TournamentListProps> = ({ 
  tournaments, 
  onSelectTournament, 
  onEditTournament, 
  onDeleteTournament, 
  onCreateTournament,
  currentTournamentId
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'DRAFT'>('ALL');

  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'ALL') return true;
    return tournament.status === filter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-400">Tornei</h2>
        <button
          onClick={onCreateTournament}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          + Nuovo Torneo
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        {(['ALL', 'ACTIVE', 'COMPLETED', 'DRAFT'] as const).map((status) => (
          <button
            key={status}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === status
                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 font-medium'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setFilter(status)}
          >
            {status === 'ALL' ? 'Tutti' : status === 'ACTIVE' ? 'Attivi' : status === 'COMPLETED' ? 'Completati' : 'Bozze'}
          </button>
        ))}
      </div>

      {filteredTournaments.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow">
          <p className="text-slate-500 dark:text-slate-400">
            {filter === 'ALL'
              ? 'Nessun torneo trovato. Crea il tuo primo torneo!'
              : `Nessun torneo con stato "${filter}" trovato.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border-l-4 ${
                tournament.id === currentTournamentId 
                  ? 'border-primary-500 dark:border-primary-400' 
                  : 'border-transparent'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400">{tournament.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(tournament.status)}`}>
                  {tournament.status === 'ACTIVE' ? 'Attivo' : tournament.status === 'COMPLETED' ? 'Completato' : 'Bozza'}
                </span>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {tournament.description || 'Nessuna descrizione'}
              </p>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div>Giornate: {tournament.days}</div>
                <div>Round corrente: {tournament.currentRound}</div>
                <div>Partite/giorno: {tournament.matchesPerDay}</div>
                <div>Giocatori: {tournament.playerIds?.length || 0}/{tournament.maxPlayers}</div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => onSelectTournament(tournament.id)}
                  className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-sm"
                >
                  {tournament.id === currentTournamentId ? 'Selezionato' : 'Seleziona'}
                </button>
                <button
                  onClick={() => onEditTournament(tournament)}
                  className="px-3 py-1.5 bg-secondary-500 text-white rounded hover:bg-secondary-600 text-sm"
                >
                  Modifica
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Sei sicuro di voler eliminare il torneo "${tournament.name}"? Questa azione non può essere annullata.`)) {
                      onDeleteTournament(tournament.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentList;