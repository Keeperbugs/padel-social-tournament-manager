// Modifica components/MatchCard.tsx
import React, { useState } from 'react';
import { Match, Team } from '../types';
import TeamEditor from './TeamEditor';

interface MatchCardProps {
  match: Match;
  onOpenResultsModal: (match: Match) => void;
  onUpdateMatch: (match: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  availablePlayers: any[];
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onOpenResultsModal,
  onUpdateMatch,
  onDeleteMatch,
  availablePlayers
}) => {
  const [showTeamEditor, setShowTeamEditor] = useState(false);

  const renderTeamName = (team: Team) => `${team.player1.nickname || team.player1.name} / ${team.player2.nickname || team.player2.name}`;

  const handleSaveTeamChanges = (updatedMatch: Match) => {
    onUpdateMatch(updatedMatch);
    setShowTeamEditor(false);
  };

  if (showTeamEditor) {
    return (
      <TeamEditor
        match={match}
        availablePlayers={availablePlayers}
        onSave={handleSaveTeamChanges}
        onCancel={() => setShowTeamEditor(false)}
      />
    );
  }

  return (
    <div 
      className={`p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg space-y-2 ${match.status === 'COMPLETED' ? 'opacity-80' : ''}`}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-md font-semibold">Round {match.round} {match.court && `- Campo ${match.court}`}</h4>
        <div className="flex space-x-1">
          <button
            onClick={() => setShowTeamEditor(true)}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            title="Modifica squadre"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteMatch(match.id)}
            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Elimina partita"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <p className="text-sm">
        <span className={`${match.winnerTeamId === match.team1.id ? 'font-bold text-green-600 dark:text-green-400' : ''}`}>
          {renderTeamName(match.team1)}
        </span>
        <span className="mx-1">vs</span> 
        <span className={`${match.winnerTeamId === match.team2.id ? 'font-bold text-green-600 dark:text-green-400' : ''}`}>
          {renderTeamName(match.team2)}
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
      
      <div className="flex justify-between items-center mt-3">
        <span className={`text-sm font-medium ${match.status === 'COMPLETED' ? 'text-green-600 dark:text-green-400' : match.status === 'IN_PROGRESS' ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {match.status === 'COMPLETED' ? 'Completato' : match.status === 'IN_PROGRESS' ? 'In corso' : 'In attesa'}
        </span>
        
        <button 
          onClick={() => onOpenResultsModal(match)} 
          className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          {match.status === 'COMPLETED' ? 'Modifica Risultato' : 'Inserisci Risultato'}
        </button>
      </div>
    </div>
  );
};

export default MatchCard;