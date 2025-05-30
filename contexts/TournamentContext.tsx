import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Tournament, 
  Player, 
  Match, 
  PlayerStats, 
  MatchSetScore, 
  AppSettings,
  PairingStrategy, 
  MatchFormat 
} from '../types';
import { 
  getTournamentsDB,
  getTournamentByIdDB,
  addTournamentDB,
  updateTournamentDB,
  deleteTournamentDB,
  getPlayersDB,
  getMatchesByTournamentDB,
  addMatchesDB,
  updateMatchDB,
  deleteMatchesByTournamentAndStatusDB,
  deleteAllMatchesByTournamentDB,
  getPlayerStatsByTournamentDB,
  getOverallPlayerStatsDB,
  updatePlayerStatsBulkDB,
  getSettingsDB,
  updateSettingsDB,
  addPlayerDB,
  updatePlayerDB,
  deletePlayerDB,
  searchPlayersDB
} from '../lib/supabaseClient';
import { DEFAULT_SETTINGS } from '../constants';

interface TournamentContextType {
  // Dati
  settings: AppSettings;
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  players: Player[];
  matches: Match[];
  tournamentPlayerStats: PlayerStats[];
  overallPlayerStats: PlayerStats[];
  createManualMatch: (team1: Team, team2: Team, matchFormat: MatchFormat, court?: string) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  updateMatch: (match: Match) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Azioni per i tornei
  fetchTournaments: () => Promise<void>;
  selectTournament: (tournamentId: string) => Promise<void>;
  createTournament: (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTournament: (tournament: Tournament) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  
  // Azioni per i giocatori
  fetchPlayers: () => Promise<void>;
  addPlayer: (player: Omit<Player, 'id' | 'matchesPlayed' | 'matchesWon' | 'setsWon' | 'setsLost' | 'gamesWon' | 'gamesLost' | 'points'>) => Promise<void>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  getPlayerTournament: (playerId: string) => Tournament | null;
  getPlayerTournaments: (playerId: string) => Tournament[]; // Nuova funzione
  searchPlayers: (searchTerm: string) => Promise<Player[]>;
  
  // Azioni per le partite
  generateMatches: (
    pairingStrategy: PairingStrategy,
    matchFormat: MatchFormat
  ) => Promise<void>;
  saveMatchResults: (matchId: string, scores: MatchSetScore[], winnerTeamId?: string) => Promise<void>;
  deleteUncompletedMatches: () => Promise<void>;
  
  // Azioni per le statistiche
  calculatePlayerStats: () => Promise<void>;
  
  // Azioni per le impostazioni
  updateSettings: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentPlayerStats, setTournamentPlayerStats] = useState<PlayerStats[]>([]);
  const [overallPlayerStats, setOverallPlayerStats] = useState<PlayerStats[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carica i dati all'avvio
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Carica le impostazioni
        const fetchedSettings = await getSettingsDB();
        if (fetchedSettings) {
          setSettings(fetchedSettings);
          
          // Se c'è un torneo corrente nelle impostazioni, caricalo
          if (fetchedSettings.currentTournamentId) {
            const tournament = await getTournamentByIdDB(fetchedSettings.currentTournamentId);
            if (tournament) {
              setCurrentTournament(tournament);
              
              // Carica le partite e le statistiche del torneo corrente
              const tournamentMatches = await getMatchesByTournamentDB(tournament.id);
              setMatches(tournamentMatches);
              
              const playerStats = await getPlayerStatsByTournamentDB(tournament.id);
              setTournamentPlayerStats(playerStats);
            }
          }
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        
        // Carica i tornei
        const fetchedTournaments = await getTournamentsDB();
        setTournaments(fetchedTournaments);
        
        // Carica i giocatori
        const fetchedPlayers = await getPlayersDB();
        setPlayers(fetchedPlayers);
        
        // Carica le statistiche generali
        const fetchedOverallStats = await getOverallPlayerStatsDB();
        setOverallPlayerStats(fetchedOverallStats);
        
      } catch (err) {
        console.error("Errore durante il caricamento dei dati iniziali:", err);
        setError("Impossibile caricare i dati. Verifica la connessione al database.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const fetchedTournaments = await getTournamentsDB();
      setTournaments(fetchedTournaments);
    } catch (err) {
      console.error("Errore durante il caricamento dei tornei:", err);
      setError("Impossibile caricare i tornei.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectTournament = async (tournamentId: string) => {
    setIsLoading(true);
    try {
      // Aggiorna le impostazioni per salvare il torneo corrente
      const updatedSettings = { ...settings, currentTournamentId: tournamentId };
      await updateSettingsDB(updatedSettings);
      setSettings(updatedSettings);
      
      // Carica il torneo
      const tournament = await getTournamentByIdDB(tournamentId);
      if (tournament) {
        setCurrentTournament(tournament);
        
        // Carica le partite del torneo
        const tournamentMatches = await getMatchesByTournamentDB(tournament.id);
        setMatches(tournamentMatches);
        
        // Carica le statistiche dei giocatori per questo torneo
        const playerStats = await getPlayerStatsByTournamentDB(tournament.id);
        setTournamentPlayerStats(playerStats);
      }
    } catch (err) {
      console.error("Errore durante la selezione del torneo:", err);
      setError("Impossibile selezionare il torneo.");
    } finally {
      setIsLoading(false);
    }
  };

  const createTournament = async (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const newTournament = await addTournamentDB(tournament);
      if (newTournament) {
        setTournaments([...tournaments, newTournament]);
        
        // Seleziona automaticamente il nuovo torneo
        await selectTournament(newTournament.id);
      }
    } catch (err) {
      console.error("Errore durante la creazione del torneo:", err);
      setError("Impossibile creare il torneo.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTournament = async (tournament: Tournament) => {
    setIsLoading(true);
    try {
      const updatedTournament = await updateTournamentDB(tournament);
      if (updatedTournament) {
        // Aggiorna la lista dei tornei
        setTournaments(tournaments.map(t => t.id === tournament.id ? updatedTournament : t));
        
        // Aggiorna il torneo corrente se necessario
        if (currentTournament && currentTournament.id === tournament.id) {
          setCurrentTournament(updatedTournament);
        }
      }
    } catch (err) {
      console.error("Errore durante l'aggiornamento del torneo:", err);
      setError("Impossibile aggiornare il torneo.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTournament = async (tournamentId: string) => {
    setIsLoading(true);
    try {
      const success = await deleteTournamentDB(tournamentId);
      if (success) {
        // Rimuovi il torneo dalla lista
        setTournaments(tournaments.filter(t => t.id !== tournamentId));
        
        // Se era il torneo corrente, deselezionalo
        if (currentTournament && currentTournament.id === tournamentId) {
          setCurrentTournament(null);
          setMatches([]);
          setTournamentPlayerStats([]);
          
          // Aggiorna le impostazioni
          const updatedSettings = { ...settings, currentTournamentId: undefined };
          await updateSettingsDB(updatedSettings);
          setSettings(updatedSettings);
        }
        
        // Ricarica le statistiche generali
        const fetchedOverallStats = await getOverallPlayerStatsDB();
        setOverallPlayerStats(fetchedOverallStats);
      }
    } catch (err) {
      console.error("Errore durante l'eliminazione del torneo:", err);
      setError("Impossibile eliminare il torneo.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const fetchedPlayers = await getPlayersDB();
      setPlayers(fetchedPlayers);
    } catch (err) {
      console.error("Errore durante il caricamento dei giocatori:", err);
      setError("Impossibile caricare i giocatori.");
    } finally {
      setIsLoading(false);
    }
  };

  const addPlayer = async (playerData: Omit<Player, 'id' | 'matchesPlayed' | 'matchesWon' | 'setsWon' | 'setsLost' | 'gamesWon' | 'gamesLost' | 'points'>) => {
    setIsLoading(true);
    try {
      const newPlayer = await addPlayerDB(playerData);
      if (newPlayer) {
        setPlayers([...players, newPlayer]);
        
        // Ricarica le statistiche generali
        const fetchedOverallStats = await getOverallPlayerStatsDB();
        setOverallPlayerStats(fetchedOverallStats);
      }
    } catch (err) {
      console.error("Errore durante l'aggiunta del giocatore:", err);
      setError("Impossibile aggiungere il giocatore.");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlayer = async (player: Player) => {
    setIsLoading(true);
    try {
      const updatedPlayer = await updatePlayerDB(player);
      if (updatedPlayer) {
        setPlayers(players.map(p => p.id === player.id ? updatedPlayer : p));
        
        // Aggiorna anche le statistiche se necessario
        if (currentTournament && currentTournament.playerIds?.includes(player.id)) {
          setTournamentPlayerStats(tournamentPlayerStats.map(p => 
            p.id === player.id ? { ...p, ...updatedPlayer } : p
          ));
        }
        
        setOverallPlayerStats(overallPlayerStats.map(p => 
          p.id === player.id ? { ...p, ...updatedPlayer } : p
        ));
      }
    } catch (err) {
      console.error("Errore durante l'aggiornamento del giocatore:", err);
      setError("Impossibile aggiornare il giocatore.");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlayer = async (playerId: string) => {
    setIsLoading(true);
    try {
      const success = await deletePlayerDB(playerId);
      if (success) {
        setPlayers(players.filter(p => p.id !== playerId));
        
        // Rimuovi dalle statistiche
        setTournamentPlayerStats(tournamentPlayerStats.filter(p => p.id !== playerId));
        setOverallPlayerStats(overallPlayerStats.filter(p => p.id !== playerId));
        
        // Rimuovi dai tornei se presente
        if (currentTournament && currentTournament.playerIds?.includes(playerId)) {
          const updatedTournament = {
            ...currentTournament,
            playerIds: currentTournament.playerIds.filter(id => id !== playerId)
          };
          await updateTournament(updatedTournament);
        }
        
        // Aggiorna anche tutti gli altri tornei
        const updatedTournaments = tournaments.map(tournament => {
          if (tournament.playerIds?.includes(playerId)) {
            return {
              ...tournament,
              playerIds: tournament.playerIds.filter(id => id !== playerId)
            };
          }
          return tournament;
        });
        setTournaments(updatedTournaments);
      }
    } catch (err) {
      console.error("Errore durante l'eliminazione del giocatore:", err);
      setError("Impossibile eliminare il giocatore.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayerTournament = (playerId: string): Tournament | null => {
    // Cerca prima nel torneo corrente se esiste
    if (currentTournament && currentTournament.playerIds?.includes(playerId)) {
      return currentTournament;
    }
    
    // Poi cerca negli altri tornei
    const playerTournament = tournaments.find(tournament => 
      tournament.playerIds?.includes(playerId)
    );
    
    return playerTournament || null;
  };

  const getPlayerTournaments = (playerId: string): Tournament[] => {
    return tournaments.filter(tournament => 
      tournament.playerIds?.includes(playerId)
    );
  };

  const generateMatches = async (pairingStrategy: PairingStrategy, matchFormat: MatchFormat) => {
    if (!currentTournament) {
      setError("Nessun torneo selezionato.");
      return;
    }
    
    setIsLoading(true);
    try {
      // Verifica che non ci siano partite in corso
      if (matches.some(m => m.status !== 'COMPLETED')) {
        setError("Completa o cancella tutti gli incontri del round corrente prima di generarne di nuovi.");
        return;
      }
      
      // Ottieni i giocatori del torneo
      const tournamentPlayerIds = currentTournament.playerIds || [];
      if (tournamentPlayerIds.length < 4) {
        setError("Servono almeno 4 giocatori per generare gli incontri.");
        return;
      }
      
      const tournamentPlayers = players.filter(p => tournamentPlayerIds.includes(p.id));
      
      // Dividi i giocatori per fascia
      let fasciaA = tournamentPlayers.filter(p => p.skillLevel === 'Fascia A (Alto)');
      let fasciaB = tournamentPlayers.filter(p => p.skillLevel === 'Fascia B (Medio/Basso)');
      
      // Mescola i giocatori
      fasciaA.sort(() => 0.5 - Math.random());
      fasciaB.sort(() => 0.5 - Math.random());
      
      // Crea le squadre in base alla strategia di abbinamento
      const createdTeams: { id: string; player1: Player; player2: Player }[] = [];
      
      switch (pairingStrategy) {
        case PairingStrategy.BALANCED_AB:
          while (fasciaA.length > 0 && fasciaB.length > 0) {
            createdTeams.push({ 
              id: `t-${crypto.randomUUID()}`, 
              player1: fasciaA.pop()!, 
              player2: fasciaB.pop()! 
            });
          }
          break;
        case PairingStrategy.SKILL_A:
          while (fasciaA.length >= 2) {
            createdTeams.push({ 
              id: `t-${crypto.randomUUID()}`, 
              player1: fasciaA.pop()!, 
              player2: fasciaA.pop()! 
            });
          }
          break;
        case PairingStrategy.SKILL_B:
          while (fasciaB.length >= 2) {
            createdTeams.push({ 
              id: `t-${crypto.randomUUID()}`, 
              player1: fasciaB.pop()!, 
              player2: fasciaB.pop()! 
            });
          }
          break;
        case PairingStrategy.MIXED:
          let mixedPool = [...fasciaA, ...fasciaB];
          mixedPool.sort(() => 0.5 - Math.random());
          while (mixedPool.length >= 2) {
            createdTeams.push({ 
              id: `t-${crypto.randomUUID()}`, 
              player1: mixedPool.pop()!, 
              player2: mixedPool.pop()! 
            });
          }
          break;
      }
      
      // Verifica che ci siano abbastanza squadre
      if (createdTeams.length < 2) {
        setError("Non è stato possibile formare abbastanza squadre (almeno 2) con i giocatori e la strategia selezionati.");
        return;
      }
      
      // Mescola le squadre
      createdTeams.sort(() => 0.5 - Math.random());
      
      // Crea le partite
      const newMatches: Match[] = [];
      for (let i = 0; i < createdTeams.length - 1; i += 2) {
        newMatches.push({
          id: crypto.randomUUID(),
          tournamentId: currentTournament.id,
          round: currentTournament.currentRound,
          team1: createdTeams[i],
          team2: createdTeams[i+1],
          scores: [],
          status: 'PENDING',
          matchFormat: matchFormat
        });
      }
      
      // Salva le partite
      const savedMatches = await addMatchesDB(newMatches);
      
      // Aggiorna lo stato
      setMatches([...matches.filter(m => m.status === 'COMPLETED'), ...savedMatches]);
      
      // Incrementa il round corrente nel torneo
      const updatedTournament = { 
        ...currentTournament, 
        currentRound: currentTournament.currentRound + 1 
      };
      await updateTournament(updatedTournament);
      
    } catch (err) {
      console.error("Errore durante la generazione degli incontri:", err);
      setError("Impossibile generare gli incontri.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveMatchResults = async (matchId: string, scores: MatchSetScore[], winnerTeamId?: string) => {
    setIsLoading(true);
    try {
      const matchToUpdate = matches.find(m => m.id === matchId);
      if (!matchToUpdate) {
        setError("Partita non trovata.");
        return;
      }
      
      const updatedMatch: Match = {
        ...matchToUpdate,
        scores,
        winnerTeamId,
        status: winnerTeamId ? 'COMPLETED' : 'IN_PROGRESS'
      };
      
      const savedMatch = await updateMatchDB(updatedMatch);
      if (savedMatch) {
        // Aggiorna lo stato locale delle partite
        setMatches(matches.map(m => m.id === matchId ? savedMatch : m));
        
        // Se la partita è stata completata, aggiorna le statistiche
        if (savedMatch.status === 'COMPLETED' && savedMatch.winnerTeamId) {
          await calculatePlayerStats();
          
          // Notifica all'utente che le statistiche sono state aggiornate
          console.log("Risultati salvati e statistiche aggiornate.");
        }
      }
    } catch (err) {
      console.error("Errore durante il salvataggio dei risultati:", err);
      setError("Impossibile salvare i risultati.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUncompletedMatches = async () => {
    if (!currentTournament) {
      setError("Nessun torneo selezionato.");
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await deleteMatchesByTournamentAndStatusDB(currentTournament.id, 'COMPLETED');
      if (success) {
        // Aggiorna lo stato
        setMatches(matches.filter(m => m.status === 'COMPLETED'));
      }
    } catch (err) {
      console.error("Errore durante l'eliminazione delle partite non completate:", err);
      setError("Impossibile eliminare le partite non completate.");
    } finally {
      setIsLoading(false);
    }
  };

  const createManualMatch = async (team1: Team, team2: Team, matchFormat: MatchFormat, court?: string) => {
    if (!currentTournament) {
      setError("Nessun torneo selezionato.");
      return;
    }

    setIsLoading(true);
    try {
      // Crea una nuova partita
      const newMatch: Match = {
        id: crypto.randomUUID(),
        tournamentId: currentTournament.id,
        round: currentTournament.currentRound,
        team1,
        team2,
        scores: [],
        status: 'PENDING',
        matchFormat,
        court
      };
      
      // Salva la partita nel database
      const savedMatches = await addMatchesDB([newMatch]);
      
      if (savedMatches.length > 0) {
        // Aggiorna lo stato locale delle partite
        setMatches([...matches, ...savedMatches]);
      }
    } catch (err) {
      console.error("Errore durante la creazione manuale della partita:", err);
      setError("Impossibile creare la partita manualmente.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMatch = async (matchId: string) => {
    setIsLoading(true);
    try {
      // Prima cerchiamo la partita nel database locale
      const matchToDelete = matches.find(m => m.id === matchId);
      if (!matchToDelete) {
        setError("Partita non trovata.");
        return;
      }
      
      // Verifica se l'utente vuole davvero eliminare la partita
      if (!window.confirm("Sei sicuro di voler eliminare questa partita? Questa azione non può essere annullata.")) {
        setIsLoading(false);
        return;
      }
      
      // Elimina la partita nel database
      // Nota: devi creare questa funzione nel file supabaseClient.ts
      const success = await deleteMatchDB(matchId);
      
      if (success) {
        // Rimuovi la partita dallo stato locale
        setMatches(matches.filter(m => m.id !== matchId));
        
        // Se la partita era completata, ricalcola le statistiche
        if (matchToDelete.status === 'COMPLETED') {
          await calculatePlayerStats();
        }
      }
    } catch (err) {
      console.error("Errore durante l'eliminazione della partita:", err);
      setError("Impossibile eliminare la partita.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateMatch = async (match: Match) => {
    setIsLoading(true);
    try {
      // Aggiorna la partita nel database
      const updatedMatch = await updateMatchDB(match);
      
      if (updatedMatch) {
        // Aggiorna lo stato locale
        setMatches(matches.map(m => m.id === match.id ? updatedMatch : m));
        
        // Aggiorna le statistiche se la partita è stata completata
        if (match.status === 'COMPLETED') {
          await calculatePlayerStats();
        }
      }
    } catch (err) {
      console.error("Errore durante l'aggiornamento della partita:", err);
      setError("Impossibile aggiornare la partita.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePlayerStats = async () => {
    if (!currentTournament) {
      setError("Nessun torneo selezionato.");
      return;
    }
    
    setIsLoading(true);
    try {
      // Ottieni tutti i giocatori del torneo
      const tournamentPlayerIds = currentTournament.playerIds || [];
      const tournamentPlayers = players.filter(p => tournamentPlayerIds.includes(p.id));
      
      // Inizializza le statistiche
      const playerStatsMap = new Map<string, PlayerStats>();
      tournamentPlayers.forEach(player => {
        playerStatsMap.set(player.id, {
          ...player,
          tournamentId: currentTournament.id,
          matchesPlayed: 0,
          matchesWon: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          points: 0
        });
      });
      
      // Calcola le statistiche in base alle partite completate
      const completedMatches = matches.filter(m => m.status === 'COMPLETED' && m.winnerTeamId);
      
      completedMatches.forEach(match => {
        const team1PlayerIds = [match.team1.player1.id, match.team1.player2.id];
        const team2PlayerIds = [match.team2.player1.id, match.team2.player2.id];
        const allPlayerIds = [...team1PlayerIds, ...team2PlayerIds];
        
        let team1SetsWon = 0;
        let team2SetsWon = 0;
        let team1GamesWon = 0;
        let team2GamesWon = 0;
        
        if (match.matchFormat === MatchFormat.GOLDEN_POINT) {
          // Per il Golden Point, conta come un set vinto
          if (match.winnerTeamId === match.team1.id) {
            team1SetsWon = 1;
            team2SetsWon = 0;
          } else if (match.winnerTeamId === match.team2.id) {
            team1SetsWon = 0;
            team2SetsWon = 1;
          }
        } else {
          // Per il Best of Three, conta i set e i game
          match.scores.forEach(set => {
            // Controlla se i punteggi sono numeri validi
            const t1s = typeof set.team1Score === 'number' ? set.team1Score : -1;
            const t2s = typeof set.team2Score === 'number' ? set.team2Score : -1;
            
            // Se entrambi i punteggi sono validi
            if (t1s >= 0 && t2s >= 0) {
              // Conteggio dei set
              if (t1s > t2s) team1SetsWon++;
              else if (t2s > t1s) team2SetsWon++;
              
              // Conteggio dei game
              team1GamesWon += t1s;
              team2GamesWon += t2s;
            }
          });
        }
        
        // Aggiorna le statistiche per ogni giocatore coinvolto
        allPlayerIds.forEach(playerId => {
          if (!playerStatsMap.has(playerId)) return;
          
          const playerStats = playerStatsMap.get(playerId)!;
          playerStats.matchesPlayed += 1;
          
          // Determina se il giocatore era nella squadra vincente
          const isTeam1Player = team1PlayerIds.includes(playerId);
          const isWinner = isTeam1Player ? match.winnerTeamId === match.team1.id : match.winnerTeamId === match.team2.id;
          
          if (isWinner) {
            playerStats.matchesWon += 1;
            playerStats.points += settings.pointsWin;
          } else {
            // Determina se è stata una sconfitta al tie-break (1-2 nel Best of Three)
            if (match.matchFormat === MatchFormat.BEST_OF_THREE) {
              const teamSetsWon = isTeam1Player ? team1SetsWon : team2SetsWon;
              const teamSetsLost = isTeam1Player ? team2SetsWon : team1SetsWon;
              
              if (teamSetsWon === 1 && teamSetsLost === 2) {
                playerStats.points += settings.pointsTieBreakLoss;
              } else {
                playerStats.points += settings.pointsLoss;
              }
            } else {
              playerStats.points += settings.pointsLoss;
            }
          }
          
          // Aggiorna i set vinti e persi
          if (isTeam1Player) {
            playerStats.setsWon += team1SetsWon;
            playerStats.setsLost += team2SetsWon;
            playerStats.gamesWon += team1GamesWon;
            playerStats.gamesLost += team2GamesWon;
          } else {
            playerStats.setsWon += team2SetsWon;
            playerStats.setsLost += team1SetsWon;
            playerStats.gamesWon += team2GamesWon;
            playerStats.gamesLost += team1GamesWon;
          }
          
          playerStatsMap.set(playerId, playerStats);
        });
      });
      
      // Converti la mappa in un array
      const playerStats = Array.from(playerStatsMap.values());
      
      // Aggiorna anche le statistiche complessive dei giocatori
      const updatedPlayers = [...players];
      playerStats.forEach(stat => {
        const playerIndex = updatedPlayers.findIndex(p => p.id === stat.id);
        if (playerIndex >= 0) {
          const player = updatedPlayers[playerIndex];
          // Aggiorna le statistiche complessive
          updatedPlayers[playerIndex] = {
            ...player,
            matchesPlayed: stat.matchesPlayed,
            matchesWon: stat.matchesWon,
            setsWon: stat.setsWon,
            setsLost: stat.setsLost,
            gamesWon: stat.gamesWon,
            gamesLost: stat.gamesLost,
            points: stat.points
          };
        }
      });
      
      // Salva le statistiche nel database
      await updatePlayerStatsBulkDB(playerStats);
      
      // Aggiorna lo stato locale
      setTournamentPlayerStats(playerStats);
      setPlayers(updatedPlayers);
      
      // Ricarica le statistiche generali
      const fetchedOverallStats = await getOverallPlayerStatsDB();
      setOverallPlayerStats(fetchedOverallStats);
      
      console.log("Statistiche dei giocatori aggiornate con successo:", playerStats);
      
    } catch (err) {
      console.error("Errore durante il calcolo delle statistiche:", err);
      setError("Impossibile calcolare le statistiche.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      await updateSettingsDB(updatedSettings);
      setSettings(updatedSettings);
    } catch (err) {
      console.error("Errore durante l'aggiornamento delle impostazioni:", err);
      setError("Impossibile aggiornare le impostazioni.");
    }
  };

  return (
    <TournamentContext.Provider
      value={{
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
        addPlayer,
        updatePlayer,
        deletePlayer,
        getPlayerTournament,
        getPlayerTournaments,
        generateMatches,
        createManualMatch, // Nuova funzione
        saveMatchResults,
        updateMatch, // Nuova funzione
        deleteMatch, // Nuova funzione
        deleteUncompletedMatches,
        calculatePlayerStats,
        updateSettings
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export default TournamentContext;