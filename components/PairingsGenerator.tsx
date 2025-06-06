import React, { useState } from 'react';
import { PairingStrategy, MatchFormat, AppSettings, Team } from '../types';
import { MIN_PLAYERS_FOR_TOURNAMENT } from '../constants';
import ManualMatchCreator from './ManualMatchCreator';

interface PairingsGeneratorProps {
  settings: Pick<AppSettings, 'pairingStrategy' | 'matchFormat'>;
  onSettingsChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onGenerateMatches: () => void;
  onCreateManualMatch: (team1: Team, team2: Team, matchFormat: MatchFormat, court?: string) => void;
  playerCount: number;
  disabled: boolean;
  availablePlayers: any[]; // Aggiunto per la creazione manuale
}

const PairingsGenerator: React.FC<PairingsGeneratorProps> = ({
  settings,
  onSettingsChange,
  onGenerateMatches,
  onCreateManualMatch,
  playerCount,
  disabled,
  availablePlayers
}) => {
  const [isManualMode, setIsManualMode] = useState(false);
  const canGenerate = playerCount >= MIN_PLAYERS_FOR_TOURNAMENT && !disabled;

  return (
    <div className="p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400">Genera Incontri</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsManualMode(false)}
            className={`px-3 py-1 text-sm rounded-md ${!isManualMode ? 'bg-primary-600 text-white dark:bg-primary-500' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
          >
            Automatico
          </button>
          <button 
            onClick={() => setIsManualMode(true)}
            className={`px-3 py-1 text-sm rounded-md ${isManualMode ? 'bg-primary-600 text-white dark:bg-primary-500' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}
          >
            Manuale
          </button>
        </div>
      </div>

      {isManualMode ? (
        <ManualMatchCreator 
          availablePlayers={availablePlayers}
          onCreateMatch={onCreateManualMatch}
          onCancel={() => setIsManualMode(false)}
          matchFormat={settings.matchFormat}
        />
      ) : (
        <>
          <div>
            <label htmlFor="pairingStrategy" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Strategia di abbinamento</label>
            <select 
              id="pairingStrategy" 
              value={settings.pairingStrategy} 
              onChange={(e) => onSettingsChange('pairingStrategy', e.target.value as PairingStrategy)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
            >
              {Object.values(PairingStrategy).map(strategy => (
                <option key={strategy} value={strategy}>{strategy}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="matchFormat" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Formato incontro</label>
            <select 
              id="matchFormat" 
              value={settings.matchFormat} 
              onChange={(e) => onSettingsChange('matchFormat', e.target.value as MatchFormat)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white"
            >
              {Object.values(MatchFormat).map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={onGenerateMatches}
            disabled={!canGenerate}
            className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${canGenerate ? 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600' : 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
          >
            {playerCount < MIN_PLAYERS_FOR_TOURNAMENT ? `Servono almeno ${MIN_PLAYERS_FOR_TOURNAMENT} giocatori` : 'Genera Incontri del Round'}
          </button>
          {disabled && playerCount >= MIN_PLAYERS_FOR_TOURNAMENT && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Completa o cancella gli incontri correnti prima di generarne di nuovi.</p>
          )}
        </>
      )}
    </div>
  );
};

export default PairingsGenerator;