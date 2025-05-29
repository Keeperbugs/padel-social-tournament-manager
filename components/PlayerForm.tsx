
import React, { useState, useEffect } from 'react';
import { Player, SkillLevel } from '../types';

interface PlayerFormProps {
  onSubmit: (player: Omit<Player, 'id' | 'matchesPlayed' | 'matchesWon' | 'setsWon' | 'setsLost' | 'gamesWon' | 'gamesLost' | 'points'>) => void;
  initialData?: Player | null; // Per la modifica
  onCancel?: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [nickname, setNickname] = useState('');
  const [contact, setContact] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.UNASSIGNED);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSurname(initialData.surname);
      setNickname(initialData.nickname || '');
      setContact(initialData.contact || '');
      setSkillLevel(initialData.skillLevel);
    } else {
      // Reset form for new player
      setName('');
      setSurname('');
      setNickname('');
      setContact('');
      setSkillLevel(SkillLevel.UNASSIGNED);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !surname) {
      alert('Nome e Cognome sono obbligatori.');
      return;
    }
    onSubmit({
      name,
      surname,
      nickname: nickname || undefined,
      contact: contact || undefined,
      skillLevel,
    });
    // Reset form after submission if not editing
    if (!initialData) {
        setName('');
        setSurname('');
        setNickname('');
        setContact('');
        setSkillLevel(SkillLevel.UNASSIGNED);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-slate-800 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400">{initialData ? 'Modifica Giocatore' : 'Aggiungi Nuovo Giocatore'}</h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome*</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white" />
      </div>
      <div>
        <label htmlFor="surname" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cognome*</label>
        <input type="text" id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white" />
      </div>
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Soprannome (Opzionale)</label>
        <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white" />
      </div>
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contatto (Opzionale)</label>
        <input type="text" id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Es. email o telefono" className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:text-white" />
      </div>
      <div>
        <label htmlFor="skillLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fascia di abilità</label>
        <select id="skillLevel" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as SkillLevel)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-slate-700 dark:text-white">
          {Object.values(SkillLevel).map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-3">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Annulla</button>}
        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600">
          {initialData ? 'Salva Modifiche' : 'Aggiungi Giocatore'}
        </button>
      </div>
    </form>
  );
};

export default PlayerForm;
