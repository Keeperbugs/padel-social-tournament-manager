
import React, { useState, useEffect } from 'react';
import { Match, MatchSetScore, Team, MatchFormat } from '../types';

interface ResultsInputModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onSaveResults: (matchId: string, scores: MatchSetScore[], winnerTeamId?: string) => void;
}

const ResultsInputModal: React.FC<ResultsInputModalProps> = ({ match, isOpen, onClose, onSaveResults }) => {
  const [currentScores, setCurrentScores] = useState<MatchSetScore[]>([]);
  const [selectedWinner, setSelectedWinner] = useState<string | undefined>(undefined); // For Golden Point

  useEffect(() => {
    if (match) {
      // Inizializza i punteggi. Se Best of Three, prepara per 3 set.
      // Se Golden Point, un solo "set" fittizio.
      const initialScores: MatchSetScore[] = [];
      if (match.matchFormat === MatchFormat.BEST_OF_THREE) {
        for (let i = 1; i <= 3; i++) {
          const existingScore = match.scores.find(s => s.setNumber === i);
          initialScores.push({
            setNumber: i,
            team1Score: existingScore?.team1Score ?? '',
            team2Score: existingScore?.team2Score ?? '',
          });
        }
      } else if (match.matchFormat === MatchFormat.GOLDEN_POINT) {
         initialScores.push({ // Unico set per registrare il vincitore del GP
            setNumber: 1,
            team1Score: match.scores[0]?.team1Score === 'GP' ? 'GP' : '',
            team2Score: match.scores[0]?.team2Score === 'GP' ? 'GP' : '',
          });
          if (match.winnerTeamId) setSelectedWinner(match.winnerTeamId);
      }
      setCurrentScores(initialScores);
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const handleScoreChange = (setIndex: number, team: 'team1' | 'team2', value: string) => {
    const newScores = [...currentScores];
    const scoreValue = value === '' ? '' : parseInt(value, 10);
    if (isNaN(scoreValue as number) && value !== '') return; // Non permettere NaN se non stringa vuota

    if (team === 'team1') {
      newScores[setIndex].team1Score = scoreValue;
    } else {
      newScores[setIndex].team2Score = scoreValue;
    }
    setCurrentScores(newScores);
  };
  
  const determineWinner = (): string | undefined => {
    if (match.matchFormat === MatchFormat.GOLDEN_POINT) {
      return selectedWinner;
    }

    let team1SetsWon = 0;
    let team2SetsWon = 0;
    for (const set of currentScores) {
      // Considera un set valido solo se entrambi i punteggi sono numeri
      const t1s = typeof set.team1Score === 'number' ? set.team1Score : -1;
      const t2s = typeof set.team2Score === 'number' ? set.team2Score : -1;

      if (t1s === -1 && t2s === -1 && set.setNumber > 1) continue; // Set non giocato o incompleto
      if (t1s === -1 || t2s === -1 ) return undefined; // Set incompleto

      if (t1s > t2s) team1SetsWon++;
      else if (t2s > t1s) team2SetsWon++;
      // Pareggio in un set non è possibile nel padel standard, ma se accade non conta per la vittoria del match
      
      if (team1SetsWon === 2) return match.team1.id;
      if (team2SetsWon === 2) return match.team2.id;
    }
    // Per il terzo set, se i punteggi sono 1-1
    if (team1SetsWon === 1 && team2SetsWon === 1 && currentScores.length >=3 ) {
       const t1s_s3 = typeof currentScores[2].team1Score === 'number' ? currentScores[2].team1Score : -1;
       const t2s_s3 = typeof currentScores[2].team2Score === 'number' ? currentScores[2].team2Score : -1;
       if(t1s_s3 > t2s_s3) return match.team1.id;
       if(t2s_s3 > t1s_s3) return match.team2.id;
    }

    return undefined; // Nessun vincitore ancora o punteggio non valido
  };


  const handleSave = () => {
    let finalWinnerTeamId = determineWinner();
    let finalScores = currentScores;

    if (match.matchFormat === MatchFormat.GOLDEN_POINT) {
      if (!selectedWinner) {
        alert("Seleziona un vincitore per il Golden Point.");
        return;
      }
      finalWinnerTeamId = selectedWinner;
      // Aggiorna scores per riflettere il vincitore del Golden Point
      finalScores = [{
        setNumber: 1,
        team1Score: selectedWinner === match.team1.id ? 'GP' : '',
        team2Score: selectedWinner === match.team2.id ? 'GP' : '',
      }];
    } else { // Best of Three
        if (!finalWinnerTeamId && currentScores.some(s => s.team1Score !== '' || s.team2Score !== '')) {
             // Se sono stati inseriti punteggi ma non c'è un vincitore chiaro (es. 1 set a 0, o 1-1 senza terzo set)
            alert("Punteggio incompleto o non valido per determinare un vincitore. Completa i set necessari.");
            return;
        }
         // Filtra i set non giocati (entrambi i punteggi vuoti)
        finalScores = currentScores.filter(s => !(s.team1Score === '' && s.team2Score === ''));
        if(finalScores.length === 0 && !finalWinnerTeamId) { // Nessun punteggio inserito
            onClose(); // Chiudi senza salvare se non c'è nulla
            return;
        }
    }
    onSaveResults(match.id, finalScores, finalWinnerTeamId);
    onClose();
  };
  
  const renderTeamName = (team: Team) => `${team.player1.nickname || team.player1.name} / ${team.player2.nickname || team.player2.name}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h3 className="text-xl font-semibold mb-4 text-primary-700 dark:text-primary-400">Inserisci Risultati: Round {match.round}</h3>
        <p className="mb-1 text-sm font-medium">{renderTeamName(match.team1)}</p>
        <p className="mb-4 text-sm font-medium vs">vs {renderTeamName(match.team2)}</p>
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">Formato: {match.matchFormat}</p>

        {match.matchFormat === MatchFormat.BEST_OF_THREE && (
          <div className="space-y-3 mb-4">
            {currentScores.map((set, index) => (
              (index < 2 || (currentScores[0].team1Score !== '' && currentScores[0].team2Score !== '' && currentScores[1].team1Score !== '' && currentScores[1].team2Score !== '' && (parseInt(String(currentScores[0].team1Score)) > parseInt(String(currentScores[0].team2Score)) !== (parseInt(String(currentScores[1].team1Score)) > parseInt(String(currentScores[1].team2Score))) ) )) && // Mostra il terzo set solo se i primi due sono completi e c'è un pareggio di set
              <div key={set.setNumber} className="flex items-center space-x-2">
                <span className="w-12 text-sm">Set {set.setNumber}:</span>
                <input 
                  type="number" 
                  min="0"
                  value={set.team1Score} 
                  onChange={(e) => handleScoreChange(index, 'team1', e.target.value)}
                  placeholder={`${match.team1.player1.nickname || match.team1.player1.name.charAt(0)}.${match.team1.player2.nickname || match.team1.player2.name.charAt(0)}`}
                  className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm dark:bg-slate-700 dark:text-white"
                />
                <span>-</span>
                <input 
                  type="number" 
                  min="0"
                  value={set.team2Score} 
                  onChange={(e) => handleScoreChange(index, 'team2', e.target.value)}
                  placeholder={`${match.team2.player1.nickname || match.team2.player1.name.charAt(0)}.${match.team2.player2.nickname || match.team2.player2.name.charAt(0)}`}
                  className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-sm dark:bg-slate-700 dark:text-white"
                />
              </div>
            ))}
          </div>
        )}

        {match.matchFormat === MatchFormat.GOLDEN_POINT && (
          <div className="mb-4">
            <p className="text-sm mb-1">Chi ha vinto il Golden Point?</p>
            <select 
              value={selectedWinner || ''} 
              onChange={(e) => setSelectedWinner(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
            >
              <option value="" disabled>Seleziona Vincitore</option>
              <option value={match.team1.id}>{renderTeamName(match.team1)}</option>
              <option value={match.team2.id}>{renderTeamName(match.team2)}</option>
            </select>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
            Annulla
          </button>
          <button onClick={handleSave} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
            Salva Risultati
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsInputModal;

