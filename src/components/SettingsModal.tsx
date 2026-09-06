import React, { useState } from 'react';
import { X, Download, Upload, Trash2, Volume2, VolumeX, Smartphone, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, resetAllData, exportData, importData } = useApp();

  const [name, setName] = useState(profile.name);
  const [dailyXpGoal, setDailyXpGoal] = useState(String(profile.dailyXpGoal));
  const [dailyStepGoal, setDailyStepGoal] = useState(String(profile.dailyStepGoal));
  const [startingWeight, setStartingWeight] = useState(String(profile.startingWeight));
  const [goalWeight, setGoalWeight] = useState(String(profile.goalWeight));
  const [startDate, setStartDate] = useState(profile.startDate);
  const [goalDate, setGoalDate] = useState(profile.goalDate);
  const [soundEffects, setSoundEffects] = useState(profile.soundEffects);
  
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim() || 'Champion',
      dailyXpGoal: parseInt(dailyXpGoal, 10) || 100,
      dailyStepGoal: parseInt(dailyStepGoal, 10) || 10000,
      startingWeight: parseFloat(startingWeight) || 242.2,
      goalWeight: parseFloat(goalWeight) || 220,
      startDate,
      goalDate,
      soundEffects,
    });
    setStatusMessage('Settings saved successfully');
    setTimeout(() => {
      setStatusMessage('');
      onClose();
    }, 600);
  };

  const handleExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `winter-arc-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importData(content);
        if (success) {
          setStatusMessage('Data imported successfully!');
          setTimeout(() => onClose(), 1000);
        } else {
          setStatusMessage('Import failed. Invalid file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    await resetAllData();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 border border-slate-200/80 shadow-xl no-scrollbar">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Settings</h3>
            <p className="text-xs text-slate-400">Configure your Winter Arc parameters</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200/60">
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Daily XP Goal
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={dailyXpGoal}
                onChange={(e) => setDailyXpGoal(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Step Target
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={dailyStepGoal}
                onChange={(e) => setDailyStepGoal(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Starting Weight (lb)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={startingWeight}
                onChange={(e) => setStartingWeight(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Goal Weight (lb)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Goal Date
              </label>
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              {soundEffects ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Sound Effects & Chimes</span>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="w-5 h-5 accent-sky-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            Save Settings
          </button>
        </form>

        {/* Data export / import and reset */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Data Management
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-200/60 cursor-pointer"
            >
              {copiedExport ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
              <span>{copiedExport ? 'Downloaded' : 'Export Backup'}</span>
            </button>

            <label className="flex-1 h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-200/60">
              <Upload className="w-4 h-4" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>

          {!showConfirmReset ? (
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="w-full h-10 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset All Data</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center space-y-2">
              <p className="text-xs font-bold text-red-700">
                Are you sure? This will wipe all logs and weights permanently.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 h-8 rounded-lg bg-white text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 h-8 rounded-lg bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700 cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
