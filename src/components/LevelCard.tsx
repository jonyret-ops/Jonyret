import React from 'react';
import { useApp } from '../context/AppContext';
import { XpProgressBar } from './XpProgressBar';
import { ShieldCheck } from 'lucide-react';

export const LevelCard: React.FC = () => {
  const { levelInfo, totalCumulativeXp } = useApp();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-sky-600 uppercase mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Character Level</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              LEVEL {levelInfo.currentLevel}
            </h2>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">
              {levelInfo.currentTitle}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase block">Total XP</span>
          <span className="text-base font-extrabold text-slate-800">
            {totalCumulativeXp.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <XpProgressBar
          current={levelInfo.xpInCurrentLevel}
          total={levelInfo.nextLevelXpRequired - levelInfo.currentLevelXpRequired}
          heightClass="h-2"
          colorClass="bg-sky-500"
        />

        <div className="flex justify-between items-center text-xs font-medium text-slate-500 pt-0.5">
          <span>
            {levelInfo.xpInCurrentLevel} / {levelInfo.nextLevelXpRequired - levelInfo.currentLevelXpRequired} XP
          </span>
          {levelInfo.isMaxLevel ? (
            <span className="font-semibold text-sky-600">MAX LEVEL REACHED</span>
          ) : (
            <span className="font-semibold text-slate-600">
              {levelInfo.xpNeededForNextLevel} XP to Level {levelInfo.currentLevel + 1}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
