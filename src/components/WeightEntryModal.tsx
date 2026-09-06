import React, { useState } from 'react';
import { X, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/calculations';

interface WeightEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeightEntryModal: React.FC<WeightEntryModalProps> = ({ isOpen, onClose }) => {
  const { addWeightEntry, activeTodayDate, weightStats } = useApp();
  const [weightInput, setWeightInput] = useState<string>(
    weightStats.currentWeight > 0 ? String(weightStats.currentWeight) : '240.0'
  );
  const [dateInput, setDateInput] = useState<string>(activeTodayDate);
  const [noteInput, setNoteInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weightInput);
    if (isNaN(parsed) || parsed < 50 || parsed > 600) {
      setError('Please enter a valid weight in lbs (e.g. 238.4)');
      return;
    }
    if (!dateInput) {
      setError('Please select a valid date');
      return;
    }

    addWeightEntry(parsed, dateInput, noteInput.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-slate-200/80 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Add Weigh-In</h3>
              <p className="text-xs text-slate-400">Log your progress toward 220 lb</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200/60">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Weight (lbs)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                required
                value={weightInput}
                onChange={(e) => {
                  setWeightInput(e.target.value);
                  setError('');
                }}
                placeholder="238.4"
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                lb
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Weigh-In Date
            </label>
            <input
              type="date"
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="e.g. Fasted morning weigh-in"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-98 text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              Save Weight
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
