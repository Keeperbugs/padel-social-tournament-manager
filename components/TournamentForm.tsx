import React, { useState, useEffect } from 'react';
import { Tournament, Player } from '../types';

interface TournamentFormProps {
  onSubmit: (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: Tournament;
  availablePlayers: Player[];
}

const TournamentForm: React.FC<TournamentFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  availablePlayers 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState(12);
  const [matchesPerDay, setMatchesPerDay] = useState(6);
  const [maxPlayers, setMaxPlayers] = useState(24);
  const [status, setStatus] = useState<'ACTIVE' | 'COMPLETED' | 'DRAFT'>('DRAFT');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setDays(initialData.days);
      setMatchesPerDay(initialData.matchesPerDay);
      setMaxPlayers(initialData.maxPlayers);
      setStatus(initialData.status as 'ACTIVE' | 'COMPLETED' | 'DRAFT');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setSelectedPlayerIds(initialData.playerIds || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'> = {
      name,
      description: description || undefined,
      days,
      matchesPerDay,
      maxPlayers,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      playerIds: selectedPlayerIds,
      currentRound: initialData?.currentRound || 1
    };
    
    onSubmit(tournamentData);
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      if (selectedPlayerIds.length < maxPlayers) {
        setSelectedPlayerIds([...selectedPlayerIds, playerId]);
      } else {
        alert(`Non puoi selezionare più di ${maxPlayers} giocatori per questo torneo.`);
      }
    }
  };

  // Filtra i giocatori in base al termine di ricerca
  const filteredPlayers = availablePlayers.filter(player => {
    const fullName = `${player.name} ${player.surname} ${player.nickname || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-primary-700 dark:text-primary-400">
        {initialData ? 'Modifica Torneo' : 'Crea Nuovo Torneo'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nome Torneo*
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Descrizione
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Stato*
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'COMPLETED' | 'DRAFT')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
            >
              <option value="DRAFT">Bozza</option>
              <option value="ACTIVE">Attivo</option>
              <option value="COMPLETED">Completato</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="maxPlayers" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Numero massimo giocatori*
            </label>
            <input
              type="number"
              id="maxPlayers"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              min={4}
              max={100}
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Numero di giornate*
            </label>
            <input
              type="number"
              id="days"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              min={1}
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="matchesPerDay" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Partite per giornata*
            </label>
            <input
              type="number"
              id="matchesPerDay"
              value={matchesPerDay}
              onChange={(e) => setMatchesPerDay(parseInt(e.target.value))}
              min={1}
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Data inizio
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Data fine
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Seleziona Giocatori ({selectedPlayerIds.length}/{maxPlayers})
          </label>
          
          <div className="mb-2">
            <input
              type="text"
              placeholder="Cerca giocatori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md">
            {filteredPlayers.length === 0 ? (
              <p className="p-3 text-slate-500 dark:text-slate-400 text-sm">Nessun giocatore trovato</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredPlayers.map(player => (
                  <li key={player.id} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <input
                      type="checkbox"
                      id={`player-${player.id}`}
                      checked={selectedPlayerIds.includes(player.id)}
                      onChange={() => togglePlayerSelection(player.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                    />
                    <label
                      htmlFor={`player-${player.id}`}
                      className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
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
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        {player.skillLevel}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            {initialData ? 'Salva Modifiche' : 'Crea Torneo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentForm;