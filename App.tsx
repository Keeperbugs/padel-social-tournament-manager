import React, { useState, useEffect, useCallback } from 'react';
import { Player, Match, SkillLevel, PairingStrategy, MatchFormat, AppSettings, TabKey, Team, MatchSetScore, SETTINGS_ID } from './types';
import { DEFAULT_SETTINGS, TAB_NAMES, MIN_PLAYERS_FOR_TOURNAMENT, MAX_PLAYERS } from './constants';
import PlayerForm from './components/PlayerForm';
import PairingsGenerator from './components/PairingsGenerator';
import ResultsInputModal from './components/ResultsInputModal';
import RankingsTable from './components/RankingsTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    supabase, 
    getSettingsDB, updateSettingsDB, 
    getPlayersDB, addPlayerDB, updatePlayerDB, deletePlayerDB,
    getMatchesDB, addMatchesDB, updateMatchDB, deleteMatchesByStatusDB,
    deleteAllMatchesDB, deleteAllPlayersDB
} from './lib/supabaseClient'; // Assicurati che il percorso sia corretto

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentTab, setCurrentTab] = useState<TabKey>('players');
  
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showPlayerForm, setShowPlayerForm] = useState<boolean>(false);
  
  const [matchForResults, setMatchForResults] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  // Caricamento dati iniziali da Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      if (!supabase) {
        console.warn("Supabase client non disponibile. L'app funzionerà in modalità offline con dati non persistenti.");
        setIsLoading(false);
        // Fornire valori di default o vuoti se supabase non è disponibile
        setSettings(DEFAULT_SETTINGS);
        setPlayers([]);
        setMatches([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedSettings, fetchedPlayers, fetchedMatches] = await Promise.all([
          getSettingsDB(),
          getPlayersDB(),
          getMatchesDB()
        ]);
        
        setSettings(fetchedSettings || DEFAULT_SETTINGS);
        setPlayers(fetchedPlayers || []);
        setMatches(fetchedMatches || []);

      } catch (err) {
        console.error("Errore durante il caricamento dei dati iniziali:", err);
        setError("Impossibile caricare i dati dal server.");
        // Fallback a valori di default in caso di errore critico di rete/server
        setSettings(DEFAULT_SETTINGS);
        setPlayers([]);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleSettingChange = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (supabase) {
        await updateSettingsDB(newSettings);
    }
  };

  const addPlayer = async (playerData: Omit<Player, 'id' | 'matchesPlayed' | 'matchesWon' | 'setsWon' | 'setsLost' | 'gamesWon' | 'gamesLost' | 'points' | 'created_at'>) => {
    if (players.length >= MAX_PLAYERS) {
        alert(`Limite massimo di ${MAX_PLAYERS} giocatori raggiunto.`);
        return;
    }
    const newPlayer: Player = {
      ...playerData,
      id: crypto.randomUUID(), // Genera UUID per il nuovo giocatore
      matchesPlayed: 0,
      matchesWon: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0,
      points: 0,
      // created_at sarà gestito da Supabase
    };
    if (supabase) {
        const addedPlayer = await addPlayerDB(newPlayer);
        if (addedPlayer) setPlayers(prev => [...prev, addedPlayer]);
    } else {
        setPlayers(prev => [...prev, newPlayer]); // Modalità offline
    }
    setShowPlayerForm(false);
  };

  const updatePlayer = async (playerToUpdate: Player) => {
    if (supabase) {
        const updatedPlayerResult = await updatePlayerDB(playerToUpdate);
        if (updatedPlayerResult) {
            setPlayers(prev => prev.map(p => p.id === updatedPlayerResult.id ? updatedPlayerResult : p));
        }
    } else {
        setPlayers(prev => prev.map(p => p.id === playerToUpdate.id ? playerToUpdate : p)); // Modalità offline
    }
    setEditingPlayer(null);
    setShowPlayerForm(false);
  };
  
  const handlePlayerFormSubmit = (playerData: Omit<Player, 'id' | 'matchesPlayed' | 'matchesWon' | 'setsWon' | 'setsLost' | 'gamesWon' | 'gamesLost' | 'points' | 'created_at'>) => {
    if (editingPlayer) {
        updatePlayer({ ...editingPlayer, ...playerData });
    } else {
        addPlayer(playerData);
    }
  };

  const deletePlayer = async (playerId: string) => {
    if (matches.some(m => (m.team1.player1.id === playerId || m.team1.player2.id === playerId || m.team2.player1.id === playerId || m.team2.player2.id === playerId) && m.status !== 'COMPLETED')) {
        alert("Impossibile eliminare un giocatore coinvolto in partite non completate.");
        return;
    }
    if (window.confirm("Sei sicuro di voler eliminare questo giocatore? Verrà rimosso anche da eventuali partite completate e le classifiche potrebbero cambiare.")) {
        if (supabase) {
            await deletePlayerDB(playerId);
        }
        setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  const updatePlayerSkillLevel = async (playerId: string, skillLevel: SkillLevel) => {
    const playerToUpdate = players.find(p => p.id === playerId);
    if (playerToUpdate) {
        await updatePlayer({ ...playerToUpdate, skillLevel });
    }
  };

  const generateMatches = useCallback(async () => {
    if (players.length < MIN_PLAYERS_FOR_TOURNAMENT) {
      alert(`Servono almeno ${MIN_PLAYERS_FOR_TOURNAMENT} giocatori per generare gli incontri.`);
      return;
    }
    if (matches.some(m => m.status !== 'COMPLETED')) {
        alert("Completa o cancella tutti gli incontri del round corrente prima di generarne di nuovi.");
        return;
    }

    let availablePlayers = [...players.filter(p => p.skillLevel !== SkillLevel.UNASSIGNED)];
    if (availablePlayers.length < MIN_PLAYERS_FOR_TOURNAMENT) {
        alert("Assicurati che almeno 4 giocatori abbiano una fascia di abilità assegnata.");
        return;
    }
    
    let fasciaA = availablePlayers.filter(p => p.skillLevel === SkillLevel.A);
    let fasciaB = availablePlayers.filter(p => p.skillLevel === SkillLevel.B);

    fasciaA.sort(() => 0.5 - Math.random());
    fasciaB.sort(() => 0.5 - Math.random());
    
    const createdTeams: Team[] = [];
    
    switch (settings.pairingStrategy) {
      case PairingStrategy.BALANCED_AB:
        while (fasciaA.length > 0 && fasciaB.length > 0) {
          createdTeams.push({ id: `t-${crypto.randomUUID()}`, player1: fasciaA.pop()!, player2: fasciaB.pop()! });
        }
        break;
      case PairingStrategy.SKILL_A:
        while (fasciaA.length >= 2) {
          createdTeams.push({ id: `t-${crypto.randomUUID()}`, player1: fasciaA.pop()!, player2: fasciaA.pop()! });
        }
        break;
      case PairingStrategy.SKILL_B:
        while (fasciaB.length >= 2) {
          createdTeams.push({ id: `t-${crypto.randomUUID()}`, player1: fasciaB.pop()!, player2: fasciaB.pop()! });
        }
        break;
      case PairingStrategy.MIXED:
        let mixedPool = [...fasciaA, ...fasciaB];
        mixedPool.sort(() => 0.5 - Math.random());
        while (mixedPool.length >= 2) {
          createdTeams.push({ id: `t-${crypto.randomUUID()}`, player1: mixedPool.pop()!, player2: mixedPool.pop()! });
        }
        break;
    }

    if (createdTeams.length < 2) {
      alert("Non è stato possibile formare abbastanza squadre (almeno 2) con i giocatori e la strategia selezionati.");
      return;
    }

    createdTeams.sort(() => 0.5 - Math.random());
    const newMatchesArray: Match[] = [];
    for (let i = 0; i < createdTeams.length - 1; i += 2) {
      newMatchesArray.push({
        id: `m-${crypto.randomUUID()}`,
        round: settings.currentTournamentRound,
        team1: createdTeams[i],
        team2: createdTeams[i+1],
        scores: [],
        status: 'PENDING',
        matchFormat: settings.matchFormat,
      });
    }

    if (supabase) {
        await addMatchesDB(newMatchesArray); // Salva le nuove partite nel DB
    }
    setMatches(prev => [...prev.filter(m => m.status === 'COMPLETED'), ...newMatchesArray]); // Aggiungi nuove partite, mantenendo le completate
    
    const newRound = settings.currentTournamentRound + 1;
    const newSettings = { ...settings, currentTournamentRound: newRound };
    setSettings(newSettings);
    if (supabase) {
        await updateSettingsDB(newSettings);
    }

  }, [players, settings, matches, supabase]);


  const calculatePlayerStats = useCallback((): Player[] => {
    let updatedPlayersStats = players.map(p => ({
        ...p,
        matchesPlayed: 0,
        matchesWon: 0,
        setsWon: 0,
        setsLost: 0,
        points: 0
    }));

    matches.filter(m => m.status === 'COMPLETED' && m.winnerTeamId).forEach(match => {
        const team1PlayerIds = [match.team1.player1.id, match.team1.player2.id];
        const team2PlayerIds = [match.team2.player1.id, match.team2.player2.id];
        const allPlayerIdsInMatch = [...team1PlayerIds, ...team2PlayerIds];

        let team1SetsWon = 0;
        let team2SetsWon = 0;

        if (match.matchFormat === MatchFormat.GOLDEN_POINT) {
            if (match.winnerTeamId === match.team1.id) team1SetsWon = 1;
            if (match.winnerTeamId === match.team2.id) team2SetsWon = 1;
        } else {
            match.scores.forEach(set => {
                const t1s = Number(set.team1Score);
                const t2s = Number(set.team2Score);
                if (!isNaN(t1s) && !isNaN(t2s)) {
                    if (t1s > t2s) team1SetsWon++;
                    else if (t2s > t1s) team2SetsWon++;
                }
            });
        }
        
        updatedPlayersStats = updatedPlayersStats.map(p => {
            if (allPlayerIdsInMatch.includes(p.id)) {
                p.matchesPlayed += 1;
                let playerIsOnWinningTeam = false;
                let playerTeamSetsWon = 0;
                let opponentTeamSetsWon = 0;

                if (match.winnerTeamId === match.team1.id && team1PlayerIds.includes(p.id)) {
                    playerIsOnWinningTeam = true;
                    playerTeamSetsWon = team1SetsWon;
                    opponentTeamSetsWon = team2SetsWon;
                } else if (match.winnerTeamId === match.team2.id && team2PlayerIds.includes(p.id)) {
                    playerIsOnWinningTeam = true;
                    playerTeamSetsWon = team2SetsWon;
                    opponentTeamSetsWon = team1SetsWon;
                } else if (team1PlayerIds.includes(p.id)) { // Giocatore in squadra 1 perdente
                    playerTeamSetsWon = team1SetsWon;
                    opponentTeamSetsWon = team2SetsWon;
                } else if (team2PlayerIds.includes(p.id)) { // Giocatore in squadra 2 perdente
                    playerTeamSetsWon = team2SetsWon;
                    opponentTeamSetsWon = team1SetsWon;
                }

                p.setsWon += playerTeamSetsWon;
                p.setsLost += opponentTeamSetsWon;

                if (playerIsOnWinningTeam) {
                    p.matchesWon += 1;
                    p.points += settings.pointsWin;
                } else { // Giocatore in squadra perdente
                    if (match.matchFormat === MatchFormat.BEST_OF_THREE) {
                        // Ha perso ma ha vinto un set (match 1-2 o 2-1 per l'avversario)
                        if (playerTeamSetsWon === 1 && opponentTeamSetsWon === 2) {
                             p.points += settings.pointsTieBreakLoss;
                        } else {
                             p.points += settings.pointsLoss;
                        }
                    } else { // Golden point loss or other losses
                         p.points += settings.pointsLoss;
                    }
                }
            }
            return p;
        });
    });
    return updatedPlayersStats;
  }, [matches, players, settings.pointsWin, settings.pointsTieBreakLoss, settings.pointsLoss, settings.matchFormat]);


  useEffect(() => {
      // Questo effetto ricalcola le statistiche quando cambiano le dipendenze.
      // Non aggiorna lo stato `players` direttamente qui per evitare loop,
      // La tabella RankingsTable userà `calculatePlayerStats()` per ottenere i dati freschi.
      // O, se fosse necessario persistere le stats calcolate, si potrebbe fare in `saveMatchResults`.
      // Per ora, le stats sono derivate al momento della visualizzazione.
  }, [matches, settings.pointsWin, settings.pointsTieBreakLoss, settings.pointsLoss, calculatePlayerStats]);


  const saveMatchResults = async (matchId: string, scores: MatchSetScore[], winnerTeamId?: string) => {
    const matchToUpdate = matches.find(m => m.id === matchId);
    if (matchToUpdate) {
        const updatedMatchData: Match = { 
            ...matchToUpdate, 
            scores, 
            winnerTeamId, 
            status: winnerTeamId ? 'COMPLETED' : 'IN_PROGRESS' 
        };
        if (supabase) {
            const savedMatch = await updateMatchDB(updatedMatchData);
            if (savedMatch) {
                setMatches(prevMatches => prevMatches.map(m => m.id === matchId ? savedMatch : m));
            }
        } else {
             setMatches(prevMatches => prevMatches.map(m => m.id === matchId ? updatedMatchData : m));
        }
    }
    setMatchForResults(null);
    // Dopo aver salvato i risultati, potremmo voler aggiornare le statistiche persistenti dei giocatori
    // Questo è un buon punto se si decide di salvare le stats calcolate nel DB dei giocatori.
    // Per ora, le statistiche sono calcolate dinamicamente.
  };
  
  const resetTournament = async () => {
    if(window.confirm("Sei sicuro di voler resettare l'intero torneo? Tutti i giocatori, partite e classifiche verranno cancellati.")) {
        if (supabase) {
            await deleteAllPlayersDB();
            await deleteAllMatchesDB();
            await updateSettingsDB(DEFAULT_SETTINGS);
        }
        setPlayers([]);
        setMatches([]);
        setSettings(DEFAULT_SETTINGS);
        setCurrentTab('players');
    }
  };

  const rankedPlayersForChart = calculatePlayerStats()
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
    .map(p => ({ name: p.nickname || `${p.name} ${p.surname.charAt(0)}.`, Punti: p.points }));

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Caricamento dati torneo...</div>;
  }
  if (error && !supabase) { // Mostra errore solo se Supabase era atteso ma non disponibile/configurato
     return <div className="min-h-screen flex flex-col items-center justify-center text-xl text-red-500 p-4">
         <p>{error}</p>
         <p>Assicurati che SUPABASE_URL e SUPABASE_ANON_KEY siano configurate correttamente.</p>
         <p>L'app non può funzionare senza la configurazione del database.</p>
         </div>;
  }
   if (error) {
     return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">{error}</div>;
   }


  return (
    <div className={`min-h-screen pb-10 ${settings.darkMode ? 'dark' : ''}`}>
      <header className="bg-primary-600 dark:bg-primary-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Padel Social Tournament</h1>
          <div className="flex items-center space-x-4">
            <button onClick={() => handleSettingChange('darkMode', !settings.darkMode)} className="p-2 rounded-full hover:bg-primary-700 dark:hover:bg-primary-900">
              {settings.darkMode ? 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                 : 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
              }
            </button>
             <button onClick={resetTournament} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 shadow-sm">
                Reset Torneo
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

      <main className="container mx-auto p-4" role="tabpanel" aria-labelledby={`tab-${currentTab}`}>
        { currentTab === 'players' && (
          <div className="space-y-6">
            {!showPlayerForm && (
                 <button 
                    onClick={() => { setEditingPlayer(null); setShowPlayerForm(true); }} 
                    className="mb-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-sm"
                    aria-label="Aggiungi Nuovo Giocatore"
                >
                    + Aggiungi Giocatore
                </button>
            )}
            {showPlayerForm && (
                <PlayerForm 
                    onSubmit={handlePlayerFormSubmit} 
                    initialData={editingPlayer}
                    onCancel={() => { setShowPlayerForm(false); setEditingPlayer(null); }}
                />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map(player => (
                <div key={player.id} className="p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg space-y-2" role="listitem">
                  <h4 className="text-md font-semibold text-primary-700 dark:text-primary-400">
                    {player.nickname ? `${player.nickname} (${player.name} ${player.surname})` : `${player.name} ${player.surname}`}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Contatto: {player.contact || 'N/D'}</p>
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`skill-${player.id}`} className="text-sm">Fascia:</label>
                    <select 
                        id={`skill-${player.id}`}
                        value={player.skillLevel} 
                        onChange={(e) => updatePlayerSkillLevel(player.id, e.target.value as SkillLevel)}
                        className="pl-2 pr-8 py-1 text-sm border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                        {Object.values(SkillLevel).map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button onClick={() => { setEditingPlayer(player); setShowPlayerForm(true);}} className="text-xs px-2 py-1 bg-secondary-500 text-white rounded hover:bg-secondary-600">Modifica</button>
                    <button onClick={() => deletePlayer(player.id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Elimina</button>
                  </div>
                </div>
              ))}
            </div>
            {players.length === 0 && !showPlayerForm && <p className="text-slate-500 dark:text-slate-400">Nessun giocatore inserito. Clicca su "Aggiungi Giocatore" per iniziare.</p>}
          </div>
        )}
        { currentTab === 'matches' && (
           <div className="space-y-6">
            <PairingsGenerator 
              settings={settings}
              onSettingsChange={handleSettingChange}
              onGenerateMatches={generateMatches}
              playerCount={players.length}
              disabled={matches.some(m => m.status !== 'COMPLETED')}
            />
            {matches.filter(m => m.status !== 'COMPLETED').length > 0 && (
                <button 
                    onClick={async () => { 
                        if(window.confirm("Sei sicuro di voler cancellare tutti gli incontri non completati del round corrente?")) {
                            if (supabase) {
                                await deleteMatchesByStatusDB('COMPLETED');
                            }
                            setMatches(prev => prev.filter(m => m.status === 'COMPLETED'));
                        }
                    }}
                    className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 shadow-sm"
                >
                    Cancella Incontri Pendenti
                </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map(match => (
                <div key={match.id} className={`p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg space-y-2 ${match.status === 'COMPLETED' ? 'opacity-70' : ''}`} role="listitem">
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
                           { (s.team1Score === 'GP' || s.team2Score === 'GP') ? 
                             (s.team1Score === 'GP' ? `${match.team1.player1.name.charAt(0)}.${match.team1.player2.name.charAt(0)} vince GP` : `${match.team2.player1.name.charAt(0)}.${match.team2.player2.name.charAt(0)} vince GP`) 
                             : `${s.team1Score}-${s.team2Score}` }
                        </span>
                    ))}
                  </div>
                  {match.status === 'COMPLETED' ? (
                     <p className="text-sm font-medium text-green-600 dark:text-green-400">Completato</p>
                  ) : (
                    <button onClick={() => setMatchForResults(match)} className="mt-2 px-3 py-1.5 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700">
                      Inserisci Risultato
                    </button>
                  )}
                </div>
              ))}
            </div>
            {matches.length === 0 && <p className="text-slate-500 dark:text-slate-400">Nessun incontro generato. Vai su "Genera Incontri".</p>}
          </div>
        )}
        { currentTab === 'rankings' && (
            <div className="space-y-6">
                <RankingsTable players={calculatePlayerStats()} />
                {players.length > 0 && rankedPlayersForChart.length > 0 && (
                    <div className="p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg">
                        <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400 mb-4">Top 10 Giocatori (per Punti)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={rankedPlayersForChart} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                            <XAxis dataKey="name" className="text-xs fill-slate-600 dark:fill-slate-400" />
                            <YAxis allowDecimals={false} className="text-xs fill-slate-600 dark:fill-slate-400" />
                            <Tooltip 
                                wrapperClassName="!bg-white dark:!bg-slate-700 !border-slate-300 dark:!border-slate-600 !rounded-md shadow-lg"
                                contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                                labelStyle={{ color: settings.darkMode ? '#cbd5e1' : '#334155', fontWeight: 'bold' }}
                                itemStyle={{ color: settings.darkMode ? '#94a3b8' : '#475569' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.875rem', color: settings.darkMode ? '#e2e8f0' : '#1e293b' }}/>
                            <Bar dataKey="Punti" className="fill-primary-500 dark:fill-primary-600" radius={[4, 4, 0, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
                 {players.length > 0 && rankedPlayersForChart.length === 0 && (
                     <p className="text-slate-500 dark:text-slate-400">Nessun dato sufficiente per il grafico dei Top 10 (es. nessun punto assegnato).</p>
                 )}
                 {players.length === 0 && (
                      <p className="text-slate-500 dark:text-slate-400">Nessun giocatore presente per visualizzare le classifiche.</p>
                 )}
            </div>
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

export default App;