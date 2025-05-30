import React, { useState } from 'react';
import { TabKey } from './types';
import { TAB_NAMES } from './constants';
import { TournamentProvider, useTournament } from './contexts/TournamentContext.tsx';
import TournamentList from './components/TournamentList';
import TournamentForm from './components/TournamentForm.tsx';
import PlayerForm from './components/PlayerForm';
import PairingsGenerator from './components/PairingsGenerator';
import ResultsInputModal from './components/ResultsInputModal';
import RankingsTab from './components/RankingsTab';
import PlayerSelector from './components/PlayerSelector';
import PlayersManagementPage from './components/PlayersManagementPage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AppContent: React.FC = () => {
  const {
    settings,
    tournaments,
    currentTournament,
    players,
    matches,
    tournamentPlayerStats,
    overallPlayerStats,
    isLoading,
    error,
    fetchTournaments,
    selectTournament,
    createTournament,
    updateTournament,
    deleteTournament,
    fetchPlayers,
    generateMatches,
    saveMatchResults,
    deleteUncompletedMatches,
    calculatePlayerStats,
    updateSettings
  } = useTournament();

  const [currentTab, setCurrentTab] = useState<TabKey>('tournaments');
  const [showTournamentForm, setShowTournamentForm] = useState<boolean>(false);
  const [editingTournament, setEditingTournament] = useState<any>(null);
  
  const [showPlayerForm, setShowPlayerForm] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  
  const [matchForResults, setMatchForResults] = useState<any>(null);

  // Funzioni per gestire i tornei
  const handleCreateTournament = () => {
    setEditingTournament(null);
    setShowTournamentForm(true);
  };

  const handleEditTournament = (tournament: any) => {
    setEditingTournament(tournament);
    setShowTournamentForm(true);
  };

  const handleTournamentFormSubmit = (tournamentData: any) => {
    if (editingTournament) {
      updateTournament({ ...editingTournament, ...tournamentData });
    } else {
      createTournament(tournamentData);
    }
    setShowTournamentForm(false);
  };

  const handleTournamentFormCancel = () => {
    setShowTournamentForm(false);
  };

  // Funzioni per gestire i giocatori
  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setShowPlayerForm(true);
  };

  const handleEditPlayer = (player: any) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handlePlayerFormSubmit = (playerData: any) => {
    // Queste funzioni dovrebbero essere implementate in TournamentContext
    // Se necessario, aggiungile al contesto
    if (editingPlayer) {
      // updatePlayer({ ...editingPlayer, ...playerData });
    } else {
      // addPlayer(playerData);
    }
    setShowPlayerForm(false);
  };

  const handlePlayerFormCancel = () => {
    setShowPlayerForm(false);
  };

  // Funzioni per generare le partite
  const handleGenerateMatches = () => {
    generateMatches(settings.pairingStrategy, settings.matchFormat);
  };

  const handleSettingChange = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    updateSettings(key, value);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Caricamento dati torneo...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">{error}</div>;
  }

  return (
    <div className={`min-h-screen pb-10 ${settings.darkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-900`}>
      <header className="bg-primary-600 dark:bg-primary-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Padel Social Tournament</h1>
          <div className="flex items-center space-x-4">
            {currentTournament && (
              <div className="hidden sm:block bg-primary-700 dark:bg-primary-900 px-3 py-1 rounded-md">
                <span className="text-sm text-primary-100">Torneo: </span>
                <span className="font-medium">{currentTournament.name}</span>
              </div>
            )}
            <button onClick={() => handleSettingChange('darkMode', !settings.darkMode)} className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-primary-900">
              {settings.darkMode ? 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                 : 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
              }
            </button>
          </div>
        </div>
      </header>
      
      <nav className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto flex">
          {(Object.keys(TAB_NAMES) as TabKey[]).map(tab => (
            <button 
              key={tab} 
              onClick={() => setCurrentTab(tab)}
              className={`px-4 py-3 text-sm font-medium 
                          ${currentTab === tab 
                            ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              aria-current={currentTab === tab ? 'page' : undefined}
            >
              {TAB_NAMES[tab]}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto p-4">
        {currentTab === 'tournaments' && (
          <div className="space-y-6">
            {showTournamentForm ? (
              <TournamentForm 
                onSubmit={handleTournamentFormSubmit}
                onCancel={handleTournamentFormCancel}
                initialData={editingTournament}
                availablePlayers={players}
              />
            ) : (
              <TournamentList 
                tournaments={tournaments}
                onSelectTournament={selectTournament}
                onEditTournament={handleEditTournament}
                onDeleteTournament={deleteTournament}
                onCreateTournament={handleCreateTournament}
                currentTournamentId={currentTournament?.id}
              />
            )}
          </div>
        )}

        {currentTab === 'players' && (
          <PlayersManagementPage
            onPlayerFormSubmit={(playerData) => {
              if (editingPlayer) {
                updatePlayer({ ...editingPlayer, ...playerData });
              } else {
                addPlayer(playerData);
              }
              setShowPlayerForm(false);
              setEditingPlayer(null);
            }}
            onPlayerUpdate={(player) => updatePlayer(player)}
            onPlayerDelete={(playerId) => deletePlayer(playerId)}
          />
        )}

        {currentTab === 'matches' && (
          <div className="space-y-6">
            {currentTournament ? (
              <>
                <PairingsGenerator 
                  settings={{
                    pairingStrategy: settings.pairingStrategy,
                    matchFormat: settings.matchFormat
                  }}
                  onSettingsChange={handleSettingChange}
                  onGenerateMatches={handleGenerateMatches}
                  playerCount={(currentTournament?.playerIds || []).length}
                  disabled={matches.some(m => m.status !== 'COMPLETED')}
                />
                
                {matches.filter(m => m.status !== 'COMPLETED').length > 0 && (
                  <button 
                    onClick={deleteUncompletedMatches}
                    className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 shadow-sm"
                  >
                    Cancella Incontri Pendenti
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.length === 0 ? (
                    <div className="col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
                      <p className="text-slate-500 dark:text-slate-400">
                        Nessun incontro generato. Vai su "Genera Incontri".
                      </p>
                    </div>
                  ) : (
                    matches.map(match => (
                      <div 
                        key={match.id} 
                        className={`p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg space-y-2 ${match.status === 'COMPLETED' ? 'opacity-70' : ''}`}
                      >
                        <h4 className="text-md font-semibold">Round {match.round} {match.court && `- Campo ${match.court}`}</h4>
                        <p className="text-sm">
                          <span className={`${match.winnerTeamId === match.team1.id ? 'font-bold text-green-600 dark:text-green-400' : ''}`}>
                            {match.team1.player1.nickname || match.team1.player1.name} / {match.team1.player2.nickname || match.team1.player2.name}
                          </span>
                          <span className="mx-1">vs</span> 
                          <span className={`${match.winnerTeamId === match.team2.id ? 'font-bold text-green-600 dark:text-green-400' : ''}`}>
                            {match.team2.player1.nickname || match.team2.player1.name} / {match.team2.player2.nickname || match.team2.player2.name}
                          </span>
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {match.scores.map((s, i) => (
                            <span key={i} className="mr-2">
                              {(s.team1Score === 'GP' || s.team2Score === 'GP') ? 
                                (s.team1Score === 'GP' ? `${match.team1.player1.name.charAt(0)}.${match.team1.player2.name.charAt(0)} vince GP` : `${match.team2.player1.name.charAt(0)}.${match.team2.player2.name.charAt(0)} vince GP`) 
                                : `${s.team1Score}-${s.team2Score}`}
                            </span>
                          ))}
                        </div>
                        {match.status === 'COMPLETED' ? (
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">Completato</p>
                        ) : (
                          <button 
                            onClick={() => setMatchForResults(match)} 
                            className="mt-2 px-3 py-1.5 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
                          >
                            Inserisci Risultato
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  Seleziona un torneo per gestire gli incontri.
                </p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'rankings' && (
          <RankingsTab 
            tournamentPlayerStats={tournamentPlayerStats}
            overallPlayerStats={overallPlayerStats}
            tournaments={tournaments}
            currentTournamentId={currentTournament?.id}
            darkMode={settings.darkMode}
          />
        )}
      </main>

      {matchForResults && (
        <ResultsInputModal
          match={matchForResults}
          isOpen={!!matchForResults}
          onClose={() => setMatchForResults(null)}
          onSaveResults={saveMatchResults}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
};

export default App;